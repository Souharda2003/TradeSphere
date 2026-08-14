const {
    pool
} = require("../config/db");


function getUserId(req) {

    return (
        req.user?.userId ||
        req.user?.id ||
        null
    );

}


async function getCart(req, res) {

    try {

        const userId =
            getUserId(req);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required."

            });

        }


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

                items: [],

                cartCount: 0,

                totalAmount: 0,

                cartTotal: 0

            });

        }


        const cartId =
            carts[0].id;


        const [
            items
        ] = await pool.execute(

            `
                SELECT

                    ci.id AS id,

                    ci.product_id,

                    ci.quantity,

                    ci.unit_price,

                    ci.unit_price AS price,

                    p.product_name,

                    p.sku,

                    p.unit,

                    p.description,

                    p.category,

                    p.seller_id,

                    p.minimum_order_quantity,

                    p.status,

                    COALESCE(
                        i.available_quantity,
                        0
                    ) AS available_quantity,

                    (
                        SELECT
                            pi.image_url

                        FROM product_images pi

                        WHERE
                            pi.product_id = p.id

                            AND pi.is_primary = 1

                        ORDER BY
                            pi.display_order ASC

                        LIMIT 1

                    ) AS primary_image

                FROM cart_items ci

                INNER JOIN products p
                    ON p.id = ci.product_id

                LEFT JOIN inventory i
                    ON i.product_id = p.id

                WHERE ci.cart_id = ?

                ORDER BY ci.id DESC
            `,

            [
                cartId
            ]

        );

const cartCount =
    items.length;


const totalAmount =
    items.reduce(

        (
            total,
            item
        ) => {

            const quantity =
                Number(
                    item.quantity || 0
                );

            const unitPrice =
                Number(
                    item.unit_price || 0
                );

            return (
                total +
                (
                    quantity *
                    unitPrice
                )
            );

        },

        0
    );
        return res.json({

            success: true,

            cartId,

            items,

            cartCount,

            totalAmount,

            cartTotal:
                totalAmount

        });


    } catch (error) {

        console.error(
            "GET CART ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to load cart."

        });

    }

}
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
ADD TO CART
==================================================
*/

async function addToCart(
    req,
    res
) {

    try {

        const userId =
            getUserId(req);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required."

            });

        }


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

                COALESCE(
                    i.available_quantity,
                    0
                ) AS available_quantity

            FROM products p

            LEFT JOIN inventory i
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
            product.status &&
            product.status !== "ACTIVE"
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
const minimumOrder = 5;


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
                product.available_quantity || 0
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
        GET / CREATE CART
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


        /*
        ==========================================
        UPDATE EXISTING ITEM
        ==========================================
        */

        if (
            existingItems.length > 0
        ) {

            const existingQuantity =
                Number(
                    existingItems[0].quantity
                );


            const finalQuantity =
                existingQuantity +
                quantityNumber;


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
            ==========================================
            INSERT NEW ITEM
            ==========================================
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
                error.message ||
                "Unable to add product to cart.",

            error: {

                code:
                    error.code,

                errno:
                    error.errno,

                sqlMessage:
                    error.sqlMessage

            }

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
            getUserId(req);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required."

            });

        }


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

                COALESCE(
                    i.available_quantity,
                    0
                ) AS available_quantity

            FROM cart_items ci

            INNER JOIN cart c
                ON c.id = ci.cart_id

            INNER JOIN products p
                ON p.id = ci.product_id

            LEFT JOIN inventory i
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
            item.status &&
            item.status !== "ACTIVE"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This product is no longer available."

            });

        }


const minimum = 5;


if (
    quantity <
    minimum
) {

    return res.status(400).json({

        success: false,

        message:
            `Minimum order is ${minimum} ${item.unit}.`

    });

}
        const available =
            Number(
                item.available_quantity || 0
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
                error.message ||
                "Unable to update cart.",

            error: {

                code:
                    error.code,

                errno:
                    error.errno,

                sqlMessage:
                    error.sqlMessage

            }

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
            getUserId(req);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required."

            });

        }


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
                error.message ||
                "Unable to remove cart item.",

            error: {

                code:
                    error.code,

                errno:
                    error.errno,

                sqlMessage:
                    error.sqlMessage

            }

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
            getUserId(req);


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required."

            });

        }


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
                error.message ||
                "Unable to clear cart.",

            error: {

                code:
                    error.code,

                errno:
                    error.errno,

                sqlMessage:
                    error.sqlMessage

            }

        });

    }

}


/*
==================================================
EXPORT
==================================================
*/

module.exports = {

    getCart,

    addToCart,

    updateCartItem,

    removeCartItem,

    clearCart

};