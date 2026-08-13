const express = require("express");

const router =
    express.Router();


const authenticateToken =
    require("../middleware/authMiddleware");


const {

    sendOrderOTPCode,

    verifyOrderOTP

} = require(
    "../controllers/otpController"
);


router.post(

    "/order/send",

    authenticateToken,

    sendOrderOTPCode

);


router.post(

    "/order/verify",

    authenticateToken,

    verifyOrderOTP

);


module.exports =
    router;