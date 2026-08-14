import { useState } from "react";
import { createPortal } from "react-dom";
import { LogOut } from "lucide-react";
import "../styles/logout-button.css";
function LogoutButton() {
    const [
        showLogoutModal,
        setShowLogoutModal
    ] = useState(false);


    const handleLogout = () => {

localStorage.removeItem("token");

        localStorage.removeItem("user");
localStorage.removeItem("authToken");

        window.location.href =
            "/login";

    };


    return (

        <>

            <button
                type="button"
                className="dashboard-logout-button"
                onClick={() =>
                    setShowLogoutModal(true)
                }
            >

                <LogOut
                    size={17}
                />

                <span>
                    Logout
                </span>

            </button>

            {showLogoutModal &&

                createPortal(

                    <div
                        className="logout-modal-overlay"
                        onMouseDown={(event) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {

                                setShowLogoutModal(
                                    false
                                );

                            }

                        }}
                    >

                        <div
                            className="logout-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="logout-title"
                        >

                            {/* CLOSE */}

                            <button
                                type="button"
                                className="logout-modal-close"
                                onClick={() =>
                                    setShowLogoutModal(
                                        false
                                    )
                                }
                            >
                            </button>

                            <div
                                className="logout-modal-icon"
                            >

                                <LogOut
                                    size={17}
                                />

                            </div>


                            <div
                            className="logout-modal-content"
                        >

                            <h2>
                                Logout?
                            </h2>

                            <p>
                                Are you sure you want
                                to logout from your
                                TradeSphere account?
                            </p>

                        </div>
                            <div
                                className="logout-modal-actions"
                            >

                                <button
                                    type="button"
                                    className="logout-cancel-button"
                                    onClick={() =>
                                        setShowLogoutModal(
                                            false
                                        )
                                    }
                                >

                                    Cancel

                                </button>


                                <button
                                    type="button"
                                    className="logout-confirm-button"
                                    onClick={
                                        handleLogout
                                    }
                                >

                                    <LogOut
                                        size={17}
                                    />

                                    Yes, Logout

                                </button>

                            </div>

                        </div>

                    </div>,

                    document.body

                )

            }

        </>

    );

}


export default LogoutButton;