import {
    useCallback,
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


    /*
    ==================================================
    USER
    ==================================================
    */

    const [user, setUser] =
        useState(null);


    /*
    ==================================================
    DASHBOARD STATS
    ==================================================
    */

    const [stats, setStats] =
        useState({
            totalOrders: 0,
            pendingOrders: 0,
            acceptedOrders: 0,
            cancelledOrders: 0,
            cartItems: 0
        });


    /*
    ==================================================
    LOADING
    ==================================================
    */

    const [loading, setLoading] =
        useState(true);


    /*
    ==================================================
    ERROR
    ==================================================
    */

    const [error, setError] =
        useState("");


    /*
    ==================================================
    NOTIFICATIONS
    ==================================================
    */

    const [
        showNotifications,
        setShowNotifications
    ] = useState(false);


    const [
        notifications,
        setNotifications
    ] = useState([]);


    /*
    ==================================================
    RETRY HELPER
    ==================================================
    */

    async function requestWithRetry(
        requestFunction,
        retries = 2,
        delay = 700
    ) {

        let lastError = null;


        for (
            let attempt = 0;
            attempt <= retries;
            attempt++
        ) {

            try {

                return await requestFunction();

            } catch (requestError) {

                lastError =
                    requestError;


                /*
                ------------------------------------------
                DO NOT RETRY 401
                ------------------------------------------
                */

                if (
                    requestError.response?.status ===
                    401
                ) {

                    throw requestError;

                }


                /*
                ------------------------------------------
                WAIT BEFORE RETRY
                ------------------------------------------
                */

                if (
                    attempt < retries
                ) {

                    await new Promise(
                        resolve =>
                            setTimeout(
                                resolve,
                                delay
                            )
                    );

                }

            }

        }


        throw lastError;

    }


    /*
    ==================================================
    LOAD DASHBOARD
    ==================================================
    */

    const loadDashboard =
        useCallback(
            async () => {

                try {

                    setLoading(true);

                    setError("");


                    /*
                    ==========================================
                    FIRST GET CURRENT USER
                    ==========================================
                    */

                    const userResponse =
                        await requestWithRetry(
                            () =>
                                api.get(
                                    "/user/me"
                                )
                        );


                    const currentUser =
                        userResponse.data?.user;


                    setUser(
                        currentUser || null
                    );


                    /*
                    ==========================================
                    LOAD ALL CUSTOMER DATA IN PARALLEL
                    ==========================================
                    */

                    const [
                        orderResult,
                        cartResult,
                        notificationResult
                    ] = await Promise.allSettled([

                        requestWithRetry(
                            () =>
                                api.get(
                                    "/orders/my"
                                )
                        ),

                        requestWithRetry(
                            () =>
                                api.get(
                                    "/cart"
                                )
                        ),

                        requestWithRetry(
                            () =>
                                api.get(
                                    "/notifications"
                                )
                        )

                    ]);


                    /*
                    ==========================================
                    CHECK 401 FROM ANY API
                    ==========================================
                    */

                    const results = [
                        orderResult,
                        cartResult,
                        notificationResult
                    ];


                    const unauthorized =
                        results.some(
                            result =>
                                result.status ===
                                    "rejected" &&
                                result.reason
                                    ?.response
                                    ?.status === 401
                        );


                    if (
                        unauthorized
                    ) {

                        navigate(
                            "/login",
                            {
                                replace: true
                            }
                        );

                        return;

                    }


                    /*
                    ==========================================
                    ORDERS
                    ==========================================
                    */

                    let orders = [];


                    if (
                        orderResult.status ===
                        "fulfilled"
                    ) {

                        orders =
                            Array.isArray(
                                orderResult
                                    .value
                                    ?.data
                                    ?.orders
                            )
                                ? orderResult
                                    .value
                                    .data
                                    .orders
                                : [];

                    } else {

                        console.error(
                            "GET MY ORDERS ERROR:",
                            orderResult.reason
                                ?.response
                                ?.data ||
                            orderResult.reason
                                ?.message ||
                            orderResult.reason
                        );

                    }


                    /*
                    ==========================================
                    CART
                    ==========================================
                    */

                    let cartItems = 0;


                    if (
                        cartResult.status ===
                        "fulfilled"
                    ) {

                        const items =
                            cartResult
                                .value
                                ?.data
                                ?.items;


                        cartItems =
                            Array.isArray(
                                items
                            )
                                ? items.length
                                : 0;

                    } else {

                        console.warn(
                            "GET CART ERROR:",
                            cartResult.reason
                                ?.response
                                ?.data ||
                            cartResult.reason
                                ?.message ||
                            cartResult.reason
                        );

                    }


                    /*
                    ==========================================
                    NOTIFICATIONS
                    ==========================================
                    */

                    if (
                        notificationResult.status ===
                        "fulfilled"
                    ) {

                        const serverNotifications =
                            notificationResult
                                .value
                                ?.data
                                ?.notifications;


                        setNotifications(
                            Array.isArray(
                                serverNotifications
                            )
                                ? serverNotifications
                                : []
                        );

                    } else {

                        console.warn(
                            "GET NOTIFICATIONS ERROR:",
                            notificationResult.reason
                                ?.response
                                ?.data ||
                            notificationResult.reason
                                ?.message ||
                            notificationResult.reason
                        );


                        /*
                        --------------------------------------
                        DO NOT BREAK DASHBOARD
                        --------------------------------------
                        */

                        setNotifications([]);

                    }


                    /*
                    ==========================================
                    NORMALIZE ORDER STATUS
                    ==========================================
                    */

                    const normalizedOrders =
                        orders.map(
                            order => ({

                                ...order,

                                normalizedStatus:
                                    String(
                                        order.status ||
                                        ""
                                    )
                                        .trim()
                                        .toUpperCase()

                            })
                        );


                    /*
                    ==========================================
                    TOTAL ORDERS
                    ==========================================
                    */

                    const totalOrders =
                        normalizedOrders.length;


                    /*
                    ==========================================
                    PENDING ORDERS
                    ==========================================
                    */

                    const pendingOrders =
                        normalizedOrders.filter(
                            order =>
                                order.normalizedStatus ===
                                "PENDING_SELLER_ACCEPTANCE"
                        ).length;


                    /*
                    ==========================================
                    ACCEPTED ORDERS

                    ACCEPTED
                    PROCESSING
                    SHIPPED
                    DELIVERED
                    ==========================================
                    */

                    const acceptedOrders =
                        normalizedOrders.filter(
                            order =>
                                [
                                    "ACCEPTED",
                                    "PROCESSING",
                                    "SHIPPED",
                                    "DELIVERED"
                                ].includes(
                                    order.normalizedStatus
                                )
                        ).length;


                    /*
                    ==========================================
                    CANCELLED ORDERS

                    CANCELLED
                    REJECTED
                    ==========================================
                    */

                    const cancelledOrders =
                        normalizedOrders.filter(
                            order =>
                                [
                                    "CANCELLED",
                                    "REJECTED"
                                ].includes(
                                    order.normalizedStatus
                                )
                        ).length;


                    /*
                    ==========================================
                    UPDATE STATS
                    ==========================================
                    */

                    setStats({

                        totalOrders,

                        pendingOrders,

                        acceptedOrders,

                        cancelledOrders,

                        cartItems

                    });

                    if (
                        orderResult.status ===
                        "rejected"
                    ) {

                        setError(
                            "Unable to load your orders. Please try again."
                        );

                    }


                } catch (requestError) {

                    console.error(
                        "CUSTOMER DASHBOARD ERROR:",
                        requestError
                    );


                    /*
                    ==========================================
                    401 = AUTHENTICATION PROBLEM
                    ==========================================
                    */

                    if (
                        requestError.response
                            ?.status === 401
                    ) {

                        navigate(
                            "/login",
                            {
                                replace: true
                            }
                        );

                        return;

                    }


                    /*
                    ==========================================
                    OTHER ERROR
                    ==========================================
                    */

                    setError(

                        requestError
                            .response
                            ?.data
                            ?.message ||

                        "Unable to load dashboard. Please try again."

                    );

                } finally {

                    setLoading(false);

                }

            },

            [navigate]
        );


    /*
    ==================================================
    INITIAL LOAD
    ==================================================
    */

    useEffect(
        () => {

            loadDashboard();

        },
        [loadDashboard]
    );


    /*
    ==================================================
    REFRESH WHEN USER RETURNS TO THIS TAB
    ==================================================

    This helps when order status/cart changes in another
    tab or after coming back from another page.
    ==================================================
    */

    useEffect(
        () => {

            function handleVisibilityChange() {

                if (
                    document.visibilityState ===
                    "visible"
                ) {

                    loadDashboard();

                }

            }


            document.addEventListener(
                "visibilitychange",
                handleVisibilityChange
            );


            return () => {

                document.removeEventListener(
                    "visibilitychange",
                    handleVisibilityChange
                );

            };

        },
        [loadDashboard]
    );


    /*
    ==================================================
    MARK ALL NOTIFICATIONS READ
    ==================================================
    */

    const handleMarkAllRead =
        async () => {

            try {

                await api.patch(
                    "/notifications/read-all"
                );


                setNotifications(
                    previousNotifications =>

                        previousNotifications.map(
                            notification => ({

                                ...notification,

                                isRead: 1

                            })
                        )

                );


                setShowNotifications(
                    true
                );


            } catch (markReadError) {

                console.error(
                    "MARK ALL READ ERROR:",
                    markReadError
                        .response
                        ?.data ||
                    markReadError
                        .message ||
                    markReadError
                );

            }

        };


    /*
    ==================================================
    CUSTOMER NAME
    ==================================================
    */

    const customerName =
        user?.full_name ||
        user?.name ||
        "Customer";


    /*
    ==================================================
    UNREAD NOTIFICATION COUNT
    ==================================================
    */

    const unreadNotificationCount =
        notifications.filter(
            notification =>
                Number(
                    notification.isRead
                ) === 0
        ).length;


    /*
    ==================================================
    LOADING SCREEN
    ==================================================
    */

    if (loading) {

        return (

            <div
                className="customer-dashboard-loading"
            >

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


    return (

        <div
            className="customer-dashboard-page"
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <header
                className="customer-dashboard-header"
            >

                <div
                    className="customer-dashboard-left"
                >

                    <div
                        className="customer-dashboard-brand"
                    >

                        <div
                            className="customer-brand-icon"
                        >

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


                <div
                    className="customer-dashboard-right"
                >

                    {/* =================================================
                        NOTIFICATION
                    ================================================= */}

                    <div
                        className="notification-wrapper"
                    >

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


                            {unreadNotificationCount > 0 && (

                                <span
                                    className="notification-badge"
                                >
                                    {
                                        unreadNotificationCount
                                    }
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

                                onViewOrder={
                                    referenceNo => {

                                        setShowNotifications(
                                            false
                                        );


                                        navigate(
                                            `/profile/orders/${referenceNo}`
                                        );

                                    }
                                }

                                onMarkAllRead={
                                    handleMarkAllRead
                                }

                            />

                        )}

                    </div>


                    {/* =================================================
                        LOGOUT
                    ================================================= */}

                    <LogoutButton />

                </div>

            </header>


            <main
                className="customer-dashboard-main"
            >

                {/* =================================================
                    HERO
                ================================================= */}

                <section
                    className="customer-dashboard-hero"
                >

                    <div>

                        <p
                            className="customer-eyebrow"
                        >
                            CUSTOMER WORKSPACE
                        </p>


                        <h1>

                            Welcome,

                            <br />

                            <span>
                                {customerName}
                            </span>

                        </h1>


                        <p
                            className="customer-dashboard-description"
                        >
                            Discover premium export-import
                            products, manage your cart and
                            track every order from one place.
                        </p>


                        <div
                            className="customer-hero-actions"
                        >

                            <button
                                type="button"
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
                                type="button"
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


                                {stats.cartItems > 0 && (

                                    <span
                                        className="cart-badge"
                                    >
                                        {
                                            stats.cartItems
                                        }
                                    </span>

                                )}

                            </button>

                        </div>

                    </div>


                    <div
                        className="customer-hero-visual"
                    >

                        <div
                            className="hero-visual-circle"
                        >

                            <ShoppingBag
                                size={65}
                                strokeWidth={1}
                            />

                        </div>


                        <div
                            className="hero-floating-card"
                        >

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


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div
                        className="customer-dashboard-error"
                    >

                        <span>
                            {error}
                        </span>


                        <button
                            type="button"
                            onClick={
                                loadDashboard
                            }
                        >
                            <RefreshCw
                                size={15}
                            />

                            Retry

                        </button>

                    </div>

                )}


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <section
                    className="customer-stats-grid"
                >

                    {/* TOTAL ORDERS */}

                    <div
                        className="customer-stat-card"
                        onClick={() =>
                            navigate(
                                "/profile/orders"
                            )
                        }
                    >

                        <div
                            className="stat-icon"
                        >

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


                    {/* PENDING */}

                    <div
                        className="customer-stat-card"
                        onClick={() =>
                            navigate(
                                "/profile/orders?status=pending"
                            )
                        }
                    >

                        <div
                            className="stat-icon pending"
                        >

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


                    {/* ACCEPTED */}

                    <div
                        className="customer-stat-card"
                        onClick={() =>
                            navigate(
                                "/profile/orders?status=accepted"
                            )
                        }
                    >

                        <div
                            className="stat-icon accepted"
                        >

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


                    {/* CANCELLED */}

                    <div
                        className="customer-stat-card"
                        onClick={() =>
                            navigate(
                                "/profile/orders?status=cancelled"
                            )
                        }
                    >

                        <div
                            className="stat-icon cancelled"
                        >

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


                {/* =================================================
                    QUICK ACCESS
                ================================================= */}

                <section
                    className="customer-dashboard-section"
                >

                    <div
                        className="customer-section-heading"
                    >

                        <div>

                            <p>
                                QUICK ACCESS
                            </p>

                            <h2>
                                Everything you need
                            </h2>

                        </div>

                    </div>


                    <div
                        className="customer-action-grid"
                    >

                        {/* BROWSE PRODUCTS */}

                        <button
                            type="button"
                            className="customer-action-card"
                            onClick={() =>
                                navigate(
                                    "/products"
                                )
                            }
                        >

                            <div
                                className="action-card-icon blue"
                            >

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


                        {/* CART */}

                        <button
                            type="button"
                            className="customer-action-card"
                            onClick={() =>
                                navigate(
                                    "/cart"
                                )
                            }
                        >

                            <div
                                className="action-card-icon purple"
                            >

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


                        {/* ORDERS */}

                        <button
                            type="button"
                            className="customer-action-card"
                            onClick={() =>
                                navigate(
                                    "/profile/orders"
                                )
                            }
                        >

                            <div
                                className="action-card-icon green"
                            >

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


                        {/* PROFILE */}

                        <button
                            type="button"
                            className="customer-action-card"
                            onClick={() =>
                                navigate(
                                    "/profile"
                                )
                            }
                        >

                            <div
                                className="action-card-icon orange"
                            >

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


                {/* =================================================
                    SECURITY
                ================================================= */}

                <section
                    className="customer-security-card"
                >

                    <div
                        className="security-icon"
                    >

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


                    <div
                        className="security-status"
                    >

                        <span>
                            Account
                        </span>

                        <strong>
                            CUSTOMER
                        </strong>

                    </div>

                </section>


            </main>

        </div>

    );

}


