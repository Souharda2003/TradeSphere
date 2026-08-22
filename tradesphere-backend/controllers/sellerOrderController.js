const { pool } =
    require("../config/db");


/*
==================================================
HELPER
==================================================
*/

function getUserId(req) {

    return (
        req.user?.userId ||
        req.user?.id ||
        req.user?.user_id
    );

}


/*
==================================================
CHECK SELLER
==================================================
*/

async function getSellerId(req) {

    const userId =
        getUserId(req);


    if (!userId) {

        throw new Error(
            "Authentication information not found."
        );

    }


    const [
        users
    ] = await pool.execute(

        `
        SELECT
            id,
            role

        FROM users

        WHERE id = ?

        LIMIT 1
        `,

        [
            userId
        ]

    );


    if (
        users.length === 0
    ) {

        throw new Error(
            "User not found."
        );

    }


    if (
        users[0].role !==
        "SELLER"
    ) {

        throw new Error(
            "Only sellers can access seller orders."
        );

    }


    return users[0].id;

}


/*
==================================================
GET ALL SELLER ORDERS
==================================================

IMPORTANT:

This does NOT filter by status.

Therefore it returns:

PENDING_SELLER_ACCEPTANCE
ACCEPTED
REJECTED
CANCELLED
PROCESSING
etc.

==================================================
*/

async function getSellerOrders(
    req,
    res
) {

    try {

        const sellerId =
            await getSellerId(req);


        const [
            orders
        ] = await pool.execute(

            `
            SELECT

                o.id,

                o.reference_no,

                o.customer_id,

                o.seller_id,

                o.subtotal,

                o.delivery_charge,

                o.total_amount,

                o.status,

                o.customer_name,

                o.customer_phone,

                o.customer_email,

                o.delivery_address,

                o.delivery_city,

                o.delivery_state,

                o.delivery_pincode,

                o.otp_verified,

                o.seller_accepted_at,

                o.cancelled_at,

                o.created_at,

                o.updated_at

            FROM orders o

            WHERE o.seller_id = ?

            ORDER BY
                o.created_at DESC

            `,

            [
                sellerId
            ]

        );


        return res.status(200).json({

            success: true,

            orders

        });


    } catch (error) {

        console.error(
            "GET SELLER ORDERS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to load seller orders."

        });

    }

}


/*
==================================================
GET RECENT SELLER ORDERS
==================================================

Dashboard uses this endpoint.

We keep all statuses here too.

==================================================
*/

/*
==================================================
GET RECENT SELLER ORDERS
==================================================

Dashboard uses this endpoint.

Recent orders:
- Last 10 orders

Total sales:
- ALL DELIVERED orders
- Not limited to recent 10
==================================================
*/

async function getSellerRecentOrders(
    req,
    res
) {

    try {

        const sellerId =
            await getSellerId(req);


        /*
        ==========================================
        GET RECENT ORDERS
        ==========================================
        */

        const [
            orders
        ] = await pool.execute(

            `
            SELECT

                o.id,

                o.reference_no,

                o.customer_id,

                o.seller_id,

                o.subtotal,

                o.delivery_charge,

                o.total_amount,

                o.status,

                o.customer_name,

                o.customer_phone,

                o.customer_email,

                o.created_at,

                o.updated_at,

                o.seller_accepted_at,

                o.cancelled_at

            FROM orders o

            WHERE o.seller_id = ?

            ORDER BY
                o.created_at DESC

            LIMIT 10

            `,

            [
                sellerId
            ]

        );


        /*
        ==========================================
        GET TOTAL SALES
        ==========================================

        ONLY DELIVERED ORDERS ARE SALES.

        ACCEPTED       -> NOT SALE
        PROCESSING     -> NOT SALE
        SHIPPED        -> NOT SALE
        DELIVERED      -> SALE
        CANCELLED      -> NOT SALE
        REJECTED       -> NOT SALE
        ==========================================
        */

        const [
            salesRows
        ] = await pool.execute(

            `
            SELECT

                COALESCE(
                    SUM(total_amount),
                    0
                ) AS totalSales

            FROM orders

            WHERE seller_id = ?

            AND status = 'DELIVERED'

            `,

            [
                sellerId
            ]

        );


        const totalSales =
            Number(
                salesRows[0]?.totalSales || 0
            );


        /*
        ==========================================
        SUCCESS RESPONSE
        ==========================================
        */

        return res.status(200).json({

            success: true,

            orders,

            totalSales

        });


    } catch (error) {

        console.error(
            "GET RECENT SELLER ORDERS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load recent orders.",

            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined

        });

    }

}
/*
==================================================
ACCEPT SELLER ORDER
==================================================
*/

