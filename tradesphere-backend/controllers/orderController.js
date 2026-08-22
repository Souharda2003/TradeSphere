const crypto =
    require("crypto");

const {pool} =
    require("../config/db");
    
function generateReferenceNumber() {

    const date =
        new Date()
            .toISOString()
            .slice(
                0,
                10
            )
            .replace(
                /-/g,
                ""
            );


    const random =
        crypto
            .randomBytes(4)
            .toString("hex")
            .toUpperCase();


    return `TS-${date}-${random}`;
}

async function createOrder(
    req,
    res
) {

    const connection =
        await pool.getConnection();


    try {

        const customerId =
            req.user.userId;


        const {

            deliveryAddress,

            deliveryCity,

            deliveryState,

            deliveryPincode,

            deliveryCharge = 0

        } = req.body;

        if (
            !deliveryAddress ||
            !deliveryCity ||
            !deliveryState ||
            !deliveryPincode
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Complete delivery information is required."

            });
        }



        await connection.beginTransaction();

        const [
            users
        ] = await connection.execute(

            `
            SELECT

                id,

                full_name AS name,

                email,

                phone,

                role

            FROM users

            WHERE id = ?

            LIMIT 1

            `,

            [
                customerId
            ]

        );


        if (
            users.length === 0
        ) {

            throw new Error(
                "Customer not found."
            );
        }


        const customer =
            users[0];


        if (
            customer.role !==
            "CUSTOMER"
        ) {

            throw new Error(
                "Only customers can create orders."
            );
        }

        const [
            verifiedOtp
        ] = await connection.execute(

            `
            SELECT id

            FROM email_otps

            WHERE user_id = ?

            AND purpose =
                'ORDER_VERIFICATION'

            AND verified = TRUE

            AND expires_at > NOW()

            ORDER BY created_at DESC

            LIMIT 1

            `,

            [
                customerId
            ]

        );


        if (
            verifiedOtp.length === 0
        ) {

            throw new Error(
                "Please verify your email with OTP before placing the order."
            );
        }


        const [
            carts
        ] = await connection.execute(

            `
            SELECT id

            FROM cart

            WHERE user_id = ?

            LIMIT 1

            `,

            [
                customerId
            ]

        );


        if (
            carts.length === 0
        ) {

            throw new Error(
                "Your cart is empty."
            );
        }


        const cartId =
            carts[0].id;

        const [
            cartItems
        ] = await connection.execute(

            `
            SELECT

                ci.id AS cart_item_id,

                ci.product_id,

                ci.quantity,

                p.product_name,

                p.sku,

                p.unit,

                p.price,

                p.minimum_order_quantity,

                p.seller_id,

                p.status,

                i.available_quantity

            FROM cart_items ci

            INNER JOIN products p
                ON p.id = ci.product_id

            INNER JOIN inventory i
                ON i.product_id = p.id

            WHERE ci.cart_id = ?

            FOR UPDATE

            `,

            [
                cartId
            ]

        );


        if (
            cartItems.length === 0
        ) {

            throw new Error(
                "Your cart is empty."
            );
        }

        const sellerIds =
            [
                ...new Set(
                    cartItems.map(
                        item =>
                            Number(
                                item.seller_id
                            )
                    )
                )
            ];


        if (
            sellerIds.length !== 1
        ) {

            throw new Error(

                "Please create separate orders for products from different sellers."

            );
        }


        const sellerId =
            sellerIds[0];

        let subtotal = 0;


        for (
            const item
            of cartItems
        ) {


            const quantity =
                Number(
                    item.quantity
                );


            const available =
                Number(
                    item.available_quantity
                );


            const minimum =
                Number(
                    item.minimum_order_quantity
                );


            if (
                item.status !==
                "ACTIVE"
            ) {

                throw new Error(

                    `${item.product_name} is no longer available.`

                );
            }


            if (
                quantity <
                minimum
            ) {

                throw new Error(

                    `${item.product_name} requires a minimum order of ${minimum} ${item.unit}.`

                );
            }


            if (
                quantity >
                available
            ) {

                throw new Error(

                    `Only ${available} ${item.unit} of ${item.product_name} is available.`

                );
            }

            const price =
                Number(
                    item.price
                );


            subtotal +=
                quantity *
                price;
        }


        const delivery =
            Number(
                deliveryCharge
            ) || 0;


        const total =
            subtotal +
            delivery;



        let referenceNo;


        for (
            let attempt = 0;
            attempt < 5;
            attempt++
        ) {

            const candidate =
                generateReferenceNumber();


            const [
                existing
            ] = await connection.execute(

                `
                SELECT id

                FROM orders

                WHERE reference_no = ?

                LIMIT 1

                `,

                [
                    candidate
                ]

            );


            if (
                existing.length === 0
            ) {

                referenceNo =
                    candidate;

                break;
            }
        }


        if (
            !referenceNo
        ) {

            throw new Error(
                "Unable to generate order reference number."
            );
        }

        const [
            orderResult
        ] = await connection.execute(

            `
            INSERT INTO orders
            (

                reference_no,

                customer_id,

                seller_id,

                subtotal,

                delivery_charge,

                total_amount,

                status,

                customer_name,

                customer_phone,

                customer_email,

                delivery_address,

                delivery_city,

                delivery_state,

                delivery_pincode,

                otp_verified

            )

            VALUES
            (

                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                'PENDING_SELLER_ACCEPTANCE',
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                TRUE

            )

            `,

            [

                referenceNo,

                customerId,

                sellerId,

                subtotal,

                delivery,

                total,

                customer.name,

                customer.phone,

                customer.email,

                deliveryAddress,

                deliveryCity,

                deliveryState,

                deliveryPincode

            ]

        );


        const orderId =
            orderResult.insertId;

        for (
            const item
            of cartItems
        ) {

            const quantity =
                Number(
                    item.quantity
                );


            const price =
                Number(
                    item.price
                );


            const itemSubtotal =
                quantity *
                price;


            await connection.execute(

                `
                INSERT INTO order_items
                (

                    order_id,

                    product_id,

                    product_name,

                    sku,

                    quantity,

                    unit,

                    unit_price,

                    subtotal

                )

                VALUES
                (

                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?

                )

                `,

                [

                    orderId,

                    item.product_id,

                    item.product_name,

                    item.sku,

                    quantity,

                    item.unit,

                    price,

                    itemSubtotal

                ]

            );


const [
    stockUpdate
] = await connection.execute(
    `
    UPDATE inventory
    SET
        reserved_quantity =
            reserved_quantity + ?
    WHERE product_id = ?
    AND seller_id = ?
    AND quantity - reserved_quantity >= ?
    `,
    [
        quantity,
        item.product_id,
        sellerId,
        quantity
    ]
);
            if (
                stockUpdate.affectedRows !== 1
            ) {

                throw new Error(

                    `Stock changed for ${item.product_name}. Please try again.`

                );
            }

        }

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
        'NEW_ORDER',
        'New Order Received',
        ?,
        ?,
        ?,
        0,
        NOW()
    )
    `,

    [

        sellerId,

        `A new order ${referenceNo} has been placed. Please review and accept the order.`,

        referenceNo,

        orderId

    ]

);


        await connection.execute(

            `
            DELETE FROM cart_items

            WHERE cart_id = ?

            `,

            [
                cartId
            ]

        );


        /*
        ==========================================
        MARK OTP AS CONSUMED
        ==========================================
        */

        await connection.execute(

            `
            UPDATE email_otps

            SET verified = FALSE

            WHERE id = ?

            `,

            [
                verifiedOtp[0].id
            ]

        );


        /*
        ==========================================
        COMMIT
        ==========================================
        */

        await connection.commit();


        return res.status(201).json({

            success: true,

            message:
                "Order created successfully.",

            order: {

                id:
                    orderId,

                referenceNo,

                status:
                    "PENDING_SELLER_ACCEPTANCE",

                subtotal,

                deliveryCharge:
                    delivery,

                totalAmount:
                    total

            }

        });


    } catch (error) {


        await connection.rollback();


        console.error(
            "CREATE ORDER ERROR:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message ||
                "Unable to create order."

        });


    } finally {

        connection.release();
    }
}
/*
==================================================
GET SELLER RECENT ORDERS
==================================================
*/

async function getSellerRecentOrders(
    req,
    res
) {

    try {

        const sellerId =
            req.user?.userId ||
            req.user?.id ||
            req.user?.user_id;


        if (!sellerId) {

            return res.status(401).json({

                success: false,

                message:
                    "Seller authentication information not found."

            });

        }


        const [
            orders
        ] = await pool.execute(

            `
            SELECT

                o.id,

                o.reference_no AS order_reference,

                o.customer_id,

                o.customer_name,

                o.customer_phone,

                o.customer_email,

                o.subtotal,

                o.delivery_charge,

                o.total_amount,

                o.status,

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

            ORDER BY o.created_at DESC

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
            "GET SELLER RECENT ORDERS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load seller orders.",

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
GET ALL SELLER ORDERS
==================================================
*/

