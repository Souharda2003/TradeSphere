const express = require("express");

const router =
    express.Router();

const authenticateToken =
    require("../middleware/authMiddleware");

const {
    getMyNotifications,
    markAllNotificationsRead
} = require(
    "../controllers/notificationController"
);


// ==========================================
// GET MY UNREAD NOTIFICATIONS
// ==========================================

router.get(
    "/",
    authenticateToken,
    getMyNotifications
);


// ==========================================
// MARK ALL AS READ
// ==========================================

router.put(
    "/read-all",
    authenticateToken,
    markAllNotificationsRead
);


module.exports = router;