async function acceptSellerOrder(
    req,
    res
) {

    const connection =
        await pool.getConnection();


    try {

        const sellerId =
            await getSellerId(req);


        const {
            orderId
        } = req.params;


        await connection.beginTransaction();


        /*
        ==========================================
        GET ORDER
        ==========================================
        */

        const [
            orders
        ] = await connection.execute(

            `
            SELECT

                id,

                reference_no,
                customer_id,
                seller_id,

                status

            FROM orders

            WHERE id = ?

            AND seller_id = ?

            LIMIT 1

            `,

            [
                orderId,
                sellerId
            ]

        );


        if (
            orders.length === 0
        ) {

            throw new Error(
                "Order not found."
            );

        }


        const order =
            orders[0];


        /*
        ==========================================
        ONLY PENDING ORDER CAN BE ACCEPTED
        ==========================================
        */

        if (
            order.status !==
            "PENDING_SELLER_ACCEPTANCE"
        ) {

            throw new Error(
                `Order cannot be accepted because its current status is ${order.status}.`
            );

        }


        /*
        ==========================================
        UPDATE STATUS
        ==========================================
        */

        await connection.execute(

            `
            UPDATE orders

            SET

                status =
                    'ACCEPTED',

                seller_accepted_at =
                    NOW(),

                updated_at =
                    NOW()

            WHERE id = ?

            AND seller_id = ?

            `,

            [
                orderId,
                sellerId
            ]

        );


        /*
        ==========================================
        CUSTOMER NOTIFICATION
        ==========================================
        */

        await connection.execute(

            `
            INSERT INTO notifications
            (
                user_id,
                type,
                title,
                message,
                reference_no,
                order_id,
                is_read,
                created_at
            )

            VALUES
            (
                ?,
                'ORDER_ACCEPTED',
                'Order Accepted',
                ?,
                ?,
                ?,
                0,
                NOW()
            )

            `,

            [

                /*
                customer id
                */

                (
                    await connection.execute(
                        `
                        SELECT customer_id
                        FROM orders
                        WHERE id = ?
                        LIMIT 1
                        `,
                        [orderId]
                    )
                )[0][0].customer_id,

                `Your order ${order.reference_no} has been accepted by the seller.`,

                order.reference_no,

                orderId

            ]

        );


        await connection.commit();


        return res.status(200).json({

            success: true,

            message:
                "Order accepted successfully.",

            order: {

                id:
                    order.id,

                referenceNo:
                    order.reference_no,

                status:
                    "ACCEPTED"

            }

        });


    } catch (error) {

        await connection.rollback();


        console.error(
            "ACCEPT SELLER ORDER ERROR:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message ||
                "Unable to accept order."

        });


    } finally {

        connection.release();

    }

}


/*
==================================================
REJECT SELLER ORDER
==================================================
*/

async function rejectSellerOrder(
    req,
    res
) {

    const connection =
        await pool.getConnection();


    try {

        const sellerId =
            await getSellerId(req);


        const {
            orderId
        } = req.params;


        await connection.beginTransaction();


        /*
        ==========================================
        GET ORDER
        ==========================================
        */

        const [
            orders
        ] = await connection.execute(

            `
            SELECT

                id,

                reference_no,

                customer_id,

                seller_id,

                status

            FROM orders

            WHERE id = ?

            AND seller_id = ?

            LIMIT 1

            `,

            [
                orderId,
                sellerId
            ]

        );


        if (
            orders.length === 0
        ) {

            throw new Error(
                "Order not found."
            );

        }


        const order =
            orders[0];


        /*
        ==========================================
        ONLY PENDING ORDER CAN BE REJECTED
        ==========================================
        */

        if (
            order.status !==
            "PENDING_SELLER_ACCEPTANCE"
        ) {

            throw new Error(
                `Order cannot be rejected because its current status is ${order.status}.`
            );

        }


        /*
        ==========================================
        GET ORDER ITEMS
        ==========================================
        */

        const [
            items
        ] = await connection.execute(

            `
            SELECT

                product_id,

                quantity

            FROM order_items

            WHERE order_id = ?

            `,

            [
                orderId
            ]

        );


        /*
        ==========================================
        RELEASE RESERVED STOCK
        ==========================================
        */

        for (
            const item
            of items
        ) {

            await connection.execute(

                `
                UPDATE inventory

                SET

                    reserved_quantity =
                        GREATEST(
                            reserved_quantity - ?,
                            0
                        )

                WHERE product_id = ?

                AND seller_id = ?

                `,

                [

                    Number(
                        item.quantity
                    ),

                    item.product_id,

                    sellerId

                ]

            );

        }


        /*
        ==========================================
        UPDATE ORDER
        ==========================================
        */

        await connection.execute(

            `
            UPDATE orders

            SET

                status =
                    'REJECTED',

                updated_at =
                    NOW()

            WHERE id = ?

            AND seller_id = ?

            `,

            [
                orderId,
                sellerId
            ]

        );


        /*
        ==========================================
        CUSTOMER NOTIFICATION
        ==========================================
        */

        await connection.execute(

            `
            INSERT INTO notifications
            (
                user_id,
                type,
                title,
                message,
                reference_no,
                order_id,
                is_read,
                created_at
            )

            VALUES
            (
                ?,
                'ORDER_REJECTED',
                'Order Rejected',
                ?,
                ?,
                ?,
                0,
                NOW()
            )

            `,

            [

                order.customer_id,

                `Your order ${order.reference_no} was rejected by the seller.`,

                order.reference_no,

                orderId

            ]

        );


        await connection.commit();


        return res.status(200).json({

            success: true,

            message:
                "Order rejected successfully.",

            order: {

                id:
                    order.id,

                referenceNo:
                    order.reference_no,

                status:
                    "REJECTED"

            }

        });


    } catch (error) {

        await connection.rollback();


        console.error(
            "REJECT SELLER ORDER ERROR:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message ||
                "Unable to reject order."

        });


    } finally {

        connection.release();

    }

}


/*
==================================================
EXPORT
==================================================
*/

module.exports = {

    getSellerOrders,

    getSellerRecentOrders,

    acceptSellerOrder,

    rejectSellerOrder

};