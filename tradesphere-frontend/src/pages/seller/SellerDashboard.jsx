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
    MessageSquare,
    RefreshCw
} from "lucide-react";

import api from "../../services/api";

import BackButton
    from "../../components/BackButton";

import LogoutButton
    from "../../components/LogoutButton";

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


    const [productsLoading, setProductsLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {

        loadDashboard();

    }, []);


    async function loadDashboard() {

        try {

            setLoading(true);

            setError("");


            // ================================
            // USER
            // ================================

            const userResponse =
                await api.get(
                    "/user/me"
                );


            setUser(
                userResponse.data.user
            );


            // ================================
            // SELLER PRODUCTS
            // ================================

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


    async function refreshProducts() {

        try {

            setProductsLoading(true);

            const response =
                await api.get(
                    "/products/seller"
                );


            setProducts(
                response.data.products || []
            );


        } catch (error) {

            console.error(
                "REFRESH PRODUCTS ERROR:",
                error
            );

        } finally {

            setProductsLoading(false);
        }
    }


    // =========================================
    // TOTAL PRODUCTS
    // =========================================

    const totalProducts =
        products.length;


    // =========================================
    // TOTAL STOCK BY UNIT
    // =========================================

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


    // =========================================
    // AVAILABLE STOCK BY UNIT
    // =========================================

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


    // =========================================
    // RESERVED STOCK
    // =========================================

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


    // =========================================
    // FORMAT STOCK
    // =========================================

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


    // =========================================
    // LOADING SCREEN
    // =========================================

    if (loading) {

        return (

            <div className="dashboard-loading">

                <RefreshCw
                    size={22}
                    className="dashboard-spin"
                />

                <span>
                    Loading Seller Dashboard...
                </span>

            </div>

        );
    }


    // =========================================
    // DASHBOARD
    // =========================================

    return (

        <div className="seller-dashboard">


            {/* =================================
                HEADER
            ================================= */}

            <header className="seller-header">


                <div className="seller-header-left">

                    <BackButton />


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


                {/* HEADER RIGHT */}

                <div className="seller-header-right">


                    {/* REFRESH */}

                    <button
                        className="dashboard-icon-button"
                        title="Refresh"
                        onClick={
                            refreshProducts
                        }
                    >

                        <RefreshCw
                            size={18}
                            className={
                                productsLoading
                                    ? "dashboard-spin"
                                    : ""
                            }
                        />

                    </button>


                    {/* NOTIFICATION */}

                    <button
                        className="dashboard-icon-button"
                        title="Notifications"
                    >

                        <Bell size={19} />

                        <span className="notification-dot">
                        </span>

                    </button>


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


            {/* =================================
                MAIN
            ================================= */}

            <main className="seller-main">


                {/* =================================
                    ERROR
                ================================= */}

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


                {/* =================================
                    WELCOME
                ================================= */}

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


                    {/* TOTAL PRODUCTS */}

                    <div
                        className="seller-stat-card"
                        onClick={() =>
                            navigate(
                                "/seller/products"
                            )
                        }
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


                    {/* TOTAL STOCK */}

                    <div
                        className="seller-stat-card"
                        onClick={() =>
                            navigate(
                                "/seller/products"
                            )
                        }
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


                    {/* NEW ORDERS */}

                    <div
                        className="seller-stat-card"
                        onClick={() =>
                            navigate(
                                "/seller/orders"
                            )
                        }
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
                                0
                            </strong>

                        </div>

                    </div>


                    {/* SALES */}

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
                                ₹0
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================
                    INVENTORY SUMMARY
                ================================= */}

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


                {/* =================================
                    QUICK ACTIONS
                ================================= */}

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


                        {/* MESSAGES */}

                        <button
                            className="seller-action-card"
                            onClick={() =>
                                navigate(
                                    "/seller/messages"
                                )
                            }
                        >

                            <div className="seller-action-icon">

                                <MessageSquare
                                    size={22}
                                />

                            </div>


                            <div>

                                <strong>
                                    Customer Messages
                                </strong>

                                <span>
                                    Respond to customer
                                    enquiries.
                                </span>

                            </div>

                        </button>

                    </div>

                </section>


                {/* =================================
                    RECENT PRODUCTS
                ================================= */}

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
                                            key={
                                                product.id
                                            }
                                            onClick={() =>
                                                navigate(
                                                    `/seller/products/${product.id}`
                                                )
                                            }
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


                    <div className="seller-empty-state">

                        <ShoppingCart
                            size={30}
                        />

                        <strong>
                            No orders yet
                        </strong>

                        <span>
                            Customer orders will appear
                            here once they purchase
                            your products.
                        </span>

                    </div>

                </section>

            </main>

        </div>
    );
}


export default SellerDashboard;