async function getSellerAllOrders(
    req,
    res
) {

    try {

        const sellerId =
            req.user?.userId ||
            req.user?.id ||
            req.user?.user_id;


        /*
        ==========================================
        CHECK SELLER AUTHENTICATION
        ==========================================
        */

        if (!sellerId) {

            return res.status(401).json({

                success: false,

                message:
                    "Seller authentication information not found."

            });

        }


        /*
        ==========================================
        GET ALL ORDERS OF THIS SELLER
        ==========================================
        */

        const [
            orders
        ] = await pool.execute(

            `
            SELECT

                o.id,

                o.reference_no AS order_reference,

                o.customer_id,

                o.customer_name,

                o.customer_phone,

                o.customer_email,

                o.subtotal,

                o.delivery_charge,

                o.total_amount,

                o.status,

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

            ORDER BY o.created_at DESC

            `,

            [
                sellerId
            ]

        );


        /*
        ==========================================
        SUCCESS
        ==========================================
        */

        return res.status(200).json({

            success: true,

            orders

        });


    } catch (error) {

        console.error(
            "GET SELLER ALL ORDERS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load all seller orders.",

            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined

        });

    }

}/*
==================================================
SELLER ACCEPT ORDER
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
            req.user?.userId ||
            req.user?.id ||
            req.user?.user_id;


        const orderId =
            Number(
                req.params.orderId
            );


        if (!sellerId) {

            return res.status(401).json({

                success: false,

                message:
                    "Seller authentication information not found."

            });

        }


        if (
            !orderId ||
            Number.isNaN(orderId)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order ID."

            });

        }


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

                seller_id,

                customer_id,

                status,

                total_amount

            FROM orders

            WHERE id = ?

            AND seller_id = ?

            LIMIT 1

            FOR UPDATE

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
                "Order not found or does not belong to this seller."
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
        UPDATE ORDER
        ==========================================
        */

        await connection.execute(

            `
            UPDATE orders

            SET

                status = 'ACCEPTED',

                seller_accepted_at = NOW(),

                updated_at = NOW()

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

                order.customer_id,

                `Your order ${order.reference_no} has been accepted by the seller.`,

                order.reference_no,

                order.id

            ]

        );


        await connection.commit();


        return res.json({

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

}/*
==================================================
SELLER REJECT ORDER
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
            req.user?.userId ||
            req.user?.id ||
            req.user?.user_id;


        const orderId =
            Number(
                req.params.orderId
            );


        if (!sellerId) {

            return res.status(401).json({

                success: false,

                message:
                    "Seller authentication information not found."

            });

        }


        if (
            !orderId ||
            Number.isNaN(orderId)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order ID."

            });

        }


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

                seller_id,

                customer_id,

                status

            FROM orders

            WHERE id = ?

            AND seller_id = ?

            LIMIT 1

            FOR UPDATE

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
                "Order not found or access denied."
            );

        }


        const order =
            orders[0];


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

                status = 'REJECTED',

                updated_at = NOW()

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

                `Your order ${order.reference_no} has been rejected by the seller.`,

                order.reference_no,

                order.id

            ]

        );


        await connection.commit();


        return res.json({

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
SELLER UPDATE ORDER STATUS
==================================================
*/

async function updateSellerOrderStatus(
    req,
    res
) {

    const connection =
        await pool.getConnection();

    try {

        const sellerId =
            req.user?.userId ||
            req.user?.id ||
            req.user?.user_id;

        const orderId =
            Number(
                req.params.orderId
            );

        const {
            status
        } = req.body;


        /*
        ==========================================
        AUTHENTICATION
        ==========================================
        */

        if (!sellerId) {

            return res.status(401).json({

                success: false,

                message:
                    "Seller authentication information not found."

            });

        }


        /*
        ==========================================
        VALID ORDER ID
        ==========================================
        */

        if (
            !orderId ||
            Number.isNaN(orderId)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order ID."

            });

        }


        /*
        ==========================================
        VALID STATUS
        ==========================================
        */

        const allowedStatuses = [

            "PROCESSING",

            "SHIPPED",

            "DELIVERED"

        ];


        if (
            !allowedStatuses.includes(
                status
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order status."

            });

        }


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

                status,

                total_amount

            FROM orders

            WHERE id = ?

            AND seller_id = ?

            LIMIT 1

            FOR UPDATE

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
                "Order not found or access denied."
            );

        }


        const order =
            orders[0];


        /*
        ==========================================
        VALID STATUS TRANSITION
        ==========================================
        */

        const validTransitions = {

            ACCEPTED: [
                "PROCESSING"
            ],

            PROCESSING: [
                "SHIPPED"
            ],

            SHIPPED: [
                "DELIVERED"
            ]

        };


        const currentStatus =
            order.status;


        if (
            !validTransitions[
                currentStatus
            ]?.includes(
                status
            )
        ) {

            throw new Error(

                `Order cannot move from ${currentStatus} to ${status}.`

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
        WHEN SHIPPED
        ==========================================

        At the time of order creation:

        reserved_quantity was increased.

        When order is shipped:

        reserved stock becomes actual sold stock.

        Therefore:

        quantity decreases
        reserved_quantity decreases
        ==========================================
        */

        if (
            status === "SHIPPED"
        ) {

            for (
                const item of items
            ) {

                const quantity =
                    Number(
                        item.quantity
                    );


                const [
                    stockResult
                ] = await connection.execute(

                    `
                    UPDATE inventory

                    SET

                        quantity =
                            GREATEST(
                                quantity - ?,
                                0
                            ),

                        reserved_quantity =
                            GREATEST(
                                reserved_quantity - ?,
                                0
                            )

                    WHERE product_id = ?

                    AND seller_id = ?

                    AND reserved_quantity >= ?

                    `,

                    [

                        quantity,

                        quantity,

                        item.product_id,

                        sellerId,

                        quantity

                    ]

                );


                if (
                    stockResult.affectedRows !== 1
                ) {

                    throw new Error(

                        `Unable to update stock for product ${item.product_id}.`

                    );

                }

            }

        }


        /*
        ==========================================
        UPDATE ORDER STATUS
        ==========================================
        */

        await connection.execute(

            `
            UPDATE orders

            SET

                status = ?,

                updated_at = NOW()

            WHERE id = ?

            AND seller_id = ?

            `,

            [

                status,

                orderId,

                sellerId

            ]

        );


        /*
        ==========================================
        CUSTOMER NOTIFICATION DATA
        ==========================================
        */

        let notificationType;
        let notificationTitle;
        let notificationMessage;


        if (
            status === "PROCESSING"
        ) {

            notificationType =
                "ORDER_PROCESSING";

            notificationTitle =
                "Order Processing";

            notificationMessage =
                `Your order ${order.reference_no} is now being processed by the seller.`;

        }


        else if (
            status === "SHIPPED"
        ) {

            notificationType =
                "ORDER_SHIPPED";

            notificationTitle =
                "Order Shipped";

            notificationMessage =
                `Your order ${order.reference_no} has been shipped.`;

        }


        else if (
            status === "DELIVERED"
        ) {

            notificationType =
                "ORDER_DELIVERED";

            notificationTitle =
                "Order Delivered";

            notificationMessage =
                `Your order ${order.reference_no} has been delivered successfully.`;

        }


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

                ?,

                ?,

                ?,

                ?,

                ?,

                0,

                NOW()
            )

            `,

            [

                order.customer_id,

                notificationType,

                notificationTitle,

                notificationMessage,

                order.reference_no,

                order.id

            ]

        );


        await connection.commit();


        /*
        ==========================================
        SUCCESS
        ==========================================
        */

        return res.status(200).json({

            success: true,

            message:
                `Order moved to ${status}.`,

            order: {

                id:
                    order.id,

                referenceNo:
                    order.reference_no,

                status

            }

        });


    } catch (error) {

        await connection.rollback();


        console.error(
            "UPDATE SELLER ORDER STATUS ERROR:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message ||
                "Unable to update order status."

        });


    } finally {

        connection.release();

    }

}
async function getOrderDetails(
    req,
    res
) {

    try {

        /*
        ==========================================
        GET AUTHENTICATED CUSTOMER ID
        ==========================================
        */

        const customerId =
            req.user?.userId ||
            req.user?.id ||
            req.user?.user_id;


        if (!customerId) {

            return res.status(401).json({

                success: false,

                message:
                    "Customer authentication information not found."

            });

        }


        /*
        ==========================================
        GET REFERENCE NUMBER FROM URL
        ==========================================
        */

        const {
            referenceNo
        } = req.params;


        if (!referenceNo) {

            return res.status(400).json({

                success: false,

                message:
                    "Order reference number is required."

            });

        }


        /*
        ==========================================
        GET ORDER
        ==========================================
        
        IMPORTANT:
        customer_id is also checked.

        This prevents one customer from viewing
        another customer's order by changing the URL.
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

                o.delivery_address,

                o.delivery_city,

                o.delivery_state,

                o.delivery_pincode,

                o.otp_verified,

                o.seller_accepted_at,

                o.cancelled_at,

                o.created_at,

                o.updated_at,

                u.full_name AS seller_name,

                u.email AS seller_email,

                u.phone AS seller_phone

            FROM orders o

            LEFT JOIN users u
                ON u.id = o.seller_id

            WHERE
                o.reference_no = ?

            AND
                o.customer_id = ?

            LIMIT 1

            `,

            [
                referenceNo,
                customerId
            ]

        );


        /*
        ==========================================
        ORDER NOT FOUND
        ==========================================
        */

        if (
            orders.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found."

            });

        }


        const order =
            orders[0];


        /*
        ==========================================
        GET ORDER ITEMS
        ==========================================
        */

        const [
            items
        ] = await pool.execute(

            `
            SELECT

                id,

                order_id,

                product_id,

                product_name,

                sku,

                quantity,

                unit,

                unit_price,

                subtotal,

                created_at

            FROM order_items

            WHERE order_id = ?

            ORDER BY id ASC

            `,

            [
                order.id
            ]

        );


        /*
        ==========================================
        FORMAT RESPONSE
        ==========================================
        */

        return res.status(200).json({

            success: true,

            order: {

                id:
                    order.id,

                referenceNo:
                    order.reference_no,

                status:
                    order.status,

                customer: {

                    id:
                        order.customer_id,

                    name:
                        order.customer_name,

                    phone:
                        order.customer_phone,

                    email:
                        order.customer_email

                },

                seller: {

                    id:
                        order.seller_id,

                    name:
                        order.seller_name,

                    email:
                        order.seller_email,

                    phone:
                        order.seller_phone

                },

                items:
                    items.map(
                        item => ({

                            id:
                                item.id,

                            orderId:
                                item.order_id,

                            productId:
                                item.product_id,

                            productName:
                                item.product_name,

                            sku:
                                item.sku,

                            quantity:
                                Number(
                                    item.quantity
                                ),

                            unit:
                                item.unit,

                            unitPrice:
                                Number(
                                    item.unit_price
                                ),

                            subtotal:
                                Number(
                                    item.subtotal
                                ),

                            createdAt:
                                item.created_at

                        })
                    ),

                subtotal:
                    Number(
                        order.subtotal
                    ),

                deliveryCharge:
                    Number(
                        order.delivery_charge
                    ),

                totalAmount:
                    Number(
                        order.total_amount
                    ),

                delivery: {

                    address:
                        order.delivery_address,

                    city:
                        order.delivery_city,

                    state:
                        order.delivery_state,

                    pincode:
                        order.delivery_pincode

                },

                otpVerified:
                    Boolean(
                        order.otp_verified
                    ),

                sellerAcceptedAt:
                    order.seller_accepted_at,

                cancelledAt:
                    order.cancelled_at,

                createdAt:
                    order.created_at,

                updatedAt:
                    order.updated_at

            }

        });


    } catch (error) {

        console.error(
            "GET ORDER DETAILS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load order details.",

            error: {

                message:
                    error.message,

                code:
                    error.code,

                sqlMessage:
                    error.sqlMessage

            }

        });

    }

}
async function getMyOrders(
    req,
    res
) {

    try {

        /*
        ==========================================
        GET AUTHENTICATED CUSTOMER ID
        ==========================================
        */

        const customerId =
            req.user?.userId ||
            req.user?.id ||
            req.user?.user_id;


        console.log(
            "GET MY ORDERS - USER:",
            req.user
        );

        console.log(
            "GET MY ORDERS - CUSTOMER ID:",
            customerId
        );


        if (!customerId) {

            return res.status(401).json({

                success: false,

                message:
                    "Customer authentication information not found."

            });

        }


        /*
        ==========================================
        GET ORDERS
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

            WHERE o.customer_id = ?

            ORDER BY
                o.created_at DESC

            `,

            [
                customerId
            ]

        );


        /*
        ==========================================
        SUCCESS
        ==========================================
        */

        return res.status(200).json({

            success: true,

            orders

        });


    } catch (error) {

        console.error(
            "GET CUSTOMER ORDERS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load your orders.",

            error: {

                message:
                    error.message,

                code:
                    error.code,

                sqlMessage:
                    error.sqlMessage

            }

        });

    }

}
/* =========================================
   CANCEL ORDER - CUSTOMER
========================================= */

