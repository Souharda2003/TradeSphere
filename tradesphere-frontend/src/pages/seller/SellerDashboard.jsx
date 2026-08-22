import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    Package,
    Boxes,
    ShoppingCart,
    Bell,
    Plus,
    BarChart3,
    MessageSquare
} from "lucide-react";

import api from "../../services/api";
import NotificationBell
    from "../../components/seller/NotificationBell";
import LogoutButton
    from "../../components/LogoutButton";
import SellerOrderModal
    from "../../components/seller/SellerOrderModal";
import "../../styles/dashboard.css";


function SellerDashboard() {

    const navigate =
        useNavigate();

    const [user, setUser] =
        useState(null);

    const [products, setProducts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);
const [
    selectedSellerOrderId,
    setSelectedSellerOrderId
] = useState(null);
    const [error, setError] =
        useState("");
    const [recentOrders, setRecentOrders] =
    useState([]);

const [newOrdersCount, setNewOrdersCount] =
    useState(0);

const [totalSales, setTotalSales] =
    useState(0);
    useEffect(() => {

        loadDashboard();
        loadSellerOrders();

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
            const productResponse =
                await api.get(
                    "/products/seller"
                );


            setProducts(
                productResponse.data.products || []
            );


        } catch (error) {

            console.error(
                "SELLER DASHBOARD ERROR:",
                error
            );


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



    const totalProducts =
        products.length;

    const stockByUnit =
        products.reduce(
            (
                totals,
                product
            ) => {

                const unit =
                    product.unit ||
                    "UNIT";


                const quantity =
                    Number(
                        product.quantity || 0
                    );


                if (
                    !totals[unit]
                ) {

                    totals[unit] = 0;

                }


                totals[unit] += quantity;


                return totals;

            },
            {}
        );

    const availableStockByUnit =
        products.reduce(
            (
                totals,
                product
            ) => {

                const unit =
                    product.unit ||
                    "UNIT";


                const quantity =
                    Number(
                        product.available_quantity ||
                        0
                    );


                if (
                    !totals[unit]
                ) {

                    totals[unit] = 0;

                }


                totals[unit] += quantity;


                return totals;

            },
            {}
        );

    const reservedStockByUnit =
        products.reduce(
            (
                totals,
                product
            ) => {

                const unit =
                    product.unit ||
                    "UNIT";


                const quantity =
                    Number(
                        product.reserved_quantity ||
                        0
                    );


                if (
                    !totals[unit]
                ) {

                    totals[unit] = 0;

                }


                totals[unit] += quantity;


                return totals;

            },
            {}
        );

    function formatStock(
        stockObject
    ) {

        const entries =
            Object.entries(
                stockObject
            );


        if (
            entries.length === 0
        ) {

            return "0";

        }


        return entries
            .map(
                ([unit, value]) => {

                    return `${Number(
                        value
                    ).toLocaleString(
                        "en-IN"
                    )} ${unit}`;
                }
            )
            .join(" • ");
    }
async function loadSellerOrders() {

    try {

        /*
        ==========================================
        GET RECENT ORDERS
        ==========================================
        */

        const recentResponse =
            await api.get(
                "/orders/seller/recent"
            );


        const recentOrders =
            recentResponse.data?.orders || [];


        /*
        ==========================================
        SET RECENT ORDERS
        ==========================================
        */

        setRecentOrders(
            recentOrders
        );


        /*
        ==========================================
        NEW ORDERS COUNT
        ==========================================
        */

        const pendingOrders =
            recentOrders.filter(

                order =>
                    String(
                        order.status || ""
                    ).toUpperCase() ===
                    "PENDING_SELLER_ACCEPTANCE"

            );


        setNewOrdersCount(
            pendingOrders.length
        );


        /*
        ==========================================
        GET ALL SELLER ORDERS
        ==========================================

        IMPORTANT:

        Recent endpoint only returns recent orders.

        Sales must be calculated from ALL orders.
        ==========================================
        */

        const allResponse =
            await api.get(
                "/orders/seller/all"
            );


        const allOrders =
            allResponse.data?.orders || [];


        /*
        ==========================================
        CALCULATE TOTAL SALES
        ==========================================

        ONLY DELIVERED ORDERS COUNT AS SALES.

        DELIVERED  -> YES
        SHIPPED    -> NO
        PROCESSING -> NO
        ACCEPTED   -> NO
        CANCELLED  -> NO
        REJECTED   -> NO
        ==========================================
        */

        const deliveredOrders =
            allOrders.filter(

                order =>
                    String(
                        order.status || ""
                    ).toUpperCase() ===
                    "DELIVERED"

            );


        const sales =
            deliveredOrders.reduce(

                (
                    total,
                    order
                ) => {

                    return (
                        total +
                        Number(
                            order.total_amount || 0
                        )
                    );

                },

                0

            );


        /*
        ==========================================
        UPDATE TOTAL SALES
        ==========================================
        */

        setTotalSales(
            sales
        );


        /*
        ==========================================
        DEBUG LOG
        ==========================================
        */

        console.log(
            "ALL SELLER ORDERS:",
            allOrders
        );

        console.log(
            "DELIVERED ORDERS:",
            deliveredOrders
        );

        console.log(
            "TOTAL SALES:",
            sales
        );


    } catch (error) {

        console.error(
            "SELLER ORDERS ERROR:",
            error
        );


        setTotalSales(
            0
        );

    }

}
async function acceptOrder(orderId) {

    try {

        await api.patch(
            `/orders/seller/${orderId}/accept`
        );


        await loadSellerOrders();


    } catch (error) {

        console.error(
            "ACCEPT ORDER ERROR:",
            error
        );


        alert(
            error.response
                ?.data
                ?.message ||
            "Unable to accept order."
        );

    }

}async function rejectOrder(orderId) {

    const confirmed =
        window.confirm(
            "Are you sure you want to reject this order?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await api.patch(
            `/orders/seller/${orderId}/reject`
        );


        await loadSellerOrders();


    } catch (error) {

        console.error(
            "REJECT ORDER ERROR:",
            error
        );


        alert(
            error.response
                ?.data
                ?.message ||
            "Unable to reject order."
        );

    }

}
    return (

        <div className="seller-dashboard">

            <header className="seller-header">


                <div className="seller-header-left">
                    <div className="seller-brand">

                        <div className="seller-brand-logo">
                            TS
                        </div>
                        <div>
                            <strong>
                                TradeSphere
                            </strong>
                            <span>
                                Seller Center
                            </span>
                        </div>
                    </div>
                </div>

                <div className="seller-header-right">
                   <NotificationBell
    onOpenOrder={orderId => {

        setSelectedSellerOrderId(
            orderId
        );

    }}
/>


                    {/* PROFILE */}

                    <button
                        className="seller-profile-button"
                    >

                        <div className="seller-avatar">

                            {user?.full_name
                                ?.charAt(0)
                                ?.toUpperCase()}

                        </div>


                        <div className="seller-profile-info">

                            <strong>
                                {user?.full_name}
                            </strong>

                            <span>
                                Seller
                            </span>

                        </div>

                    </button>


                    {/* LOGOUT */}

                    <LogoutButton />

                </div>

            </header>


            <main className="seller-main">


                {error && (

                    <div className="dashboard-error">

                        {error}

                        <button
                            onClick={
                                loadDashboard
                            }
                        >
                            Try Again
                        </button>

                    </div>

                )}

                <section className="seller-welcome">


                    <div>

                        <p className="seller-eyebrow">
                            SELLER WORKSPACE
                        </p>


                        <h1>

                            Welcome back,{" "}

                            {user?.full_name}

                        </h1>


                        <p>

                            Manage your products,
                            inventory and customer
                            orders from one place.

                        </p>

                    </div>


                    <button
                        className="premium-button"
                        type = "button"
                        onClick={() =>
                            navigate(
                                "/seller/products/add"
                            )
                        }
                    >

                        <Plus size={18} />

                        Add New Product

                    </button>

                </section>

                <section className="seller-stats">

                    <div
                        className="seller-stat-card"

                    >

                        <div className="seller-stat-icon">

                            <Package
                                size={21}
                            />

                        </div>


                        <div>

                            <span>
                                Total Products
                            </span>


                            <strong>
                                {totalProducts}
                            </strong>

                        </div>

                    </div>
                    <div
                        className="seller-stat-card"
    
                    >

                        <div className="seller-stat-icon">

                            <Boxes
                                size={21}
                            />

                        </div>


                        <div>

                            <span>
                                Total Stock
                            </span>


                            <strong className="stock-stat-value">

                                {formatStock(
                                    stockByUnit
                                )}

                            </strong>

                        </div>

                    </div>
                    <div
                        className="seller-stat-card"

                    >

                        <div className="seller-stat-icon">

                            <ShoppingCart
                                size={21}
                            />

                        </div>


                        <div>

                            <span>
                                New Orders
                            </span>


                            <strong>
                                {newOrdersCount}
                            </strong>

                        </div>

                    </div>

                    <div
                        className="seller-stat-card"
                    >

                        <div className="seller-stat-icon">

                            <BarChart3
                                size={21}
                            />

                        </div>


                        <div>

                            <span>
                                Total Sales
                            </span>


                            <strong>
    ₹{" "}
    {Number(
        totalSales || 0
    ).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )}
</strong>

                        </div>

                    </div>

                </section>
                {products.length > 0 && (

                    <section className="seller-section">


                        <div className="seller-section-header">

                            <div>

                                <p>
                                    INVENTORY
                                </p>

                                <h2>
                                    Stock Overview
                                </h2>

                            </div>


                            <button
                                className="secondary-button"
                                onClick={() =>
                                    navigate(
                                        "/seller/products"
                                    )
                                }
                            >

                                View Products

                            </button>

                        </div>


                        <div className="inventory-summary-grid">


                            <div className="inventory-summary-card">

                                <span>
                                    Total Inventory
                                </span>

                                <strong>
                                    {formatStock(
                                        stockByUnit
                                    )}
                                </strong>

                            </div>


                            <div className="inventory-summary-card">

                                <span>
                                    Available
                                </span>

                                <strong>
                                    {formatStock(
                                        availableStockByUnit
                                    )}
                                </strong>

                            </div>


                            <div className="inventory-summary-card">

                                <span>
                                    Reserved
                                </span>

                                <strong>
                                    {formatStock(
                                        reservedStockByUnit
                                    )}
                                </strong>

                            </div>

                        </div>

                    </section>

                )}
                <section className="seller-section">


                    <div className="seller-section-header">

                        <div>

                            <p>
                                QUICK ACTIONS
                            </p>

                            <h2>
                                Manage your business
                            </h2>

                        </div>

                    </div>


                    <div className="seller-action-grid">


                        <button
                            className="seller-action-card"
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/seller/products/add"
                                )
                            }
                        >

                            <div className="seller-action-icon">

                                <Plus size={22} />

                            </div>


                            <div>

                                <strong>
                                    Add Product
                                </strong>

                                <span>
                                    Add a new product
                                    to your catalogue.
                                </span>

                            </div>

                        </button>


                        {/* MANAGE STOCK */}

                        <button
                            className="seller-action-card"
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/seller/products"
                                )
                            }
                        >

                            <div className="seller-action-icon">

                                <Boxes size={22} />

                            </div>


                            <div>

                                <strong>
                                    Manage Stock
                                </strong>

                                <span>
                                    Add or remove stock
                                    for each product.
                                </span>

                            </div>

                        </button>


                        {/* ORDERS */}

                        <button
                            className="seller-action-card"
                            onClick={() =>
                                navigate(
                                    "/seller/orders"
                                )
                            }
                        >

                            <div className="seller-action-icon">

                                <ShoppingCart
                                    size={22}
                                />

                            </div>


                            <div>

                                <strong>
                                    Orders
                                </strong>

                                <span>
                                    View and accept
                                    customer orders.
                                </span>

                            </div>

                        </button>

                    </div>

                </section>

                <section className="seller-section">


                    <div className="seller-section-header">

                        <div>

                            <p>
                                CATALOGUE
                            </p>

                            <h2>
                                Recent Products
                            </h2>

                        </div>


                        <button
                            className="secondary-button"
                            onClick={() =>
                                navigate(
                                    "/seller/products"
                                )
                            }
                        >
                            View All
                        </button>

                    </div>


                    {products.length === 0 ? (

                        <div className="seller-empty-state">

                            <Package
                                size={30}
                            />

                            <strong>
                                No products yet
                            </strong>

                            <span>
                                Add your first product
                                to start selling.
                            </span>


                            <button
                                className="premium-button"
                                onClick={() =>
                                    navigate(
                                        "/seller/products/add"
                                    )
                                }
                            >

                                <Plus size={16} />

                                Add Product

                            </button>

                        </div>

                    ) : (

                        <div className="recent-products-grid">

                            {products
                                .slice(0, 4)
                                .map(
                                    product => (

                                        <div
    className="recent-product-card"
    key={product.id}
    
>

                                            <div className="recent-product-image">

                                                {product.primary_image ? (

                                                    <img
                                                        src={
                                                            product.primary_image.startsWith(
                                                                "http"
                                                            )
                                                                ? product.primary_image
                                                                : `http://localhost:5000${product.primary_image}`
                                                        }

                                                        alt={
                                                            product.product_name
                                                        }
                                                    />

                                                ) : (

                                                    <Package
                                                        size={25}
                                                    />

                                                )}

                                            </div>


                                            <div className="recent-product-info">

                                                <strong>
                                                    {
                                                        product.product_name
                                                    }
                                                </strong>


                                                <span>
                                                    SKU:{" "}
                                                    {
                                                        product.sku
                                                    }
                                                </span>


                                                <div>

                                                    <b>
                                                        {Number(
                                                            product.available_quantity ||
                                                            0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </b>

                                                    {" "}

                                                    {
                                                        product.unit
                                                    }

                                                    <small>
                                                        {" "}
                                                        available
                                                    </small>

                                                </div>

                                            </div>

                                        </div>

                                    )
                                )}

                        </div>

                    )}

                </section>


                {/* =================================
                    RECENT ORDERS
                ================================= */}

                <section className="seller-section">


                    <div className="seller-section-header">

                        <div>

                            <p>
                                ORDERS
                            </p>

                            <h2>
                                Recent Orders
                            </h2>

                        </div>


                        <button
                            className="secondary-button"
                            onClick={() =>
                                navigate(
                                    "/seller/orders"
                                )
                            }
                        >

                            View All

                        </button>

                    </div>


                   {recentOrders.length === 0 ? (

    <div className="seller-empty-state">

        <ShoppingCart size={30} />

        <strong>
            No orders yet
        </strong>

        <span>
            Customer orders will appear
            here once they purchase
            your products.
        </span>

    </div>

) : (

    <div className="seller-orders-list">

        {recentOrders.map(order => (

            <div
                key={order.id}
                className="seller-order-card"
            >

                <div className="seller-order-main">

                    <div className="seller-order-icon">

                        <ShoppingCart
                            size={20}
                        />

                    </div>


                    <div>

                        <strong>
                            {order.order_reference}
                        </strong>

                        <span>
                            Customer:{" "}
                            {order.customer_name}
                        </span>

                        <small>
                            {new Date(
                                order.created_at
                            ).toLocaleString(
                                "en-IN"
                            )}
                        </small>

                    </div>

                </div>


                <div className="seller-order-right">

                    <strong>
                        ₹
                        {Number(
                            order.total_amount
                        ).toLocaleString(
                            "en-IN"
                        )}
                    </strong>


                    <span
                        className={
                            `order-status ${order.status
                                .toLowerCase()
                            }`
                        }
                    >
                        {order.status}
                    </span>


                   {String(
    order.status || ""
).toUpperCase() ===
"PENDING_SELLER_ACCEPTANCE" && (

                        <div className="order-actions">

                            <button
                                type="button"
                                className="order-accept-button"
                                onClick={() =>
                                    acceptOrder(
                                        order.id
                                    )
                                }
                            >
                                Accept
                            </button>


                            <button
                                type="button"
                                className="order-reject-button"
                                onClick={() =>
                                    rejectOrder(
                                        order.id
                                    )
                                }
                            >
                                Reject
                            </button>

                        </div>

                    )}

                </div>

            </div>

        ))}

    </div>

)}{selectedSellerOrderId && (

    <SellerOrderModal

        orderId={
            selectedSellerOrderId
        }

        onClose={() =>
            setSelectedSellerOrderId(
                null
            )
        }

        onUpdated={async () => {

            await loadSellerOrders();

        }}

    />

)}

                </section>

            </main>

        </div>
    );
}


export default SellerDashboard;