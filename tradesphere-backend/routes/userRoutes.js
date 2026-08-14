const express = require("express");

const router =
    express.Router();

const authenticateToken =
    require("../middleware/authMiddleware");

const upload =
    require("../middleware/profileUpload");

const {
    getMe,
    updateProfile,
    uploadProfilePicture
} = require("../controllers/userController");


/*
=========================================
GET CURRENT USER
=========================================
*/

router.get(
    "/me",
    authenticateToken,
    getMe
);


/*
=========================================
UPDATE PROFILE
=========================================
*/

router.put(
    "/profile",
    authenticateToken,
    updateProfile
);


/*
=========================================
UPLOAD PROFILE PICTURE
=========================================
*/

router.post(
    "/profile/avatar",
    authenticateToken,
    upload.single("profilePicture"),
    uploadProfilePicture
);


module.exports =
    router;