import {
    useEffect,
    useState
} from "react";

import {
    X,
    Check,
    Ban,
    Package,
    Loader2,
    User,
    Phone,
    Mail,
    MapPin,
    ShoppingBag,
    IndianRupee
} from "lucide-react";

import api from "../../services/api";

import "../../styles/seller-order-modal.css";


function SellerOrderModal({
    orderId,
    onClose,
    onUpdated
}) {

    const [
        order,
        setOrder
    ] = useState(null);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        processing,
        setProcessing
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    /*
    ==================================================
    LOAD ORDER DETAILS
    ==================================================
    */

    useEffect(() => {

        if (orderId) {

            loadOrder();

        }

    }, [orderId]);


    async function loadOrder() {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.get(
                    `/orders/seller/${orderId}`
                );


            setOrder(
                response.data?.order ||
                null
            );


        } catch (error) {

            console.error(
                "SELLER ORDER DETAILS ERROR:",
                error
            );


            setError(
                error.response
                    ?.data
                    ?.message ||
                "Unable to load order."
            );


        } finally {

            setLoading(false);

        }

    }


    /*
    ==================================================
    ORDER STATUS
    ==================================================
    */

    const normalizedStatus =
        String(
            order?.status || ""
        ).toUpperCase();


    /*
    ==================================================
    STATUS LABEL
    ==================================================
    */

    function getOrderStatusLabel(
        status
    ) {

        const normalized =
            String(
                status || ""
            ).toUpperCase();


        if (
            normalized ===
            "PENDING_SELLER_ACCEPTANCE"
        ) {

            return "NEW ORDER";

        }


        if (
            normalized ===
            "ACCEPTED"
        ) {

            return "ACCEPTED ORDER";

        }


        if (
            normalized ===
            "REJECTED"
        ) {

            return "REJECTED ORDER";

        }


        if (
            normalized ===
            "CANCELLED"
        ) {

            return "CANCELLED ORDER";

        }


        return "ORDER";

    }


    /*
    ==================================================
    FORMAT STATUS
    ==================================================
    */

    function formatStatus(
        status
    ) {

        if (!status) {

            return "UNKNOWN";

        }


        return String(
            status
        )
            .replaceAll(
                "_",
                " "
            );

    }


    /*
    ==================================================
    ACCEPT ORDER
    ==================================================
    */

    async function handleAccept() {

        try {

            setProcessing(true);

            setError("");


            await api.patch(
                `/orders/seller/${orderId}/accept`
            );


            /*
            Refresh seller dashboard
            */

            if (onUpdated) {

                await onUpdated();

            }


            /*
            Close modal
            */

            onClose();


        } catch (error) {

            console.error(
                "ACCEPT ORDER ERROR:",
                error
            );


            setError(
                error.response
                    ?.data
                    ?.message ||
                "Unable to accept order."
            );


        } finally {

            setProcessing(false);

        }

    }


    /*
    ==================================================
    REJECT ORDER
    ==================================================
    */

    async function handleReject() {

        const confirmed =
            window.confirm(
                "Are you sure you want to reject this order?"
            );


        if (!confirmed) {

            return;

        }


        try {

            setProcessing(true);

            setError("");


            await api.patch(
                `/orders/seller/${orderId}/reject`
            );


            /*
            Refresh seller dashboard
            */

            if (onUpdated) {

                await onUpdated();

            }


            /*
            Close modal
            */

            onClose();


        } catch (error) {

            console.error(
                "REJECT ORDER ERROR:",
                error
            );


            setError(
                error.response
                    ?.data
                    ?.message ||
                "Unable to reject order."
            );


        } finally {

            setProcessing(false);

        }

    }


    /*
    ==================================================
    CLOSE ON ESCAPE
    ==================================================
    */

    useEffect(() => {

        function handleEscape(
            event
        ) {

            if (
                event.key === "Escape"
            ) {

                onClose();

            }

        }


        document.addEventListener(
            "keydown",
            handleEscape
        );


        return () => {

            document.removeEventListener(
                "keydown",
                handleEscape
            );

        };

    }, [onClose]);


    /*
    ==================================================
    MODAL
    ==================================================
    */

    return (

        <div
            className="seller-order-modal-overlay"

            onClick={
                onClose
            }
        >

            <div
                className="seller-order-modal"

                onClick={
                    event =>
                        event.stopPropagation()
                }
            >

                {/* =====================================
                    HEADER
                ===================================== */}

                <div
                    className="seller-order-modal-header"
                >

                    <div>

                        <span>

                            {getOrderStatusLabel(
                                order?.status
                            )}

                        </span>

                        <h2>
                            Order Details
                        </h2>

                    </div>


                    <button
                        type="button"

                        className="seller-order-close-button"

                        onClick={
                            onClose
                        }

                        aria-label="Close order details"
                    >

                        <X
                            size={21}
                        />

                    </button>

                </div>


                {/* =====================================
                    LOADING
                ===================================== */}

                {loading && (

                    <div
                        className="seller-order-modal-loading"
                    >

                        <Loader2
                            size={24}

                            className="spin"
                        />

                        <span>
                            Loading order details...
                        </span>

                    </div>

                )}


                {/* =====================================
                    ERROR
                ===================================== */}

                {error && (

                    <div
                        className="seller-order-modal-error"
                    >

                        {error}

                    </div>

                )}


                {/* =====================================
                    ORDER CONTENT
                ===================================== */}

                {!loading &&
                    order && (

                    <>

                        {/* =================================
                            ORDER REFERENCE
                        ================================= */}

                        <div
                            className="seller-order-reference"
                        >

                            <div
                                className="seller-order-reference-icon"
                            >

                                <Package
                                    size={22}
                                />

                            </div>


                            <div>

                                <span>
                                    Order Reference
                                </span>

                                <strong>

                                    {
                                        order.referenceNo ||
                                        order.reference_no ||
                                        order.order_reference ||
                                        "N/A"
                                    }

                                </strong>

                            </div>

                        </div>


                        {/* =================================
                            STATUS BADGE
                        ================================= */}

                        <div
                            className={
                                `seller-order-status-badge ${
                                    normalizedStatus
                                        .toLowerCase()
                                }`
                            }
                        >

                            {formatStatus(
                                order.status
                            )}

                        </div>


                        {/* =================================
                            CUSTOMER INFORMATION
                        ================================= */}

                        <section
                            className="seller-order-section"
                        >

                            <div
                                className="seller-order-section-title"
                            >

                                <User
                                    size={18}
                                />

                                <h3>
                                    Customer Information
                                </h3>

                            </div>


                            <div
                                className="seller-order-info-grid"
                            >

                                {/* CUSTOMER */}

                                <div
                                    className="seller-order-info-card"
                                >

                                    <div
                                        className="seller-order-info-icon"
                                    >

                                        <User
                                            size={17}
                                        />

                                    </div>


                                    <div>

                                        <span>
                                            Customer
                                        </span>

                                        <strong>

                                            {
                                                order.customer?.name ||
                                                order.customer_name ||
                                                "N/A"
                                            }

                                        </strong>

                                    </div>

                                </div>


                                {/* PHONE */}

                                <div
                                    className="seller-order-info-card"
                                >

                                    <div
                                        className="seller-order-info-icon"
                                    >

                                        <Phone
                                            size={17}
                                        />

                                    </div>


                                    <div>

                                        <span>
                                            Phone
                                        </span>

                                        <strong>

                                            {
                                                order.customer?.phone ||
                                                order.customer_phone ||
                                                "N/A"
                                            }

                                        </strong>

                                    </div>

                                </div>


                                {/* EMAIL */}

                                <div
                                    className="seller-order-info-card"
                                >

                                    <div
                                        className="seller-order-info-icon"
                                    >

                                        <Mail
                                            size={17}
                                        />

                                    </div>


                                    <div>

                                        <span>
                                            Email
                                        </span>

                                        <strong>

                                            {
                                                order.customer?.email ||
                                                order.customer_email ||
                                                "N/A"
                                            }

                                        </strong>

                                    </div>

                                </div>


                                {/* TOTAL */}

                                <div
                                    className="seller-order-info-card"
                                >

                                    <div
                                        className="seller-order-info-icon money"
                                    >

                                        <IndianRupee
                                            size={17}
                                        />

                                    </div>


                                    <div>

                                        <span>
                                            Total Amount
                                        </span>

                                        <strong>

                                            ₹
                                            {Number(
                                                order.totalAmount ||
                                                order.total_amount ||
                                                0
                                            ).toLocaleString(
                                                "en-IN",
                                                {
                                                    minimumFractionDigits: 2
                                                }
                                            )}

                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </section>


                        {/* =================================
                            PRODUCTS
                        ================================= */}

                        <section
                            className="seller-order-section"
                        >

                            <div
                                className="seller-order-section-title"
                            >

                                <ShoppingBag
                                    size={18}
                                />

                                <h3>
                                    Products
                                </h3>

                            </div>


                            <div
                                className="seller-order-items"
                            >

                                {(order.items || [])
                                    .length === 0 ? (

                                    <div
                                        className="seller-order-no-items"
                                    >

                                        No products found.

                                    </div>

                                ) : (

                                    (order.items || [])
                                        .map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <div
                                                    key={
                                                        item.id ||
                                                        index
                                                    }

                                                    className="seller-order-item"
                                                >

                                                    <div
                                                        className="seller-order-item-left"
                                                    >

                                                        <div
                                                            className="seller-order-item-icon"
                                                        >

                                                            <Package
                                                                size={18}
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

                                                                Qty:{" "}

                                                                {
                                                                    item.quantity ||
                                                                    0
                                                                }{" "}

                                                                {
                                                                    item.unit ||
                                                                    ""
                                                                }

                                                            </span>

                                                        </div>

                                                    </div>


                                                    <strong
                                                        className="seller-order-item-price"
                                                    >

                                                        ₹
                                                        {Number(
                                                            item.subtotal ||
                                                            0
                                                        ).toLocaleString(
                                                            "en-IN",
                                                            {
                                                                minimumFractionDigits: 2
                                                            }
                                                        )}

                                                    </strong>

                                                </div>

                                            )
                                        )

                                )}

                            </div>

                        </section>


                        {/* =================================
                            DELIVERY ADDRESS
                        ================================= */}

                        <section
                            className="seller-order-section"
                        >

                            <div
                                className="seller-order-section-title"
                            >

                                <MapPin
                                    size={18}
                                />

                                <h3>
                                    Delivery Address
                                </h3>

                            </div>


                            <div
                                className="seller-order-delivery"
                            >

                                <div
                                    className="seller-order-delivery-icon"
                                >

                                    <MapPin
                                        size={20}
                                    />

                                </div>


                                <div>

                                    <p>

                                        {
                                            order.delivery?.address ||
                                            order.delivery_address ||
                                            "Address not available"
                                        }

                                    </p>


                                    <p>

                                        {
                                            order.delivery?.city ||
                                            order.delivery_city ||
                                            ""
                                        }

                                        {
                                            (
                                                order.delivery?.city ||
                                                order.delivery_city
                                            ) &&
                                            (
                                                order.delivery?.state ||
                                                order.delivery_state
                                            )
                                                ? ", "
                                                : ""
                                        }

                                        {
                                            order.delivery?.state ||
                                            order.delivery_state ||
                                            ""
                                        }

                                        {
                                            (
                                                order.delivery?.state ||
                                                order.delivery_state
                                            ) &&
                                            (
                                                order.delivery?.pincode ||
                                                order.delivery_pincode
                                            )
                                                ? " - "
                                                : ""
                                        }

                                        {
                                            order.delivery?.pincode ||
                                            order.delivery_pincode ||
                                            ""
                                        }

                                    </p>

                                </div>

                            </div>

                        </section>


                        {/* =================================
                            ACCEPT / REJECT
                        ================================= */}

                        {normalizedStatus ===
                            "PENDING_SELLER_ACCEPTANCE" && (

                            <div
                                className="seller-order-modal-actions"
                            >

                                <button
                                    type="button"

                                    className="seller-order-reject"

                                    disabled={
                                        processing
                                    }

                                    onClick={
                                        handleReject
                                    }
                                >

                                    {processing ? (

                                        <Loader2
                                            size={17}
                                            className="spin"
                                        />

                                    ) : (

                                        <Ban
                                            size={17}
                                        />

                                    )}

                                    Reject

                                </button>


                                <button
                                    type="button"

                                    className="seller-order-accept"

                                    disabled={
                                        processing
                                    }

                                    onClick={
                                        handleAccept
                                    }
                                >

                                    {processing ? (

                                        <Loader2
                                            size={17}
                                            className="spin"
                                        />

                                    ) : (

                                        <Check
                                            size={17}
                                        />

                                    )}

                                    Accept

                                </button>

                            </div>

                        )}

                    </>

                )}

            </div>

        </div>

    );

}


export default SellerOrderModal;