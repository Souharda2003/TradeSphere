const {
    pool
} = require("../config/db");


// ==========================================
// GET MY UNREAD NOTIFICATIONS
// ==========================================

const getMyNotifications = async (
    req,
    res
) => {

    try {

        const userId =
            req.user.id ||
            req.user.userId;


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

              AND is_read = 0

            ORDER BY created_at DESC
            `,

            [userId]

        );


        return res.json({

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



// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// ==========================================

const markAllNotificationsRead = async (
    req,
    res
) => {

    try {

        const userId =
            req.user.id ||
            req.user.userId;


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

            [userId]

        );


        return res.json({

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



// ==========================================
// EXPORT
// ==========================================

module.exports = {

    getMyNotifications,

    markAllNotificationsRead

};