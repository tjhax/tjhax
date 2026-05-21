const pool = require('../database/database.js');

async function createUser(username, password_hash, password_salt, sfsu_email, token) {
  return pool.query(
    "INSERT INTO users (username, password_hash, password_salt, sfsu_email, verification_token) VALUES (?, ?, ?, ?, ?)",
    [username, password_hash, password_salt, sfsu_email, token]
  );
}
//Checking for duplicate usernames and emails
async function duplicateCheck(username, sfsu_email) {
  return pool.query(
    //Is there a user with this username and email in the database?
    "SELECT username FROM users WHERE sfsu_email = ? OR username = ?",
    //ignores case sensitivity, usernames and emails must be distinct
    [sfsu_email.toLowerCase(), username]
  );
}

async function loginUser(sfsu_email) {
  //Checking our user_id, name, and email columns from the "users" table in the database 
  // to see if there is one registered based on email and password,
  // if so we are able to login
  return pool.query
  ("SELECT user_id, username, sfsu_email, check_role, password_hash, password_salt, verification_token, verified FROM users WHERE sfsu_email = ?",
    //Tries to match email and password with what is found from query results
    [sfsu_email.toLowerCase()] 
  );
}

// Save verification token to user row
async function saveVerificationToken(user_id, token) {
  return pool.query(
    "UPDATE users SET verification_token = ? WHERE user_id = ?",
    [token, user_id]
  );
}

// Find user by token and mark as verified
async function verifyUserToken(token) {
  return pool.query(
    "SELECT user_id FROM users WHERE verification_token = ?",
    [token]
  );
}

async function markVerified(user_id) {
  return pool.query(
    "UPDATE users SET verified = 1, verification_token = NULL WHERE user_id = ?",
    [user_id]
  );
}

async function passwordResetToken(sfsu_email,token) {
  // Store token in database
  await pool.query(
    "UPDATE users SET verification_token = ? WHERE sfsu_email = ?",
    [token, sfsu_email]
  );

  return pool.query(
    "SELECT username FROM users WHERE sfsu_email = ?",
    [sfsu_email]
  );
}

async function resetPassword(token, hash, salt) {
  // Update password on token
  await pool.query(
    "UPDATE users SET password_hash = ?, password_salt = ? WHERE verification_token = ?",
    [hash, salt, token]
  );
}

async function clearToken(token) {
  // Clearing token
  await pool.query(
    "UPDATE users SET verification_token = NULL WHERE verification_token = ?",
    [token]
  );
}

async function getListings(userId) {
return pool.query(
  "SELECT * FROM listings WHERE seller_id = ? ORDER BY created_at DESC",
  [userId]
);
}

async function getConvos(userId) {
  return pool.query(
    "SELECT * FROM conversations WHERE buyer_id = ? OR seller_id = ? ORDER BY created_at DESC",
    [userId,userId]
  );
}

async function updateUserInfo(username, email,userId) {
  pool.query(
  "UPDATE users SET username = ?, sfsu_email = ? WHERE user_id = ?",
  [username,email,userId]
  );
}

async function report(reporter_user_id, reported_user_id, reported_listing_id, report_type, reason_category, description, status) {
  return pool.query(
    "INSERT INTO reports (reporter_user_id, reported_user_id, reported_listing_id, report_type, reason_category, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [reporter_user_id, reported_user_id, reported_listing_id, report_type, reason_category, description, status]
  );
}

module.exports = { 
  createUser, duplicateCheck, loginUser, saveVerificationToken, verifyUserToken, 
  markVerified, passwordResetToken, resetPassword, clearToken, getListings,
  getConvos, updateUserInfo, report
 };