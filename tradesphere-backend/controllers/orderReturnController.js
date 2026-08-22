const {
    pool
} = require("../config/db");


const {
    sendSMS
} = require("../services/smsService");


const RETURN_WINDOW_DAYS =
    Number(
        process.env.RETURN_WINDOW_DAYS || 7
    );


/*
==================================================
HELPER
==================================================
*/

function getReturnDeadline(
    deliveredAt
) {

    const deadline =
        new Date(
            deliveredAt
        );


    deadline.setDate(
        deadline.getDate() +
        RETURN_WINDOW_DAYS
    );


    return deadline;

}


/*
==================================================
CREATE RETURN REQUEST
CUSTOMER
==================================================
*/

async function createReturnRequest(
    req,
    res
) {

    let connection;

    try {

        const customerId =
            req.user.id;


        const {
            referenceNo
        } = req.params;


        const {
            reason
        } = req.body;


        /*
        ==========================================
        VALIDATE REASON
        ==========================================
        */

        if (
            !reason ||
            !String(reason).trim()
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Return reason is required."

            });

        }


        const cleanReason =
            String(
                reason
            ).trim();


        if (
            cleanReason.length <
            10
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Please provide at least 10 characters explaining the return reason."

            });

        }


        /*
        ==========================================
        GET CONNECTION
        ==========================================
        */

        connection =
            await pool.getConnection();


        /*
        ==========================================
        GET ORDER
        ==========================================
        */

        const [
            orders
        ] = await connection.query(

            `
            SELECT
                id,
                reference_no,
                customer_id,
                seller_id,
                status,
                delivered_at,
                total_amount

            FROM orders

            WHERE reference_no = ?
              AND customer_id = ?

            LIMIT 1
            `,

            [
                referenceNo,
                customerId
            ]

        );


        if (
            !orders.length
        ) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Order not found."

            });

        }


        const order =
            orders[0];


        /*
        ==========================================
        ONLY DELIVERED
        ==========================================
        */

        if (
            String(
                order.status
            ).toUpperCase() !==
            "DELIVERED"
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Return can only be requested after the order is delivered."

            });

        }


        /*
        ==========================================
        DELIVERY DATE REQUIRED
        ==========================================
        */

        if (
            !order.delivered_at
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Delivery date is not available."

            });

        }


        /*
        ==========================================
        RETURN DEADLINE
        ==========================================
        */

        const deliveredAt =
            new Date(
                order.delivered_at
            );


        const returnDeadline =
            getReturnDeadline(
                deliveredAt
            );


        const now =
            new Date();


        /*
        ==========================================
        RETURN WINDOW EXPIRED
        ==========================================
        */

        if (
            now >=
            returnDeadline
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    `The ${RETURN_WINDOW_DAYS}-day return window has expired.`,

                returnDeadline:
                    returnDeadline.toISOString()

            });

        }


        /*
        ==========================================
        CHECK EXISTING RETURN
        ==========================================
        */

        const [
            existingReturns
        ] = await connection.query(

            `
            SELECT
                id,
                status,
                reason,
                seller_response,
                requested_at,
                responded_at

            FROM order_returns

            WHERE order_id = ?

            LIMIT 1
            `,

            [
                order.id
            ]

        );


        if (
            existingReturns.length
        ) {

            return res.status(409).json({

                success:
                    false,

                message:
                    "A return request already exists for this order.",

                returnRequest:
                    existingReturns[0]

            });

        }


        /*
        ==========================================
        START TRANSACTION
        ==========================================
        */

        await connection.beginTransaction();


        /*
        ==========================================
        INSERT RETURN
        ==========================================
        */

        const [
            returnResult
        ] = await connection.query(

            `
            INSERT INTO order_returns
            (
                order_id,
                reference_no,
                customer_id,
                seller_id,
                reason,
                status,
                requested_at,
                created_at,
                updated_at
            )

            VALUES
            (
                ?,
                ?,
                ?,
                ?,
                ?,
                'RETURN_REQUESTED',
                NOW(),
                NOW(),
                NOW()
            )
            `,

            [

                order.id,

                order.reference_no,

                order.customer_id,

                order.seller_id,

                cleanReason

            ]

        );


        /*
        ==========================================
        UPDATE ORDER STATUS
        ==========================================
        */

        await connection.query(

            `
            UPDATE orders

            SET
                status = 'RETURN_REQUESTED',
                updated_at = NOW()

            WHERE id = ?
            `,

            [
                order.id
            ]

        );


        /*
        ==========================================
        SELLER NOTIFICATION
        ==========================================
        */

        await connection.query(

            `
            INSERT INTO notifications
            (
                user_id,
                type,
                title,
                message,
                reference_no,
                is_read,
                created_at
            )

            VALUES
            (
                ?,
                'RETURN_REQUESTED',
                'Return request received',
                ?,
                ?,
                0,
                NOW()
            )
            `,

            [

                order.seller_id,

                `Customer has requested a return for order ${order.reference_no}. Reason: ${cleanReason}`,

                order.reference_no

            ]

        );


        /*
        ==========================================
        GET SELLER PHONE
        ==========================================
        */

        let sellerPhone =
            null;


        try {

            const [
                sellers
            ] = await connection.query(

                `
                SELECT
                    phone

                FROM users

                WHERE id = ?

                LIMIT 1
                `,

                [
                    order.seller_id
                ]

            );


            if (
                sellers.length
            ) {

                sellerPhone =
                    sellers[0].phone;

            }

        } catch (phoneError) {

            console.warn(
                "SELLER PHONE LOOKUP FAILED:",
                phoneError.message
            );

        }


        /*
        ==========================================
        COMMIT
        ==========================================
        */

        await connection.commit();


        /*
        ==========================================
        SEND SELLER SMS
        ==========================================
        */

        if (
            sellerPhone
        ) {

            await sendSMS({

                phone:
                    sellerPhone,

                message:
                    `TradeSphere: Return request received for order ${order.reference_no}. Customer reason: ${cleanReason}. Please review and accept/reject the request.`,

                tag:
                    "ReturnRequest"

            });

        }


        /*
        ==========================================
        RESPONSE
        ==========================================
        */

        return res.status(201).json({

            success:
                true,

            message:
                "Return request submitted successfully. The seller has been notified.",

            returnRequest: {

                id:
                    returnResult.insertId,

                referenceNo:
                    order.reference_no,

                status:
                    "RETURN_REQUESTED",

                reason:
                    cleanReason,

                requestedAt:
                    new Date().toISOString(),

                returnDeadline:
                    returnDeadline.toISOString()

            }

        });


    } catch (error) {

        if (
            connection
        ) {

            try {

                await connection.rollback();

            } catch {

                // Ignore rollback failure

            }

        }


        console.error(
            "CREATE RETURN REQUEST ERROR:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                "Unable to submit return request."

        });

    } finally {

        if (
            connection
        ) {

            connection.release();

        }

    }

}


