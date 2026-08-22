const express =
    require("express");


const router =
    express.Router();


const authenticateToken =
    require("../middleware/authMiddleware");


const {

    getMyNotifications,

    getUnreadNotificationCount,

    markNotificationRead,

    markAllNotificationsRead

} = require(
    "../controllers/notificationController"
);

router.get(

    "/",

    authenticateToken,

    getMyNotifications

);

router.get(

    "/unread-count",

    authenticateToken,

    getUnreadNotificationCount

);

router.patch(

    "/:id/read",

    authenticateToken,

    markNotificationRead

);

router.patch(

    "/read-all",

    authenticateToken,

    markAllNotificationsRead

);


module.exports =
    router;