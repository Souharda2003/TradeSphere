import {
    useEffect,
    useState
} from "react";


import {
    Bell,
    CheckCheck,
    ShoppingCart
} from "lucide-react";


import {
    useNavigate
} from "react-router-dom";


import api
    from "../../services/api";


function NotificationBell({onOpenOrder}) {

    const navigate =
        useNavigate();


    const [
        notifications,
        setNotifications
    ] = useState([]);


    const [
        unreadCount,
        setUnreadCount
    ] = useState(0);


    const [
        open,
        setOpen
    ] = useState(false);


    const [
        loading,
        setLoading
    ] = useState(false);



    async function loadNotifications() {

        try {

            const response =
                await api.get(
                    "/notifications"
                );


            setNotifications(

                response.data
                    ?.notifications || []

            );


        } catch (error) {

            console.error(
                "LOAD NOTIFICATIONS ERROR:",
                error
            );

        }

    }

    async function loadUnreadCount() {

        try {

            const response =
                await api.get(
                    "/notifications/unread-count"
                );


            setUnreadCount(

                Number(
                    response.data?.count || 0
                )

            );


        } catch (error) {

            console.error(
                "LOAD UNREAD COUNT ERROR:",
                error
            );

        }

    }


    async function loadNotificationData() {

        try {

            setLoading(true);


            await Promise.all([

                loadNotifications(),

                loadUnreadCount()

            ]);


        } finally {

            setLoading(false);

        }

    }


    useEffect(() => {

        loadNotificationData();


        const interval =
            setInterval(

                () => {

                    loadNotificationData();

                },

                15000

            );


        return () => {

            clearInterval(interval);

        };

    }, []);


async function markAsRead(
    notification
) {

    try {
        if (
            !notification.isRead
        ) {
            await api.patch(
                `/notifications/${notification.id}/read`
            );
        }
        const orderId =
            notification.orderId ||
            notification.order_id;
        if (
            orderId
        ) {
            if (
                typeof onOpenOrder ===
                "function"
            ) {
                onOpenOrder(
                    orderId
                );
            } else {
                navigate(
                    `/seller/orders/${orderId}`
                );
            }
        }
        setOpen(false);
        await loadNotificationData();
    } catch (error) {
        console.error(
            "MARK NOTIFICATION READ ERROR:",
            error
        );
    }
}
    async function markAllRead() {
        try {
            await api.patch(
                "/notifications/read-all"
            );
            await loadNotificationData();
        } catch (error) {
            console.error(
                "MARK ALL READ ERROR:",
                error
            );
        }
    }
    function formatNotificationTime(
        date
    ) {
        if (!date) {
            return "";
        }
        const notificationDate =
            new Date(date);


        if (
            Number.isNaN(
                notificationDate.getTime()
            )
        ) {

            return "";

        }


        return notificationDate.toLocaleString(

            "en-IN",

            {

                day:
                    "2-digit",

                month:
                    "short",

                hour:
                    "2-digit",

                minute:
                    "2-digit"

            }

        );

    }

    return (

        <div
            className="notification-wrapper"
        >

            <button

                type="button"

                className="dashboard-icon-button"

                title="Notifications"

                onClick={() =>
                    setOpen(
                        previous =>
                            !previous
                    )
                }

            >

                <Bell
                    size={19}
                />

                {unreadCount > 0 && (

                    <span
                        className="notification-count"
                    >

                        {unreadCount > 99
                            ? "99+"
                            : unreadCount}

                    </span>

                )}

            </button>


            {open && (

                <div
                    className="notification-dropdown"
                >

                    
                    <div
                        className="notification-header"
                    >

                        <div>

                            <strong>
                                Notifications
                            </strong>

                            <span>
                                {unreadCount} unread
                            </span>

                        </div>


                        {unreadCount > 0 && (

                            <button

                                type="button"

                                className="mark-all-read"

                                onClick={
                                    markAllRead
                                }

                            >

                                <CheckCheck
                                    size={15}
                                />

                                Mark all read

                            </button>

                        )}

                    </div>


                   
                    <div
                        className="notification-list"
                    >

                        {loading &&
                        notifications.length === 0 ? (

                            <div
                                className="notification-empty"
                            >

                                <Bell
                                    size={25}
                                />

                                <span>
                                    Loading notifications...
                                </span>

                            </div>

                        ) : notifications.length === 0 ? (

                            <div
                                className="notification-empty"
                            >

                                <Bell
                                    size={25}
                                />

                                <strong>
                                    No notifications
                                </strong>

                                <span>
                                    New customer orders
                                    will appear here.
                                </span>

                            </div>

                        ) : (

                            notifications.map(
                                notification => (

                                    <button

                                        key={
                                            notification.id
                                        }

                                        type="button"

                                        className={

                                            `notification-item ${
                                                notification.isRead
                                                    ? ""
                                                    : "unread"
                                            }`

                                        }

                                        onClick={() =>
                                            markAsRead(
                                                notification
                                            )
                                        }

                                    >

                                        <div
                                            className="notification-item-icon"
                                        >

                                            <ShoppingCart
                                                size={18}
                                            />

                                        </div>


                              
                                        <div
                                            className="notification-item-content"
                                        >

                                            <strong>

                                                {
                                                    notification.title
                                                }

                                            </strong>


                                            <p>

                                                {
                                                    notification.message
                                                }

                                            </p>


                                            {notification.referenceNo && (

                                                <small>

                                                    Order:{" "}

                                                    {
                                                        notification.referenceNo
                                                    }

                                                </small>

                                            )}


                                            <time>

                                                {
                                                    formatNotificationTime(
                                                        notification.createdAt
                                                    )
                                                }

                                            </time>

                                        </div>

                                    </button>

                                )

                            )

                        )}

                    </div>
                    <button

                        type="button"

                        className="view-all-notifications"

                        onClick={() => {

                            setOpen(false);

                            navigate(
                                "/seller/orders"
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


export default NotificationBell;