/*
==================================================
CUSTOMER GET RETURN REQUEST
==================================================
*/

async function getCustomerReturnRequest(
    req,
    res
) {

    let connection;

    try {

        const customerId =
            req.user.id;


        const {
            referenceNo
        } = req.params;


        connection =
            await pool.getConnection();


        /*
        ==========================================
        GET RETURN REQUEST
        ==========================================
        */

        const [
            rows
        ] = await connection.query(

            `
            SELECT

                r.id,

                r.order_id,

                r.reference_no,

                r.customer_id,

                r.seller_id,

                r.reason,

                r.status,

                r.seller_response,

                r.requested_at,

                r.responded_at,

                r.created_at,

                r.updated_at,

                o.status AS order_status,

                o.delivered_at

            FROM order_returns r

            INNER JOIN orders o
                ON o.id = r.order_id

            WHERE r.reference_no = ?

              AND r.customer_id = ?

            LIMIT 1
            `,

            [
                referenceNo,
                customerId
            ]

        );


        if (
            !rows.length
        ) {

            return res.json({

                success:
                    true,

                returnRequest:
                    null

            });

        }


        const row =
            rows[0];


        let returnDeadline =
            null;


        let eligible =
            false;


        let expired =
            false;


        let daysRemaining =
            0;


        if (
            row.delivered_at
        ) {

            returnDeadline =
                getReturnDeadline(
                    row.delivered_at
                );


            const remaining =
                returnDeadline.getTime() -
                Date.now();


            expired =
                remaining <= 0;


            eligible =
                !expired;


            daysRemaining =
                expired
                    ? 0
                    : Math.ceil(

                        remaining /
                        (
                            1000 *
                            60 *
                            60 *
                            24
                        )

                    );

        }


        return res.json({

            success:
                true,

            returnRequest: {

                id:
                    row.id,

                order_id:
                    row.order_id,

                reference_no:
                    row.reference_no,

                customer_id:
                    row.customer_id,

                seller_id:
                    row.seller_id,

                reason:
                    row.reason,

                status:
                    row.status,

                seller_response:
                    row.seller_response,

                requested_at:
                    row.requested_at,

                responded_at:
                    row.responded_at,

                created_at:
                    row.created_at,

                updated_at:
                    row.updated_at,

                delivered_at:
                    row.delivered_at,

                returnDeadline:
                    returnDeadline
                        ? returnDeadline.toISOString()
                        : null,

                eligible,

                expired,

                daysRemaining

            }

        });


    } catch (error) {

        console.error(
            "GET CUSTOMER RETURN ERROR:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                "Unable to load return information."

        });

    } finally {

        if (
            connection
        ) {

            connection.release();

        }

    }

}


