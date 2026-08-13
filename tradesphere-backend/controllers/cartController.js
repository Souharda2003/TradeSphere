const pool = require("../config/db");


/*
==================================================
GET OR CREATE CART
==================================================
*/

async function getOrCreateCart(
    userId
) {

    const [
        existingCart
    ] = await pool.execute(

        `
        SELECT id
        FROM cart
        WHERE user_id = ?
        LIMIT 1
        `,

        [
            userId
        ]

    );


    if (
        existingCart.length > 0
    ) {

        return existingCart[0].id;
    }


    const [
        result
    ] = await pool.execute(

        `
        INSERT INTO cart
        (
            user_id
        )
        VALUES (?)
        `,

        [
            userId
        ]

    );


    return result.insertId;
}


/*
==================================================
GET CUSTOMER CART
==================================================
*/

async function getCart(
    req,
    res
) {

    try {

        const userId =
            req.user.userId;


        const cartId =
            await getOrCreateCart(
                userId
            );


        const [
            items
        ] = await pool.execute(

            `
            SELECT

                ci.id,

                ci.product_id,

                ci.quantity,

                ci.unit_price,

                (
                    ci.quantity *
                    ci.unit_price
                ) AS subtotal,

                p.product_name,

                p.category,

                p.sku,

                p.unit,

                p.status,

                p.minimum_order_quantity,

                i.available_quantity,

                (
                    SELECT pi.image_url

                    FROM product_images pi

                    WHERE pi.product_id =
                        p.id

                    AND pi.is_primary = 1

                    LIMIT 1

                ) AS primary_image

            FROM cart_items ci

            INNER JOIN products p
                ON p.id = ci.product_id

            INNER JOIN inventory i
                ON i.product_id = p.id

            WHERE ci.cart_id = ?

            ORDER BY ci.created_at DESC

            `,

            [
                cartId
            ]

        );


        let totalAmount = 0;

        let totalItems = 0;


        items.forEach(
            item => {

                totalAmount +=
                    Number(
                        item.subtotal
                    );

                totalItems +=
                    Number(
                        item.quantity
                    );

            }
        );


        return res.json({

            success: true,

            cartId,

            items,

            totalAmount,

            totalItems

        });


    } catch (error) {

        console.error(
            "GET CART ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load cart."

        });

    }
}


/*
==================================================
ADD PRODUCT TO CART
==================================================
*/

async function addToCart(
    req,
    res
) {

    try {

        const userId =
            req.user.userId;


        const {
            productId,
            quantity
        } = req.body;


        const productIdNumber =
            Number(productId);


        const quantityNumber =
            Number(quantity);


        /*
        ==========================================
        VALIDATION
        ==========================================
        */

        if (
            !productIdNumber ||
            Number.isNaN(
                productIdNumber
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid product."

            });
        }


        if (
            !quantityNumber ||
            quantityNumber <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid quantity."

            });
        }


        /*
        ==========================================
        GET PRODUCT + STOCK
        ==========================================
        */

        const [
            products
        ] = await pool.execute(

            `
            SELECT

                p.id,

                p.product_name,

                p.price,

                p.unit,

                p.status,

                p.minimum_order_quantity,

                i.available_quantity

            FROM products p

            INNER JOIN inventory i
                ON i.product_id = p.id

            WHERE p.id = ?

            LIMIT 1

            `,

            [
                productIdNumber
            ]

        );


        if (
            products.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Product not found."

            });
        }


        const product =
            products[0];


        /*
        ==========================================
        PRODUCT STATUS
        ==========================================
        */

        if (
            product.status !==
            "ACTIVE"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This product is currently unavailable."

            });
        }


        /*
        ==========================================
        MINIMUM ORDER
        ==========================================
        */

        const minimumOrder =
            Number(
                product.minimum_order_quantity
            );


        if (
            quantityNumber <
            minimumOrder
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Minimum order is ${minimumOrder} ${product.unit}.`

            });
        }


        /*
        ==========================================
        AVAILABLE STOCK
        ==========================================
        */

        const availableStock =
            Number(
                product.available_quantity
            );


        if (
            quantityNumber >
            availableStock
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Only ${availableStock} ${product.unit} is available.`

            });
        }


        /*
        ==========================================
        CART
        ==========================================
        */

        const cartId =
            await getOrCreateCart(
                userId
            );


        /*
        ==========================================
        CHECK EXISTING ITEM
        ==========================================
        */

        const [
            existingItems
        ] = await pool.execute(

            `
            SELECT

                id,

                quantity

            FROM cart_items

            WHERE cart_id = ?

            AND product_id = ?

            LIMIT 1

            `,

            [
                cartId,
                productIdNumber
            ]

        );


        if (
            existingItems.length > 0
        ) {

            const existingQuantity =
                Number(
                    existingItems[0]
                        .quantity
                );


            const finalQuantity =
                existingQuantity +
                quantityNumber;


            /*
            ==============================
            STOCK CHECK
            ==============================
            */

            if (
                finalQuantity >
                availableStock
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        `Only ${availableStock} ${product.unit} is available. You already have ${existingQuantity} in your cart.`

                });
            }


            /*
            ==============================
            UPDATE
            ==============================
            */

            await pool.execute(

                `
                UPDATE cart_items

                SET

                    quantity = ?,

                    unit_price = ?

                WHERE id = ?

                `,

                [
                    finalQuantity,

                    product.price,

                    existingItems[0].id

                ]

            );


        } else {


            /*
            ==============================
            INSERT
            ==============================
            */

            await pool.execute(

                `
                INSERT INTO cart_items
                (
                    cart_id,

                    product_id,

                    quantity,

                    unit_price
                )

                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?
                )

                `,

                [
                    cartId,

                    productIdNumber,

                    quantityNumber,

                    product.price

                ]

            );
        }


        return res.status(201).json({

            success: true,

            message:
                "Product added to cart."

        });


    } catch (error) {

        console.error(
            "ADD TO CART ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to add product to cart."

        });

    }
}


