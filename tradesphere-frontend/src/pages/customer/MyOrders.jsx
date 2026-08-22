import {
    useEffect,
    useState
} from "react";

import {
    Package,
    Clock3,
    CheckCircle,
    XCircle,
    Eye,
    RefreshCw,
    ArrowLeft
} from "lucide-react";

import {
    useNavigate
} from "react-router-dom";

import api from "../../services/api";
import LogoutButton
    from "../../components/LogoutButton";

import "../../styles/my-order.css";


function MyOrders() {

    const navigate =
        useNavigate();


    const [orders, setOrders] =
        useState([]);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    useEffect(() => {

        loadOrders();

    }, []);


    async function loadOrders() {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.get(
                    "/orders/my"
                );


            setOrders(
                response.data.orders ||
                []
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
                    "/login"
                );

                return;
            }

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
    function getStatusIcon(
        status
    ) {
        if (
            status ===
            "PENDING_SELLER_ACCEPTANCE"
        ) {
            return (
                <Clock3
                    size={15}
                />
            );
        }
        if (
            [
                "ACCEPTED",
                "PROCESSING",
                "SHIPPED",
                "DELIVERED"
            ].includes(
                status
            )
        ) {
            return (
                <CheckCircle
                    size={15}
                />
            );
        }
        return (
            <XCircle
                size={15}
            />
        );
    }
    function getStatusText(
        status
    ) {

        const map = {

            PENDING_SELLER_ACCEPTANCE:
                "Waiting for Seller",

            ACCEPTED:
                "Order Accepted",

            PROCESSING:
                "Processing",

            SHIPPED:
                "Shipped",

            DELIVERED:
                "Delivered",

            REJECTED:
                "Rejected",

            CANCELLED:
                "Cancelled"

        };


        return (
            map[status] ||
            status
        );

    }


    function getStatusClass(
        status
    ) {

        if (
            status ===
            "PENDING_SELLER_ACCEPTANCE"
        ) {

            return "pending";

        }


        if (
            [
                "ACCEPTED",
                "PROCESSING",
                "SHIPPED",
                "DELIVERED"
            ].includes(
                status
            )
        ) {

            return "accepted";

        }


        return "cancelled";

    }


    if (loading) {

        return (

            <div className="orders-loading">

                <RefreshCw
                    size={20}
                    className="dashboard-spin"
                />

                Loading orders...

            </div>

        );

    }


    return (

        <div className="my-orders-page">


            <header className="my-orders-header">

                <button
    type="button"
    className="my-orders-back-button"
    onClick={() =>
        navigate("/customer")
    }
>
    <ArrowLeft size={18} />

    <span>
        Back
    </span>
</button>

                <div className="my-orders-brand">

                    <Package
                        size={18}
                    />

                    My Orders

                </div>


                <LogoutButton />

            </header>


            <main className="my-orders-main">


                <div className="my-orders-title">

                    <p>
                        CUSTOMER ORDERS
                    </p>

                    <h1>
                        Your orders
                    </h1>

                    <span>
                        Track every order,
                        reference number and
                        seller response.
                    </span>

                </div>


                {error && (

                    <div className="orders-error">
                        {error}
                    </div>

                )}


                {orders.length === 0 ? (

                    <div className="no-orders">

                        <Package
                            size={35}
                        />

                        <h2>
                            No orders yet
                        </h2>

                        <p>
                            Your purchases will
                            appear here.
                        </p>


                        <button
                            onClick={() =>
                                navigate(
                                    "/products"
                                )
                            }
                        >

                            Browse Products

                        </button>

                    </div>

                ) : (

                    <div className="orders-list">

                        {orders.map(
                            order => (

                                <article
                                    className="order-card"
                                    key={
                                        order.id
                                    }
                                >


                                    <div className="order-card-top">

                                        <div>

                                            <span>
                                                ORDER REFERENCE
                                            </span>

                                            <strong>
                                                {
                                                    order.reference_no
                                                }
                                            </strong>

                                        </div>


                                        <div
                                            className={
                                                `order-status ${getStatusClass(
                                                    order.status
                                                )}`
                                            }
                                        >

                                            {
                                                getStatusIcon(
                                                    order.status
                                                )
                                            }

                                            {
                                                getStatusText(
                                                    order.status
                                                )
                                            }

                                        </div>

                                    </div>


                                    <div className="order-card-middle">

                                        <div>

                                            <span>
                                                ORDER DATE
                                            </span>

                                            <strong>
                                                {
                                                    new Date(
                                                        order.created_at
                                                    ).toLocaleDateString(
                                                        "en-IN"
                                                    )
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                TOTAL
                                            </span>

                                            <strong>

                                                ₹
                                                {Number(
                                                    order.total_amount
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}

                                            </strong>

                                        </div>

                                    </div>


                                    <div className="order-card-actions">

                                        <button
    type="button"
    className="view-order-button"
    onClick={() =>
        navigate(
            `/profile/orders/${order.reference_no}`
        )
    }
>
    <Eye size={16} />
    View Order
</button>
                                    </div>

                                </article>

                            )
                        )}

                    </div>

                )}

            </main>

        </div>

    );

}


export default MyOrders;