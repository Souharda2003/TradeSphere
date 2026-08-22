import {
    useEffect,
    useState
} from "react";


import {
    useNavigate,
    useParams
} from "react-router-dom";


import {
    ArrowLeft,
    Package,
    MapPin,
    User,
    Mail,
    Phone,
    CheckCircle,
    Clock,
    Truck,
    XCircle,
    AlertTriangle
} from "lucide-react";


import api
    from "../../services/api";


import "../../styles/orderDetails.css";


function OrderDetails() {

    const navigate =
        useNavigate();


    const {
        referenceNo
    } = useParams();


    const [order, setOrder] =
        useState(null);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");
    const [showCancelModal, setShowCancelModal] =
        useState(false);
    const [cancellingOrder, setCancellingOrder] =
    useState(false);
    useEffect(() => {

    loadOrder();


    const interval =
        setInterval(
            () => {

                loadOrder();

            },
            10000
        );


    return () => {

        clearInterval(
            interval
        );

    };

}, [referenceNo]);

    async function loadOrder() {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.get(

                    `/orders/${referenceNo}`

                );


            console.log(
                "ORDER DETAILS RESPONSE:",
                response.data
            );


            if (
                !response.data?.success
            ) {

                throw new Error(

                    response.data?.message ||

                    "Unable to load order."

                );

            }


            setOrder(
                response.data.order
            );


        } catch (error) {

            console.error(
                "LOAD ORDER DETAILS ERROR:",
                error
            );


            if (
                error.response?.status ===
                401
            ) {

                navigate(
                    `/login?redirect=/profile/orders/${referenceNo}`
                );

                return;

            }


            setError(

                error.response
                    ?.data
                    ?.message ||

                error.message ||

                "Unable to load order details."

            );


        } finally {

            setLoading(false);

        }

    }


    /* =========================================
   CANCEL ORDER
========================================= */