/*
==================================================
UPDATE CART ITEM
==================================================
*/

async function updateCartItem(
    req,
    res
) {

    try {

        const userId =
            req.user.userId;


        const itemId =
            Number(
                req.params.itemId
            );


        const quantity =
            Number(
                req.body.quantity
            );


        if (
            !itemId ||
            Number.isNaN(itemId)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid cart item."

            });
        }


        if (
            !quantity ||
            quantity <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Quantity must be greater than zero."

            });
        }


        /*
        ==========================================
        FIND ITEM BELONGING TO USER
        ==========================================
        */

        const [
            items
        ] = await pool.execute(

            `
            SELECT

                ci.id,

                ci.product_id,

                p.minimum_order_quantity,

                p.unit,

                p.price,

                p.status,

                i.available_quantity

            FROM cart_items ci

            INNER JOIN cart c
                ON c.id = ci.cart_id

            INNER JOIN products p
                ON p.id = ci.product_id

            INNER JOIN inventory i
                ON i.product_id = p.id

            WHERE ci.id = ?

            AND c.user_id = ?

            LIMIT 1

            `,

            [
                itemId,
                userId
            ]

        );


        if (
            items.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Cart item not found."

            });
        }


        const item =
            items[0];


        if (
            item.status !==
            "ACTIVE"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This product is no longer available."

            });
        }


        const minimum =
            Number(
                item.minimum_order_quantity
            );


        if (
            quantity < minimum
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Minimum order is ${minimum} ${item.unit}.`

            });
        }


        const available =
            Number(
                item.available_quantity
            );


        if (
            quantity >
            available
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Only ${available} ${item.unit} is available.`

            });
        }


        await pool.execute(

            `
            UPDATE cart_items

            SET

                quantity = ?,

                unit_price = ?

            WHERE id = ?

            `,

            [
                quantity,

                item.price,

                itemId

            ]

        );


        return res.json({

            success: true,

            message:
                "Cart updated."

        });


    } catch (error) {

        console.error(
            "UPDATE CART ITEM ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to update cart."

        });

    }
}


/*
==================================================
REMOVE CART ITEM
==================================================
*/

async function removeCartItem(
    req,
    res
) {

    try {

        const userId =
            req.user.userId;


        const itemId =
            Number(
                req.params.itemId
            );


        if (
            !itemId ||
            Number.isNaN(itemId)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid cart item."

            });
        }


        const [
            result
        ] = await pool.execute(

            `
            DELETE ci

            FROM cart_items ci

            INNER JOIN cart c
                ON c.id = ci.cart_id

            WHERE ci.id = ?

            AND c.user_id = ?

            `,

            [
                itemId,
                userId
            ]

        );


        if (
            result.affectedRows === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Cart item not found."

            });
        }


        return res.json({

            success: true,

            message:
                "Product removed from cart."

        });


    } catch (error) {

        console.error(
            "REMOVE CART ITEM ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to remove cart item."

        });

    }
}


/*
==================================================
CLEAR CART
==================================================
*/

async function clearCart(
    req,
    res
) {

    try {

        const userId =
            req.user.userId;


        const [
            carts
        ] = await pool.execute(

            `
            SELECT id

            FROM cart

            WHERE user_id = ?

            LIMIT 1

            `,

            [
                userId
            ]

        );


        if (
            carts.length === 0
        ) {

            return res.json({

                success: true,

                message:
                    "Cart is already empty."

            });
        }


        await pool.execute(

            `
            DELETE FROM cart_items

            WHERE cart_id = ?

            `,

            [
                carts[0].id
            ]

        );


        return res.json({

            success: true,

            message:
                "Cart cleared."

        });


    } catch (error) {

        console.error(
            "CLEAR CART ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to clear cart."

        });

    }
}


module.exports = {

    getCart,

    addToCart,

    updateCartItem,

    removeCartItem,

    clearCart

};