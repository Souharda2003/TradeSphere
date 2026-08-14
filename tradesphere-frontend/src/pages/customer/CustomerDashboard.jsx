import {
    useEffect,
    useState
} from "react";

import {
    ShoppingBag,
    ShoppingCart,
    Package,
    Clock3,
    CheckCircle,
    XCircle,
    UserRound,
    Bell,
    ArrowRight,
    RefreshCw
} from "lucide-react";

import {
    useNavigate
} from "react-router-dom";

import api from "../../services/api";
import LogoutButton
    from "../../components/LogoutButton";

import "../../styles/customer-dashboard.css";


function CustomerDashboard() {

    const navigate =
        useNavigate();

    const [user, setUser] =
        useState(null);


    const [stats, setStats] =
        useState({

            totalOrders: 0,

            pendingOrders: 0,

            acceptedOrders: 0,

            cancelledOrders: 0,

            cartItems: 0

        });


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");

const [showNotifications, setShowNotifications] =
    useState(false);

const [notifications, setNotifications] =
    useState([]);

const [notificationsRead, setNotificationsRead] =
    useState(false);
    useEffect(() => {

        loadDashboard();

    }, []);


    async function loadDashboard() {

        try {

            setLoading(true);

            setError("");


            const userResponse =
                await api.get(
                    "/user/me"
                );


            setUser(
                userResponse.data.user
            );
            let orders = [];

try {

    const orderResponse =
        await api.get("/orders/my");

    orders =
        Array.isArray(
            orderResponse.data?.orders
        )
            ? orderResponse.data.orders
            : [];

    

} catch (orderError) {

    console.error(
        "GET MY ORDERS ERROR:",
        orderError.response?.data ||
        orderError.message ||
        orderError
    );

    orders = [];

    

}
try {

    const notificationResponse =
        await api.get("/notifications");

    setNotifications(
        Array.isArray(
            notificationResponse.data?.notifications
        )
            ? notificationResponse.data.notifications
            : []
    );

} catch (notificationError) {

    console.error(
        "GET NOTIFICATIONS ERROR:",
        notificationError.response?.data ||
        notificationError.message ||
        notificationError
    );

    setNotifications([]);

}
            let cartItems = 0;


            try {

                const cartResponse =
                    await api.get(
                        "/cart"
                    );


                cartItems =
                    cartResponse.data.items
                        ?.length || 0;

            } catch (
                cartError
            ) {

                console.warn(
                    "Cart API unavailable:",
                    cartError
                );

            }

            const totalOrders =
                orders.length;


            const pendingOrders =
                orders.filter(

                    order =>

                        order.status ===
                        "PENDING_SELLER_ACCEPTANCE"

                ).length;


            const acceptedOrders =
                orders.filter(

                    order =>

                        [
                            "ACCEPTED",
                            "PROCESSING",
                            "SHIPPED",
                            "DELIVERED"

                        ].includes(
                            order.status
                        )

                ).length;


            const cancelledOrders =
                orders.filter(

                    order =>

                        [
                            "CANCELLED",
                            "REJECTED"

                        ].includes(
                            order.status
                        )

                ).length;


            setStats({

                totalOrders,

                pendingOrders,

                acceptedOrders,

                cancelledOrders,

                cartItems

            });


        } catch (error) {

            console.error(
                "CUSTOMER DASHBOARD ERROR:",
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

                "Unable to load dashboard."

            );


        } finally {

            setLoading(false);
        }

    }
const handleMarkAllRead = async () => {

    try {

        await api.put(
            "/notifications/read-all"
        );

        setNotifications([]);

        setNotificationsRead(true);

        setShowNotifications(true);

    } catch (error) {

        console.error(
            "MARK ALL READ ERROR:",
            error.response?.data ||
            error.message ||
            error
        );

    }

};
function createNotifications(
    orders
) {

    if (
        !Array.isArray(orders)
    ) {

        return [];

    }


    const result = [];


    orders.forEach(
        order => {

            const referenceNo =
                order.referenceNo ||
                order.reference_no ||
                `#${order.id}`;


            const status =
                String(
                    order.status || ""
                ).toUpperCase();


            /*
            =================================
            PENDING
            =================================
            */

            if (
                status ===
                "PENDING_SELLER_ACCEPTANCE"
            ) {

                result.push({

                    id:
                        `pending-${order.id}`,

                    type:
                        "pending",

                    title:
                        "Order pending",

                    message:
                        `Order ${referenceNo} is waiting for seller acceptance.`,

                    orderId:
                        order.id,

                    referenceNo,

                    createdAt:
                        order.created_at ||
                        order.createdAt ||
                        null

                });

            }


            /*
            =================================
            ACCEPTED
            =================================
            */

            else if (
                status ===
                    "ACCEPTED" ||
                status ===
                    "PROCESSING"
            ) {

                result.push({

                    id:
                        `accepted-${order.id}`,

                    type:
                        "accepted",

                    title:
                        "Order accepted",

                    message:
                        `Your order ${referenceNo} has been accepted by the seller.`,

                    orderId:
                        order.id,

                    referenceNo,

                    createdAt:
                        order.updated_at ||
                        order.updatedAt ||
                        null

                });

            }


            /*
            =================================
            SHIPPED
            =================================
            */

            else if (
                status ===
                "SHIPPED"
            ) {

                result.push({

                    id:
                        `shipped-${order.id}`,

                    type:
                        "shipped",

                    title:
                        "Order shipped",

                    message:
                        `Your order ${referenceNo} has been shipped.`,

                    orderId:
                        order.id,

                    referenceNo,

                    createdAt:
                        order.updated_at ||
                        order.updatedAt ||
                        null

                });

            }


            /*
            =================================
            DELIVERED
            =================================
            */

            else if (
                status ===
                "DELIVERED"
            ) {

                result.push({

                    id:
                        `delivered-${order.id}`,

                    type:
                        "delivered",

                    title:
                        "Order delivered",

                    message:
                        `Your order ${referenceNo} has been delivered successfully.`,

                    orderId:
                        order.id,

                    referenceNo,

                    createdAt:
                        order.updated_at ||
                        order.updatedAt ||
                        null

                });

            }


            /*
            =================================
            CANCELLED
            =================================
            */

            else if (
                status ===
                    "CANCELLED" ||
                status ===
                    "REJECTED"
            ) {

                result.push({

                    id:
                        `cancelled-${order.id}`,

                    type:
                        "cancelled",

                    title:
                        "Order cancelled",

                    message:
                        `Your order ${referenceNo} has been cancelled or rejected.`,

                    orderId:
                        order.id,

                    referenceNo,

                    createdAt:
                        order.updated_at ||
                        order.updatedAt ||
                        null

                });

            }

        }
    );


    return result;

}
    if (loading) {

        return (

            <div className="customer-dashboard-loading">

                <RefreshCw
                    size={22}
                    className="dashboard-spin"
                />

                <span>
                    Loading your workspace...
                </span>

            </div>

        );

    }


    /*
    ==========================================
    USER NAME
    ==========================================
    */

    const customerName =
        user?.full_name ||
        user?.name ||
        "Customer";

    return (

        <div className="customer-dashboard-page">

            <header className="customer-dashboard-header">


                <div className="customer-dashboard-left">


                    <div className="customer-dashboard-brand">

                        <div className="customer-brand-icon">

                            <ShoppingBag
                                size={17}
                            />

                        </div>


                        <div>

                            <strong>
                                TradeSphere
                            </strong>

                            <span>
                                Customer Workspace
                            </span>

                        </div>

                    </div>

                </div>


                <div className="customer-dashboard-right">

                    <div className="notification-wrapper">

    <button
        type="button"
        className="customer-notification-button"
        onClick={() => {

            setShowNotifications(
                previous =>
                    !previous
            );

        }}
    >

        <Bell
            size={17}
        />

        {notifications.length > 0 && (

    <span className="notification-badge">
        {notifications.length}
    </span>

)}

    </button>


    {showNotifications && (

        <NotificationPopup
            notifications={
                notifications
            }

            onClose={() =>
                setShowNotifications(
                    false
                )
            }

            onViewOrder={referenceNo => {

                setShowNotifications(
                    false
                );

                navigate(
                    `/profile/orders/${referenceNo}`
                );

            }}

            onMarkAllRead={() =>
                handleMarkAllRead()
                
            }

        />

    )}

</div>

                    <LogoutButton />

                </div>

            </header>

            <main className="customer-dashboard-main">

                <section className="customer-dashboard-hero">


                    <div>

                        <p className="customer-eyebrow">
                            CUSTOMER WORKSPACE
                        </p>


                        <h1>

                            Welcome,

                            <br />

                            <span>
                                {customerName}
                            </span>

                        </h1>


                        <p className="customer-dashboard-description">

                            Discover premium export-import
                            products, manage your cart and
                            track every order from one place.

                        </p>


                        <div className="customer-hero-actions">

                            <button
                                className="customer-primary-button"
                                onClick={() =>
                                    navigate(
                                        "/products"
                                    )
                                }
                            >

                                <ShoppingBag
                                    size={17}
                                />

                                Browse Products

                                <ArrowRight
                                    size={15}
                                />

                            </button>


                            <button
                                className="customer-secondary-button"
                                onClick={() =>
                                    navigate(
                                        "/cart"
                                    )
                                }
                            >

                                <ShoppingCart
                                    size={16}
                                />

                                Cart

                                {stats.cartItems >
                                    0 && (

                                    <span className="cart-badge">

                                        {
                                            stats.cartItems
                                        }

                                    </span>

                                )}

                            </button>

                        </div>

                    </div>


                    <div className="customer-hero-visual">

                        <div className="hero-visual-circle">

                            <ShoppingBag
                                size={65}
                                strokeWidth={1}
                            />

                        </div>


                        <div className="hero-floating-card">

                            <CheckCircle
                                size={15}
                            />

                            <div>

                                <strong>
                                    Secure Orders
                                </strong>

                                <span>
                                    Email verified
                                </span>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================
                    ERROR
                ================================= */}

                {error && (

                    <div className="customer-dashboard-error">

                        {error}

                    </div>

                )}


                {/* =================================
                    STATISTICS
                ================================= */}

                <section className="customer-stats-grid">


                    <div
                        className="customer-stat-card"
                        onClick={() =>
                            navigate(
                                "/profile/orders"
                            )
                        }
                    >

                        <div className="stat-icon">

                            <Package
                                size={19}
                            />

                        </div>


                        <div>

                            <span>
                                Total Orders
                            </span>

                            <strong>
                                {
                                    stats.totalOrders
                                }
                            </strong>

                        </div>

                    </div>


                    <div
                        className="customer-stat-card"
                        onClick={() =>
                            navigate(
                                "/profile/orders?status=pending"
                            )
                        }
                    >

                        <div className="stat-icon pending">

                            <Clock3
                                size={19}
                            />

                        </div>


                        <div>

                            <span>
                                Pending
                            </span>

                            <strong>
                                {
                                    stats.pendingOrders
                                }
                            </strong>

                        </div>

                    </div>


                    <div
                        className="customer-stat-card"
                        onClick={() =>
                            navigate(
                                "/profile/orders?status=accepted"
                            )
                        }
                    >

                        <div className="stat-icon accepted">

                            <CheckCircle
                                size={19}
                            />

                        </div>


                        <div>

                            <span>
                                Accepted
                            </span>

                            <strong>
                                {
                                    stats.acceptedOrders
                                }
                            </strong>

                        </div>

                    </div>


                    <div
                        className="customer-stat-card"
                        onClick={() =>
                            navigate(
                                "/profile/orders?status=cancelled"
                            )
                        }
                    >

                        <div className="stat-icon cancelled">

                            <XCircle
                                size={19}
                            />

                        </div>


                        <div>

                            <span>
                                Cancelled
                            </span>

                            <strong>
                                {
                                    stats.cancelledOrders
                                }
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================
                    QUICK ACTIONS
                ================================= */}

                <section className="customer-dashboard-section">


                    <div className="customer-section-heading">

                        <div>

                            <p>
                                QUICK ACCESS
                            </p>

                            <h2>
                                Everything you need
                            </h2>

                        </div>

                    </div>


                    <div className="customer-action-grid">


                        <button
                            className="customer-action-card"
                            onClick={() =>
                                navigate(
                                    "/products"
                                )
                            }
                        >

                            <div className="action-card-icon blue">

                                <ShoppingBag
                                    size={21}
                                />

                            </div>


                            <div>

                                <strong>
                                    Browse Products
                                </strong>

                                <span>
                                    Explore soyabean,
                                    papad and other
                                    export products.
                                </span>

                            </div>


                            <ArrowRight
                                size={16}
                            />

                        </button>


                        <button
                            className="customer-action-card"
                            onClick={() =>
                                navigate(
                                    "/cart"
                                )
                            }
                        >

                            <div className="action-card-icon purple">

                                <ShoppingCart
                                    size={21}
                                />

                            </div>


                            <div>

                                <strong>
                                    Shopping Cart
                                </strong>

                                <span>
                                    Review your selected
                                    products before checkout.
                                </span>

                            </div>


                            <ArrowRight
                                size={16}
                            />

                        </button>


                        <button
                            className="customer-action-card"
                            onClick={() =>
                                navigate(
                                    "/profile/orders"
                                )
                            }
                        >

                            <div className="action-card-icon green">

                                <Package
                                    size={21}
                                />

                            </div>


                            <div>

                                <strong>
                                    My Orders
                                </strong>

                                <span>
                                    Track references,
                                    status and seller
                                    acceptance.
                                </span>

                            </div>


                            <ArrowRight
                                size={16}
                            />

                        </button>


                        <button
                            className="customer-action-card"
                            onClick={() =>
                                navigate(
                                    "/profile"
                                )
                            }
                        >

                            <div className="action-card-icon orange">

                                <UserRound
                                    size={21}
                                />

                            </div>


                            <div>

                                <strong>
                                    My Profile
                                </strong>

                                <span>
                                    Manage your personal
                                    and delivery information.
                                </span>

                            </div>


                            <ArrowRight
                                size={16}
                            />

                        </button>

                    </div>

                </section>


                {/* =================================
                    SECURITY
                ================================= */}

                <section className="customer-security-card">


                    <div className="security-icon">

                        <CheckCircle
                            size={22}
                        />

                    </div>


                    <div>

                        <strong>
                            Secure purchasing
                        </strong>

                        <span>

                            Every order is verified
                            through your registered
                            email before confirmation.

                        </span>

                    </div>


                    <div className="security-status">

                        <span>
                            Account
                        </span>

                        <strong>
                            {user?.role || "CUSTOMER"}
                        </strong>

                    </div>

                </section>


            </main>

        </div>
    );

}
function NotificationIcon({
    type
}) {

    if (
        type === "accepted"
    ) {

        return (

            <div
                className="notification-icon accepted"
            >

                <CheckCircle
                    size={18}
                />

            </div>

        );

    }


    if (
        type === "pending"
    ) {

        return (

            <div
                className="notification-icon pending"
            >

                <Clock3
                    size={18}
                />

            </div>

        );

    }


    if (
        type === "shipped"
    ) {

        return (

            <div
                className="notification-icon shipped"
            >

                <Package
                    size={18}
                />

            </div>

        );

    }


    if (
        type === "delivered"
    ) {

        return (

            <div
                className="notification-icon delivered"
            >

                <CheckCircle
                    size={18}
                />

            </div>

        );

    }


    return (

        <div
            className="notification-icon cancelled"
        >

            <XCircle
                size={18}
            />

        </div>

    );

}
function NotificationPopup({

    notifications,

    onClose,

    onViewOrder,

    onMarkAllRead

}) {
    const navigate = useNavigate();
    return (

        <div
            className="notification-popup"
        >

            {/* HEADER */}

            <div
                className="notification-popup-header"
            >

                <div>

                    <span>
                        NOTIFICATIONS
                    </span>

                    <h3>
                        Your updates
                    </h3>

                </div>


                <button
                    type="button"
                    className="notification-close"
                    onClick={
                        onClose
                    }
                >
                    ×
                </button>

            </div>


            {/* CONTENT */}

            {notifications.length === 0 ? (

                <div
                    className="notification-empty"
                >

                    <div
                        className="notification-empty-icon"
                    >

                        <Bell
                            size={22}
                        />

                    </div>


                    <strong>
                        No notifications
                    </strong>


                    <span>
                        You're all caught up.
                    </span>

                </div>

            ) : (

                <div
                    className="notification-list"
                >

                    {notifications.map(
                        notification => (

                            <button
                                type="button"
                                className="notification-item"
                                key={
                                    notification.id
                                }
                                onClick={() =>
                                    onViewOrder(
                                        notification.referenceNo
                                    )
                                }
                            >

                                <NotificationIcon
                                    type={
                                        notification.type
                                    }
                                />


                                <div
                                    className="notification-item-content"
                                >

                                    <strong>
                                        {
                                            notification.title
                                        }
                                    </strong>

                                    <span>
                                        {
                                            notification.message
                                        }
                                    </span>

                                </div>


                                <ArrowRight
                                    size={15}
                                />

                            </button>

                        )
                    )}

                </div>

            )}


            {/* FOOTER */}

            {notifications.length > 0 && (

                <div
                    className="notification-popup-footer"
                >

                    <button
                        type="button"
                        onClick={
                            onMarkAllRead
                        }
                    >
                        Mark all as read
                    </button>


                    <button
                        type="button"
                        onClick={() => {

                            onClose();

                            navigate(
                                "/profile/orders"
                            );

                        }}
                    >
                        View all orders
                    </button>

                </div>

            )}

        </div>

    );

}

export default CustomerDashboard;