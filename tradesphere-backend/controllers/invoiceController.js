const PDFDocument =
    require("pdfkit");


const {
    pool: db
} = require("../config/db");


/*
==================================================
INVOICE AVAILABLE STATUSES
==================================================

Invoice remains available after the order
has been shipped.

Even if a return request is created later,
the customer can still download the invoice.
*/

const INVOICE_AVAILABLE_STATUSES = [

    "SHIPPED",

    "DELIVERED",

    "RETURN_REQUESTED",

    "RETURN_ACCEPTED",

    "RETURN_REJECTED"

];


/*
==================================================
DOWNLOAD CUSTOMER INVOICE
==================================================
*/

async function downloadInvoice(
    req,
    res
) {

    try {

        /*
        ==========================================
        CUSTOMER
        ==========================================
        */

        const customerId =
            req.user?.id;


        if (!customerId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required."

            });

        }


        /*
        ==========================================
        REFERENCE NUMBER
        ==========================================
        */

        const {
            referenceNo
        } = req.params;


        if (
            !referenceNo ||
            !String(referenceNo).trim()
        ) {

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
        */

        const [
            orders
        ] = await db.query(

            `
            SELECT

                o.*,

                u.full_name AS customer_name,

                u.email AS customer_email,

                u.phone AS customer_phone

            FROM orders o

            LEFT JOIN users u
                ON u.id = o.customer_id

            WHERE o.reference_no = ?

              AND o.customer_id = ?

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
            !orders.length
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
        NORMALIZE STATUS
        ==========================================
        */

        const orderStatus =
            String(
                order.status || ""
            )
                .trim()
                .toUpperCase();


        /*
        ==========================================
        STATUS CHECK
        ==========================================
        */

        if (
            !INVOICE_AVAILABLE_STATUSES.includes(
                orderStatus
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invoice is available after the order has been shipped.",

                status:
                    orderStatus

            });

        }


        /*
        ==========================================
        GET ORDER ITEMS
        ==========================================
        */

        const [
            items
        ] = await db.query(

            `
            SELECT

                oi.*,

                p.name AS product_name

            FROM order_items oi

            LEFT JOIN products p
                ON p.id = oi.product_id

            WHERE oi.order_id = ?

            ORDER BY oi.id ASC
            `,

            [
                order.id
            ]

        );


        /*
        ==========================================
        CREATE PDF DOCUMENT
        ==========================================
        */

        const doc =
            new PDFDocument({

                size:
                    "A4",

                margin:
                    50,

                info: {

                    Title:
                        `TradeSphere Invoice - ${referenceNo}`,

                    Author:
                        "TradeSphere",

                    Subject:
                        "Order Invoice"

                }

            });


        /*
        ==========================================
        RESPONSE HEADERS
        ==========================================
        */

        res.statusCode =
            200;


        res.setHeader(
            "Content-Type",
            "application/pdf"
        );


        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${sanitizeFileName(
                referenceNo
            )}-invoice.pdf"`
        );


        res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate"
        );


        res.setHeader(
            "Pragma",
            "no-cache"
        );


        res.setHeader(
            "Expires",
            "0"
        );


        /*
        ==========================================
        PIPE PDF TO RESPONSE
        ==========================================
        */

        doc.pipe(
            res
        );


        /*
        ==========================================
        HEADER
        ==========================================
        */

        doc
            .fontSize(24)
            .font("Helvetica-Bold")
            .text(
                "TradeSphere"
            );


        doc
            .fontSize(11)
            .font("Helvetica")
            .text(
                "Order Invoice"
            );


        doc.moveDown(
            1
        );


        /*
        ==========================================
        ORDER INFORMATION
        ==========================================
        */

        doc
            .fontSize(12)
            .font("Helvetica-Bold")
            .text(
                "Order Information"
            );


        doc
            .fontSize(10)
            .font("Helvetica")
            .text(
                `Invoice / Order No: ${referenceNo}`
            );


        doc.text(
            `Order Date: ${formatDate(
                order.created_at ||
                order.createdAt
            )}`
        );


        if (
            order.shipped_at ||
            order.shippedAt
        ) {

            doc.text(
                `Shipped Date: ${formatDate(
                    order.shipped_at ||
                    order.shippedAt
                )}`
            );

        }


        if (
            order.delivered_at ||
            order.deliveredAt
        ) {

            doc.text(
                `Delivered Date: ${formatDate(
                    order.delivered_at ||
                    order.deliveredAt
                )}`
            );

        }


        doc.text(
            `Order Status: ${getStatusLabel(
                orderStatus
            )}`
        );


        doc.moveDown(
            1
        );


        /*
        ==========================================
        CUSTOMER
        ==========================================
        */

        doc
            .fontSize(12)
            .font("Helvetica-Bold")
            .text(
                "Customer"
            );


        doc
            .fontSize(10)
            .font("Helvetica")
            .text(
                order.customer_name ||
                "Customer"
            );


        if (
            order.customer_email
        ) {

            doc.text(
                `Email: ${order.customer_email}`
            );

        }


        if (
            order.customer_phone
        ) {

            doc.text(
                `Phone: ${order.customer_phone}`
            );

        }


        doc.moveDown(
            1
        );


        /*
        ==========================================
        DELIVERY ADDRESS
        ==========================================
        */

        const deliveryAddress =
            order.delivery_address ||
            order.deliveryAddress;

        const deliveryCity =
            order.delivery_city ||
            order.deliveryCity;

        const deliveryState =
            order.delivery_state ||
            order.deliveryState;

        const deliveryPincode =
            order.delivery_pincode ||
            order.deliveryPincode;


        if (
            deliveryAddress ||
            deliveryCity ||
            deliveryState ||
            deliveryPincode
        ) {

            doc
                .fontSize(12)
                .font("Helvetica-Bold")
                .text(
                    "Delivery Address"
                );


            doc
                .fontSize(10)
                .font("Helvetica");


            if (
                deliveryAddress
            ) {

                doc.text(
                    deliveryAddress
                );

            }


            if (
                deliveryCity
            ) {

                doc.text(
                    deliveryCity
                );

            }


            if (
                deliveryState
            ) {

                doc.text(
                    deliveryState
                );

            }


            if (
                deliveryPincode
            ) {

                doc.text(
                    `Pincode: ${deliveryPincode}`
                );

            }


            doc.moveDown(
                1
            );

        }


        /*
        ==========================================
        PRODUCTS
        ==========================================
        */

        doc
            .fontSize(13)
            .font("Helvetica-Bold")
            .text(
                "Products"
            );


        doc.moveDown(
            0.5
        );


        if (
            !items.length
        ) {

            doc
                .fontSize(10)
                .font("Helvetica")
                .text(
                    "No product information available."
                );

        }


        items.forEach(

            (
                item,
                index
            ) => {

                const productName =
                    item.product_name ||
                    item.productName ||
                    "Product";


                const quantity =
                    Number(
                        item.quantity || 0
                    );


                const unit =
                    item.unit ||
                    "";


                const unitPrice =
                    Number(
                        item.unit_price ||
                        item.unitPrice ||
                        0
                    );


                const subtotal =
                    Number(
                        item.subtotal ||
                        (
                            quantity *
                            unitPrice
                        ) ||
                        0
                    );


                doc
                    .fontSize(10)
                    .font("Helvetica-Bold")
                    .text(
                        `${index + 1}. ${productName}`
                    );


                doc
                    .fontSize(9)
                    .font("Helvetica")
                    .text(
                        `Quantity: ${formatNumber(
                            quantity
                        )}${unit ? ` ${unit}` : ""}`
                    );


                doc.text(
                    `Unit Price: INR ${formatMoney(
                        unitPrice
                    )}`
                );


                doc
                    .font("Helvetica-Bold")
                    .text(
                        `Amount: INR ${formatMoney(
                            subtotal
                        )}`
                    );


                doc.moveDown(
                    0.7
                );

            }

        );


        /*
        ==========================================
        SUMMARY LINE
        ==========================================
        */

        doc.moveDown(
            0.5
        );


        doc
            .moveTo(
                50,
                doc.y
            )
            .lineTo(
                545,
                doc.y
            )
            .stroke();


        doc.moveDown(
            0.7
        );


        /*
        ==========================================
        ORDER TOTALS
        ==========================================
        */

        const subtotal =
            Number(
                order.subtotal || 0
            );


        const deliveryCharge =
            Number(
                order.delivery_charge ||
                order.deliveryCharge ||
                0
            );


        const totalAmount =
            Number(
                order.total_amount ||
                order.totalAmount ||
                0
            );


        doc
            .fontSize(10)
            .font("Helvetica")
            .text(
                `Subtotal: INR ${formatMoney(
                    subtotal
                )}`
            );


        doc.text(
            `Delivery: ${
                deliveryCharge === 0
                    ? "FREE"
                    : `INR ${formatMoney(
                        deliveryCharge
                    )}`
            }`
        );


        doc.moveDown(
            0.5
        );


        doc
            .fontSize(15)
            .font("Helvetica-Bold")
            .text(
                `Total Amount: INR ${formatMoney(
                    totalAmount
                )}`
            );


        /*
        ==========================================
        RETURN INFORMATION
        ==========================================
        */

        if (

            orderStatus ===
                "RETURN_REQUESTED" ||

            orderStatus ===
                "RETURN_ACCEPTED" ||

            orderStatus ===
                "RETURN_REJECTED"

        ) {

            doc.moveDown(
                1.5
            );


            doc
                .fontSize(11)
                .font("Helvetica-Bold")
                .text(
                    "Return Information"
                );


            doc
                .fontSize(9)
                .font("Helvetica")
                .text(
                    `Return Status: ${getStatusLabel(
                        orderStatus
                    )}`
                );

        }


        /*
        ==========================================
        FOOTER
        ==========================================
        */

        doc.moveDown(
            2
        );


        doc
            .fontSize(9)
            .font("Helvetica")
            .text(
                "Thank you for shopping with TradeSphere.",
                {
                    align:
                        "center"
                }
            );


        doc.moveDown(
            0.3
        );


        doc
            .fontSize(8)
            .fillColor("#666666")
            .text(
                "This is a computer-generated invoice.",
                {
                    align:
                        "center"
                }
            );


        /*
        ==========================================
        FINISH PDF
        ==========================================
        */

        doc.end();


    } catch (error) {

        console.error(
            "DOWNLOAD INVOICE ERROR:",
            error
        );


        /*
        ==========================================
        RESPONSE NOT STARTED
        ==========================================
        */

        if (
            !res.headersSent
        ) {

            return res.status(500).json({

                success: false,

                message:
                    "Unable to generate invoice.",

                error:
                    process.env.NODE_ENV ===
                    "development"
                        ? error.message
                        : undefined

            });

        }


        /*
        ==========================================
        RESPONSE ALREADY STARTED
        ==========================================
        */

        try {

            res.end();

        } catch {

            // Ignore response end errors

        }

    }

}


