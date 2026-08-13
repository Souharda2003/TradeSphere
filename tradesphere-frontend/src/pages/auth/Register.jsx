import { useState } from "react";

import { motion, AnimatePresence } from "motion/react";

import {
    User,
    Mail,
    Phone,
    Lock,
    Building2,
    MapPin,
    Globe2,
    ArrowRight,
    Check,
    Eye,
    EyeOff,
    UserRound,
    Store,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import BackButton from "../../components/BackButton";

import api from "../../services/api";

import "../../styles/auth.css";


function Register() {

    const navigate = useNavigate();


    // =====================================================
    // ACCOUNT TYPE
    // =====================================================

    const [role, setRole] =
        useState("CUSTOMER");


    // =====================================================
    // CUSTOMER GENDER / THEME
    // =====================================================

    const [gender, setGender] =
        useState("MALE");


    // =====================================================
    // PASSWORD VISIBILITY
    // =====================================================

    const [showPassword, setShowPassword] =
        useState(false);


    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);


    // =====================================================
    // FORM DATA
    // =====================================================

    const [formData, setFormData] = useState({

        fullName: "",

        email: "",

        phone: "",

        password: "",

        confirmPassword: "",

        businessName: "",

        address: "",

        country: "India",

    });


    // =====================================================
    // UI STATES
    // =====================================================

    const [loading, setLoading] =
        useState(false);


    const [error, setError] =
        useState("");


    const [success, setSuccess] =
        useState("");


    // =====================================================
    // HANDLE INPUT CHANGE
    // =====================================================

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;


        /*
         * Phone number:
         * Allow only digits.
         */

        if (name === "phone") {

            const onlyDigits =
                value.replace(/\D/g, "");


            setFormData((previous) => ({

                ...previous,

                phone:
                    onlyDigits.slice(0, 10),

            }));


            setError("");

            return;
        }


        setFormData((previous) => ({

            ...previous,

            [name]: value,

        }));


        if (error) {

            setError("");

        }
    };


    // =====================================================
    // ROLE CHANGE
    // =====================================================

    const handleRoleChange = (
        selectedRole
    ) => {

        setRole(selectedRole);

        setError("");

        setSuccess("");


        /*
         * Customer does not need
         * business name.
         */

        if (
            selectedRole === "CUSTOMER"
        ) {

            setFormData((previous) => ({

                ...previous,

                businessName: "",

            }));
        }
    };


    // =====================================================
    // GENDER CHANGE
    // =====================================================

    const handleGenderChange = (
        selectedGender
    ) => {

        setGender(selectedGender);

        setError("");

        setSuccess("");
    };


    // =====================================================
    // VALIDATE FORM
    // =====================================================

    const validateForm = () => {

        const {
            fullName,
            email,
            phone,
            password,
            confirmPassword,
            businessName,
            address,
            country,
        } = formData;


        // Full name

        if (!fullName.trim()) {

            return "Please enter your full name.";

        }


        if (fullName.trim().length < 2) {

            return "Full name must contain at least 2 characters.";

        }


        // Email

        if (!email.trim()) {

            return "Please enter your email address.";

        }


        if (
            !/^\S+@\S+\.\S+$/.test(
                email.trim()
            )
        ) {

            return "Please enter a valid email address.";

        }


        // Phone

        if (
            !/^\d{10}$/.test(
                phone
            )
        ) {

            return "Phone number must contain exactly 10 digits.";

        }


        // Password

        if (password.length < 8) {

            return "Password must contain at least 8 characters.";

        }


        // Confirm password

        if (
            password !==
            confirmPassword
        ) {

            return "Passwords do not match.";

        }


        // Customer gender

        if (
            role === "CUSTOMER" &&
            !gender
        ) {

            return "Please select your gender.";

        }


        // Seller business

        if (
            role === "SELLER" &&
            !businessName.trim()
        ) {

            return "Please enter your business name.";

        }


        // Address

        if (!address.trim()) {

            return "Please enter your address.";

        }


        // Country

        if (!country.trim()) {

            return "Please enter your country.";

        }


        return null;
    };


