import {
    useEffect,
    useState
} from "react";

import {
    Search,
    ShoppingCart,
    Package,
    RefreshCw,
    SlidersHorizontal
} from "lucide-react";

import {
    useNavigate
} from "react-router-dom";

import api from "../../services/api";

import "../../styles/customer-products.css";


function CustomerProducts() {

    const navigate =
        useNavigate();


    const [products, setProducts] =
        useState([]);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    const [search, setSearch] =
        useState("");


    const [category, setCategory] =
        useState("ALL");


    /*
    =========================================
    LOAD PRODUCTS
    =========================================
    */

    useEffect(() => {

        loadProducts();

    }, [search, category]);


    async function loadProducts() {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.get(
                    "/products",
                    {
                        params: {

                            search:
                                search,

                            category:
                                category

                        }
                    }
                );


            setProducts(
                response.data.products || []
            );


        } catch (error) {

            console.error(
                "CUSTOMER PRODUCTS ERROR:",
                error
            );


            setError(

                error.response
                    ?.data
                    ?.message ||

                "Unable to load products."

            );

        } finally {

            setLoading(false);
        }
    }


    /*
    =========================================
    CATEGORIES
    =========================================
    */

    const categories = [

        "ALL",

        ...new Set(

            products
                .map(
                    product =>
                        product.category
                )
                .filter(Boolean)

        )

    ];


    /*
    =========================================
    IMAGE URL
    =========================================
    */

    function getImageUrl(
        image
    ) {

        if (!image) {

            return null;
        }


        if (
            image.startsWith("http")
        ) {

            return image;
        }


        return `http://localhost:5000${image}`;
    }


    /*
    =========================================
    PRODUCT DETAILS
    =========================================
    */

    function openProduct(
        productId
    ) {

        navigate(
            `/products/${productId}`
        );
    }


    return (

        <div className="customer-products-page">


            {/* =================================
                HEADER
            ================================= */}

            <header className="customer-products-header">


                <div
                    className="customer-logo"
                    onClick={() =>
                        navigate("/")
                    }
                >

                    <div>
                        TS
                    </div>

                    <span>
                        TradeSphere
                    </span>

                </div>


                <nav>

                    <button
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        Home
                    </button>

                    <button
                        className="nav-active"
                    >
                        Products
                    </button>

                </nav>


                <div className="customer-header-actions">

                    <button
                        className="customer-cart-button"
                        onClick={() =>
                            navigate(
                                "/cart"
                            )
                        }
                    >

                        <ShoppingCart
                            size={18}
                        />

                        <span>
                            Cart
                        </span>

                        <b>
                            0
                        </b>

                    </button>


                    <button
                        className="customer-login-button"
                        onClick={() =>
                            navigate(
                                "/login"
                            )
                        }
                    >
                        Login
                    </button>

                </div>

            </header>


            {/* =================================
                MAIN
            ================================= */}

            <main className="customer-products-main">


                {/* HERO */}

                <section className="customer-products-hero">

                    <p>
                        TRADE & EXPORT MARKETPLACE
                    </p>

                    <h1>
                        Quality products,
                        <br />

                        <span>
                            trusted trade.
                        </span>
                    </h1>

                    <span>
                        Explore premium export and
                        import products from verified sellers.
                    </span>

                </section>


                {/* =================================
                    SEARCH
                ================================= */}

                <section className="customer-search-area">


                    <div className="customer-search">

                        <Search
                            size={19}
                        />

                        <input
                            type="text"
                            placeholder="Search soyabean, papad, spices..."
                            value={
                                search
                            }
                            onChange={
                                event =>
                                    setSearch(
                                        event.target.value
                                    )
                            }
                        />

                    </div>


                    <div className="customer-filter-icon">

                        <SlidersHorizontal
                            size={17}
                        />

                    </div>

                </section>


                {/* =================================
                    CATEGORY
                ================================= */}

                <section className="customer-categories">

                    {categories.map(
                        item => (

                            <button
                                key={
                                    item
                                }
                                className={
                                    category === item
                                        ? "customer-category active"
                                        : "customer-category"
                                }
                                onClick={() =>
                                    setCategory(
                                        item
                                    )
                                }
                            >

                                {item}

                            </button>

                        )
                    )}

                </section>


                {/* =================================
                    ERROR
                ================================= */}

                {error && (

                    <div className="customer-products-error">

                        {error}

                        <button
                            onClick={
                                loadProducts
                            }
                        >
                            Try Again
                        </button>

                    </div>

                )}


                {/* =================================
                    LOADING
                ================================= */}

                {loading ? (

                    <div className="customer-products-loading">

                        <RefreshCw
                            size={22}
                            className="spin"
                        />

                        <span>
                            Loading products...
                        </span>

                    </div>

                ) : products.length === 0 ? (

                    /* =================================
                        EMPTY
                    ================================= */

                    <div className="customer-no-products">

                        <div>
                            <Package
                                size={35}
                            />
                        </div>

                        <h2>
                            No products found
                        </h2>

                        <p>
                            Try another search or
                            category.
                        </p>

                    </div>

                ) : (

                    /* =================================
                        PRODUCT GRID
                    ================================= */

                    <section className="customer-product-grid">

                        {products.map(
                            product => {


                                const image =
                                    getImageUrl(
                                        product.primary_image
                                    );


                                const available =
                                    Number(
                                        product.available_quantity ||
                                        0
                                    );


                                return (

                                    <article
                                        className="customer-product-card"
                                        key={
                                            product.id
                                        }
                                        onClick={() =>
                                            openProduct(
                                                product.id
                                            )
                                        }
                                    >


                                        {/* IMAGE */}

                                        <div className="customer-product-image">

                                            {image ? (

                                                <img
                                                    src={
                                                        image
                                                    }
                                                    alt={
                                                        product.product_name
                                                    }
                                                />

                                            ) : (

                                                <Package
                                                    size={42}
                                                />

                                            )}


                                            <span>
                                                {product.category}
                                            </span>

                                        </div>


                                        {/* CONTENT */}

                                        <div className="customer-product-content">


                                            <small>
                                                SKU:{" "}
                                                {
                                                    product.sku
                                                }
                                            </small>


                                            <h2>
                                                {
                                                    product.product_name
                                                }
                                            </h2>


                                            <p>

                                                {
                                                    product.description
                                                        ?.slice(
                                                            0,
                                                            80
                                                        ) ||

                                                    "Premium quality export product."

                                                }

                                                {product.description?.length >
                                                    80 &&
                                                    "..."}

                                            </p>


                                            <div className="customer-product-price">

                                                ₹
                                                {Number(
                                                    product.price
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}

                                                <small>
                                                    /
                                                    {
                                                        product.unit
                                                    }
                                                </small>

                                            </div>


                                            <div className="customer-product-stock">

                                                <span>
                                                    Available
                                                </span>

                                                <strong>
                                                    {available}
                                                    {" "}
                                                    {
                                                        product.unit
                                                    }
                                                </strong>

                                            </div>


                                            <button
                                                className="view-product-button"
                                                onClick={
                                                    event => {

                                                        event.stopPropagation();

                                                        openProduct(
                                                            product.id
                                                        );

                                                    }
                                                }
                                            >
                                                View Product
                                            </button>

                                        </div>

                                    </article>

                                );

                            }
                        )}

                    </section>

                )}

            </main>

        </div>
    );
}


export default CustomerProducts;