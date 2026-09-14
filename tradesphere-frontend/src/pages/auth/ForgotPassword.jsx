import {
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    motion
} from "motion/react";

import {
    Phone,
    Lock,
    ShieldCheck,
    ArrowRight,
    Eye,
    EyeOff,
    CheckCircle2
} from "lucide-react";

import BackButton
    from "../../components/BackButton";

import api
    from "../../services/api";

import "../../styles/forgot-password.css";


function ForgotPassword() {

    const navigate =
        useNavigate();


    const [
        loading,
        setLoading
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    const [
        success,
        setSuccess
    ] = useState(false);


    const [
        showPassword,
        setShowPassword
    ] = useState(false);


    const [
        showConfirmPassword,
        setShowConfirmPassword
    ] = useState(false);


    const [
        formData,
        setFormData
    ] = useState({

        phone: "",

        role: "CUSTOMER",

        password: "",

        confirmPassword: ""

    });


    // =================================================
    // HANDLE INPUT
    // =================================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setFormData(
            previous => ({

                ...previous,

                [name]:
                    value

            })
        );


        setError("");

    };


    // =================================================
    // SUBMIT
    // =================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();


        setError("");


        const phone =
            formData.phone.trim();


        const password =
            formData.password;


        const confirmPassword =
            formData.confirmPassword;


        // =================================================
        // PHONE VALIDATION
        // =================================================

        if (
            !/^\d{10}$/.test(phone)
        ) {

            setError(
                "Enter a valid 10-digit phone number."
            );

            return;

        }


        // =================================================
        // PASSWORD VALIDATION
        // =================================================

        if (
            password.length < 8
        ) {

            setError(
                "Password must contain at least 8 characters."
            );

            return;

        }


        // =================================================
        // CONFIRM PASSWORD
        // =================================================

        if (
            password !==
            confirmPassword
        ) {

            setError(
                "Passwords do not match."
            );

            return;

        }


        try {

            setLoading(true);


            const response =
                await api.post(

                    "/auth/forgot-password",

                    {

                        phone,

                        role:
                            formData.role,

                        password

                    }

                );


            if (
                response.data?.success
            ) {

                setSuccess(true);


                setTimeout(() => {

                    navigate(
                        "/login"
                    );

                }, 1800);

            }


        } catch (error) {

            console.error(
                "FORGOT PASSWORD:",
                error
            );


            setError(

                error.response
                    ?.data
                    ?.message ||

                "Unable to reset password."

            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="forgot-password-page">


            {/* =========================================
                BACKGROUND
            ========================================= */}

            <div className="forgot-password-background">

                <div
                    className="
                        forgot-password-orb
                        forgot-orb-one
                    "
                />

                <div
                    className="
                        forgot-password-orb
                        forgot-orb-two
                    "
                />

            </div>


            <motion.div

                className="
                    forgot-password-container
                "

                initial={{
                    opacity: 0,
                    y: 25
                }}

                animate={{
                    opacity: 1,
                    y: 0
                }}

                transition={{
                    duration: 0.6
                }}

            >


                <BackButton />


                {/* =====================================
                    BRAND
                ===================================== */}

                <a
                    href="/"
                    className="
                        forgot-password-brand
                    "
                >

                    <span>
                        TS
                    </span>

                    <strong>
                        TradeSphere
                    </strong>

                </a>


                {/* =====================================
                    CARD
                ===================================== */}

                <div
                    className="
                        forgot-password-card
                    "
                >


                    {/* =================================
                        SUCCESS
                    ================================= */}

                    {success ? (

                        <div
                            className="
                                forgot-success
                            "
                        >

                            <div
                                className="
                                    forgot-success-icon
                                "
                            >

                                <CheckCircle2
                                    size={30}
                                />

                            </div>


                            <h1>
                                Password Updated
                            </h1>


                            <p>
                                Your password has been
                                changed successfully.
                            </p>


                            <span>
                                Redirecting you to login...
                            </span>

                        </div>

                    ) : (

                        <>


                            {/* =========================
                                ICON
                            ========================= */}

                            <div
                                className="
                                    forgot-password-icon
                                "
                            >

                                <Lock
                                    size={25}
                                />

                            </div>


                            {/* =========================
                                HEADER
                            ========================= */}

                            <div
                                className="
                                    forgot-password-header
                                "
                            >

                                <p>
                                    ACCOUNT RECOVERY
                                </p>


                                <h1>
                                    Reset your password
                                </h1>


                                <span>
                                    Enter your account details
                                    and create a new password.
                                </span>

                            </div>


                            {/* =========================
                                ERROR
                            ========================= */}

                            {error && (

                                <div
                                    className="
                                        forgot-password-error
                                    "
                                >

                                    {error}

                                </div>

                            )}


                            {/* =========================
                                FORM
                            ========================= */}

                            <form
                                className="
                                    forgot-password-form
                                "
                                onSubmit={
                                    handleSubmit
                                }
                            >


                                {/* =====================
                                    PHONE
                                ===================== */}

                                <div
                                    className="
                                        forgot-input-group
                                    "
                                >

                                    <label>
                                        Phone Number
                                    </label>


                                    <div
                                        className="
                                            forgot-input
                                        "
                                    >

                                        <Phone
                                            size={18}
                                        />


                                        <input

                                            type="tel"

                                            name="phone"

                                            placeholder="
                                                Enter phone number
                                            "

                                            value={
                                                formData.phone
                                            }

                                            onChange={
                                                handleChange
                                            }

                                            maxLength={10}

                                            inputMode="numeric"

                                            required

                                        />

                                    </div>

                                </div>


                                {/* =====================
                                    ACCOUNT TYPE
                                ===================== */}

                                <div
                                    className="
                                        forgot-input-group
                                    "
                                >

                                    <label>
                                        Account Type
                                    </label>


                                    <div
                                        className="
                                            forgot-select
                                        "
                                    >

                                        <select

                                            name="role"

                                            value={
                                                formData.role
                                            }

                                            onChange={
                                                handleChange
                                            }

                                        >

                                            <option
                                                value="CUSTOMER"
                                            >
                                                Customer
                                            </option>


                                            <option
                                                value="SELLER"
                                            >
                                                Seller
                                            </option>

                                        </select>

                                    </div>

                                </div>


                                {/* =====================
                                    PASSWORD
                                ===================== */}

                                <div
                                    className="
                                        forgot-input-group
                                    "
                                >

                                    <label>
                                        New Password
                                    </label>


                                    <div
                                        className="
                                            forgot-input
                                        "
                                    >

                                        <Lock
                                            size={18}
                                        />


                                        <input

                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }

                                            name="password"

                                            placeholder="
                                                Enter new password
                                            "

                                            value={
                                                formData.password
                                            }

                                            onChange={
                                                handleChange
                                            }

                                            autoComplete="
                                                new-password
                                            "

                                            required

                                        />


                                        <button

                                            type="button"

                                            className="
                                                forgot-password-toggle
                                            "

                                            onClick={() =>
                                                setShowPassword(
                                                    previous =>
                                                        !previous
                                                )
                                            }

                                        >

                                            {showPassword ? (

                                                <EyeOff
                                                    size={17}
                                                />

                                            ) : (

                                                <Eye
                                                    size={17}
                                                />

                                            )}

                                        </button>

                                    </div>

                                </div>


                                {/* =====================
                                    CONFIRM PASSWORD
                                ===================== */}

                                <div
                                    className="
                                        forgot-input-group
                                    "
                                >

                                    <label>
                                        Confirm Password
                                    </label>


                                    <div
                                        className="
                                            forgot-input
                                        "
                                    >

                                        <Lock
                                            size={18}
                                        />


                                        <input
    type={
        showConfirmPassword
            ? "text"
            : "password"
    }

    name="confirmPassword"

    placeholder="Confirm new password"

    value={formData.confirmPassword}

    onChange={handleChange}

    autoComplete="new-password"

    required
/>



                                        <button

                                            type="button"

                                            className="
                                                forgot-password-toggle
                                            "

                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    previous =>
                                                        !previous
                                                )
                                            }

                                        >

                                            {showConfirmPassword ? (

                                                <EyeOff
                                                    size={17}
                                                />

                                            ) : (

                                                <Eye
                                                    size={17}
                                                />

                                            )}

                                        </button>

                                    </div>

                                </div>


                                {/* =====================
                                    SUBMIT
                                ===================== */}

                                <button

                                    type="submit"

                                    className="
                                        forgot-password-button
                                    "

                                    disabled={
                                        loading
                                    }

                                >

                                    {loading ? (

                                        "Updating password..."

                                    ) : (

                                        <>

                                            Update Password

                                            <ArrowRight
                                                size={18}
                                            />

                                        </>

                                    )}

                                </button>


                            </form>


                            {/* =========================
                                SECURITY
                            ========================= */}

                            <div
                                className="
                                    forgot-password-security
                                "
                            >

                                <ShieldCheck
                                    size={14}
                                />

                                Password will be securely
                                encrypted before being stored.

                            </div>


                        </>

                    )}

                </div>

            </motion.div>

        </div>

    );

}


export default ForgotPassword;