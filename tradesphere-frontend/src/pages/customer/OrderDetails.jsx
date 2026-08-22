import {
    useEffect,
    useMemo,
    useState
} from "react";

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
    AlertTriangle,
    Download,
    RotateCcw,
    FileText,
    Loader2,
    Printer
} from "lucide-react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import api from "../../services/api";
import Invoice from "../../components/invoice/Invoice";
import "../../styles/orderDetails.css";


const RETURN_WINDOW_DAYS = 7;

const INVOICE_AVAILABLE_STATUSES = [
    "SHIPPED",
    "DELIVERED",
    "RETURN_REQUESTED",
    "RETURN_ACCEPTED",
    "RETURN_REJECTED"
];


function OrderDetails() {

    const navigate = useNavigate();

    const {
        referenceNo
    } = useParams();


    const [order, setOrder] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    /*
    ==================================================
    CANCEL
    ==================================================
    */

    const [
        showCancelModal,
        setShowCancelModal
    ] = useState(false);

    const [
        cancellingOrder,
        setCancellingOrder
    ] = useState(false);


    /*
    ==================================================
    RETURN
    ==================================================
    */

    const [
        returnRequest,
        setReturnRequest
    ] = useState(null);

    const [
        showReturnModal,
        setShowReturnModal
    ] = useState(false);

    const [
        returnReason,
        setReturnReason
    ] = useState("");

    const [
        submittingReturn,
        setSubmittingReturn
    ] = useState(false);

    const [
        returnError,
        setReturnError
    ] = useState("");


    /*
    ==================================================
    INVOICE
    ==================================================
    */

    const [
        showInvoice,
        setShowInvoice
    ] = useState(false);


    /*
    ==================================================
    LOAD ORDER
    ==================================================
    */

    useEffect(() => {

        loadOrder();

    }, [referenceNo]);


    /*
    ==================================================
    LOAD ORDER
    ==================================================
    */

    async function loadOrder() {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.get(
                    `/orders/${encodeURIComponent(
                        referenceNo
                    )}`
                );


            if (
                !response.data?.success
            ) {

                throw new Error(
                    response.data?.message ||
                    "Unable to load order."
                );

            }


            const loadedOrder =
                response.data.order;


            setOrder(
                loadedOrder
            );


            await loadReturnRequest();


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


    /*
    ==================================================
    LOAD RETURN REQUEST
    ==================================================
    */

    async function loadReturnRequest() {

        try {

            const response =
                await api.get(
                    `/order-returns/${encodeURIComponent(
                        referenceNo
                    )}/return`
                );


            if (
                response.data?.success
            ) {

                setReturnRequest(
                    response.data.returnRequest ||
                    null
                );

            } else {

                setReturnRequest(
                    null
                );

            }


        } catch (error) {

            if (
                error.response?.status ===
                404
            ) {

                setReturnRequest(
                    null
                );

                return;

            }


            console.warn(
                "LOAD RETURN REQUEST ERROR:",
                error.response?.data ||
                error.message
            );

        }

    }


    /*
    ==================================================
    CANCEL ORDER
    ==================================================
    */

    async function cancelOrder() {

        if (
            !order?.referenceNo
        ) {

            return;

        }


        try {

            setCancellingOrder(
                true
            );

            setError("");


            const response =
                await api.put(

                    `/orders/${encodeURIComponent(
                        order.referenceNo
                    )}/cancel`

                );


            if (
                response.data?.success
            ) {

                setOrder(
                    previous => ({

                        ...previous,

                        status:
                            "CANCELLED",

                        cancelledAt:
                            new Date().toISOString()

                    })
                );


                setShowCancelModal(
                    false
                );

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

            setCancellingOrder(
                false
            );

        }

    }


function openInvoice() {

    console.log(
        "VIEW INVOICE CLICKED"
    );

    console.log(
        "INVOICE ORDER DATA:",
        order
    );

    if (!order) {

        setError(
            "Order information is not available."
        );

        return;

    }

    if (!invoiceAvailable) {

        setError(
            "Invoice is not available for this order yet."
        );

        return;

    }

    setError("");

    setShowInvoice(true);

}
function printInvoice() {

    console.log(
        "PRINT INVOICE CLICKED"
    );

    if (!showInvoice) {

        return;

    }

    window.setTimeout(
        () => {

            window.print();

        },
        100
    );

}
    function formatMoney(value) {

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
    FORMAT DATE
    ==================================================
    */

    function formatDate(value) {

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
                    "2-digit",

                year:
                    "numeric"
            }
        );

    }


    /*
    ==================================================
    FORMAT DATETIME
    ==================================================
    */

    function formatDateTime(value) {

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


        return date.toLocaleString(
            "en-IN",
            {
                day:
                    "2-digit",

                month:
                    "short",

                year:
                    "numeric",

                hour:
                    "2-digit",

                minute:
                    "2-digit"
            }
        );

    }


    /*
    ==================================================
    STATUS LABEL
    ==================================================
    */

    function getStatusLabel(status) {

        switch (
            String(
                status || ""
            ).toUpperCase()
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


            case "RETURN_REQUESTED":

                return "Return Requested";


            case "RETURN_ACCEPTED":

                return "Return Accepted";


            case "RETURN_REJECTED":

                return "Return Rejected";


            default:

                return status ||
                    "Unknown";

        }

    }


    /*
    ==================================================
    STATUS ICON
    ==================================================
    */

    function StatusIcon() {

        const status =
            String(
                order?.status ||
                ""
            ).toUpperCase();


        switch (status) {

            case "DELIVERED":

            case "RETURN_ACCEPTED":

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

            case "RETURN_REJECTED":

                return (
                    <XCircle
                        size={17}
                    />
                );


            case "RETURN_REQUESTED":

                return (
                    <RotateCcw
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
    ==================================================
    INVOICE AVAILABLE
    ==================================================
    */

    const invoiceAvailable =
        INVOICE_AVAILABLE_STATUSES.includes(
            String(
                order?.status ||
                ""
            ).toUpperCase()
        );


    /*
    ==================================================
    DELIVERY DATE
    ==================================================
    */

    const deliveryDate =
        order?.deliveredAt ||
        order?.delivered_at ||
        null;


    /*
    ==================================================
    RETURN CALCULATION
    ==================================================

    IMPORTANT:

    Return deadline = DELIVERY DATE + 7 DAYS

    Not order date + 7 days.

    ==================================================
    */

    const returnInfo =
        useMemo(() => {

            if (!order) {

                return {

                    eligible:
                        false,

                    expired:
                        false,

                    daysRemaining:
                        0,

                    deadline:
                        null,

                    deliveredAt:
                        null

                };

            }


            const status =
                String(
                    order.status ||
                    ""
                ).toUpperCase();


            /*
            ------------------------------------------
            ONLY DELIVERED ORDER
            ------------------------------------------
            */

            if (
                status !==
                "DELIVERED"
            ) {

                return {

                    eligible:
                        false,

                    expired:
                        false,

                    daysRemaining:
                        0,

                    deadline:
                        null,

                    deliveredAt:
                        null

                };

            }


            /*
            ------------------------------------------
            DELIVERY DATE REQUIRED
            ------------------------------------------
            */

            if (
                !deliveryDate
            ) {

                return {

                    eligible:
                        false,

                    expired:
                        false,

                    daysRemaining:
                        0,

                    deadline:
                        null,

                    deliveredAt:
                        null

                };

            }


            const delivered =
                new Date(
                    deliveryDate
                );


            if (
                Number.isNaN(
                    delivered.getTime()
                )
            ) {

                return {

                    eligible:
                        false,

                    expired:
                        false,

                    daysRemaining:
                        0,

                    deadline:
                        null,

                    deliveredAt:
                        null

                };

            }


            /*
            ------------------------------------------
            DELIVERY DATE + 7 DAYS
            ------------------------------------------
            */

            const deadline =
                new Date(
                    delivered
                );


            deadline.setDate(
                deadline.getDate() +
                RETURN_WINDOW_DAYS
            );


            const now =
                new Date();


            const remainingMilliseconds =
                deadline.getTime() -
                now.getTime();


            const expired =
                remainingMilliseconds <=
                0;


            const daysRemaining =
                expired
                    ? 0
                    : Math.ceil(

                        remainingMilliseconds /
                        (
                            1000 *
                            60 *
                            60 *
                            24
                        )

                    );


            return {

                eligible:
                    !expired,

                expired,

                daysRemaining,

                deadline,

                deliveredAt:
                    delivered

            };

        }, [
            order,
            deliveryDate
        ]);


    /*
    ==================================================
    RETURN ALREADY REQUESTED
    ==================================================
    */

    const returnAlreadyRequested =
        Boolean(
            returnRequest
        );


    /*
    ==================================================
    SUBMIT RETURN
    ==================================================
    */

    async function submitReturnRequest() {

        if (
            !order?.referenceNo
        ) {

            return;

        }


        if (
            !returnInfo.eligible
        ) {

            setReturnError(
                "The 7-day return window has expired."
            );

            return;

        }


        const reason =
            returnReason.trim();


        if (!reason) {

            setReturnError(
                "Please enter the reason for return."
            );

            return;

        }


        if (
            reason.length <
            10
        ) {

            setReturnError(
                "Please provide at least 10 characters describing the reason."
            );

            return;

        }


        try {

            setSubmittingReturn(
                true
            );

            setReturnError("");


            const response =
                await api.post(

                    `/order-returns/${encodeURIComponent(
                        order.referenceNo
                    )}/return`,

                    {
                        reason
                    }

                );


            if (
                !response.data?.success
            ) {

                throw new Error(

                    response.data?.message ||
                    "Unable to submit return request."

                );

            }


            /*
            ------------------------------------------
            UPDATE UI
            ------------------------------------------
            */

            setOrder(
                previous => ({

                    ...previous,

                    status:
                        "RETURN_REQUESTED"

                })
            );


            setReturnRequest({

                id:
                    response.data
                        ?.returnRequest
                        ?.id,

                reference_no:
                    order.referenceNo,

                reason,

                status:
                    "RETURN_REQUESTED",

                requested_at:
                    new Date().toISOString()

            });


            setReturnReason("");

            setShowReturnModal(
                false
            );


        } catch (error) {

            console.error(
                "SUBMIT RETURN ERROR:",
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


            setReturnError(

                error.response
                    ?.data
                    ?.message ||

                error.message ||

                "Unable to submit return request."

            );

        } finally {

            setSubmittingReturn(
                false
            );

        }

    }


    /*
    ==================================================
    LOADING
    ==================================================
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
    ==================================================
    ERROR
    ==================================================
    */

    if (
        error &&
        !order
    ) {

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


    /*
    ==================================================
    MAIN UI
    ==================================================
    */

    return (

        <div
            className="order-details-page"
        >

            {/* =========================================
                HEADER
            ========================================= */}

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

                {/* =========================================
                    TITLE
                ========================================= */}

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
                                order.createdAt ||
                                order.created_at
                            )}
                        </span>

                    </div>


                    <div
                        className={`order-status-badge status-${String(
                            order.status ||
                            ""
                        ).toLowerCase()}`}
                    >

                        <StatusIcon />

                        {getStatusLabel(
                            order.status
                        )}

                    </div>

                </section>


                {/* =========================================
                    ERROR
                ========================================= */}

                {error && (

                    <div
                        className="order-inline-error"
                    >

                        <AlertTriangle
                            size={17}
                        />

                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                        >
                            ×
                        </button>

                    </div>

                )}


                {/* =========================================
                    STATUS TIMELINE
                ========================================= */}

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

                        <TimelineStep
                            label="Order Placed"
                            active
                            icon={
                                <CheckCircle
                                    size={15}
                                />
                            }
                        />


                        <TimelineLine
                            active={[
                                "ACCEPTED",
                                "PROCESSING",
                                "SHIPPED",
                                "DELIVERED",
                                "RETURN_REQUESTED",
                                "RETURN_ACCEPTED",
                                "RETURN_REJECTED"
                            ].includes(
                                order.status
                            )}
                        />


                        <TimelineStep
                            label="Seller Accepted"
                            active={[
                                "ACCEPTED",
                                "PROCESSING",
                                "SHIPPED",
                                "DELIVERED",
                                "RETURN_REQUESTED",
                                "RETURN_ACCEPTED",
                                "RETURN_REJECTED"
                            ].includes(
                                order.status
                            )}
                            icon={
                                <CheckCircle
                                    size={15}
                                />
                            }
                        />


                        <TimelineLine
                            active={[
                                "PROCESSING",
                                "SHIPPED",
                                "DELIVERED",
                                "RETURN_REQUESTED",
                                "RETURN_ACCEPTED",
                                "RETURN_REJECTED"
                            ].includes(
                                order.status
                            )}
                        />


                        <TimelineStep
                            label="Processing"
                            active={[
                                "PROCESSING",
                                "SHIPPED",
                                "DELIVERED",
                                "RETURN_REQUESTED",
                                "RETURN_ACCEPTED",
                                "RETURN_REJECTED"
                            ].includes(
                                order.status
                            )}
                            icon={
                                <Package
                                    size={15}
                                />
                            }
                        />


                        <TimelineLine
                            active={[
                                "SHIPPED",
                                "DELIVERED"
                            ].includes(
                                order.status
                            )}
                        />


                        <TimelineStep
                            label="Shipped"
                            active={[
                                "SHIPPED",
                                "DELIVERED"
                            ].includes(
                                order.status
                            )}
                            icon={
                                <Truck
                                    size={15}
                                />
                            }
                        />


                        <TimelineLine
                            active={[
                                "DELIVERED"
                            ].includes(
                                order.status
                            )}
                        />


                        <TimelineStep
                            label="Delivered"
                            active={[
                                "DELIVERED",
                                "RETURN_REQUESTED",
                                "RETURN_ACCEPTED",
                                "RETURN_REJECTED"
                            ].includes(
                                order.status
                            )}
                            icon={
                                <CheckCircle
                                    size={15}
                                />
                            }
                        />

                    </div>

                </section>


                {/* =========================================
                    INVOICE
                ========================================= */}

                <section
                    className="order-details-card invoice-card"
                >

                    <div
                        className="invoice-card-left"
                    >

                        <div
                            className="invoice-icon"
                        >

                            <FileText
                                size={22}
                            />

                        </div>


                        <div>

                            <h2>
                                Order Invoice
                            </h2>


                            {invoiceAvailable ? (

                                <p>
                                    Your invoice is ready.
                                    You can view and save it as PDF.
                                </p>

                            ) : (

                                <p>
                                    Invoice will be available
                                    after the order is shipped.
                                </p>

                            )}

                        </div>

                    </div>


                    <button
                        type="button"
                        className={`invoice-download-button ${
                            invoiceAvailable
                                ? "available"
                                : "disabled"
                        }`}
                        disabled={
                            !invoiceAvailable
                        }
                        onClick={
                            openInvoice
                        }
                    >

                        <FileText
                            size={17}
                        />

                        {invoiceAvailable
                            ? "View Invoice"
                            : "Available after Shipped"}

                    </button>

                </section>


                {/* =========================================
                    PRODUCTS
                ========================================= */}

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

                        {Array.isArray(
                            order.items
                        ) &&
                        order.items.map(
                            item => (

                                <div
                                    className="order-product-row"
                                    key={
                                        item.id
                                    }
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
                                                    item.productName ||
                                                    item.product_name ||
                                                    "Product"
                                                }
                                            </strong>


                                            <span>

                                                {
                                                    Number(
                                                        item.quantity ||
                                                        0
                                                    ).toLocaleString(
                                                        "en-IN",
                                                        {
                                                            maximumFractionDigits:
                                                                3
                                                        }
                                                    )
                                                }

                                                {" "}

                                                {
                                                    item.unit ||
                                                    ""
                                                }

                                                {" × ₹"}

                                                {
                                                    formatMoney(
                                                        item.unitPrice ||
                                                        item.unit_price
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


                {/* =========================================
                    SELLER + DELIVERY
                ========================================= */}

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
                                    order.seller?.full_name ||
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
                                    order.delivery?.address ||
                                    "-"
                                }
                            </strong>

                            <span>
                                {
                                    order.delivery?.city ||
                                    "-"
                                }
                            </span>

                            <span>
                                {
                                    order.delivery?.state ||
                                    "-"
                                }
                            </span>

                            <span>
                                Pincode:{" "}
                                {
                                    order.delivery?.pincode ||
                                    "-"
                                }
                            </span>

                        </div>

                    </section>

                </div>


                {/* =========================================
                    ORDER SUMMARY
                ========================================= */}

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

                                {
                                    Number(
                                        order.deliveryCharge ||
                                        order.delivery_charge ||
                                        0
                                    ) === 0

                                        ? "Free"

                                        : `₹${formatMoney(
                                            order.deliveryCharge ||
                                            order.delivery_charge
                                        )}`
                                }

                            </strong>

                        </div>


                        {/* GST */}

                        {(Number(
                            order.gst ||
                            order.gstAmount ||
                            order.gst_amount ||
                            0
                        ) > 0) && (

                            <div
                                className="summary-row"
                            >

                                <span>
                                    GST
                                </span>

                                <strong>
                                    ₹
                                    {
                                        formatMoney(
                                            order.gst ||
                                            order.gstAmount ||
                                            order.gst_amount
                                        )
                                    }
                                </strong>

                            </div>

                        )}


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
                                        order.totalAmount ||
                                        order.total_amount
                                    )
                                }
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =========================================
                    RETURN
                ========================================= */}

                <section
                    className={`order-return-card ${
                        returnAlreadyRequested
                            ? "return-existing"
                            : ""
                    }`}
                >

                    <div
                        className="return-card-main"
                    >

                        <div
                            className="return-icon"
                        >

                            <RotateCcw
                                size={22}
                            />

                        </div>


                        <div
                            className="return-card-content"
                        >

                            <span
                                className="return-label"
                            >
                                RETURN POLICY
                            </span>


                            <h2>
                                {returnAlreadyRequested
                                    ? "Return Request"
                                    : "Need to return this order?"}
                            </h2>


                            {returnAlreadyRequested ? (

                                <>

                                    <p>

                                        Return status:

                                        {" "}

                                        <strong>
                                            {
                                                getStatusLabel(
                                                    returnRequest.status
                                                )
                                            }
                                        </strong>

                                    </p>


                                    {returnRequest.requested_at && (

                                        <p>

                                            Requested on:{" "}

                                            <strong>
                                                {
                                                    formatDateTime(
                                                        returnRequest.requested_at
                                                    )
                                                }
                                            </strong>

                                        </p>

                                    )}


                                    {returnRequest.reason && (

                                        <div
                                            className="return-reason-display"
                                        >

                                            <strong>
                                                Your reason
                                            </strong>

                                            <span>
                                                {
                                                    returnRequest.reason
                                                }
                                            </span>

                                        </div>

                                    )}


                                    {returnRequest.seller_response && (

                                        <div
                                            className="return-response-display"
                                        >

                                            <strong>
                                                Seller response
                                            </strong>

                                            <span>
                                                {
                                                    returnRequest.seller_response
                                                }
                                            </span>

                                        </div>

                                    )}

                                </>

                            ) : (

                                <>

                                    {String(
                                        order.status ||
                                        ""
                                    ).toUpperCase() ===
                                    "DELIVERED" ? (

                                        returnInfo.eligible ? (

                                            <p>

                                                You can request a return
                                                within{" "}

                                                <strong>
                                                    {
                                                        returnInfo.daysRemaining
                                                    } day
                                                    {
                                                        returnInfo.daysRemaining !== 1
                                                            ? "s"
                                                            : ""
                                                    }
                                                </strong>
                                                .

                                                <br />

                                                Delivered on:{" "}

                                                <strong>
                                                    {
                                                        formatDate(
                                                            returnInfo.deliveredAt
                                                        )
                                                    }
                                                </strong>

                                                <br />

                                                Return deadline:{" "}

                                                <strong>
                                                    {
                                                        formatDate(
                                                            returnInfo.deadline
                                                        )
                                                    }
                                                </strong>

                                            </p>

                                        ) : (

                                            <p
                                                className="return-expired-text"
                                            >

                                                The{" "}
                                                {
                                                    RETURN_WINDOW_DAYS
                                                }-day return window
                                                has expired.

                                            </p>

                                        )

                                    ) : (

                                        <p>

                                            Return will become available
                                            after the order is delivered.

                                        </p>

                                    )}

                                </>

                            )}

                        </div>

                    </div>


                    {!returnAlreadyRequested &&

                    String(
                        order.status ||
                        ""
                    ).toUpperCase() ===
                        "DELIVERED" &&

                    returnInfo.eligible && (

                        <button
                            type="button"
                            className="return-request-button"
                            onClick={() => {

                                setReturnError("");

                                setReturnReason("");

                                setShowReturnModal(
                                    true
                                );

                            }}
                        >

                            <RotateCcw
                                size={17}
                            />

                            Request Return

                        </button>

                    )}

                </section>


                {/* =========================================
                    CANCEL
                ========================================= */}

                {[
                    "PENDING_SELLER_ACCEPTANCE",
                    "ACCEPTED",
                    "PROCESSING"
                ].includes(
                    String(
                        order.status ||
                        ""
                    ).toUpperCase()
                ) && (

                    <div
                        className="order-cancel-section"
                    >

                        <div
                            className="cancel-info"
                        >

                            <XCircle
                                size={20}
                            />

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
                                setShowCancelModal(
                                    true
                                )
                            }
                            disabled={
                                cancellingOrder
                            }
                        >

                            <XCircle
                                size={18}
                            />

                            Cancel Order

                        </button>

                    </div>

                )}

            </main>


            {/* =====================================================
                RETURN MODAL
            ===================================================== */}

            {showReturnModal && (

                <div
                    className="return-modal-overlay"
                    onClick={() => {

                        if (
                            !submittingReturn
                        ) {

                            setShowReturnModal(
                                false
                            );

                        }

                    }}
                >

                    <div
                        className="return-modal"
                        onClick={
                            event =>
                                event.stopPropagation()
                        }
                    >

                        <div
                            className="return-modal-icon"
                        >

                            <RotateCcw
                                size={28}
                            />

                        </div>


                        <div
                            className="return-modal-content"
                        >

                            <span>
                                RETURN REQUEST
                            </span>


                            <h2>
                                Why do you want to return this order?
                            </h2>


                            <p>

                                Order:{" "}

                                <strong>
                                    {
                                        order.referenceNo
                                    }
                                </strong>

                            </p>


                            <label>

                                Return reason


                                <textarea
                                    value={
                                        returnReason
                                    }
                                    onChange={
                                        event =>
                                            setReturnReason(
                                                event.target.value
                                            )
                                    }
                                    placeholder="Please explain why you want to return this order..."
                                    rows={5}
                                    maxLength={1000}
                                    disabled={
                                        submittingReturn
                                    }
                                />

                            </label>


                            <div
                                className="return-character-count"
                            >

                                {
                                    returnReason.length
                                }
                                /1000

                            </div>


                            {returnError && (

                                <div
                                    className="return-modal-error"
                                >

                                    <AlertTriangle
                                        size={16}
                                    />

                                    {
                                        returnError
                                    }

                                </div>

                            )}

                        </div>


                        <div
                            className="return-modal-actions"
                        >

                            <button
                                type="button"
                                className="return-modal-cancel"
                                disabled={
                                    submittingReturn
                                }
                                onClick={() =>
                                    setShowReturnModal(
                                        false
                                    )
                                }
                            >

                                Keep Order

                            </button>


                            <button
                                type="button"
                                className="return-modal-submit"
                                disabled={
                                    submittingReturn
                                }
                                onClick={
                                    submitReturnRequest
                                }
                            >

                                {submittingReturn ? (

                                    <>

                                        <Loader2
                                            size={16}
                                            className="invoice-spin"
                                        />

                                        Submitting...

                                    </>

                                ) : (

                                    <>

                                        <RotateCcw
                                            size={16}
                                        />

                                        Submit Return Request

                                    </>

                                )}

                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =====================================================
                CANCEL MODAL
            ===================================================== */}

            {showCancelModal && (

                <div
                    className="cancel-modal-overlay"
                    onClick={() => {

                        if (
                            !cancellingOrder
                        ) {

                            setShowCancelModal(
                                false
                            );

                        }

                    }}
                >

                    <div
                        className="cancel-modal"
                        onClick={
                            event =>
                                event.stopPropagation()
                        }
                    >

                        <div
                            className="cancel-modal-icon"
                        >

                            <XCircle
                                size={32}
                            />

                        </div>


                        <div
                            className="cancel-modal-content"
                        >

                            <span
                                className="cancel-modal-label"
                            >
                                ORDER CANCELLATION
                            </span>


                            <h2>
                                Cancel this order?
                            </h2>


                            <p>

                                Are you sure you want
                                to cancel order{" "}

                                <strong>
                                    {
                                        order.referenceNo
                                    }
                                </strong>

                                ?

                            </p>


                            <div
                                className="cancel-modal-warning"
                            >

                                <AlertTriangle
                                    size={18}
                                />

                                <span>

                                    The reserved inventory
                                    will be released automatically.
                                    This action cannot be undone.

                                </span>

                            </div>

                        </div>


                        <div
                            className="cancel-modal-actions"
                        >

                            <button
                                type="button"
                                className="cancel-modal-keep"
                                disabled={
                                    cancellingOrder
                                }
                                onClick={() =>
                                    setShowCancelModal(
                                        false
                                    )
                                }
                            >

                                Keep Order

                            </button>


                            <button
                                type="button"
                                className="cancel-modal-confirm"
                                disabled={
                                    cancellingOrder
                                }
                                onClick={
                                    cancelOrder
                                }
                            >

                                {cancellingOrder ? (

                                    <>

                                        <span
                                            className="cancel-spinner"
                                        />

                                        Cancelling...

                                    </>

                                ) : (

                                    <>

                                        <XCircle
                                            size={17}
                                        />

                                        Yes, Cancel Order

                                    </>

                                )}

                            </button>

                        </div>

                    </div>

                </div>

            )}
{/* =====================================================
    INVOICE MODAL
===================================================== */}

{showInvoice && (

    <div
        className="invoice-modal-overlay"
        onClick={() =>
            setShowInvoice(false)
        }
    >

        <div
            className="invoice-modal"
            onClick={(event) =>
                event.stopPropagation()
            }
        >

            {/* =========================================
                TOOLBAR
            ========================================= */}

            <div
                className="invoice-modal-toolbar"
            >

                <div
                    className="invoice-toolbar-title"
                >

                    <strong>
                        Invoice
                    </strong>

                    <span>
                        {order.referenceNo}
                    </span>

                </div>


                <div
                    className="invoice-toolbar-actions"
                >

                    <button
                        type="button"
                        className="invoice-print-button"
                        onClick={
                            printInvoice
                        }
                    >

                        <Printer
                            size={16}
                        />

                        Print / Save PDF

                    </button>


                    <button
                        type="button"
                        className="invoice-close-button"
                        onClick={() =>
                            setShowInvoice(false)
                        }
                        aria-label="Close invoice"
                    >

                        <XCircle
                            size={18}
                        />

                    </button>

                </div>

            </div>


            {/* =========================================
                INVOICE CONTENT
            ========================================= */}

            <div
                className="invoice-print-area"
            >

                <Invoice
                    order={order}
                />

            </div>

        </div>

    </div>

)}
        </div>

    );

}


/*
==================================================
TIMELINE STEP
==================================================
*/

function TimelineStep({
    label,
    active,
    icon
}) {

    return (

        <div
            className={`timeline-step ${
                active
                    ? "active"
                    : ""
            }`}
        >

            <div
                className="timeline-dot"
            >

                {icon}

            </div>


            <span>
                {label}
            </span>

        </div>

    );

}


/*
==================================================
TIMELINE LINE
==================================================
*/

function TimelineLine({
    active
}) {

    return (

        <div
            className={`timeline-line ${
                active
                    ? "active"
                    : ""
            }`}
        />

    );

}


export default OrderDetails;