/*
==================================================
SELLER GET RETURN REQUESTS
==================================================
*/

async function getSellerReturnRequests(
    req,
    res
) {

    let connection;

    try {

        const sellerId =
            req.user.id;


        connection =
            await pool.getConnection();


        const [
            rows
        ] = await connection.query(

            `
            SELECT

                r.id,

                r.order_id,

                r.reference_no,

                r.customer_id,

                r.seller_id,

                r.reason,

                r.status,

                r.seller_response,

                r.requested_at,

                r.responded_at,

                r.created_at,

                r.updated_at,

                o.total_amount,

                o.delivered_at,

                u.name AS customer_name,

                u.phone AS customer_phone

            FROM order_returns r

            INNER JOIN orders o
                ON o.id = r.order_id

            LEFT JOIN users u
                ON u.id = r.customer_id

            WHERE r.seller_id = ?

            ORDER BY
                r.requested_at DESC

            `,

            [
                sellerId
            ]

        );


        /*
        ==========================================
        ADD DEADLINE
        ==========================================
        */

        const returns =
            rows.map(
                row => {

                    const deadline =
                        row.delivered_at
                            ? getReturnDeadline(
                                row.delivered_at
                            )
                            : null;


                    return {

                        ...row,

                        return_deadline:
                            deadline
                                ? deadline.toISOString()
                                : null

                    };

                }
            );


        return res.json({

            success:
                true,

            returns

        });


    } catch (error) {

        console.error(
            "GET SELLER RETURNS ERROR:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                "Unable to load return requests."

        });

    } finally {

        if (
            connection
        ) {

            connection.release();

        }

    }

}


/*
==================================================
SELLER ASK CUSTOMER FOR MORE DETAILS
==================================================
*/

