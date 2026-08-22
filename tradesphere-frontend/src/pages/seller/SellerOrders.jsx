import {
    useEffect,
    useState
} from "react";

import {
    ShoppingCart,
    ArrowLeft,
    RefreshCw,
    CheckCircle,
    XCircle,
    Package,
    Truck,
    Clock3,
    AlertTriangle
} from "lucide-react";

import {
    useNavigate
} from "react-router-dom";

import api from "../../services/api";

import "../../styles/seller-orders.css";


function SellerOrders() {

    const navigate = useNavigate();


    /* =====================================================
       STATE
    ===================================================== */

    const [orders, setOrders] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [updatingOrderId, setUpdatingOrderId] =
        useState(null);


    /*
    ========================================================
    SHIPMENT MODAL
    ========================================================
    */

    const [showShipmentModal, setShowShipmentModal] =
        useState(false);

    const [selectedShipmentOrder, setSelectedShipmentOrder] =
        useState(null);


    /* =====================================================
       LOAD ORDERS
    ===================================================== */

    async function loadOrders() {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.get(
                    "/orders/seller/all"
                );


            const fetchedOrders =
                Array.isArray(
                    response.data?.orders
                )
                    ? response.data.orders
                    : [];


            setOrders(
                fetchedOrders
            );


        } catch (error) {

            console.error(
                "SELLER ORDERS ERROR:",
                error
            );


            setError(
                error.response
                    ?.data
                    ?.message ||
                "Unable to load orders."
            );


        } finally {

            setLoading(false);

        }

    }


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {

        loadOrders();

    }, []);


    /* =====================================================
       STATUS LABEL
    ===================================================== */

    function getStatusLabel(
        status
    ) {

        switch (status) {

            case "PENDING_SELLER_ACCEPTANCE":
                return "PENDING";

            case "ACCEPTED":
                return "ACCEPTED";

            case "PROCESSING":
                return "PROCESSING";

            case "SHIPPED":
                return "SHIPPED";

            case "DELIVERED":
                return "DELIVERED";

            case "REJECTED":
                return "REJECTED";

            case "CANCELLED":
                return "CANCELLED";

            default:
                return status || "UNKNOWN";

        }

    }


    /* =====================================================
       STATUS CLASS
    ===================================================== */

    function getStatusClass(
        status
    ) {

        return (
            status
                ?.toLowerCase()
                .replaceAll(
                    "_",
                    "-"
                ) || ""
        );

    }


    /* =====================================================
       STATUS ICON
    ===================================================== */

    function getStatusIcon(
        status
    ) {

        switch (status) {

            case "PENDING_SELLER_ACCEPTANCE":

                return (
                    <Clock3
                        size={14}
                    />
                );


            case "ACCEPTED":

                return (
                    <CheckCircle
                        size={14}
                    />
                );


            case "PROCESSING":

                return (
                    <Package
                        size={14}
                    />
                );


            case "SHIPPED":

                return (
                    <Truck
                        size={14}
                    />
                );


            case "DELIVERED":

                return (
                    <CheckCircle
                        size={14}
                    />
                );


            case "REJECTED":

            case "CANCELLED":

                return (
                    <XCircle
                        size={14}
                    />
                );


            default:

                return null;

        }

    }


    /* =====================================================
       UPDATE CHECK
    ===================================================== */

    function isUpdating(
        orderId
    ) {

        return (
            updatingOrderId ===
            orderId
        );

    }


    /* =====================================================
       ACCEPT ORDER
    ===================================================== */

    async function handleAcceptOrder(
        orderId
    ) {

        try {

            setUpdatingOrderId(
                orderId
            );

            setError("");


            const response =
                await api.patch(
                    `/orders/seller/${orderId}/accept`
                );


            if (
                !response.data?.success
            ) {

                throw new Error(
                    response.data?.message ||
                    "Unable to accept order."
                );

            }


            await loadOrders();


        } catch (error) {

            console.error(
                "ACCEPT ORDER ERROR:",
                error
            );


            setError(
                error.response
                    ?.data
                    ?.message ||
                error.message ||
                "Unable to accept order."
            );


        } finally {

            setUpdatingOrderId(
                null
            );

        }

    }


    /* =====================================================
       REJECT ORDER
    ===================================================== */

    async function handleRejectOrder(
        orderId
    ) {

        const confirmed =
            window.confirm(
                "Are you sure you want to reject this order?"
            );


        if (!confirmed) {

            return;

        }


        try {

            setUpdatingOrderId(
                orderId
            );

            setError("");


            const response =
                await api.patch(
                    `/orders/seller/${orderId}/reject`
                );


            if (
                !response.data?.success
            ) {

                throw new Error(
                    response.data?.message ||
                    "Unable to reject order."
                );

            }


            await loadOrders();


        } catch (error) {

            console.error(
                "REJECT ORDER ERROR:",
                error
            );


            setError(
                error.response
                    ?.data
                    ?.message ||
                error.message ||
                "Unable to reject order."
            );


        } finally {

            setUpdatingOrderId(
                null
            );

        }

    }


    /* =====================================================
       START PROCESSING
    ===================================================== */

    async function handleStartProcessing(
        orderId
    ) {

        try {

            setUpdatingOrderId(
                orderId
            );

            setError("");


            const response =
                await api.patch(

                    `/orders/seller/${orderId}/status`,

                    {
                        status:
                            "PROCESSING"
                    }

                );


            if (
                !response.data?.success
            ) {

                throw new Error(
                    response.data?.message ||
                    "Unable to start processing."
                );

            }


            await loadOrders();


        } catch (error) {

            console.error(
                "PROCESSING ERROR:",
                error
            );


            setError(
                error.response
                    ?.data
                    ?.message ||
                error.message ||
                "Unable to start processing."
            );


        } finally {

            setUpdatingOrderId(
                null
            );

        }

    }


    /* =====================================================
       OPEN SHIPMENT MODAL
    ===================================================== */

    function openShipmentModal(
        order
    ) {

        if (
            !order ||
            order.status !==
            "PROCESSING"
        ) {

            return;

        }


        setSelectedShipmentOrder(
            order
        );


        setShowShipmentModal(
            true
        );

        setError("");

    }


    /* =====================================================
       CLOSE SHIPMENT MODAL
    ===================================================== */

    function closeShipmentModal() {

        if (
            updatingOrderId !==
            null
        ) {

            return;

        }


        setShowShipmentModal(
            false
        );


        setSelectedShipmentOrder(
            null
        );

    }


    /* =====================================================
       CONFIRM SHIPMENT
    ===================================================== */

    async function confirmShipment() {

        if (
            !selectedShipmentOrder
        ) {

            return;

        }


        const orderId =
            selectedShipmentOrder.id;


        try {

            setUpdatingOrderId(
                orderId
            );

            setError("");


            const response =
                await api.patch(

                    `/orders/seller/${orderId}/status`,

                    {
                        status:
                            "SHIPPED"
                    }

                );


            if (
                !response.data?.success
            ) {

                throw new Error(
                    response.data?.message ||
                    "Unable to mark order as shipped."
                );

            }


            /*
            =============================================
            CLOSE MODAL FIRST
            =============================================
            */

            setShowShipmentModal(
                false
            );


            setSelectedShipmentOrder(
                null
            );


            /*
            =============================================
            RELOAD DATA
            =============================================
            */

            await loadOrders();


        } catch (error) {

            console.error(
                "SHIPMENT ERROR:",
                error
            );


            setError(
                error.response
                    ?.data
                    ?.message ||
                error.message ||
                "Unable to mark order as shipped."
            );


        } finally {

            setUpdatingOrderId(
                null
            );

        }

    }


    /* =====================================================
       MARK DELIVERED
    ===================================================== */

    async function handleMarkDelivered(
        orderId
    ) {

        try {

            setUpdatingOrderId(
                orderId
            );

            setError("");


            const response =
                await api.patch(

                    `/orders/seller/${orderId}/status`,

                    {
                        status:
                            "DELIVERED"
                    }

                );


            if (
                !response.data?.success
            ) {

                throw new Error(
                    response.data?.message ||
                    "Unable to mark order as delivered."
                );

            }


            await loadOrders();


        } catch (error) {

            console.error(
                "DELIVERED ERROR:",
                error
            );


            setError(
                error.response
                    ?.data
                    ?.message ||
                error.message ||
                "Unable to mark order as delivered."
            );


        } finally {

            setUpdatingOrderId(
                null
            );

        }

    }


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div
                className="seller-orders-loading"
            >

                <RefreshCw
                    size={20}
                    className="seller-orders-spinner"
                />

                <span>
                    Loading orders...
                </span>

            </div>

        );

    }


    /* =====================================================
       PAGE
    ===================================================== */

    return (

        <div
            className="seller-orders-page"
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <header
                className="seller-orders-header"
            >

                <button
                    type="button"
                    className="seller-orders-back"
                    onClick={() =>
                        navigate(
                            "/seller/dashboard"
                        )
                    }
                >

                    <ArrowLeft
                        size={18}
                    />

                    Back

                </button>


                <div>

                    <p>
                        SELLER CENTRE
                    </p>

                    <h1>
                        Customer Orders
                    </h1>

                    <span>
                        View and manage all
                        customer orders.
                    </span>

                </div>


                <button
                    type="button"
                    className="seller-orders-refresh"
                    onClick={
                        loadOrders
                    }
                >

                    <RefreshCw
                        size={17}
                    />

                    Refresh

                </button>

            </header>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div
                    className="seller-orders-error"
                >

                    <AlertTriangle
                        size={17}
                    />

                    <span>
                        {error}
                    </span>

                </div>

            )}


            {/* =================================================
                EMPTY
            ================================================= */}

            {orders.length === 0 ? (

                <div
                    className="seller-orders-empty"
                >

                    <ShoppingCart
                        size={40}
                    />

                    <strong>
                        No orders found
                    </strong>

                    <span>
                        Customer orders will
                        appear here.
                    </span>

                </div>

            ) : (

                <div
                    className="seller-orders-list"
                >

                    {orders.map(
                        order => (

                            <article
                                key={
                                    order.id
                                }

                                className="seller-order-card"
                            >

                                {/* =========================================
                                    LEFT
                                ========================================= */}

                                <div
                                    className="seller-order-main"
                                >

                                    <div
                                        className="seller-order-icon"
                                    >

                                        <ShoppingCart
                                            size={20}
                                        />

                                    </div>


                                    <div
                                        className="seller-order-info"
                                    >

                                        <strong>
                                            {
                                                order.reference_no
                                            }
                                        </strong>


                                        <span>
                                            Customer:{" "}
                                            {
                                                order.customer_name ||
                                                "Customer"
                                            }
                                        </span>


                                        <span>
                                            Phone:{" "}
                                            {
                                                order.customer_phone ||
                                                "-"
                                            }
                                        </span>


                                        <small>
                                            {
                                                order.created_at
                                                    ? new Date(
                                                        order.created_at
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )
                                                    : "-"
                                            }
                                        </small>

                                    </div>

                                </div>


                                {/* =========================================
                                    RIGHT
                                ========================================= */}

                                <div
                                    className="seller-order-right"
                                >

                                    <strong
                                        className="seller-order-amount"
                                    >

                                        ₹
                                        {
                                            Number(
                                                order.total_amount ||
                                                0
                                            ).toLocaleString(
                                                "en-IN",
                                                {
                                                    minimumFractionDigits:
                                                        2,

                                                    maximumFractionDigits:
                                                        2
                                                }
                                            )
                                        }

                                    </strong>


                                    {/* =====================================
                                        STATUS
                                    ===================================== */}

                                    <span
                                        className={`
                                            seller-order-status
                                            ${getStatusClass(
                                                order.status
                                            )}
                                        `}
                                    >

                                        {
                                            getStatusIcon(
                                                order.status
                                            )
                                        }

                                        {
                                            getStatusLabel(
                                                order.status
                                            )
                                        }

                                    </span>


                                    {/* =====================================
                                        ACTION AREA
                                    ===================================== */}

                                    <div
                                        className="seller-order-actions"
                                    >

                                        {/* =================================
                                            PENDING
                                        ================================= */}

                                        {order.status ===
                                            "PENDING_SELLER_ACCEPTANCE" && (

                                            <>

                                                <button
                                                    type="button"
                                                    className="seller-order-button seller-order-accept"
                                                    disabled={
                                                        isUpdating(
                                                            order.id
                                                        )
                                                    }
                                                    onClick={() =>
                                                        handleAcceptOrder(
                                                            order.id
                                                        )
                                                    }
                                                >

                                                    {
                                                        isUpdating(
                                                            order.id
                                                        )
                                                            ? (
                                                                <>
                                                                    <RefreshCw
                                                                        size={15}
                                                                        className="seller-orders-spinner"
                                                                    />

                                                                    Accepting...
                                                                </>
                                                            )
                                                            : (
                                                                <>
                                                                    <CheckCircle
                                                                        size={15}
                                                                    />

                                                                    Accept
                                                                </>
                                                            )
                                                    }

                                                </button>


                                                <button
                                                    type="button"
                                                    className="seller-order-button seller-order-reject"
                                                    disabled={
                                                        isUpdating(
                                                            order.id
                                                        )
                                                    }
                                                    onClick={() =>
                                                        handleRejectOrder(
                                                            order.id
                                                        )
                                                    }
                                                >

                                                    <XCircle
                                                        size={15}
                                                    />

                                                    Reject

                                                </button>

                                            </>

                                        )}


                                        {/* =================================
                                            ACCEPTED
                                        ================================= */}

                                        {order.status ===
                                            "ACCEPTED" && (

                                            <button
                                                type="button"
                                                className="seller-order-button seller-order-processing"
                                                disabled={
                                                    isUpdating(
                                                        order.id
                                                    )
                                                }
                                                onClick={() =>
                                                    handleStartProcessing(
                                                        order.id
                                                    )
                                                }
                                            >

                                                {
                                                    isUpdating(
                                                        order.id
                                                    )
                                                        ? (
                                                            <>
                                                                <RefreshCw
                                                                    size={15}
                                                                    className="seller-orders-spinner"
                                                                />

                                                                Processing...
                                                            </>
                                                        )
                                                        : (
                                                            <>
                                                                <Package
                                                                    size={15}
                                                                />

                                                                Start Processing
                                                            </>
                                                        )
                                                }

                                            </button>

                                        )}


                                        {/* =================================
                                            PROCESSING

                                            IMPORTANT:
                                            ONLY MARK AS SHIPPED
                                        ================================= */}

                                        {order.status ===
                                            "PROCESSING" && (

                                            <button
                                                type="button"
                                                className="seller-order-button seller-order-shipped"
                                                disabled={
                                                    isUpdating(
                                                        order.id
                                                    )
                                                }
                                                onClick={() =>
                                                    openShipmentModal(
                                                        order
                                                    )
                                                }
                                            >

                                                <Truck
                                                    size={15}
                                                />

                                                Mark as Shipped

                                            </button>

                                        )}


                                        {/* =================================
                                            SHIPPED

                                            IMPORTANT:
                                            MARK AS SHIPPED IS NOT RENDERED
                                            HERE.
                                        ================================= */}

                                        {order.status ===
                                            "SHIPPED" && (

                                            <button
                                                type="button"
                                                className="seller-order-button seller-order-delivered"
                                                disabled={
                                                    isUpdating(
                                                        order.id
                                                    )
                                                }
                                                onClick={() =>
                                                    handleMarkDelivered(
                                                        order.id
                                                    )
                                                }
                                            >

                                                {
                                                    isUpdating(
                                                        order.id
                                                    )
                                                        ? (
                                                            <>
                                                                <RefreshCw
                                                                    size={15}
                                                                    className="seller-orders-spinner"
                                                                />

                                                                Updating...
                                                            </>
                                                        )
                                                        : (
                                                            <>
                                                                <CheckCircle
                                                                    size={15}
                                                                />

                                                                Mark as Delivered
                                                            </>
                                                        )
                                                }

                                            </button>

                                        )}


                                        {/* =================================
                                            DELIVERED
                                        ================================= */}

                                        {order.status ===
                                            "DELIVERED" && (

                                            <span
                                                className="seller-order-completed delivered"
                                            >

                                                <CheckCircle
                                                    size={15}
                                                />

                                                Order Completed

                                            </span>

                                        )}


                                        {/* =================================
                                            REJECTED
                                        ================================= */}

                                        {order.status ===
                                            "REJECTED" && (

                                            <span
                                                className="seller-order-completed rejected"
                                            >

                                                <XCircle
                                                    size={15}
                                                />

                                                Order Rejected

                                            </span>

                                        )}


                                        {/* =================================
                                            CANCELLED

                                            NO BUTTON.
                                            ONLY STATUS MESSAGE.
                                        ================================= */}

                                        {order.status ===
                                            "CANCELLED" && (

                                            <span
                                                className="seller-order-completed cancelled"
                                            >

                                                <XCircle
                                                    size={15}
                                                />

                                                Order Cancelled

                                            </span>

                                        )}

                                    </div>

                                </div>

                            </article>

                        )
                    )}

                </div>

            )}


            {/* =====================================================
                SHIPMENT MODAL
            ===================================================== */}

            {showShipmentModal &&
                selectedShipmentOrder && (

                <div
                    className="shipment-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            closeShipmentModal();

                        }

                    }}
                >

                    <div
                        className="shipment-modal"
                    >

                        {/* ICON */}

                        <div
                            className="shipment-modal-icon"
                        >

                            <Truck
                                size={28}
                            />

                        </div>


                        {/* CONTENT */}

                        <div
                            className="shipment-modal-content"
                        >

                            <span
                                className="shipment-modal-eyebrow"
                            >
                                ORDER SHIPMENT
                            </span>


                            <h2>
                                Mark order as shipped?
                            </h2>


                            <p>
                                You are about to mark this
                                order as shipped. The customer
                                will be notified about the
                                updated order status.
                            </p>


                            {/* ORDER INFORMATION */}

                            <div
                                className="shipment-order-summary"
                            >

                                <div>

                                    <span>
                                        Order Reference
                                    </span>

                                    <strong>
                                        {
                                            selectedShipmentOrder.reference_no
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Customer
                                    </span>

                                    <strong>
                                        {
                                            selectedShipmentOrder.customer_name ||
                                            "Customer"
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Amount
                                    </span>

                                    <strong>
                                        ₹
                                        {
                                            Number(
                                                selectedShipmentOrder.total_amount ||
                                                0
                                            ).toLocaleString(
                                                "en-IN",
                                                {
                                                    minimumFractionDigits:
                                                        2,

                                                    maximumFractionDigits:
                                                        2
                                                }
                                            )
                                        }
                                    </strong>

                                </div>

                            </div>


                            {/* WARNING */}

                            <div
                                className="shipment-modal-warning"
                            >

                                <AlertTriangle
                                    size={17}
                                />

                                <span>
                                    Current status:
                                    <strong>
                                        {" "}PROCESSING
                                    </strong>
                                    <br />

                                    New status:
                                    <strong>
                                        {" "}SHIPPED
                                    </strong>
                                </span>

                            </div>

                        </div>


                        {/* ACTIONS */}

                        <div
                            className="shipment-modal-actions"
                        >

                            <button
                                type="button"
                                className="shipment-modal-cancel"
                                disabled={
                                    updatingOrderId !==
                                    null
                                }
                                onClick={
                                    closeShipmentModal
                                }
                            >

                                Cancel

                            </button>


                            <button
                                type="button"
                                className="shipment-modal-confirm"
                                disabled={
                                    updatingOrderId !==
                                    null
                                }
                                onClick={
                                    confirmShipment
                                }
                            >

                                {
                                    updatingOrderId !==
                                    null
                                        ? (
                                            <>
                                                <RefreshCw
                                                    size={16}
                                                    className="seller-orders-spinner"
                                                />

                                                Updating...
                                            </>
                                        )
                                        : (
                                            <>
                                                <Truck
                                                    size={16}
                                                />

                                                Confirm Shipment
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


export default SellerOrders;