async function cancelOrder(req, res) {

    const connection =
        await pool.getConnection();

    try {

        const customerId =
            req.user.userId;

        const {
            referenceNo
        } = req.params;


        await connection.beginTransaction();


        /* =====================================
           GET ORDER
        ===================================== */

        const [orders] =
            await connection.execute(

                `
                SELECT

                    id,
                    reference_no,
                    customer_id,
                    seller_id,
                    status,
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
            orders.length === 0
        ) {

            await connection.rollback();

            return res.status(404).json({

                success: false,

                message:
                    "Order not found."

            });

        }


        const order =
            orders[0];


        /* =====================================
           ALREADY CANCELLED
        ===================================== */

        if (
            order.status ===
            "CANCELLED"
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    "This order is already cancelled."

            });

        }


        /* =====================================
           CHECK CANCELLATION STATUS
        ===================================== */

        const cancellableStatuses = [

            "PENDING_SELLER_ACCEPTANCE",

            "ACCEPTED",

            "PROCESSING"

        ];


        if (
            !cancellableStatuses.includes(
                order.status
            )
        ) {

            await connection.rollback();

            return res.status(400).json({

                success: false,

                message:
                    "This order can no longer be cancelled."

            });

        }


        /* =====================================
           GET ORDER ITEMS
        ===================================== */

        const [items] =
            await connection.execute(

                `
                SELECT

                    product_id,
                    quantity

                FROM order_items

                WHERE order_id = ?

                `,

                [
                    order.id
                ]

            );


        /* =====================================
           RELEASE RESERVED INVENTORY
        ===================================== */

        for (
            const item of items
        ) {

            await connection.execute(

                `
                UPDATE inventory

                SET reserved_quantity =
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

                    order.seller_id

                ]

            );

        }


        /* =====================================
           UPDATE ORDER STATUS
        ===================================== */

        await connection.execute(

            `
            UPDATE orders

            SET

                status = 'CANCELLED',

                cancelled_at = NOW(),

                updated_at = NOW()

            WHERE id = ?

            AND customer_id = ?

            `,

            [

                order.id,

                customerId

            ]

        );


        /* =====================================
           SELLER NOTIFICATION
        ===================================== */

