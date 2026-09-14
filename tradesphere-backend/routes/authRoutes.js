const express = require("express");

const {

    register,

    login,

    chooseAccount,

    forgotPassword

} = require(
    "../controllers/authController"
);


const router =
    express.Router();


// =====================================================
// REGISTER
// =====================================================

router.post(
    "/register",
    register
);


// =====================================================
// LOGIN
// =====================================================

router.post(
    "/login",
    login
);


// =====================================================
// CHOOSE ACCOUNT
// =====================================================

router.post(
    "/choose-account",
    chooseAccount
);


// =====================================================
// FORGOT PASSWORD
// =====================================================

router.post(
    "/forgot-password",
    forgotPassword
);


module.exports = router;