/*
==================================================
NOTIFICATION ICON
==================================================
*/

function NotificationIcon({
    type
}) {

    const normalizedType =
        String(
            type || ""
        )
            .trim()
            .toLowerCase();


    /*
    ACCEPTED
    */

    if (
        [
            "accepted",
            "order_accepted",
            "order accepted",
            "accept"
        ].includes(
            normalizedType
        )
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


    /*
    PENDING
    */

    if (
        [
            "pending",
            "order_pending",
            "pending_seller_acceptance"
        ].includes(
            normalizedType
        )
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


    /*
    SHIPPED
    */

    if (
        [
            "shipped",
            "order_shipped"
        ].includes(
            normalizedType
        )
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


    /*
    DELIVERED
    */

    if (
        [
            "delivered",
            "order_delivered"
        ].includes(
            normalizedType
        )
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


    /*
    CANCELLED / REJECTED
    */

    if (
        [
            "cancelled",
            "canceled",
            "order_cancelled",
            "rejected",
            "order_rejected"
        ].includes(
            normalizedType
        )
    ) {

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


    return (

        <div
            className="notification-icon pending"
        >

            <Bell
                size={18}
            />

        </div>

    );

}


/*
==================================================
NOTIFICATION POPUP
==================================================
*/

function NotificationPopup({

    notifications,

    onClose,

    onViewOrder,

    onMarkAllRead

}) {

    const navigate =
        useNavigate();


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