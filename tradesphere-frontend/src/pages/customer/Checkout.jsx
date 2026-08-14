import {
    useEffect,
    useState
} from "react";

import {
    ArrowLeft,
    CheckCircle,
    Mail,
    ShieldCheck,
    MapPin,
    ShoppingBag
} from "lucide-react";

import {
    useNavigate
} from "react-router-dom";

import api from "../../services/api";

import "../../styles/checkout.css";


function Checkout() {

    const navigate =
        useNavigate();


    /* =========================================
       STATE
    ========================================= */

    const [cart, setCart] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [sendingOTP, setSendingOTP] =
        useState(false);

    const [verifyingOTP, setVerifyingOTP] =
        useState(false);

    const [placingOrder, setPlacingOrder] =
        useState(false);

    const [otpSent, setOtpSent] =
        useState(false);

    const [otpVerified, setOtpVerified] =
        useState(false);

    const [maskedEmail, setMaskedEmail] =
        useState("");

    const [otp, setOtp] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");


    const [form, setForm] =
        useState({

            deliveryAddress: "",

            deliveryCity: "",

            deliveryState: "",

            deliveryPincode: ""

        });


    /* =========================================
       LOAD CART
    ========================================= */

    useEffect(() => {

        loadCart();

    }, []);


    async function loadCart() {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.get(
                    "/cart"
                );


            const items =
                response.data?.items || [];


            /*
            =====================================
            EMPTY CART
            =====================================
            */

            if (
                items.length === 0
            ) {

                navigate(
                    "/cart"
                );

                return;

            }


            setCart(
                response.data
            );


        } catch (error) {

            console.error(
                "LOAD CHECKOUT ERROR:",
                error
            );


            if (
                error.response?.status ===
                401
            ) {

                navigate(
                    "/login?redirect=/checkout"
                );

                return;

            }


            setError(

                error.response
                    ?.data
                    ?.message ||

                "Unable to load checkout."

            );


        } finally {

            setLoading(false);

        }

    }


    /* =========================================
       FORMAT QUANTITY
    ========================================= */

    function formatQuantity(
        value
    ) {

        const number =
            Number(value || 0);


        if (
            Number.isInteger(
                number
            )
        ) {

            return number.toLocaleString(
                "en-IN"
            );

        }


        return number.toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 3
            }
        );

    }


    /* =========================================
       ITEM SUBTOTAL
    ========================================= */

    function getItemSubtotal(
        item
    ) {

        const quantity =
            Number(
                item.quantity || 0
            );


        const unitPrice =
            Number(
                item.unit_price || 0
            );


        return (
            quantity *
            unitPrice
        );

    }


    /* =========================================
       CART TOTAL
    ========================================= */

    function getCartTotal() {

        if (
            !cart ||
            !Array.isArray(
                cart.items
            )
        ) {

            return 0;

        }


        return cart.items.reduce(

            (
                total,
                item
            ) => {

                return (
                    total +
                    getItemSubtotal(
                        item
                    )
                );

            },

            0

        );

    }


    /*
    IMPORTANT:
    Use calculated total if API totalAmount
    is missing or invalid.
    */

    const calculatedTotal =
        getCartTotal();


    const apiTotal =
        Number(
            cart?.totalAmount
        );


    const finalTotal =
        Number.isFinite(
            apiTotal
        )
            ? apiTotal
            : calculatedTotal;


    /* =========================================
       FORM CHANGE
    ========================================= */

    function handleChange(
        event
    ) {

        const {
            name,
            value
        } = event.target;


        setForm(
            previous => ({

                ...previous,

                [name]:
                    value

            })
        );

    }


/* =========================================
   SEND OTP
========================================= */

async function sendOTP() {

    try {

        setSendingOTP(true);

        setError("");

        setMessage("");


        const response =
            await api.post(
                "/otp/order/send"
            );


        console.log(
            "OTP RESPONSE:",
            response.data
        );


        if (
            !response.data?.success
        ) {

            throw new Error(
                response.data?.message ||
                "Unable to send OTP."
            );

        }


        setOtpSent(true);

        setOtpVerified(false);

        setOtp("");

        setMaskedEmail(
            response.data?.email || ""
        );


        setMessage(
            response.data?.message ||
            "OTP has been sent to your registered email."
        );


    } catch (error) {

        console.error(
            "SEND ORDER OTP ERROR:",
            error
        );


        console.error(
            "OTP RESPONSE:",
            error.response?.data
        );


        setError(
            error.response
                ?.data
                ?.message ||
            error.message ||
            "Unable to send OTP."
        );


    } finally {

        setSendingOTP(false);

    }

}
/* =========================================
   VERIFY OTP
========================================= */

