const express = require('express');
const router = express.Router();
const userController = require('../controller/userController.js');

// /api/"route name"
router.get("/login", (req, res) => {
  res.sendFile(path.join(clientDistPath, "login.html"));
});

router.post('/register',userController.register);

router.post('/login',userController.login);

router.post('/logout', userController.logout);

router.get('/verify', userController.verifyPage);
router.post('/verify', userController.verify);

router.post('/forgot-password', userController.resetPasswordRequest); 
router.get('/resetPasswordPage', userController.resetPasswordPage); 
router.post('/resetPassword', userController.resetPassword);


router.get('/users/me', userController.loadUserInfo);
router.put('/users/me', userController.updateInfo);

router.post('/report-issue', userController.report);

module.exports = router;


