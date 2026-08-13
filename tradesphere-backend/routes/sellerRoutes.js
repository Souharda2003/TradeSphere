const express = require("express");

const authenticateToken =
    require("../middleware/authMiddleware");

const requireRole =
    require("../middleware/roleMiddleware");


const router =
    express.Router();


router.get(
    "/dashboard",
    authenticateToken,
    requireRole("SELLER"),

    (req, res) => {

        res.json({

            success: true,

            message:
                "Welcome to Seller Dashboard",

            userId:
                req.user.userId,

            role:
                req.user.role

        });

    }
);


module.exports = router;