async function askCustomerReturnReason(
    req,
    res
) {

    let connection;

    try {

        const sellerId =
            req.user.id;


        const {
            returnId
        } = req.params;


        const {
            message
        } = req.body;


        connection =
            await pool.getConnection();


        /*
        ==========================================
        GET RETURN + CUSTOMER PHONE
        ==========================================
        */

        const [
            rows
        ] = await connection.query(

            `
            SELECT

                r.id,

                r.reference_no,

                r.customer_id,

                r.seller_id,

                r.status,

                u.name AS customer_name,

                u.phone AS customer_phone

            FROM order_returns r

            INNER JOIN users u
                ON u.id = r.customer_id

            WHERE r.id = ?

              AND r.seller_id = ?

            LIMIT 1
            `,

            [
                returnId,
                sellerId
            ]

        );


        if (
            !rows.length
        ) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Return request not found."

            });

        }


        const request =
            rows[0];


        if (
            request.status !==
            "RETURN_REQUESTED"
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "This return request has already been processed."

            });

        }


        const smsMessage =
            message &&
            String(
                message
            ).trim()

                ? String(
                    message
                ).trim()

                : `TradeSphere: Please provide more details about the reason for your return request for order ${request.reference_no}.`;


        /*
        ==========================================
        CUSTOMER NOTIFICATION
        ==========================================
        */

        await connection.query(

            `
            INSERT INTO notifications
            (
                user_id,
                type,
                title,
                message,
                reference_no,
                is_read,
                created_at
            )

            VALUES
            (
                ?,
                'RETURN_REASON_REQUESTED',
                'Seller requested more return details',
                ?,
                ?,
                0,
                NOW()
            )
            `,

            [

                request.customer_id,

                smsMessage,

                request.reference_no

            ]

        );


        /*
        ==========================================
        SEND SMS
        ==========================================
        */

        const smsResult =
            await sendSMS({

                phone:
                    request.customer_phone,

                message:
                    smsMessage,

                tag:
                    "ReturnReason"

            });


        return res.json({

            success:
                true,

            message:
                smsResult.success

                    ? "Customer has been asked for more details by SMS."

                    : "Customer notification created, but SMS could not be sent.",

            smsSent:
                Boolean(
                    smsResult.success
                )

        });


    } catch (error) {

        console.error(
            "ASK CUSTOMER RETURN REASON ERROR:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                "Unable to contact customer."

        });

    } finally {

        if (
            connection
        ) {

            connection.release();

        }

    }

}


/*
==================================================
SELLER ACCEPT RETURN
==================================================
*/

async function acceptReturn(
    req,
    res
) {

    let connection;

    try {

        const sellerId =
            req.user.id;


        const {
            returnId
        } = req.params;


        const {
            response
        } = req.body;


        connection =
            await pool.getConnection();


        /*
        ==========================================
        GET REQUEST
        ==========================================
        */

        const [
            rows
        ] = await connection.query(

            `
            SELECT

                *

            FROM order_returns

            WHERE id = ?

              AND seller_id = ?

            LIMIT 1

            FOR UPDATE
            `,

            [
                returnId,
                sellerId
            ]

        );


        if (
            !rows.length
        ) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Return request not found."

            });

        }


        const returnRequest =
            rows[0];


        /*
        ==========================================
        CHECK STATUS
        ==========================================
        */

        if (
            returnRequest.status !==
            "RETURN_REQUESTED"
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "This return request has already been processed."

            });

        }


        await connection.beginTransaction();


        /*
        ==========================================
        UPDATE RETURN
        ==========================================
        */

        await connection.query(

            `
            UPDATE order_returns

            SET

                status =
                    'RETURN_ACCEPTED',

                seller_response = ?,

                responded_at =
                    NOW(),

                updated_at =
                    NOW()

            WHERE id = ?

              AND seller_id = ?

            `,

            [

                response &&
                String(
                    response
                ).trim()

                    ? String(
                        response
                    ).trim()

                    : "Return accepted by seller.",

                returnId,

                sellerId

            ]

        );


        /*
        ==========================================
        UPDATE ORDER
        ==========================================
        */

        await connection.query(

            `
            UPDATE orders

            SET

                status =
                    'RETURN_ACCEPTED',

                updated_at =
                    NOW()

            WHERE id = ?

            `,

            [
                returnRequest.order_id
            ]

        );


        /*
        ==========================================
        CUSTOMER NOTIFICATION
        ==========================================
        */

        await connection.query(

            `
            INSERT INTO notifications
            (
                user_id,
                type,
                title,
                message,
                reference_no,
                is_read,
                created_at
            )

            VALUES
            (
                ?,
                'RETURN_ACCEPTED',
                'Return request accepted',
                ?,
                ?,
                0,
                NOW()
            )

            `,

            [

                returnRequest.customer_id,

                `Your return request for order ${returnRequest.reference_no} has been accepted by the seller.`,

                returnRequest.reference_no

            ]

        );


        await connection.commit();


        return res.json({

            success:
                true,

            message:
                "Return accepted successfully."

        });


    } catch (error) {

        if (
            connection
        ) {

            try {

                await connection.rollback();

            } catch {

                // Ignore rollback failure

            }

        }


        console.error(
            "ACCEPT RETURN ERROR:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                "Unable to accept return."

        });

    } finally {

        if (
            connection
        ) {

            connection.release();

        }

    }

}


