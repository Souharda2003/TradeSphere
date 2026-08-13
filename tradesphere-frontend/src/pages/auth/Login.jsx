import { useState } from "react";
import {
    useNavigate
} from "react-router-dom";
import { motion } from "motion/react";
import api from "../../services/api";
import BackButton from "../../components/BackButton";
import {
    Phone,
    Lock,
    ArrowRight,
    ShieldCheck
} from "lucide-react";

import "../../styles/login.css";

function Login() {
  const navigate = useNavigate();

const [loading, setLoading] = useState(false);

const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        phone: "",
        password: ""
    });

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };


    const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");
    setLoading(true);

    try {

       const response = await api.post(
    "/auth/login",
    formData
);

        const data = response.data;

        if (!data.success) {

            setError(data.message);

            return;
        }


        /*
         * Multiple accounts
         */

        if (data.multipleAccounts) {

            sessionStorage.setItem(
                "loginAccounts",
                JSON.stringify(data.accounts)
            );

            sessionStorage.setItem(
                "loginPhone",
                formData.phone
            );

           

            navigate("/choose-account");

            return;
        }

localStorage.setItem(
    "accessToken",
    data.token
);

localStorage.setItem(
    "userId",
    data.userId
);

localStorage.setItem(
    "role",
    data.role
);

localStorage.setItem(
    "fullName",
    data.fullName
);

localStorage.setItem(
    "gender",
    data.gender || ""
);

        if (data.role === "CUSTOMER") {

            navigate("/customer");

        } else {

            navigate("/seller");

        }

    } catch (error) {

        console.error(error);

        setError(
            error.response?.data?.message ||
            "Unable to connect to the server."
        );

    } finally {

        setLoading(false);

    }
};

    return (

        <div className="login-page">

            <div className="login-background">

                <div className="login-orb orb-one"></div>
                <div className="login-orb orb-two"></div>

            </div>


            <motion.div
                className="login-container"

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
<BackButton/>
                {/* BRAND */}

                <a
                    href="/"
                    className="login-brand"
                >

                    <span>TS</span>

                    <strong>
                        TradeSphere
                    </strong>

                </a>


                {/* CARD */}

                <div className="login-card">

                    <div className="login-icon">
                        <ShieldCheck size={25} />
                    </div>


                    <div className="login-header">

                        <p>
                            WELCOME BACK
                        </p>

                        <h1>
                            Sign in to TradeSphere
                        </h1>

                        <span>
                            Access your trading workspace securely.
                        </span>

                    </div>

{error && (
    <div className="login-error">
        {error}
    </div>
)}
                    <form
                        onSubmit={handleSubmit}
                        className="login-form"
                    >

                        <div className="login-input-group">

                            <label>
                                Phone Number
                            </label>

                            <div className="login-input">

                                <Phone size={18} />

                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Enter phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>


                        <div className="login-input-group">

                            <div className="password-label">

                                <label>
                                    Password
                                </label>

                                <a href="/forgot-password">
                                    Forgot password?
                                </a>

                            </div>


                            <div className="login-input">

                                <Lock size={18} />

                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>


                        <button
    className="login-button"
    type="submit"
    disabled={loading}
>
    {loading ? (
        "Signing in..."
    ) : (
        <>
            Sign In
            <ArrowRight size={18} />
        </>
    )}
</button>

                    </form>


                    <div className="login-divider">
                        <span></span>
                        <p>OR</p>
                        <span></span>
                    </div>


                    <div className="register-prompt">

                        <span>
                            Don't have an account?
                        </span>

                        <a href="/register">
                            Create account
                        </a>

                    </div>

                </div>


                <p className="login-security">
                    <ShieldCheck size={14} />
                    Your account is protected with secure authentication.
                </p>

            </motion.div>

        </div>
    );
}

export default Login;