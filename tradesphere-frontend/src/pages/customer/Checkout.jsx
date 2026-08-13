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

            deliveryAddress:
                "",

            deliveryCity:
                "",

            deliveryState:
                "",

            deliveryPincode:
                ""

        });


    /*
    =========================================
    LOAD CART
    =========================================
    */

    useEffect(() => {

        loadCart();

    }, []);


    async function loadCart() {

        try {

            setLoading(true);


            const response =
                await api.get(
                    "/cart"
                );


            if (
                !response.data.items ||
                response.data.items.length === 0
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


    /*
    =========================================
    INPUT CHANGE
    =========================================
    */

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


    /*
    =========================================
    SEND OTP
    =========================================
    */

    async function sendOTP() {

        try {

            setSendingOTP(true);

            setError("");

            setMessage("");


            const response =
                await api.post(
                    "/otp/order/send"
                );


            setOtpSent(true);

            setMaskedEmail(
                response.data.email
            );


            setMessage(
                "OTP has been sent to your Gmail."
            );


        } catch (error) {

            console.error(
                error
            );


            setError(

                error.response
                    ?.data
                    ?.message ||

                "Unable to send OTP."

            );

        } finally {

            setSendingOTP(false);
        }
    }


    /*
    =========================================
    VERIFY OTP
    =========================================
    */

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


            await api.post(

                "/otp/order/verify",

                {
                    otp
                }

            );


            setOtpVerified(
                true
            );


            setMessage(
                "Email verified successfully."
            );


        } catch (error) {

            console.error(
                error
            );


            setError(

                error.response
                    ?.data
                    ?.message ||

                "Incorrect OTP."

            );

        } finally {

            setVerifyingOTP(false);
        }
    }


    /*
    =========================================
    PLACE ORDER
    =========================================
    */

    async function placeOrder() {

        setError("");

        setMessage("");


        if (
            !form.deliveryAddress ||
            !form.deliveryCity ||
            !form.deliveryState ||
            !form.deliveryPincode
        ) {

            setError(
                "Please complete all delivery information."
            );

            return;
        }


        if (
            !otpVerified
        ) {

            setError(
                "Please verify your email OTP first."
            );

            return;
        }


        try {

            setPlacingOrder(true);


            const response =
                await api.post(

                    "/orders",

                    {

                        deliveryAddress:
                            form.deliveryAddress,

                        deliveryCity:
                            form.deliveryCity,

                        deliveryState:
                            form.deliveryState,

                        deliveryPincode:
                            form.deliveryPincode,

                        deliveryCharge:
                            0

                    }

                );


            const referenceNo =
                response.data
                    .order
                    .referenceNo;


            navigate(
                `/order-success/${referenceNo}`
            );


        } catch (error) {

            console.error(
                "PLACE ORDER ERROR:",
                error
            );


            setError(

                error.response
                    ?.data
                    ?.message ||

                "Unable to place order."

            );

        } finally {

            setPlacingOrder(false);
        }
    }


    if (loading) {

        return (

            <div className="checkout-loading">

                Loading checkout...

            </div>

        );
    }


    if (!cart) {

        return null;
    }


    return (

        <div className="checkout-page">


            {/* HEADER */}

            <header className="checkout-header">

                <button
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


                <div className="checkout-brand">

                    <ShoppingBag
                        size={18}
                    />

                    TradeSphere Checkout

                </div>


                <div className="secure-checkout">

                    <ShieldCheck
                        size={15}
                    />

                    Secure

                </div>

            </header>


            <main className="checkout-main">


                <div className="checkout-title">

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


                {error && (

                    <div className="checkout-error">
                        {error}
                    </div>

                )}


                {message && (

                    <div className="checkout-success">
                        <CheckCircle
                            size={16}
                        />

                        {message}
                    </div>

                )}


                <div className="checkout-layout">


                    {/* =================================
                        LEFT
                    ================================= */}

                    <section className="checkout-left">


                        {/* DELIVERY */}

                        <div className="checkout-card">

                            <div className="checkout-card-title">

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


                            <div className="checkout-form">


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


                                <div className="checkout-form-row">

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
                                    />

                                </label>

                            </div>

                        </div>


                        {/* OTP */}

                        <div className="checkout-card">

                            <div className="checkout-card-title">

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

                                <div className="otp-start">

                                    <p>
                                        An OTP will be sent
                                        to your registered
                                        email address.
                                    </p>


                                    <button
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

                                <div className="otp-area">


                                    <div className="otp-email">

                                        OTP sent to:

                                        <strong>
                                            {
                                                maskedEmail
                                            }
                                        </strong>

                                    </div>


                                    <div className="otp-input-row">

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
                                                        event.target.value
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
                                                className="verify-otp-button"
                                                disabled={
                                                    verifyingOTP
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

                                        <div className="otp-verified">

                                            <CheckCircle
                                                size={16}
                                            />

                                            Email verified

                                        </div>

                                    )}


                                    {!otpVerified && (

                                        <button
                                            className="resend-otp-button"
                                            disabled={
                                                sendingOTP
                                            }
                                            onClick={
                                                sendOTP
                                            }
                                        >
                                            Resend OTP
                                        </button>

                                    )}

                                </div>

                            )}

                        </div>


                    </section>


                    {/* =================================
                        RIGHT SUMMARY
                    ================================= */}

                    <aside className="checkout-summary">


                        <p>
                            ORDER SUMMARY
                        </p>


                        <h2>
                            Your Order
                        </h2>


                        <div className="checkout-products">


                            {cart.items.map(
                                item => (

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
                                                    item.quantity
                                                }{" "}
                                                {
                                                    item.unit
                                                }
                                                {" × "}
                                                ₹
                                                {Number(
                                                    item.unit_price
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </span>

                                        </div>


                                        <strong>

                                            ₹
                                            {Number(
                                                item.subtotal
                                            ).toLocaleString(
                                                "en-IN"
                                            )}

                                        </strong>

                                    </div>

                                )
                            )}

                        </div>


                        <div className="checkout-divider" />


                        <div className="checkout-summary-line">

                            <span>
                                Subtotal
                            </span>

                            <strong>

                                ₹
                                {Number(
                                    cart.totalAmount
                                ).toLocaleString(
                                    "en-IN"
                                )}

                            </strong>

                        </div>


                        <div className="checkout-summary-line">

                            <span>
                                Delivery
                            </span>

                            <strong>
                                Free
                            </strong>

                        </div>


                        <div className="checkout-divider" />


                        <div className="checkout-total">

                            <span>
                                Total
                            </span>

                            <strong>

                                ₹
                                {Number(
                                    cart.totalAmount
                                ).toLocaleString(
                                    "en-IN"
                                )}

                            </strong>

                        </div>


                        <button
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

                            <small className="checkout-warning">

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