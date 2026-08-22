const {
    pool
} = require("../config/db");

function getUserId(req) {

    return (
        req.user?.id ||
        req.user?.userId ||
        req.user?.user_id
    );

}
const getMyNotifications = async (
    req,
    res
) => {

    try {

        const userId =
            getUserId(req);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "User authentication information not found."

            });

        }


        const [
            notifications
        ] = await pool.query(

            `
            SELECT

                id,

                type,

                title,

                message,

                reference_no AS referenceNo,

                order_id AS orderId,

                is_read AS isRead,

                created_at AS createdAt

            FROM notifications

            WHERE user_id = ?

            ORDER BY created_at DESC

            LIMIT 30

            `,

            [
                userId
            ]

        );


        return res.status(200).json({

            success: true,

            notifications

        });


    } catch (error) {

        console.error(
            "GET NOTIFICATIONS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load notifications."

        });

    }

};

const getUnreadNotificationCount = async (
    req,
    res
) => {

    try {

        const userId =
            getUserId(req);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "User authentication information not found."

            });

        }


        const [
            rows
        ] = await pool.query(

            `
            SELECT
                COUNT(*) AS count

            FROM notifications

            WHERE user_id = ?

            AND is_read = 0

            `,

            [
                userId
            ]

        );


        return res.status(200).json({

            success: true,

            count:
                Number(
                    rows[0]?.count || 0
                )

        });


    } catch (error) {

        console.error(
            "GET UNREAD NOTIFICATION COUNT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load unread notification count."

        });

    }

};
const markNotificationRead = async (
    req,
    res
) => {

    try {

        const userId =
            getUserId(req);


        const notificationId =
            req.params.id;


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "User authentication information not found."

            });

        }


        if (!notificationId) {

            return res.status(400).json({

                success: false,

                message:
                    "Notification ID is required."

            });

        }


        const [
            result
        ] = await pool.query(

            `
            UPDATE notifications

            SET is_read = 1

            WHERE id = ?

            AND user_id = ?

            `,

            [

                notificationId,

                userId

            ]

        );


        if (
            result.affectedRows === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Notification not found."

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Notification marked as read."

        });


    } catch (error) {

        console.error(
            "MARK NOTIFICATION READ ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to mark notification as read."

        });

    }

};

const markAllNotificationsRead = async (
    req,
    res
) => {

    try {

        const userId =
            getUserId(req);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "User authentication information not found."

            });

        }


        const [
            result
        ] = await pool.query(

            `
            UPDATE notifications

            SET is_read = 1

            WHERE user_id = ?

            AND is_read = 0

            `,

            [
                userId
            ]

        );


        return res.status(200).json({

            success: true,

            message:
                "All notifications marked as read.",

            affectedRows:
                result.affectedRows

        });


    } catch (error) {

        console.error(
            "MARK ALL NOTIFICATIONS READ ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to mark notifications as read."

        });

    }

};

module.exports = {

    getMyNotifications,

    getUnreadNotificationCount,

    markNotificationRead,

    markAllNotificationsRead

};