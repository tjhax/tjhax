const userModel = require('../model/userModel.js');
const crypto = require('crypto');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
//Helper Functions
function hashPassword(plaintext) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(plaintext, salt, 64).toString('hex');
    return {hash, salt};
}

function verifyPassword(plaintext, storedHash, storedSalt){
    const hash = crypto.scryptSync(plaintext, storedSalt, 64).toString('hex');
    return hash === storedHash;
}

//App Functions
async function register(req, res) {
  const { username, password, sfsu_email } = req.body;

  //If any are null, send status code back and error with json message
      if (!username || !password || !sfsu_email) {
          return res.status(400).json({ error: 'username, password, sfsu email are required.' });
      }

      //Max username length on mysql is 50, reject if registering with one over that
      if (username.length > 50) {
          return res.status(400).json({ error: 'Username length too long' });
      }

      //Max password length on mysql is 255, reject if registering with one over that
      if (password.length > 255) {
           return res.status(400).json({ error: 'Password length too long' });
      }

      // //If email does not end in "@sfsu.edu" exactly, reject register request
      const SFSU_EMAILRE = /^[a-zA-Z0-9.%+-]+@sfsu.edu$/i;
      if (!SFSU_EMAILRE.test(sfsu_email)) {
          return res.status(400).json({ error: "Only SFSU email addresses (@sfsu.edu) are allowed." });
      }

      //Checking for duplicate usernames and emails
      const [rows] = await userModel.duplicateCheck(username,sfsu_email);

      if (rows.length > 0) {
        return res.status(409).json({ error: "Email or username already in use." });
      }

    try {
        const { hash, salt } = hashPassword(password);
        // Generate verification token
        const token = crypto.randomBytes(32).toString('hex');

        const [result] = await userModel.createUser(username, hash, salt, sfsu_email, token);

            // Send verification email
            const verifyUrl = `http://54.177.182.16:3000/api/verify?token=${token}`;
            await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: sfsu_email,
            subject: 'Verify your SFSU Marketplace account',
            html: `
            <h2>Welcome to SFSU Marketplace!</h2>
            <p>Hi ${username}, please verify your email by clicking the link below:</p>
            <a href="${verifyUrl}">Verify my account</a>
            <p>This link will verify your account immediately.</p>
            `
        });

        // create cookie and include in response
        req.session.regenerate((err) => {
            if (err) {
                console.error('[register session regenerate]', err);
                return res.status(500).json({ error: 'Session error. Please try again later.' });
            }

            req.session.userId = result.insertId;
            req.session.username = username;
            req.session.sfsu_email = sfsu_email.toLowerCase();
            req.session.check_role = 'USER'; // for now only users have registration thru api endpoint

            return res.status(201).json({
                message: 'Registration successful. Please check your email (possibly in junk) to verify your account.',
                user: {
                    user_id: result.insertId,
                    username,
                    sfsu_email: sfsu_email.toLowerCase(),
                    check_role: req.session.check_role
                }
            });
        });
    }
    catch (err) {
        console.error('[register]', err);
        return res.status(500).json({ error: 'Server error. Please try again later.' });
    }
}

async function login(req,res) {
    const {sfsu_email, password} = req.body;
    if(!sfsu_email || !password) {
        return res.status(400).json({error: "Email and password are required."})
    }

    try {
        const [rows] = await userModel.loginUser(sfsu_email);
        if (rows.length === 0) {
            //Query finds no matches
            return res.status(401).json({ error: "Invalid email or password." });
        }
        const user = rows[0];
        const match = verifyPassword(password, user.password_hash, user.password_salt);
        if (!match) {
          return res.status(401).json({error: "Invalid email or password."});
        }

        if (user.verified === 0) {
          return res.status(401).json({error: "Unverified User. Please check your email for verification request."});
        }

        if (user.verification_token) {
          await userModel.clearToken(user.verification_token);
        }
          
        req.session.regenerate((err) => {
            if (err) {
                console.error('[login session regenerate]', err);
                return res.status(500).json({ error: 'Session error. Please try again later.' });
            }

            req.session.userId = user.user_id;
            req.session.username = user.username;
            req.session.sfsu_email = user.sfsu_email;
            req.session.check_role = user.check_role;
            
            req.session.save(() => {
              return res.status(200).json({
                message: 'Login successful.',
                user: {
                  user_id:    user.user_id,
                  username:   user.username,
                  sfsu_email: user.sfsu_email,
                  check_role: user.check_role
                }
              });
            });
        });
    }
    catch (err) {
        console.error('[login]', err);
        //mysql is down and returns server error for developer to see. Client never sees this.
        return res.status(500).json({ error: 'Server error. Please try again later.' });
    }

}


function logout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error('[logout]', err);
            return res.status(500).json({ error: 'Logout failed.' });
        }
        res.clearCookie('sid');        
        return res.status(200).json({ message: 'Logout successful.' });
    });
}