const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
        validateForm();

    if (validationError) {

        setError(
            validationError
        );

        return;
    }

    setLoading(true);

    try {

        const payload = {

    fullName:
        formData.fullName.trim(),

    email:
        formData.email.trim().toLowerCase(),

    phone:
        formData.phone.trim(),

    password:
        formData.password,

    role:
        role.toUpperCase(),

    gender:
        gender.toUpperCase(),

    businessName:
        formData.businessName.trim(),

    address:
        formData.address.trim(),

    country:
        formData.country.trim()

};

        const response =
            await api.post(
                "/auth/register",
                payload
            );


        console.log(
            "REGISTER RESPONSE:",
            response.data
        );


        if (
            response.data.success
        ) {

            navigate(
                "/login",
                {
                    state: {
                        registered: true
                    }
                }
            );

            return;
        }


        setError(
            response.data.message ||
            "Registration failed."
        );


    } catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );


        console.error(
            "SERVER RESPONSE:",
            error.response?.data
        );


        setError(

            error.response?.data?.message ||

            "Registration failed."
        );


    } finally {

        setLoading(false);

    }
};
    const isMale =
        gender === "MALE";


    // =====================================================
    // UI
    // =====================================================

    return (

        <div
            className={`register-page app-theme ${
                isMale
                    ? "male-theme"
                    : "female-theme"
            }`}
        >


            {/* =================================================
                BACK BUTTON
            ================================================= */}

            <div className="register-back">

                <BackButton
                    label="Back to Home"
                />

            </div>


            <div className="register-wrapper">


                {/* =================================================
                    BRAND
                ================================================= */}

                <motion.div

                    className="register-brand"

                    initial={{
                        opacity: 0,
                        y: -12,
                    }}

                    animate={{
                        opacity: 1,
                        y: 0,
                    }}

                    transition={{
                        duration: 0.55,
                    }}

                >

                    <div className="register-brand-logo">

                        TS

                    </div>


                    <div className="register-brand-name">

                        TradeSphere

                    </div>

                </motion.div>


                {/* =================================================
                    REGISTER CARD
                ================================================= */}

                <motion.div

                    className="register-card"

                    initial={{
                        opacity: 0,
                        y: 35,
                    }}

                    animate={{
                        opacity: 1,
                        y: 0,
                    }}

                    transition={{
                        duration: 0.7,
                        delay: 0.1,
                    }}

                >


                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div className="register-header">


                        <div className="register-title-icon">

                            {role === "CUSTOMER" ? (

                                <UserRound
                                    size={22}
                                />

                            ) : (

                                <Store
                                    size={22}
                                />

                            )}

                        </div>


                        <div>

                            <p className="eyebrow">

                                CREATE ACCOUNT

                            </p>


                            <h2>

                                Join TradeSphere

                            </h2>


                            <p>

                                Create your secure trading
                                account.

                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        ACCOUNT TYPE
                    ================================================= */}

                    <div className="section-title">

                        Choose Account Type

                    </div>


                    <div className="role-selection">


                        {/* =================================================
                            CUSTOMER
                        ================================================= */}

                        <button

                            type="button"

                            className={`role-card ${
                                role === "CUSTOMER"
                                    ? "selected"
                                    : ""
                            }`}

                            onClick={() =>
                                handleRoleChange(
                                    "CUSTOMER"
                                )
                            }

                        >

                            <div className="role-icon customer-role-icon">

                                <UserRound
                                    size={21}
                                />

                            </div>


                            <div className="role-content">

                                <strong>

                                    Customer

                                </strong>


                                <span>

                                    Browse and purchase products

                                </span>

                            </div>


                            {role === "CUSTOMER" && (

                                <div className="selected-check">

                                    <Check
                                        size={15}
                                    />

                                </div>

                            )}

                        </button>


                        {/* =================================================
                            SELLER
                        ================================================= */}

                        <button

                            type="button"

                            className={`role-card ${
                                role === "SELLER"
                                    ? "selected"
                                    : ""
                            }`}

                            onClick={() =>
                                handleRoleChange(
                                    "SELLER"
                                )
                            }

                        >

                            <div className="role-icon seller-role-icon">

                                <Store
                                    size={21}
                                />

                            </div>


                            <div className="role-content">

                                <strong>

                                    Seller

                                </strong>


                                <span>

                                    Sell and manage products

                                </span>

                            </div>


                            {role === "SELLER" && (

                                <div className="selected-check">

                                    <Check
                                        size={15}
                                    />

                                </div>

                            )}

                        </button>

                    </div>


                    {/* =================================================
                        CUSTOMER GENDER
                    ================================================= */}

                    <AnimatePresence mode="wait">

                        {role === "CUSTOMER" && (

                            <motion.div

                                key="gender"

                                initial={{
                                    opacity: 0,
                                    height: 0,
                                }}

                                animate={{
                                    opacity: 1,
                                    height: "auto",
                                }}

                                exit={{
                                    opacity: 0,
                                    height: 0,
                                }}

                                transition={{
                                    duration: 0.25,
                                }}

                                className="gender-wrapper"

                            >

                                <div className="section-title">

                                    Choose Your Theme

                                </div>


                                <div className="gender-selection">


                                    {/* =================================================
                                        MALE
                                    ================================================= */}

                                    <button

                                        type="button"

                                        className={`gender-card male ${
                                            gender === "MALE"
                                                ? "selected"
                                                : ""
                                        }`}

                                        onClick={() =>
                                            handleGenderChange(
                                                "MALE"
                                            )
                                        }

                                    >

                                        <div className="gender-symbol">

                                            ♂

                                        </div>


                                        <div>

                                            <strong>

                                                Male

                                            </strong>


                                            <span>

                                                Blue premium theme

                                            </span>

                                        </div>


                                        {gender === "MALE" && (

                                            <Check
                                                size={17}
                                                className="gender-check"
                                            />

                                        )}

                                    </button>


                                    {/* =================================================
                                        FEMALE
                                    ================================================= */}

                                    <button

                                        type="button"

                                        className={`gender-card female ${
                                            gender === "FEMALE"
                                                ? "selected"
                                                : ""
                                        }`}

                                        onClick={() =>
                                            handleGenderChange(
                                                "FEMALE"
                                            )
                                        }

                                    >

                                        <div className="gender-symbol">

                                            ♀

                                        </div>


                                        <div>

                                            <strong>

                                                Female

                                            </strong>


                                            <span>

                                                Rose premium theme

                                            </span>

                                        </div>


                                        {gender === "FEMALE" && (

                                            <Check
                                                size={17}
                                                className="gender-check"
                                            />

                                        )}

                                    </button>

                                </div>

                            </motion.div>

                        )}

                    </AnimatePresence>


                    {/* =================================================
                        ERROR MESSAGE
                    ================================================= */}

                    <AnimatePresence>

                        {error && (

                            <motion.div

                                className="register-message error-message"

                                initial={{
                                    opacity: 0,
                                    y: -5,
                                }}

                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}

                                exit={{
                                    opacity: 0,
                                    y: -5,
                                }}

                            >

                                {error}

                            </motion.div>

                        )}

                    </AnimatePresence>


                    {/* =================================================
                        SUCCESS MESSAGE
                    ================================================= */}

                    <AnimatePresence>

                        {success && (

                            <motion.div

                                className="register-message success-message"

                                initial={{
                                    opacity: 0,
                                    y: -5,
                                }}

                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}

                                exit={{
                                    opacity: 0,
                                    y: -5,
                                }}

                            >

                                <Check
                                    size={16}
                                />

                                {success}

                            </motion.div>

                        )}

                    </AnimatePresence>


                    {/* =================================================
                        FORM
                    ================================================= */}

                    <form

                        onSubmit={
                            handleSubmit
                        }

                        className="register-form"

                    >


                        {/* =================================================
                            FORM GRID
                        ================================================= */}

                        <div className="form-grid">


                            {/* =================================================
                                FULL NAME
                            ================================================= */}

                            <div className="input-group">

                                <label>

                                    Full Name

                                </label>


                                <div className="input-wrapper">

                                    <User
                                        size={17}
                                    />


                                    <input

                                        type="text"

                                        name="fullName"

                                        placeholder="Your full name"

                                        value={
                                            formData.fullName
                                        }

                                        onChange={
                                            handleChange
                                        }

                                        autoComplete="name"

                                        required

                                    />

                                </div>

                            </div>


                            {/* =================================================
                                EMAIL
                            ================================================= */}

                            <div className="input-group">

                                <label>

                                    Email Address

                                </label>


                                <div className="input-wrapper">

                                    <Mail
                                        size={17}
                                    />


                                    <input

                                        type="email"

                                        name="email"

                                        placeholder="you@example.com"

                                        value={
                                            formData.email
                                        }

                                        onChange={
                                            handleChange
                                        }

                                        autoComplete="email"

                                        required

                                    />

                                </div>

                            </div>


                            {/* =================================================
                                PHONE
                            ================================================= */}

                            <div className="input-group">

                                <label>

                                    Phone Number

                                </label>


                                <div className="input-wrapper">

                                    <Phone
                                        size={17}
                                    />


                                    <input

                                        type="tel"

                                        name="phone"

                                        placeholder="10 digit phone number"

                                        value={
                                            formData.phone
                                        }

                                        onChange={
                                            handleChange
                                        }

                                        maxLength={10}

                                        inputMode="numeric"

                                        autoComplete="tel"

                                        required

                                    />

                                </div>

                            </div>


                            {/* =================================================
                                PASSWORD
                            ================================================= */}

                            <div className="input-group">

                                <label>

                                    Password

                                </label>


                                <div className="input-wrapper">

                                    <Lock
                                        size={17}
                                    />


                                    <input

                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }

                                        name="password"

                                        placeholder="Minimum 8 characters"

                                        value={
                                            formData.password
                                        }

                                        onChange={
                                            handleChange
                                        }

                                        autoComplete="new-password"

                                        required

                                    />


                                    <button

                                        type="button"

                                        className="password-toggle"

                                        onClick={() =>
                                            setShowPassword(
                                                (previous) =>
                                                    !previous
                                            )
                                        }

                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
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


                            {/* =================================================
                                CONFIRM PASSWORD
                            ================================================= */}

                            <div className="input-group">

                                <label>

                                    Confirm Password

                                </label>


                                <div className="input-wrapper">

                                    <Lock
                                        size={17}
                                    />


                                    <input

                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }

                                        name="confirmPassword"

                                        placeholder="Repeat your password"

                                        value={
                                            formData.confirmPassword
                                        }

                                        onChange={
                                            handleChange
                                        }

                                        autoComplete="new-password"

                                        required

                                    />


                                    <button

                                        type="button"

                                        className="password-toggle"

                                        onClick={() =>
                                            setShowConfirmPassword(
                                                (previous) =>
                                                    !previous
                                            )
                                        }

                                        aria-label={
                                            showConfirmPassword
                                                ? "Hide confirm password"
                                                : "Show confirm password"
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


                            {/* =================================================
                                COUNTRY
                            ================================================= */}

                            <div className="input-group">

                                <label>

                                    Country

                                </label>


                                <div className="input-wrapper">

                                    <Globe2
                                        size={17}
                                    />


                                    <input

                                        type="text"

                                        name="country"

                                        placeholder="Country"

                                        value={
                                            formData.country
                                        }

                                        onChange={
                                            handleChange
                                        }

                                        autoComplete="country-name"

                                        required

                                    />

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            SELLER BUSINESS NAME
                        ================================================= */}

                        <AnimatePresence>

                            {role === "SELLER" && (

                                <motion.div

                                    className="seller-extra"

                                    initial={{
                                        opacity: 0,
                                        height: 0,
                                    }}

                                    animate={{
                                        opacity: 1,
                                        height: "auto",
                                    }}

                                    exit={{
                                        opacity: 0,
                                        height: 0,
                                    }}

                                >

                                    <div className="input-group">

                                        <label>

                                            Business Name

                                        </label>


                                        <div className="input-wrapper">

                                            <Building2
                                                size={17}
                                            />


                                            <input

                                                type="text"

                                                name="businessName"

                                                placeholder="Your company / business name"

                                                value={
                                                    formData.businessName
                                                }

                                                onChange={
                                                    handleChange
                                                }

                                                autoComplete="organization"

                                                required

                                            />

                                        </div>

                                    </div>

                                </motion.div>

                            )}

                        </AnimatePresence>


                        {/* =================================================
                            ADDRESS
                        ================================================= */}

                        <div className="input-group">

                            <label>

                                Address

                            </label>


                            <div className="input-wrapper">

                                <MapPin
                                    size={17}
                                />


                                <input

                                    type="text"

                                    name="address"

                                    placeholder="City, State"

                                    value={
                                        formData.address
                                    }

                                    onChange={
                                        handleChange
                                    }

                                    autoComplete="street-address"

                                    required

                                />

                            </div>

                        </div>


                        {/* =================================================
                            TERMS
                        ================================================= */}

                        <div className="terms-row">

                            <span className="terms-check">

                                <Check
                                    size={13}
                                />

                            </span>


                            <p>

                                By creating an account, you agree
                                to our Terms of Service and Privacy
                                Policy.

                            </p>

                        </div>


                        {/* =================================================
                            SUBMIT BUTTON
                        ================================================= */}

                        <button

                            type="submit"

                            className="register-button"

                            disabled={loading}

                        >

                            {loading ? (

                                <>

                                    <span className="button-spinner"></span>

                                    Creating Account...

                                </>

                            ) : (

                                <>

                                    Create Account

                                    <ArrowRight
                                        size={18}
                                    />

                                </>

                            )}

                        </button>


                    </form>


                    {/* =================================================
                        LOGIN LINK
                    ================================================= */}

                    <div className="login-link">

                        <span>

                            Already have an account?

                        </span>


                        <button

                            type="button"

                            onClick={() =>
                                navigate("/login")
                            }

                        >

                            Sign in

                        </button>

                    </div>


                </motion.div>

            </div>

        </div>
    );
}


export default Register;