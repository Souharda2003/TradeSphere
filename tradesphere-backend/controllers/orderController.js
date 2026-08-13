const crypto =
    require("crypto");

const pool =
    require("../config/db");


/*
==================================================
GENERATE REFERENCE NUMBER
==================================================
*/

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


/*
==================================================
CREATE ORDER AFTER OTP VERIFICATION
==================================================
*/

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


        /*
        ==========================================
        VALIDATION
        ==========================================
        */

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


        /*
        ==========================================
        START TRANSACTION
        ==========================================
        */

        await connection.beginTransaction();


        /*
        ==========================================
        VERIFY CUSTOMER
        ==========================================
        */

        const [
            users
        ] = await connection.execute(

            `
            SELECT

                id,

                name,

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


        /*
        ==========================================
        OTP MUST BE VERIFIED
        ==========================================
        */

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


        /*
        ==========================================
        GET CART
        ==========================================
        */

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


        /*
        ==========================================
        LOCK CART PRODUCTS
        ==========================================
        */

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


        /*
        ==========================================
        CHECK SELLER
        ==========================================
        */

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


        /*
        ==========================================
        VERIFY STOCK
        ==========================================
        */

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


            /*
            ======================================
            IMPORTANT:
            Use CURRENT SERVER PRICE
            ======================================
            */

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


        /*
        ==========================================
        REFERENCE NUMBER
        ==========================================
        */

        let referenceNo;


        /*
        ==========================================
        CREATE UNIQUE REFERENCE
        ==========================================
        */

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


        /*
        ==========================================
        CREATE ORDER
        ==========================================
        */

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


        /*
        ==========================================
        INSERT ORDER ITEMS
        ==========================================
        */

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


            /*
            ======================================
            RESERVE STOCK
            ======================================
            */

            const [
                stockUpdate
            ] = await connection.execute(

                `
                UPDATE inventory

                SET

                    available_quantity =
                        available_quantity - ?,

                    reserved_quantity =
                        reserved_quantity + ?

                WHERE product_id = ?

                AND available_quantity >= ?

                `,

                [

                    quantity,

                    quantity,

                    item.product_id,

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


        /*
        ==========================================
        CREATE SELLER NOTIFICATION
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

                order_id

            )

            VALUES
            (

                ?,

                'NEW_ORDER',

                'New Order Received',

                ?,

                ?,

                ?

            )

            `,

            [

                sellerId,

                `A new order ${referenceNo} has been placed. Please review and accept the order.`,

                referenceNo,

                orderId

            ]

        );


        /*
        ==========================================
        CLEAR CART
        ==========================================
        */

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


module.exports = {

    createOrder

};