async function cancelOrder() {

    if (!order?.referenceNo) {
        return;
    }

    try {

        setCancellingOrder(true);

        setError("");

        const response =
            await api.put(
                `/orders/${order.referenceNo}/cancel`
            );

        console.log(
            "CANCEL ORDER RESPONSE:",
            response.data
        );

        if (
            response.data?.success
        ) {

            setOrder(
                previous => ({

                    ...previous,

                    status: "CANCELLED",

                    cancelledAt:
                        new Date().toISOString()

                })
            );

            setShowCancelModal(false);

        } else {

            setError(
                response.data?.message ||
                "Unable to cancel order."
            );

        }

    } catch (error) {

        console.error(
            "CANCEL ORDER ERROR:",
            error
        );

        setError(
            error.response?.data?.message ||
            "Unable to cancel order."
        );

    } finally {

        setCancellingOrder(false);

    }
}
    function formatMoney(
        value
    ) {

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
    =========================================
    FORMAT DATE
    =========================================
    */

    function formatDate(
        value
    ) {

        if (!value) {

            return "-";

        }


        return new Date(
            value
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    }


    /*
    =========================================
    STATUS LABEL
    =========================================
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


            case "REJECTED":

                return "Rejected";


            case "CANCELLED":

                return "Cancelled";


            case "PROCESSING":

                return "Processing";


            case "SHIPPED":

                return "Shipped";


            case "DELIVERED":

                return "Delivered";


            default:

                return status || "Unknown";

        }

    }


    /*
    =========================================
    STATUS ICON
    =========================================
    */

    function StatusIcon() {

        switch (
            order?.status
        ) {

            case "DELIVERED":

                return (
                    <CheckCircle
                        size={17}
                    />
                );


            case "SHIPPED":

                return (
                    <Truck
                        size={17}
                    />
                );


            case "REJECTED":

            case "CANCELLED":

                return (
                    <XCircle
                        size={17}
                    />
                );


            default:

                return (
                    <Clock
                        size={17}
                    />
                );

        }

    }


    /*
    =========================================
    LOADING
    =========================================
    */

    if (loading) {

        return (

            <div
                className="order-details-loading"
            >

                <div
                    className="order-loading-spinner"
                />

                <p>
                    Loading order details...
                </p>

            </div>

        );

    }


    /*
    =========================================
    ERROR
    =========================================
    */

    if (error) {

        return (

            <div
                className="order-details-page"
            >

                <div
                    className="order-details-error"
                >

                    <XCircle
                        size={42}
                    />

                    <h2>
                        Unable to load order
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/profile/orders"
                            )
                        }
                    >

                        <ArrowLeft
                            size={17}
                        />

                        Back to Orders

                    </button>

                </div>

            </div>

        );

    }


    if (!order) {

        return null;

    }


    return (

        <div
            className="order-details-page"
        >

            {/* =================================
                HEADER
            ================================= */}

            <header
                className="order-details-header"
            >

                <button
                    type="button"
                    className="order-back-button"
                    onClick={() =>
                        navigate(
                            "/profile/orders"
                        )
                    }
                >

                    <ArrowLeft
                        size={17}
                    />

                    Back to Orders

                </button>


                <div
                    className="order-details-brand"
                >

                    <Package
                        size={19}
                    />

                    My Order

                </div>


                <div
                    className="order-header-space"
                />

            </header>


            <main
                className="order-details-main"
            >

                {/* =================================
                    TITLE
                ================================= */}

                <section
                    className="order-details-title"
                >

                    <div>

                        <p>
                            ORDER DETAILS
                        </p>

                        <h1>
                            {order.referenceNo}
                        </h1>

                        <span>
                            Placed on{" "}
                            {formatDate(
                                order.createdAt
                            )}
                        </span>

                    </div>


                    <div
                        className={`order-status-badge status-${String(
                            order.status || ""
                        ).toLowerCase()}`
                        }
                    >

                        <StatusIcon />

                        {
                            getStatusLabel(
                                order.status
                            )
                        }

                    </div>

                </section>


                {/* =================================
                    STATUS
                ================================= */}

                <section
                    className="order-details-card"
                >

                    <div
                        className="order-section-heading"
                    >

                        <Clock
                            size={19}
                        />

                        <div>

                            <h2>
                                Order Status
                            </h2>

                            <p>
                                Current status of your order
                            </p>

                        </div>

                    </div>


                    <div
                        className="order-status-timeline"
                    >

                        <div
                            className={`timeline-step active`}
                        >

                            <div
                                className="timeline-dot"
                            >
                                <CheckCircle
                                    size={15}
                                />
                            </div>

                            <span>
                                Order Placed
                            </span>

                        </div>


                        <div
                            className={`timeline-line ${
                                [
                                    "ACCEPTED",
                                    "PROCESSING",
                                    "SHIPPED",
                                    "DELIVERED"
                                ].includes(
                                    order.status
                                )
                                    ? "active"
                                    : ""
                            }`}
                        />


                        <div
                            className={`timeline-step ${
                                [
                                    "ACCEPTED",
                                    "PROCESSING",
                                    "SHIPPED",
                                    "DELIVERED"
                                ].includes(
                                    order.status
                                )
                                    ? "active"
                                    : ""
                            }`}
                        >

                            <div
                                className="timeline-dot"
                            >
                                {[
                                    "ACCEPTED",
                                    "PROCESSING",
                                    "SHIPPED",
                                    "DELIVERED"
                                ].includes(
                                    order.status
                                )
                                    ? (
                                        <CheckCircle
                                            size={15}
                                        />
                                    )
                                    : (
                                        <Clock
                                            size={15}
                                        />
                                    )
                                }
                            </div>

                            <span>
                                Seller Accepted
                            </span>

                        </div>


                        <div
                            className={`timeline-line ${
                                [
                                    "PROCESSING",
                                    "SHIPPED",
                                    "DELIVERED"
                                ].includes(
                                    order.status
                                )
                                    ? "active"
                                    : ""
                            }`}
                        />


                        <div
                            className={`timeline-step ${
                                [
                                    "PROCESSING",
                                    "SHIPPED",
                                    "DELIVERED"
                                ].includes(
                                    order.status
                                )
                                    ? "active"
                                    : ""
                            }`}
                        >

                            <div
                                className="timeline-dot"
                            >
                                <Package
                                    size={15}
                                />
                            </div>

                            <span>
                                Processing
                            </span>

                        </div>


                        <div
                            className={`timeline-line ${
                                [
                                    "SHIPPED",
                                    "DELIVERED"
                                ].includes(
                                    order.status
                                )
                                    ? "active"
                                    : ""
                            }`}
                        />


                        <div
                            className={`timeline-step ${
                                [
                                    "SHIPPED",
                                    "DELIVERED"
                                ].includes(
                                    order.status
                                )
                                    ? "active"
                                    : ""
                            }`}
                        >

                            <div
                                className="timeline-dot"
                            >
                                <Truck
                                    size={15}
                                />
                            </div>

                            <span>
                                Shipped
                            </span>

                        </div>


                        <div
                            className={`timeline-line ${
                                order.status ===
                                "DELIVERED"
                                    ? "active"
                                    : ""
                            }`}
                        />


                        <div
                            className={`timeline-step ${
                                order.status ===
                                "DELIVERED"
                                    ? "active"
                                    : ""
                            }`}
                        >

                            <div
                                className="timeline-dot"
                            >
                                <CheckCircle
                                    size={15}
                                />
                            </div>

                            <span>
                                Delivered
                            </span>

                        </div>

                    </div>

                </section>


                {/* =================================
                    PRODUCTS
                ================================= */}

                <section
                    className="order-details-card"
                >

                    <div
                        className="order-section-heading"
                    >

                        <Package
                            size={19}
                        />

                        <div>

                            <h2>
                                Products
                            </h2>

                            <p>
                                Items included in this order
                            </p>

                        </div>

                    </div>


                    <div
                        className="order-products-list"
                    >

                        {order.items?.map(
                            item => (

                                <div
                                    className="order-product-row"
                                    key={item.id}
                                >

                                    <div
                                        className="order-product-info"
                                    >

                                        <div
                                            className="order-product-icon"
                                        >

                                            <Package
                                                size={19}
                                            />

                                        </div>


                                        <div>

                                            <strong>
                                                {
                                                    item.productName
                                                }
                                            </strong>

                                            <span>

                                                {
                                                    Number(
                                                        item.quantity
                                                    ).toLocaleString(
                                                        "en-IN",
                                                        {
                                                            maximumFractionDigits: 3
                                                        }
                                                    )
                                                }

                                                {" "}

                                                {
                                                    item.unit
                                                }

                                                {" × ₹"}

                                                {
                                                    formatMoney(
                                                        item.unitPrice
                                                    )
                                                }

                                            </span>


                                            {item.sku && (

                                                <small>

                                                    SKU:
                                                    {" "}
                                                    {item.sku}

                                                </small>

                                            )}

                                        </div>

                                    </div>


                                    <strong
                                        className="order-product-price"
                                    >

                                        ₹
                                        {
                                            formatMoney(
                                                item.subtotal
                                            )
                                        }

                                    </strong>

                                </div>

                            )
                        )}

                    </div>

                </section>


                {/* =================================
                    TWO COLUMN INFORMATION
                ================================= */}

                <div
                    className="order-info-grid"
                >

                    {/* SELLER */}

                    <section
                        className="order-details-card"
                    >

                        <div
                            className="order-section-heading"
                        >

                            <User
                                size={19}
                            />

                            <div>

                                <h2>
                                    Seller Information
                                </h2>

                                <p>
                                    Seller handling your order
                                </p>

                            </div>

                        </div>


                        <div
                            className="seller-details"
                        >

                            <strong>
                                {
                                    order.seller?.name ||
                                    "Seller"
                                }
                            </strong>


                            {order.seller?.email && (

                                <div>

                                    <Mail
                                        size={15}
                                    />

                                    {
                                        order.seller.email
                                    }

                                </div>

                            )}


                            {order.seller?.phone && (

                                <div>

                                    <Phone
                                        size={15}
                                    />

                                    {
                                        order.seller.phone
                                    }

                                </div>

                            )}

                        </div>

                    </section>


                    {/* DELIVERY */}

                    <section
                        className="order-details-card"
                    >

                        <div
                            className="order-section-heading"
                        >

                            <MapPin
                                size={19}
                            />

                            <div>

                                <h2>
                                    Delivery Information
                                </h2>

                                <p>
                                    Order delivery address
                                </p>

                            </div>

                        </div>


                        <div
                            className="delivery-details"
                        >

                            <strong>
                                {
                                    order.delivery?.address
                                }
                            </strong>

                            <span>
                                {
                                    order.delivery?.city
                                }
                            </span>

                            <span>
                                {
                                    order.delivery?.state
                                }
                            </span>

                            <span>
                                Pincode:{" "}
                                {
                                    order.delivery?.pincode
                                }
                            </span>

                        </div>

                    </section>

                </div>


                {/* =================================
                    ORDER SUMMARY
                ================================= */}

                <section
                    className="order-details-card order-summary-card"
                >

                    <div
                        className="order-section-heading"
                    >

                        <CheckCircle
                            size={19}
                        />

                        <div>

                            <h2>
                                Order Summary
                            </h2>

                            <p>
                                Final order amount
                            </p>

                        </div>

                    </div>


                    <div
                        className="order-summary-content"
                    >

                        <div
                            className="summary-row"
                        >

                            <span>
                                Subtotal
                            </span>

                            <strong>
                                ₹
                                {
                                    formatMoney(
                                        order.subtotal
                                    )
                                }
                            </strong>

                        </div>


                        <div
                            className="summary-row"
                        >

                            <span>
                                Delivery
                            </span>

                            <strong>

                                {Number(
                                    order.deliveryCharge
                                ) === 0

                                    ? "Free"

                                    : `₹${formatMoney(
                                        order.deliveryCharge
                                    )}`}

                            </strong>

                        </div>


                        <div
                            className="summary-divider"
                        />


                        <div
                            className="summary-total-row"
                        >

                            <span>
                                Total
                            </span>

                            <strong>
                                ₹
                                {
                                    formatMoney(
                                        order.totalAmount
                                    )
                                }
                            </strong>

                        </div>

                    </div>

                </section>

            {order &&
                (
                    order.status ===
                        "PENDING_SELLER_ACCEPTANCE" ||

                    order.status ===
                        "ACCEPTED" ||

                    order.status ===
                        "PROCESSING"
                ) && (

                    <div className="order-cancel-section">

                        <div className="cancel-info">

                            <XCircle size={20} />

                            <div>

                                <strong>
                                    Want to cancel this order?
                                </strong>

                                <span>
                                    Your reserved inventory
                                    will be released automatically.
                                </span>

                            </div>

                        </div>


                        <button
                            type="button"
                            className="order-cancel-button"
                            onClick={() =>
                                setShowCancelModal(true)
                            }
                            disabled={cancellingOrder}
                        >

                            <XCircle size={18} />

                            Cancel Order

                        </button>

                    </div>

                )}

        </main>


        {/* =====================================
            CANCEL MODAL
        ===================================== */}

        {showCancelModal && (

            <div
                className="cancel-modal-overlay"
                onClick={() => {

                    if (!cancellingOrder) {
                        setShowCancelModal(false);
                    }

                }}
            >

                <div
                    className="cancel-modal"
                    onClick={(event) =>
                        event.stopPropagation()
                    }
                >

                    <div className="cancel-modal-icon">

                        <XCircle size={32} />

                    </div>


                    <div className="cancel-modal-content">

                        <span className="cancel-modal-label">
                            ORDER CANCELLATION
                        </span>

                        <h2>
                            Cancel this order?
                        </h2>

                        <p>
                            Are you sure you want to cancel order{" "}

                            <strong>
                                {order.referenceNo}
                            </strong>
                            ?
                        </p>


                        <div className="cancel-modal-warning">

                            <AlertTriangle size={18} />

                            <span>
                                The reserved inventory will
                                be released automatically.
                                This action cannot be undone.
                            </span>

                        </div>

                    </div>


                    <div className="cancel-modal-actions">

                        <button
                            type="button"
                            className="cancel-modal-keep"
                            disabled={cancellingOrder}
                            onClick={() =>
                                setShowCancelModal(false)
                            }
                        >
                            Keep Order
                        </button>


                        <button
                            type="button"
                            className="cancel-modal-confirm"
                            disabled={cancellingOrder}
                            onClick={cancelOrder}
                        >

                            {cancellingOrder
                                ? (
                                    <>
                                        <span
                                            className="cancel-spinner"
                                        />

                                        Cancelling...
                                    </>
                                )
                                : (
                                    <>
                                        <XCircle size={17} />

                                        Yes, Cancel Order
                                    </>
                                )
                            }

                        </button>

                    </div>

                </div>

            </div>

        )}

    </div>

);
}


export default OrderDetails;