/* =====================================
   SELLER NOTIFICATION
===================================== */

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
        'ORDER_CANCELLED',
        'Order Cancelled',
        ?,
        ?,
        ?,
        0,
        NOW()
    )

    `,

    [

        order.seller_id,

        `Order ${order.reference_no} has been cancelled by the customer.`,

        order.reference_no,

        order.id

    ]

);

        await connection.commit();


        return res.json({

            success: true,

            message:
                "Order cancelled successfully.",

            order: {

                id:
                    order.id,

                referenceNo:
                    order.reference_no,

                status:
                    "CANCELLED"

            }

        });


    } catch (error) {

        await connection.rollback();


        console.error(
            "CANCEL ORDER ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to cancel order."

        });

    } finally {

        connection.release();

    }

}async function getSellerOrderDetails(
    req,
    res
) {

    try {

        const sellerId =
            req.user?.userId ||
            req.user?.id ||
            req.user?.user_id;


        const orderId =
            Number(
                req.params.orderId
            );


        if (!sellerId) {

            return res.status(401).json({

                success: false,

                message:
                    "Seller authentication information not found."

            });

        }


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

            WHERE o.id = ?

            AND o.seller_id = ?

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

            return res.status(404).json({

                success: false,

                message:
                    "Order not found."

            });

        }


        const order =
            orders[0];


        const [
            items
        ] = await pool.execute(

            `
            SELECT

                id,

                order_id,

                product_id,

                product_name,

                sku,

                quantity,

                unit,

                unit_price,

                subtotal,

                created_at

            FROM order_items

            WHERE order_id = ?

            ORDER BY id ASC

            `,

            [
                orderId
            ]

        );


        return res.json({

            success: true,

            order: {

                id:
                    order.id,

                referenceNo:
                    order.reference_no,

                customer: {

                    id:
                        order.customer_id,

                    name:
                        order.customer_name,

                    phone:
                        order.customer_phone,

                    email:
                        order.customer_email

                },

                items:
                    items.map(
                        item => ({

                            id:
                                item.id,

                            productId:
                                item.product_id,

                            productName:
                                item.product_name,

                            sku:
                                item.sku,

                            quantity:
                                Number(
                                    item.quantity
                                ),

                            unit:
                                item.unit,

                            unitPrice:
                                Number(
                                    item.unit_price
                                ),

                            subtotal:
                                Number(
                                    item.subtotal
                                )

                        })
                    ),

                subtotal:
                    Number(
                        order.subtotal
                    ),

                deliveryCharge:
                    Number(
                        order.delivery_charge
                    ),

                totalAmount:
                    Number(
                        order.total_amount
                    ),

                status:
                    order.status,

                delivery: {

                    address:
                        order.delivery_address,

                    city:
                        order.delivery_city,

                    state:
                        order.delivery_state,

                    pincode:
                        order.delivery_pincode

                },

                otpVerified:
                    Boolean(
                        order.otp_verified
                    ),

                sellerAcceptedAt:
                    order.seller_accepted_at,

                cancelledAt:
                    order.cancelled_at,

                createdAt:
                    order.created_at,

                updatedAt:
                    order.updated_at

            }

        });

    } catch (error) {

        console.error(
            "GET SELLER ORDER DETAILS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load seller order."

        });

    }

}
module.exports = {

    createOrder,
    getSellerRecentOrders,
    getSellerAllOrders,
    acceptSellerOrder,
    rejectSellerOrder,
    updateSellerOrderStatus,
    getMyOrders,
    getOrderDetails,
    cancelOrder,
    getSellerOrderDetails

};