async function verifyOTP() {

    if (
        !/^\d{6}$/.test(
            otp
        )
    ) {

        setError(
            "Enter the 6-digit OTP."
        );

        return;

    }


    try {

        setVerifyingOTP(true);

        setError("");

        setMessage("");


        const response =
            await api.post(
                "/otp/order/verify",
                {
                    otp: otp
                }
            );


        console.log(
            "VERIFY OTP RESPONSE:",
            response.data
        );


        if (
            !response.data?.success
        ) {

            throw new Error(
                response.data?.message ||
                "OTP verification failed."
            );

        }


        setOtpVerified(true);


        setMessage(
            response.data?.message ||
            "Email verified successfully."
        );


    } catch (error) {

        console.error(
            "VERIFY ORDER OTP ERROR:",
            error
        );


        console.error(
            "VERIFY OTP RESPONSE:",
            error.response?.data
        );


        setOtpVerified(false);


        setError(
            error.response
                ?.data
                ?.message ||
            error.message ||
            "Incorrect OTP."
        );


    } finally {

        setVerifyingOTP(false);

    }

}
async function placeOrder() {

    setError("");
    setMessage("");

    /* =====================================
       DELIVERY VALIDATION
    ===================================== */

    const address =
        form.deliveryAddress.trim();

    const city =
        form.deliveryCity.trim();

    const state =
        form.deliveryState.trim();

    const pincode =
        form.deliveryPincode.trim();


    if (
        !address ||
        !city ||
        !state ||
        !pincode
    ) {

        setError(
            "Please complete all delivery information."
        );

        return;

    }


    /* =====================================
       PINCODE VALIDATION
    ===================================== */

    if (
        !/^\d{6}$/.test(
            pincode
        )
    ) {

        setError(
            "Please enter a valid 6-digit pincode."
        );

        return;

    }


    /* =====================================
       OTP VALIDATION
    ===================================== */

    if (
        !otpVerified
    ) {

        setError(
            "Please verify your email OTP first."
        );

        return;

    }


    /* =====================================
       CART VALIDATION
    ===================================== */

    if (
        !cart ||
        !Array.isArray(cart.items) ||
        cart.items.length === 0
    ) {

        setError(
            "Your cart is empty."
        );

        return;

    }


    try {

        setPlacingOrder(true);

        console.log(
            "PLACING ORDER..."
        );


        const response =
            await api.post(
                "/orders",
                {
                    deliveryAddress:
                        address,

                    deliveryCity:
                        city,

                    deliveryState:
                        state,

                    deliveryPincode:
                        pincode,

                    deliveryCharge:
                        0
                }
            );


        console.log(
            "CREATE ORDER RESPONSE:",
            response.data
        );


        if (
            !response.data?.success
        ) {

            throw new Error(
                response.data?.message ||
                "Unable to create order."
            );

        }


        const referenceNo =
            response.data
                ?.order
                ?.referenceNo;


        if (
            !referenceNo
        ) {

            throw new Error(
                "Order created but reference number was not returned."
            );

        }


        /* =====================================
           SUCCESS
        ===================================== */

        navigate(
            `/order-success/${referenceNo}`
        );


    } catch (error) {

        console.error(
            "PLACE ORDER ERROR:",
            error
        );


        console.error(
            "ORDER RESPONSE:",
            error.response?.data
        );


        const backendMessage =
            error.response
                ?.data
                ?.message;


        setError(
            backendMessage ||
            error.message ||
            "Unable to place order."
        );


    } finally {

        setPlacingOrder(false);

    }

}
    if (
        loading
    ) {

        return (

            <div
                className="checkout-loading"
            >

                Loading checkout...

            </div>

        );

    }


    /* =========================================
       CART NOT AVAILABLE
    ========================================= */

    if (
        !cart
    ) {

        return null;

    }


    /* =========================================
       UI
    ========================================= */

    return (

        <div className="checkout-page">


            {/* =================================
                HEADER
            ================================= */}

            <header
                className="checkout-header"
            >

                <button
                    type="button"
                    className="checkout-back-button"
                    onClick={() =>
                        navigate(
                            "/cart"
                        )
                    }
                >

                    <ArrowLeft
                        size={17}
                    />

                    Back to Cart

                </button>


                <div
                    className="checkout-brand"
                >

                    <ShoppingBag
                        size={18}
                    />

                    TradeSphere Checkout

                </div>


                <div
                    className="secure-checkout"
                >

                    <ShieldCheck
                        size={15}
                    />

                    Secure

                </div>

            </header>


            <main
                className="checkout-main"
            >


                {/* =================================
                    TITLE
                ================================= */}

                <div
                    className="checkout-title"
                >

                    <p>
                        SECURE CHECKOUT
                    </p>

                    <h1>
                        Complete your order
                    </h1>

                    <span>
                        Verify your email before
                        confirming the order.
                    </span>

                </div>


                {/* =================================
                    ERROR
                ================================= */}

                {error && (

                    <div
                        className="checkout-error"
                    >

                        {error}

                    </div>

                )}


                {/* =================================
                    SUCCESS MESSAGE
                ================================= */}

                {message && (

                    <div
                        className="checkout-success"
                    >

                        <CheckCircle
                            size={16}
                        />

                        {message}

                    </div>

                )}


                <div
                    className="checkout-layout"
                >


                    {/* =================================
                        LEFT
                    ================================= */}

                    <section
                        className="checkout-left"
                    >


                        {/* =================================
                            DELIVERY
                        ================================= */}

                        <div
                            className="checkout-card"
                        >

                            <div
                                className="checkout-card-title"
                            >

                                <MapPin
                                    size={18}
                                />

                                <div>

                                    <h2>
                                        Delivery Information
                                    </h2>

                                    <span>
                                        Where should we
                                        deliver your order?
                                    </span>

                                </div>

                            </div>


                            <div
                                className="checkout-form"
                            >

                                <label>

                                    Address

                                    <textarea
                                        name="deliveryAddress"
                                        value={
                                            form.deliveryAddress
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="House / building / street address"
                                        rows="3"
                                    />

                                </label>


                                <div
                                    className="checkout-form-row"
                                >

                                    <label>

                                        City

                                        <input
                                            name="deliveryCity"
                                            value={
                                                form.deliveryCity
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="City"
                                        />

                                    </label>


                                    <label>

                                        State

                                        <input
                                            name="deliveryState"
                                            value={
                                                form.deliveryState
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="State"
                                        />

                                    </label>

                                </div>


                                <label>

                                    Pincode

                                    <input
                                        name="deliveryPincode"
                                        value={
                                            form.deliveryPincode
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Pincode"
                                        maxLength="10"
                                        inputMode="numeric"
                                    />

                                </label>

                            </div>

                        </div>


                        {/* =================================
                            EMAIL OTP
                        ================================= */}

                        <div
                            className="checkout-card"
                        >

                            <div
                                className="checkout-card-title"
                            >

                                <Mail
                                    size={18}
                                />

                                <div>

                                    <h2>
                                        Email Verification
                                    </h2>

                                    <span>
                                        Verify your Gmail to
                                        place the order.
                                    </span>

                                </div>

                            </div>


                            {!otpSent ? (

                                <div
                                    className="otp-start"
                                >

                                    <p>
                                        An OTP will be sent
                                        to your registered
                                        email address.
                                    </p>


                                    <button
                                        type="button"
                                        className="checkout-primary-button"
                                        disabled={
                                            sendingOTP
                                        }
                                        onClick={
                                            sendOTP
                                        }
                                    >

                                        <Mail
                                            size={16}
                                        />

                                        {sendingOTP
                                            ? "Sending..."
                                            : "Send OTP"}

                                    </button>

                                </div>

                            ) : (

                                <div
                                    className="otp-area"
                                >

                                    <div
                                        className="otp-email"
                                    >

                                        OTP sent to:

                                        <strong>
                                            {maskedEmail}
                                        </strong>

                                    </div>


                                    <div
                                        className="otp-input-row"
                                    >

                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength="6"
                                            value={
                                                otp
                                            }
                                            disabled={
                                                otpVerified
                                            }
                                            onChange={
                                                event =>
                                                    setOtp(
                                                        event
                                                            .target
                                                            .value
                                                            .replace(
                                                                /\D/g,
                                                                ""
                                                            )
                                                    )
                                            }
                                            placeholder="000000"
                                        />


                                        {!otpVerified && (

                                            <button
                                                type="button"
                                                className="verify-otp-button"
                                                disabled={
                                                    verifyingOTP ||
                                                    otp.length !== 6
                                                }
                                                onClick={
                                                    verifyOTP
                                                }
                                            >

                                                {verifyingOTP
                                                    ? "Verifying..."
                                                    : "Verify"}

                                            </button>

                                        )}

                                    </div>


                                    {otpVerified && (

                                        <div
                                            className="otp-verified"
                                        >

                                            <CheckCircle
                                                size={16}
                                            />

                                            Email verified

                                        </div>

                                    )}


                                    {!otpVerified && (

                                        <button
                                            type="button"
                                            className="resend-otp-button"
                                            disabled={
                                                sendingOTP
                                            }
                                            onClick={
                                                sendOTP
                                            }
                                        >

                                            {sendingOTP
                                                ? "Sending..."
                                                : "Resend OTP"}

                                        </button>

                                    )}

                                </div>

                            )}

                        </div>

                    </section>


                    {/* =================================
                        RIGHT SUMMARY
                    ================================= */}

                    <aside
                        className="checkout-summary"
                    >

                        <p>
                            ORDER SUMMARY
                        </p>


                        <h2>
                            Your Order
                        </h2>


                        {/* =================================
                            PRODUCTS
                        ================================= */}

                        <div
                            className="checkout-products"
                        >

                            {cart.items.map(
                                item => {

                                    const quantity =
                                        Number(
                                            item.quantity ||
                                            0
                                        );


                                    const unitPrice =
                                        Number(
                                            item.unit_price ||
                                            0
                                        );


                                    const itemSubtotal =
                                        getItemSubtotal(
                                            item
                                        );


                                    return (

                                        <div
                                            className="checkout-product"
                                            key={
                                                item.id
                                            }
                                        >

                                            <div>

                                                <strong>
                                                    {
                                                        item.product_name
                                                    }
                                                </strong>


                                                <span>

                                                    {
                                                        formatQuantity(
                                                            quantity
                                                        )
                                                    }

                                                    {" "}

                                                    {
                                                        item.unit
                                                    }

                                                    {" × ₹"}

                                                    {
                                                        unitPrice.toLocaleString(
                                                            "en-IN",
                                                            {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            }
                                                        )
                                                    }

                                                </span>

                                            </div>


                                            <strong>

                                                ₹
                                                {
                                                    itemSubtotal.toLocaleString(
                                                        "en-IN",
                                                        {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        }
                                                    )
                                                }

                                            </strong>

                                        </div>

                                    );

                                }
                            )}

                        </div>


                        <div
                            className="checkout-divider"
                        />


                        {/* =================================
                            SUBTOTAL
                        ================================= */}

                        <div
                            className="checkout-summary-line"
                        >

                            <span>
                                Subtotal
                            </span>

                            <strong>

                                ₹
                                {finalTotal.toLocaleString(
                                    "en-IN",
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }
                                )}

                            </strong>

                        </div>


                        {/* =================================
                            DELIVERY
                        ================================= */}

                        <div
                            className="checkout-summary-line"
                        >

                            <span>
                                Delivery
                            </span>

                            <strong>
                                Free
                            </strong>

                        </div>


                        <div
                            className="checkout-divider"
                        />


                        {/* =================================
                            TOTAL
                        ================================= */}

                        <div
                            className="checkout-total"
                        >

                            <span>
                                Total
                            </span>

                            <strong>

                                ₹
                                {finalTotal.toLocaleString(
                                    "en-IN",
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }
                                )}

                            </strong>

                        </div>


                        {/* =================================
                            PLACE ORDER
                        ================================= */}

                        <button
                            type="button"
                            className="place-order-button"
                            disabled={
                                placingOrder ||
                                !otpVerified
                            }
                            onClick={
                                placeOrder
                            }
                        >

                            <CheckCircle
                                size={18}
                            />

                            {placingOrder
                                ? "Creating Order..."
                                : "Confirm & Place Order"}

                        </button>


                        {!otpVerified && (

                            <small
                                className="checkout-warning"
                            >

                                Verify your email before
                                placing the order.

                            </small>

                        )}

                    </aside>

                </div>

            </main>

        </div>

    );

}


export default Checkout;