/*
==================================================
SELLER REJECT RETURN
==================================================
*/

async function rejectReturn(
    req,
    res
) {

    let connection;

    try {

        const sellerId =
            req.user.id;


        const {
            returnId
        } = req.params;


        const {
            response
        } = req.body;


        if (
            !response ||
            !String(
                response
            ).trim()
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Please provide a reason for rejecting the return."

            });

        }


        connection =
            await pool.getConnection();


        /*
        ==========================================
        GET REQUEST
        ==========================================
        */

        const [
            rows
        ] = await connection.query(

            `
            SELECT

                *

            FROM order_returns

            WHERE id = ?

              AND seller_id = ?

            LIMIT 1

            FOR UPDATE

            `,

            [
                returnId,
                sellerId
            ]

        );


        if (
            !rows.length
        ) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Return request not found."

            });

        }


        const returnRequest =
            rows[0];


        if (
            returnRequest.status !==
            "RETURN_REQUESTED"
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "This return request has already been processed."

            });

        }


        await connection.beginTransaction();


        /*
        ==========================================
        UPDATE RETURN
        ==========================================
        */

        await connection.query(

            `
            UPDATE order_returns

            SET

                status =
                    'RETURN_REJECTED',

                seller_response = ?,

                responded_at =
                    NOW(),

                updated_at =
                    NOW()

            WHERE id = ?

              AND seller_id = ?

            `,

            [

                String(
                    response
                ).trim(),

                returnId,

                sellerId

            ]

        );


        /*
        ==========================================
        UPDATE ORDER
        ==========================================
        */

        await connection.query(

            `
            UPDATE orders

            SET

                status =
                    'RETURN_REJECTED',

                updated_at =
                    NOW()

            WHERE id = ?

            `,

            [
                returnRequest.order_id
            ]

        );


        /*
        ==========================================
        CUSTOMER NOTIFICATION
        ==========================================
        */

        await connection.query(

            `
            INSERT INTO notifications
            (
                user_id,
                type,
                title,
                message,
                reference_no,
                is_read,
                created_at
            )

            VALUES
            (
                ?,
                'RETURN_REJECTED',
                'Return request rejected',
                ?,
                ?,
                0,
                NOW()
            )

            `,

            [

                returnRequest.customer_id,

                `Your return request for order ${returnRequest.reference_no} was rejected. Seller reason: ${String(response).trim()}`,

                returnRequest.reference_no

            ]

        );


        await connection.commit();


        return res.json({

            success:
                true,

            message:
                "Return rejected successfully."

        });


    } catch (error) {

        if (
            connection
        ) {

            try {

                await connection.rollback();

            } catch {

                // Ignore rollback failure

            }

        }


        console.error(
            "REJECT RETURN ERROR:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                "Unable to reject return."

        });

    } finally {

        if (
            connection
        ) {

            connection.release();

        }

    }

}


/*
==================================================
EXPORT
==================================================
*/

module.exports = {

    createReturnRequest,

    getCustomerReturnRequest,

    getSellerReturnRequests,

    askCustomerReturnReason,

    acceptReturn,

    rejectReturn

};