/*
==================================================
FORMAT MONEY
==================================================
*/

function formatMoney(
    value
) {

    return Number(
        value || 0
    ).toLocaleString(

        "en-IN",

        {

            minimumFractionDigits:
                2,

            maximumFractionDigits:
                2

        }

    );

}


/*
==================================================
FORMAT NUMBER
==================================================
*/

function formatNumber(
    value
) {

    return Number(
        value || 0
    ).toLocaleString(

        "en-IN",

        {

            maximumFractionDigits:
                3

        }

    );

}


/*
==================================================
FORMAT DATE
==================================================
*/

function formatDate(
    value
) {

    if (
        !value
    ) {

        return "-";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleDateString(

        "en-IN",

        {

            day:
                "2-digit",

            month:
                "2-digit",

            year:
                "numeric"

        }

    );

}


/*
==================================================
STATUS LABEL
==================================================
*/

function getStatusLabel(
    status
) {

    switch (
        status
    ) {

        case "PENDING_SELLER_ACCEPTANCE":

            return "Waiting for Seller";


        case "ACCEPTED":

            return "Accepted";


        case "PROCESSING":

            return "Processing";


        case "SHIPPED":

            return "Shipped";


        case "DELIVERED":

            return "Delivered";


        case "RETURN_REQUESTED":

            return "Return Requested";


        case "RETURN_ACCEPTED":

            return "Return Accepted";


        case "RETURN_REJECTED":

            return "Return Rejected";


        case "CANCELLED":

            return "Cancelled";


        default:

            return status ||
                "Unknown";

    }

}


/*
==================================================
SANITIZE FILE NAME
==================================================
*/

function sanitizeFileName(
    value
) {

    return String(
        value || "order"
    )
        .replace(
            /[^a-zA-Z0-9_-]/g,
            "_"
        );

}


/*
==================================================
EXPORT
==================================================
*/

module.exports = {

    downloadInvoice

};