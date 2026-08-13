import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import {
    UserRound,
    Store,
    ArrowRight
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import BackButton from "../../components/BackButton";

import api from "../../services/api";

import "../../styles/choose-account.css";


function ChooseAccount() {

    const navigate = useNavigate();
    
    const [accounts, setAccounts] =
    useState([]);
    
    
    const [phone, setPhone] =
    useState("");


    
    const [password, setPassword] =
        useState("");


    const [loading, setLoading] =
        useState(false);


    const [error, setError] =
        useState("");


    useEffect(() => {

        const savedAccounts =
            sessionStorage.getItem(
                "loginAccounts"
            );


        const savedPhone =
            sessionStorage.getItem(
                "loginPhone"
            );


        if (
            !savedAccounts ||
            !savedPhone
        ) {

            navigate("/login");

            return;
        }


        setAccounts(
            JSON.parse(savedAccounts)
        );


        setPhone(savedPhone);


        /*
         * Ask password again.
         *
         * Password should never be
         * stored in sessionStorage.
         */

    }, [navigate]);


    const chooseAccount = async (
        account
    ) => {

        if (!password) {

            setError(
                "Please enter your password to continue."
            );

            return;
        }


        setLoading(true);

        setError("");


        try {

           const response =
    await api.post(
        "/auth/choose-account",
        {
            accountId: account.id,
            phone,
            password
        }
    );


            const data =
                response.data;


            if (!data.success) {

                setError(
                    data.message
                );

                return;
            }


            /*
             * Store JWT
             */

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


            sessionStorage.removeItem(
                "loginAccounts"
            );


            sessionStorage.removeItem(
                "loginPhone"
            );


            if (
                data.role ===
                "CUSTOMER"
            ) {

                navigate(
                    "/customer"
                );

            } else {

                navigate(
                    "/seller"
                );
            }


        } catch (error) {

            console.error(
                error
            );

            setError(
                error.response
                    ?.data
                    ?.message ||
                "Unable to login."
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="choose-account-page">

            <div className="choose-account-container">

                <BackButton
                    label="Back to Login"
                />


                <div className="choose-brand">

                    <span>
                        TS
                    </span>

                    <strong>
                        TradeSphere
                    </strong>

                </div>


                <motion.div
                    className="choose-header"

                    initial={{
                        opacity: 0,
                        y: 15
                    }}

                    animate={{
                        opacity: 1,
                        y: 0
                    }}
                >

                    <p>
                        ACCOUNT SELECTION
                    </p>

                    <h1>
                        Choose your workspace
                    </h1>

                    <span>
                        This phone number is connected
                        to multiple TradeSphere accounts.
                    </span>

                </motion.div>


                {/* PASSWORD */}

                <div
                    className="account-password-box"
                >

                    <label>
                        Confirm your password
                    </label>

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) =>
                            setPassword(
                                e.target.value
                            )
                        }
                    />

                </div>


                {error && (

                    <div className="account-error">
                        {error}
                    </div>

                )}


                <div className="account-options">

                    {accounts.map(
                        (
                            account,
                            index
                        ) => {

                            const isCustomer =
                                account.role ===
                                "CUSTOMER";


                            return (

                                <motion.button

                                    key={
                                        account.id
                                    }

                                    className="account-card"

                                    disabled={
                                        loading
                                    }

                                    initial={{
                                        opacity: 0,
                                        y: 20
                                    }}

                                    animate={{
                                        opacity: 1,
                                        y: 0
                                    }}

                                    transition={{
                                        delay:
                                            index *
                                            0.1
                                    }}

                                    onClick={() =>
                                        chooseAccount(
                                            account
                                        )
                                    }
                                >

                                    <div
                                        className={`account-icon ${
                                            isCustomer
                                                ? "customer-icon"
                                                : "seller-icon"
                                        }`}
                                    >

                                        {isCustomer ? (

                                            <UserRound
                                                size={24}
                                            />

                                        ) : (

                                            <Store
                                                size={24}
                                            />

                                        )}

                                    </div>


                                    <div
                                        className="account-info"
                                    >

                                        <span>

                                            {
                                                isCustomer
                                                    ? "CUSTOMER ACCOUNT"
                                                    : "SELLER ACCOUNT"
                                            }

                                        </span>


                                        <strong>

                                            {
                                                account.fullName
                                            }

                                        </strong>


                                        <small>

                                            {
                                                isCustomer
                                                    ? "Explore products and manage your orders"
                                                    : "Manage products, stock and sales"
                                            }

                                        </small>

                                    </div>


                                    <div
                                        className="account-arrow"
                                    >

                                        <ArrowRight
                                            size={19}
                                        />

                                    </div>

                                </motion.button>

                            );
                        }
                    )}

                </div>

            </div>

        </div>
    );
}

export default ChooseAccount;