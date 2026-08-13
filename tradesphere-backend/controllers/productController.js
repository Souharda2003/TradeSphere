const {
    pool
} = require("../config/db");


/*
=========================================
CREATE PRODUCT
=========================================
*/

async function createProduct(
    req,
    res
) {

    const connection =
        await pool.getConnection();


    try {

        const sellerId =
            req.user.userId;


        const {
            productName,
            category,
            description,
            sku,
            originCountry,
            unit,
            price,
            minimumOrderQuantity,
            initialStock
        } = req.body;


        /*
        =================================
        VALIDATION
        =================================
        */

        if (
            !productName ||
            !category ||
            !sku ||
            !unit ||
            price === undefined ||
            initialStock === undefined
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Required product fields are missing"

            });
        }


        const productPrice =
            Number(price);


        const stock =
            Number(initialStock);


        const moq =
            Number(
                minimumOrderQuantity || 1
            );


        if (
            Number.isNaN(productPrice) ||
            productPrice < 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid product price"

            });
        }


        if (
            Number.isNaN(stock) ||
            stock < 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid stock quantity"

            });
        }


        if (
            Number.isNaN(moq) ||
            moq <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Minimum order quantity must be greater than zero"

            });
        }


        /*
        =================================
        CHECK SKU
        =================================
        */

        const [
            existingSku
        ] = await connection.execute(

            `
            SELECT id
            FROM products
            WHERE sku = ?
            LIMIT 1
            `,

            [sku]
        );


        if (
            existingSku.length > 0
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "SKU already exists"

            });
        }


        /*
        =================================
        TRANSACTION
        =================================
        */

        await connection.beginTransaction();


        /*
        =================================
        PRODUCT
        =================================
        */

        const [
            productResult
        ] = await connection.execute(

            `
            INSERT INTO products
            (
                seller_id,
                product_name,
                category,
                description,
                sku,
                origin_country,
                unit,
                price,
                minimum_order_quantity,
                status
            )

            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,

            [
                sellerId,

                productName,

                category,

                description || null,

                sku,

                originCountry ||
                    "India",

                unit,

                productPrice,

                moq,

                stock > 0
                    ? "ACTIVE"
                    : "OUT_OF_STOCK"
            ]
        );


        const productId =
            productResult.insertId;


        /*
        =================================
        INVENTORY
        =================================
        */

        await connection.execute(

            `
            INSERT INTO inventory
            (
                product_id,
                seller_id,
                quantity,
                reserved_quantity
            )

            VALUES
            (?, ?, ?, ?)
            `,

            [
                productId,

                sellerId,

                stock,

                0
            ]
        );


        /*
        =================================
        PRODUCT IMAGES
        =================================
        */

        if (
            req.files &&
            req.files.length > 0
        ) {

            for (
                let i = 0;
                i < req.files.length;
                i++
            ) {

                const file =
                    req.files[i];


                const imageUrl =
                    `/uploads/products/${file.filename}`;


                await connection.execute(

                    `
                    INSERT INTO product_images
                    (
                        product_id,
                        image_url,
                        is_primary,
                        display_order
                    )

                    VALUES
                    (?, ?, ?, ?)
                    `,

                    [
                        productId,

                        imageUrl,

                        i === 0
                            ? 1
                            : 0,

                        i
                    ]
                );
            }
        }


        /*
        =================================
        COMMIT
        =================================
        */

        await connection.commit();


        /*
        =================================
        RESPONSE
        =================================
        */

        return res.status(201).json({

            success: true,

            message:
                "Product created successfully",

            product: {

                id:
                    productId,

                productName,

                category,

                sku,

                unit,

                price:
                    productPrice,

                initialStock:
                    stock,

                minimumOrderQuantity:
                    moq

            }

        });


    } catch (error) {

        await connection.rollback();


        console.error(
            "CREATE PRODUCT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to create product"

        });


    } finally {

        connection.release();
    }
}


/*
=========================================
GET SELLER PRODUCTS
=========================================
*/

async function getSellerProducts(
    req,
    res
) {

    try {

        const sellerId =
            req.user.userId;


        const [
            products
        ] = await pool.execute(

            `
            SELECT

                p.id,

                p.product_name,

                p.category,

                p.description,

                p.sku,

                p.origin_country,

                p.unit,

                p.price,

                p.minimum_order_quantity,

                p.status,

                p.created_at,

                i.quantity,

                i.reserved_quantity,

                i.available_quantity,

                (
                    SELECT pi.image_url

                    FROM product_images pi

                    WHERE pi.product_id = p.id

                    AND pi.is_primary = 1

                    LIMIT 1

                ) AS primary_image

            FROM products p

            INNER JOIN inventory i
                ON i.product_id = p.id

            WHERE p.seller_id = ?

            ORDER BY p.created_at DESC
            `,

            [sellerId]
        );


        return res.json({

            success: true,

            products

        });


    } catch (error) {

        console.error(
            "GET SELLER PRODUCTS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to fetch products"

        });
    }
}


/*
=========================================
GET SINGLE SELLER PRODUCT
=========================================
*/

async function getSellerProduct(
    req,
    res
) {

    try {

        const sellerId =
            req.user.userId;


        const productId =
            Number(
                req.params.id
            );


        const [
            products
        ] = await pool.execute(

            `
            SELECT

                p.*,

                i.quantity,

                i.reserved_quantity,

                i.available_quantity

            FROM products p

            INNER JOIN inventory i
                ON i.product_id = p.id

            WHERE p.id = ?

            AND p.seller_id = ?

            LIMIT 1
            `,

            [
                productId,
                sellerId
            ]
        );


        if (
            products.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Product not found"

            });
        }


        const [
            images
        ] = await pool.execute(

            `
            SELECT
                id,
                image_url,
                is_primary,
                display_order

            FROM product_images

            WHERE product_id = ?

            ORDER BY display_order ASC
            `,

            [productId]
        );


        return res.json({

            success: true,

            product:
                products[0],

            images

        });


    } catch (error) {

        console.error(
            "GET PRODUCT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to fetch product"

        });
    }
}


/*
=========================================
UPDATE STOCK
=========================================
*/

async function updateStock(
    req,
    res
) {

    const connection =
        await pool.getConnection();


    try {

        const sellerId =
            req.user.userId;


        const productId =
            Number(
                req.params.id
            );


        const {
            quantity,
            operation
        } = req.body;


        const amount =
            Number(quantity);


        if (
            Number.isNaN(amount) ||
            amount <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Stock quantity must be greater than zero"

            });
        }


        if (
            ![
                "ADD",
                "REMOVE"
            ].includes(
                operation
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Operation must be ADD or REMOVE"

            });
        }


        await connection.beginTransaction();


        /*
        =================================
        LOCK INVENTORY ROW
        =================================
        */

        const [
            inventoryRows
        ] = await connection.execute(

            `
            SELECT
                quantity,
                reserved_quantity

            FROM inventory

            WHERE product_id = ?

            AND seller_id = ?

            FOR UPDATE
            `,

            [
                productId,
                sellerId
            ]
        );


        if (
            inventoryRows.length === 0
        ) {

            await connection.rollback();


            return res.status(404).json({

                success: false,

                message:
                    "Inventory not found"

            });
        }


        const inventory =
            inventoryRows[0];


        let newQuantity =
            Number(
                inventory.quantity
            );


        const reserved =
            Number(
                inventory.reserved_quantity
            );


        /*
        =================================
        ADD STOCK
        =================================
        */

        if (
            operation === "ADD"
        ) {

            newQuantity += amount;
        }


        /*
        =================================
        REMOVE STOCK
        =================================
        */

        if (
            operation === "REMOVE"
        ) {

            const available =
                newQuantity -
                reserved;


            if (
                amount > available
            ) {

                await connection.rollback();


                return res.status(400).json({

                    success: false,

                    message:
                        "Cannot remove more than available stock",

                    availableQuantity:
                        available

                });
            }


            newQuantity -= amount;
        }


        /*
        =================================
        UPDATE
        =================================
        */

        await connection.execute(

            `
            UPDATE inventory

            SET quantity = ?

            WHERE product_id = ?

            AND seller_id = ?
            `,

            [
                newQuantity,

                productId,

                sellerId
            ]
        );


        /*
        =================================
        PRODUCT STATUS
        =================================
        */

        const available =
            newQuantity -
            reserved;


        const status =
            available > 0
                ? "ACTIVE"
                : "OUT_OF_STOCK";


        await connection.execute(

            `
            UPDATE products

            SET status = ?

            WHERE id = ?

            AND seller_id = ?
            `,

            [
                status,

                productId,

                sellerId
            ]
        );


        await connection.commit();


        return res.json({

            success: true,

            message:
                "Stock updated successfully",

            quantity:
                newQuantity,

            reservedQuantity:
                reserved,

            availableQuantity:
                available,

            status

        });


    } catch (error) {

        await connection.rollback();


        console.error(
            "UPDATE STOCK ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to update stock"

        });


    } finally {

        connection.release();
    }
}
/*
=========================================
GET PUBLIC PRODUCTS
CUSTOMER CATALOGUE
=========================================
*/

async function getPublicProducts(req, res) {

    try {

        const {
            search = "",
            category = "ALL"
        } = req.query;


        let query = `

            SELECT

                p.id,

                p.product_name,

                p.category,

                p.description,

                p.sku,

                p.origin_country,

                p.unit,

                p.price,

                p.minimum_order_quantity,

                p.status,

                i.quantity,

                i.reserved_quantity,

                i.available_quantity,

                (

                    SELECT pi.image_url

                    FROM product_images pi

                    WHERE pi.product_id = p.id

                    AND pi.is_primary = 1

                    LIMIT 1

                ) AS primary_image

            FROM products p

            INNER JOIN inventory i
                ON i.product_id = p.id

            WHERE p.status = 'ACTIVE'

            AND i.available_quantity > 0

        `;


        const params = [];


        /*
        =================================
        SEARCH
        =================================
        */

        if (
            search &&
            search.trim() !== ""
        ) {

            query += `

                AND (

                    p.product_name LIKE ?

                    OR p.category LIKE ?

                    OR p.sku LIKE ?

                )

            `;


            const searchValue =
                `%${search.trim()}%`;


            params.push(
                searchValue,
                searchValue,
                searchValue
            );
        }


        /*
        =================================
        CATEGORY
        =================================
        */

        if (
            category &&
            category !== "ALL"
        ) {

            query += `

                AND p.category = ?

            `;

            params.push(
                category
            );
        }


        query += `

            ORDER BY
                p.created_at DESC

        `;


        const [
            products
        ] = await pool.execute(
            query,
            params
        );


        return res.json({

            success: true,

            products

        });


    } catch (error) {

        console.error(
            "GET PUBLIC PRODUCTS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load products"

        });

    }
}
/*
=========================================
GET PUBLIC PRODUCT DETAILS
=========================================
*/

async function getPublicProduct(
    req,
    res
) {

    try {

        const productId =
            Number(
                req.params.id
            );


        if (
            !productId ||
            Number.isNaN(productId)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid product ID"

            });
        }


        /*
        =================================
        PRODUCT
        =================================
        */

        const [
            products
        ] = await pool.execute(

            `

            SELECT

                p.id,

                p.product_name,

                p.category,

                p.description,

                p.sku,

                p.origin_country,

                p.unit,

                p.price,

                p.minimum_order_quantity,

                p.status,

                i.quantity,

                i.reserved_quantity,

                i.available_quantity

            FROM products p

            INNER JOIN inventory i
                ON i.product_id = p.id

            WHERE p.id = ?

            AND p.status = 'ACTIVE'

            LIMIT 1

            `,

            [
                productId
            ]

        );


        if (
            products.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Product not found"

            });
        }


        /*
        =================================
        IMAGES
        =================================
        */

        const [
            images
        ] = await pool.execute(

            `

            SELECT

                id,

                image_url,

                is_primary,

                display_order

            FROM product_images

            WHERE product_id = ?

            ORDER BY display_order ASC

            `,

            [
                productId
            ]

        );


        return res.json({

            success: true,

            product:
                products[0],

            images

        });


    } catch (error) {

        console.error(
            "GET PUBLIC PRODUCT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load product"

        });
    }
}module.exports = {

    createProduct,

    getSellerProducts,

    getSellerProduct,

    updateStock,

    getPublicProducts,

    getPublicProduct

};