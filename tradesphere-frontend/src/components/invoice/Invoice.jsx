import React from "react";

import {
    FileText
} from "lucide-react";

import "../../styles/invoice.css";


/*
==================================================
MONEY FORMAT
==================================================
*/

function money(value) {

    return Number(
        value || 0
    ).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,

            maximumFractionDigits: 2
        }
    );

}


/*
==================================================
DATE FORMAT
==================================================
*/

function formatDate(
    value
) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(value);


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
                "short",

            year:
                "numeric"
        }
    );

}


/*
==================================================
INVOICE COMPONENT
==================================================
*/

function Invoice({
    order
}) {

    if (!order) {

        return null;

    }


    /*
    ==============================================
    CUSTOMER
    ==============================================
    */

    const customer =
        order.customer ||
        order.user ||
        {};


    /*
    ==============================================
    SELLER
    ==============================================
    */

    const seller =
        order.seller ||
        {};


    /*
    ==============================================
    ITEMS
    ==============================================
    */

    const items =
        Array.isArray(
            order.items
        )
            ? order.items
            : [];


    /*
    ==============================================
    AMOUNTS
    ==============================================
    */

    const subtotal =
        Number(
            order.subtotal ||
            0
        );


    const delivery =
        Number(
            order.deliveryCharge ||
            order.delivery_charge ||
            0
        );


    const cgst =
        Number(
            order.cgstAmount ||
            order.cgst_amount ||
            0
        );


    const sgst =
        Number(
            order.sgstAmount ||
            order.sgst_amount ||
            0
        );


    const igst =
        Number(
            order.igstAmount ||
            order.igst_amount ||
            0
        );


    const gst =
        Number(
            order.gstAmount ||
            order.gst_amount ||
            cgst +
            sgst +
            igst
        );


    const total =
        Number(
            order.totalAmount ||
            order.total_amount ||
            subtotal +
            gst +
            delivery
        );


    return (

        <div
            className="invoice-document"
        >

            {/* ======================================
                HEADER
            ====================================== */}

            <div
                className="invoice-header"
            >

                <div>

                    <h1>
                        TradeSphere
                    </h1>

                    <p>
                        Export-Import Marketplace
                    </p>

                </div>


                <div
                    className="invoice-title"
                >

                    <FileText
                        size={26}
                    />

                    <div>

                        <strong>
                            TAX INVOICE
                        </strong>

                        <span>
                            #
                            {order.referenceNo}
                        </span>

                    </div>

                </div>

            </div>


            {/* ======================================
                ORDER INFO
            ====================================== */}

            <div
                className="invoice-meta"
            >

                <div>

                    <span>
                        Invoice / Order No.
                    </span>

                    <strong>
                        {
                            order.referenceNo ||
                            "-"
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        Order Date
                    </span>

                    <strong>
                        {
                            formatDate(
                                order.createdAt ||
                                order.created_at
                            )
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        Status
                    </span>

                    <strong>
                        {
                            order.status ||
                            "-"
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        Delivery Date
                    </span>

                    <strong>
                        {
                            formatDate(
                                order.deliveredAt ||
                                order.delivered_at
                            )
                        }
                    </strong>

                </div>

            </div>


            {/* ======================================
                CUSTOMER + SELLER
            ====================================== */}

            <div
                className="invoice-parties"
            >

                {/* CUSTOMER */}

                <div
                    className="invoice-party"
                >

                    <span>
                        BILL TO
                    </span>


                    <h3>
                        {
                            customer.fullName ||
                            customer.full_name ||
                            customer.name ||
                            order.customerName ||
                            "Customer"
                        }
                    </h3>


                    {(

                        customer.email ||
                        order.customerEmail

                    ) && (

                        <p>
                            {
                                customer.email ||
                                order.customerEmail
                            }
                        </p>

                    )}


                    {(

                        customer.phone ||
                        order.customerPhone

                    ) && (

                        <p>
                            {
                                customer.phone ||
                                order.customerPhone
                            }
                        </p>

                    )}


                    <p>

                        {
                            order.delivery?.address ||
                            "-"
                        }

                        <br />

                        {
                            order.delivery?.city ||
                            "-"
                        }

                        {", "}

                        {
                            order.delivery?.state ||
                            "-"
                        }

                        <br />

                        PIN:{" "}

                        {
                            order.delivery?.pincode ||
                            "-"
                        }

                    </p>

                </div>


                {/* SELLER */}

                <div
                    className="invoice-party"
                >

                    <span>
                        SELLER
                    </span>


                    <h3>
                        {
                            seller.name ||
                            seller.full_name ||
                            "Seller"
                        }
                    </h3>


                    {seller.email && (

                        <p>
                            {
                                seller.email
                            }
                        </p>

                    )}


                    {seller.phone && (

                        <p>
                            {
                                seller.phone
                            }
                        </p>

                    )}


                    {seller.address && (

                        <p>
                            {
                                seller.address
                            }
                        </p>

                    )}


                    {seller.city && (

                        <p>
                            {
                                seller.city
                            }
                        </p>

                    )}


                    {seller.state && (

                        <p>
                            {
                                seller.state
                            }
                        </p>

                    )}


                    {seller.pincode && (

                        <p>
                            PIN:{" "}
                            {
                                seller.pincode
                            }
                        </p>

                    )}


                    {seller.gstin && (

                        <p>
                            GSTIN:{" "}
                            {
                                seller.gstin
                            }
                        </p>

                    )}

                </div>

            </div>


            {/* ======================================
                PRODUCTS
            ====================================== */}

            <div
                className="invoice-products"
            >

                <h2>
                    Order Items
                </h2>


                <table>

                    <thead>

                        <tr>

                            <th>
                                #
                            </th>

                            <th>
                                Product
                            </th>

                            <th>
                                SKU
                            </th>

                            <th>
                                Qty
                            </th>

                            <th>
                                Unit Price
                            </th>

                            <th>
                                GST
                            </th>

                            <th>
                                Amount
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {items.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="7"
                                    style={{
                                        textAlign:
                                            "center"
                                    }}
                                >

                                    No products found.

                                </td>

                            </tr>

                        ) : (

                            items.map(
                                (
                                    item,
                                    index
                                ) => {

                                    const quantity =
                                        Number(
                                            item.quantity ||
                                            0
                                        );


                                    const unitPrice =
                                        Number(
                                            item.unitPrice ||
                                            item.unit_price ||
                                            0
                                        );


                                    const itemSubtotal =
                                        Number(
                                            item.subtotal ||
                                            quantity *
                                            unitPrice
                                        );


                                    const itemGST =
                                        Number(
                                            item.gst ||
                                            item.gstAmount ||
                                            item.gst_amount ||
                                            0
                                        );


                                    return (

                                        <tr
                                            key={
                                                item.id ||
                                                `${order.referenceNo}-${index}`
                                            }
                                        >

                                            <td>
                                                {
                                                    index + 1
                                                }
                                            </td>


                                            <td>

                                                <strong>
                                                    {
                                                        item.productName ||
                                                        item.product_name ||
                                                        "Product"
                                                    }
                                                </strong>

                                                <small>
                                                    {
                                                        item.unit ||
                                                        ""
                                                    }
                                                </small>

                                            </td>


                                            <td>
                                                {
                                                    item.sku ||
                                                    "-"
                                                }
                                            </td>


                                            <td>
                                                {
                                                    quantity
                                                }

                                                {" "}

                                                {
                                                    item.unit ||
                                                    ""
                                                }
                                            </td>


                                            <td>
                                                ₹
                                                {
                                                    money(
                                                        unitPrice
                                                    )
                                                }
                                            </td>


                                            <td>
                                                ₹
                                                {
                                                    money(
                                                        itemGST
                                                    )
                                                }
                                            </td>


                                            <td>
                                                ₹
                                                {
                                                    money(
                                                        itemSubtotal
                                                    )
                                                }
                                            </td>

                                        </tr>

                                    );

                                }
                            )

                        )}

                    </tbody>

                </table>

            </div>


            {/* ======================================
                SUMMARY
            ====================================== */}

            <div
                className="invoice-summary"
            >

                <div
                    className="invoice-summary-box"
                >

                    <div>

                        <span>
                            Subtotal
                        </span>

                        <strong>
                            ₹
                            {money(
                                subtotal
                            )}
                        </strong>

                    </div>


                    {cgst > 0 && (

                        <div>

                            <span>
                                CGST
                            </span>

                            <strong>
                                ₹
                                {money(
                                    cgst
                                )}
                            </strong>

                        </div>

                    )}


                    {sgst > 0 && (

                        <div>

                            <span>
                                SGST
                            </span>

                            <strong>
                                ₹
                                {money(
                                    sgst
                                )}
                            </strong>

                        </div>

                    )}


                    {igst > 0 && (

                        <div>

                            <span>
                                IGST
                            </span>

                            <strong>
                                ₹
                                {money(
                                    igst
                                )}
                            </strong>

                        </div>

                    )}


                    {gst > 0 &&
                    cgst === 0 &&
                    sgst === 0 &&
                    igst === 0 && (

                        <div>

                            <span>
                                GST
                            </span>

                            <strong>
                                ₹
                                {money(
                                    gst
                                )}
                            </strong>

                        </div>

                    )}


                    <div>

                        <span>
                            Delivery
                        </span>

                        <strong>

                            {
                                delivery === 0

                                    ? "FREE"

                                    : `₹${money(
                                        delivery
                                    )}`
                            }

                        </strong>

                    </div>


                    <div
                        className="invoice-total"
                    >

                        <span>
                            Grand Total
                        </span>

                        <strong>
                            ₹
                            {money(
                                total
                            )}
                        </strong>

                    </div>

                </div>

            </div>


            {/* ======================================
                FOOTER
            ====================================== */}

            <div
                className="invoice-footer"
            >

                <strong>
                    Thank you for shopping with TradeSphere.
                </strong>

                <span>
                    This is a computer-generated invoice.
                </span>

            </div>

        </div>

    );

}


export default Invoice;