async function verifyPage(req, res) {
  const { token } = req.query;
  if (!token) {
    return res.status(400).send('Invalid verification link.');
  }
  return res.send(`
    <html>
      <body>
        <h2>Verify your SFSU Marketplace account</h2>
        <p>Click the button below to verify your email.</p>
        <form method="POST" action="/api/verify">
          <input type="hidden" name="token" value="${token}" />
          <button type="submit">Verify my account</button>
        </form>
      </body>
    </html>
  `);
}

async function verify(req, res) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Verification token is required.' });
  }

  try {
    const [rows] = await userModel.verifyUserToken(token);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }

    await userModel.markVerified(rows[0].user_id);

    return res.status(200).json({ message: 'Email verified successfully. You can now log in.' });

  } catch (err) {
    console.error('[verify]', err);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
}

async function resetPasswordRequest(req, res) {
const token = crypto.randomBytes(32).toString('hex');
const {sfsu_email} = req.body
const [rows] = await userModel.passwordResetToken(sfsu_email,token);
//send verification email + add token to given email
//if reset is done or user logs in, clear token field

// Send verification email
const resetPasswordUrl = `http://54.177.182.16:3000/api/resetPasswordPage?token=${token}`;
await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: sfsu_email,
  subject: 'Password Reset SFSU MARKETPLACE ACCOUNT',
  html: `
  <h2>Welcome to SFSU Marketplace!</h2>
  <p>Hi ${rows[0].username}, you can reset your password by clicking the link below:</p>
  <a href="${resetPasswordUrl}">Password Reset</a>
  <p>This link will take you to a page to reset your password.</p>
  `
});

return res.status(200).json({
  message: "Reset password email sent and token field filled"
});
}

async function resetPasswordPage(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send('Invalid verification link.');
  }

  
  if ((await userModel.verifyUserToken(token)).length == 0) {
    return res.status(400).send('Password reset request has been cleared. Please resend the request.')
  }

  return res.send(`
    <html>
      <body>
        <h2>SFSU Marketplace Account Password Reset</h2>
        <p>Fill in the fields and submit to update your password.</p>
        <form method="POST" action="/api/resetPassword">
          <input type="hidden" name="token" value="${token}" />
          <input type="text" name="password">
          <button type="submit">Submit</button>
        </form>
      </body>
    </html>
  `);
}

async function resetPassword (req, res) {

const { token, password } = req.body;

if (!token) {
  return res.status(400).json({ error: 'Verification token missing. Please resend password reset request.' });
}

//Max password length on mysql is 255, reject if registering with one over that
if (password.length > 255) {
      return res.status(400).json({ error: 'Password length too long' });
}

const { hash, salt } = hashPassword(password);

try {

  await userModel.resetPassword(token, hash, salt);
  await userModel.clearToken(token);
  return res.status(200).json({ message: 'Password reset successful.' });

} catch (err) {
  console.error('[resetPassword]', err);
  return res.status(500).json({ error: 'Server error. Please try again later.' });
}

}

async function loadUserInfo (req, res) {

  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not logged in.' });
  }

  const user_id = req.session.userId;
  try {
    const [listings] = await userModel.getListings(user_id);
    const [convos] = await userModel.getConvos(user_id);

    return res.status(200).json({ 
      message: 'Data loaded',
      listings: listings,
      conversations: convos
    });
  }
  catch (err) {
    return res.status(500).json({
      message: "Server Error. Please try again later."
    });
  }
}

async function updateInfo (req, res) {

  const {username, sfsu_email} = req.body;
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  if (req.session.username == username && req.session.sfsu_email == sfsu_email.toLowerCase()) {
    return res.status(400).json({
      message: 'No changes made'
    });
  }

  const SFSU_EMAILRE = /^[a-zA-Z0-9.%+-]+@sfsu.edu$/i;
  if (!SFSU_EMAILRE.test(sfsu_email)) {
      return res.status(400).json({ error: "Only SFSU email addresses (@sfsu.edu) are allowed." });
  }  
  
  try {
  await userModel.updateUserInfo(username,sfsu_email,req.session.userId);
    return res.status(200).json({
      message: 'Changes saved'
    });
  }
  catch (err) {
    return res.status(500).json({
      message: "Server Error. Please try again later."
    });
  }
}

async function report(req, res) {
  
  const {reporter_user_id, reported_user_id, reported_listing_id, report_type, reason_category, description, status} = req.body;
  try {
    const [result] = await userModel.report(reporter_user_id, reported_user_id, reported_listing_id, report_type, reason_category, description, status);

    // if (result) {
    // result.insertId;
    // }

    return res.status(200).json({
      message: "jaja"
    });
  }
  catch (err) {
    return res.status(500).json({
      message: "Server Error. Please try again later."
    });
  }
}

module.exports = { 
  register, login, logout, verifyPage, verify, 
  resetPasswordRequest, resetPasswordPage, resetPassword, loadUserInfo, updateInfo,
  report
 }; 
