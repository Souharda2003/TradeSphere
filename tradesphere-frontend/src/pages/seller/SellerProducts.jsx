import {
    useEffect,
    useState
} from "react";

import {
    Plus,
    Package,
    Boxes,
    Edit3,
    RefreshCw,
    Search,
    ArrowLeft
} from "lucide-react";

import {
    useNavigate
} from "react-router-dom";

import api from "../../services/api";

import BackButton
    from "../../components/BackButton";

import "../../styles/seller-products.css";


function SellerProducts() {

    const navigate =
        useNavigate();


    // =========================================
    // STATES
    // =========================================

    const [products, setProducts] =
        useState([]);

    const [filteredProducts, setFilteredProducts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [category, setCategory] =
        useState("ALL");


    // =========================================
    // LOAD PRODUCTS
    // =========================================

    useEffect(() => {

        loadProducts();

    }, []);


    async function loadProducts() {

        try {

            setLoading(true);

            setError("");

            const response =
                await api.get(
                    "/products/seller"
                );


            const productList =
                response.data.products || [];


            setProducts(
                productList
            );

            setFilteredProducts(
                productList
            );


        } catch (error) {

            console.error(
                "SELLER PRODUCTS ERROR:",
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


    // =========================================
    // SEARCH + CATEGORY FILTER
    // =========================================

    useEffect(() => {

        let result =
            [...products];


        // SEARCH

        if (
            search.trim()
        ) {

            const searchText =
                search
                    .toLowerCase()
                    .trim();


            result =
                result.filter(
                    product =>

                        product.product_name
                            ?.toLowerCase()
                            .includes(
                                searchText
                            )

                        ||

                        product.sku
                            ?.toLowerCase()
                            .includes(
                                searchText
                            )

                        ||

                        product.category
                            ?.toLowerCase()
                            .includes(
                                searchText
                            )
                );
        }


        // CATEGORY

        if (
            category !== "ALL"
        ) {

            result =
                result.filter(
                    product =>
                        product.category ===
                        category
                );
        }


        setFilteredProducts(
            result
        );

    }, [
        search,
        category,
        products
    ]);


    // =========================================
    // CATEGORIES
    // =========================================

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


    // =========================================
    // PRODUCT IMAGE
    // =========================================

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


    // =========================================
    // FORMAT NUMBER
    // =========================================

    function formatNumber(
        value
    ) {

        return Number(
            value || 0
        ).toLocaleString(
            "en-IN"
        );
    }


    // =========================================
    // OPEN PRODUCT
    // =========================================

    function openProduct(
        productId
    ) {

        navigate(
            `/seller/products/${productId}`
        );
    }


    // =========================================
    // ADD PRODUCT
    // =========================================

    function addProduct() {

        navigate(
            "/seller/products/add"
        );
    }


    // =========================================
    // LOADING
    // =========================================

    if (loading) {

        return (

            <div className="products-loading">

                <RefreshCw
                    size={22}
                    className="spin"
                />

                <span>
                    Loading your products...
                </span>

            </div>

        );
    }


    // =========================================
    // MAIN UI
    // =========================================

    return (

        <div className="seller-products-page">


            {/* =====================================
                HEADER
            ===================================== */}

            <header className="seller-products-header">


                <div className="seller-products-header-left">

                    <BackButton />


                    <div className="products-header-title">

                        <div className="products-header-logo">

                            <Package
                                size={18}
                            />

                        </div>


                        <div>

                            <p>
                                SELLER CENTER
                            </p>

                            <h1>
                                My Products
                            </h1>

                        </div>

                    </div>

                </div>


                <button
                    className="premium-button"
                    onClick={
                        addProduct
                    }
                >

                    <Plus
                        size={17}
                    />

                    Add Product

                </button>

            </header>


            {/* =====================================
                MAIN
            ===================================== */}

            <main className="seller-products-main">


                {/* =================================
                    ERROR
                ================================= */}

                {error && (

                    <div className="products-error">

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
                    PAGE INTRO
                ================================= */}

                <section className="products-intro">

                    <div>

                        <p>
                            PRODUCT CATALOGUE
                        </p>

                        <h2>
                            Manage your products
                        </h2>

                        <span>
                            Every product has its own
                            inventory and stock.
                        </span>

                    </div>


                    <div className="product-total">

                        <strong>
                            {products.length}
                        </strong>

                        <span>
                            Products
                        </span>

                    </div>

                </section>


                {/* =================================
                    SEARCH + FILTER
                ================================= */}

                {products.length > 0 && (

                    <section className="products-toolbar">


                        {/* SEARCH */}

                        <div className="product-search">

                            <Search
                                size={17}
                            />

                            <input
                                type="text"
                                placeholder="Search product, SKU or category..."
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


                        {/* CATEGORY */}

                        <div className="category-filter">

                            {categories.map(
                                item => (

                                    <button
                                        key={
                                            item
                                        }
                                        className={
                                            category === item
                                                ? "category-button active"
                                                : "category-button"
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

                        </div>

                    </section>

                )}


                {/* =================================
                    EMPTY PRODUCT
                ================================= */}

                {products.length === 0 && (

                    <div className="products-empty">


                        <div className="products-empty-icon">

                            <Package
                                size={32}
                            />

                        </div>


                        <h2>
                            No products yet
                        </h2>


                        <p>
                            Your product catalogue
                            is empty. Add your first
                            product to start selling.
                        </p>


                        <button
                            className="premium-button"
                            onClick={
                                addProduct
                            }
                        >

                            <Plus
                                size={17}
                            />

                            Add Your First Product

                        </button>

                    </div>

                )}


                {/* =================================
                    NO SEARCH RESULT
                ================================= */}

                {products.length > 0 &&
                    filteredProducts.length === 0 && (

                        <div className="products-empty">

                            <div className="products-empty-icon">

                                <Search
                                    size={28}
                                />

                            </div>


                            <h2>
                                No products found
                            </h2>


                            <p>
                                Try a different product
                                name, SKU or category.
                            </p>


                            <button
                                className="secondary-button"
                                onClick={() => {

                                    setSearch("");

                                    setCategory(
                                        "ALL"
                                    );

                                }}
                            >

                                Clear Filters

                            </button>

                        </div>

                    )}


                {/* =================================
                    PRODUCT GRID
                ================================= */}

                {filteredProducts.length > 0 && (

                    <section className="products-grid">

                        {filteredProducts.map(
                            product => {


                                const imageUrl =
                                    getImageUrl(
                                        product.primary_image
                                    );


                                const available =
                                    Number(
                                        product.available_quantity ||
                                        0
                                    );


                                const total =
                                    Number(
                                        product.quantity ||
                                        0
                                    );


                                const reserved =
                                    Number(
                                        product.reserved_quantity ||
                                        0
                                    );


                                const isActive =
                                    product.status ===
                                    "ACTIVE";


                                return (

                                    <article
                                        className="product-card"
                                        key={
                                            product.id
                                        }
                                    >


                                        {/* IMAGE */}

                                        <div className="product-image">


                                            {imageUrl ? (

                                                <img
                                                    src={
                                                        imageUrl
                                                    }
                                                    alt={
                                                        product.product_name
                                                    }
                                                />

                                            ) : (

                                                <div className="no-product-image">

                                                    <Package
                                                        size={38}
                                                    />

                                                    <span>
                                                        No Image
                                                    </span>

                                                </div>

                                            )}


                                            {/* STATUS */}

                                            <div
                                                className={
                                                    isActive
                                                        ? "product-status active"
                                                        : "product-status inactive"
                                                }
                                            >

                                                {product.status}

                                            </div>


                                        </div>


                                        {/* CARD BODY */}

                                        <div className="product-card-body">


                                            {/* CATEGORY + SKU */}

                                            <div className="product-card-meta">

                                                <span>
                                                    {
                                                        product.category
                                                    }
                                                </span>

                                                <small>
                                                    SKU:{" "}
                                                    {
                                                        product.sku
                                                    }
                                                </small>

                                            </div>


                                            {/* NAME */}

                                            <h3>
                                                {
                                                    product.product_name
                                                }
                                            </h3>


                                            {/* DESCRIPTION */}

                                            <p className="product-description">

                                                {
                                                    product.description
                                                        ?.slice(
                                                            0,
                                                            90
                                                        ) ||

                                                    "No description available."
                                                }

                                                {product.description?.length >
                                                    90 &&
                                                    "..."}
                                            </p>


                                            {/* PRICE */}

                                            <div className="product-price">

                                                ₹
                                                {Number(
                                                    product.price ||
                                                    0
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}

                                                <small>
                                                    /{" "}
                                                    {
                                                        product.unit
                                                    }
                                                </small>

                                            </div>


                                            {/* =================================
                                                STOCK
                                            ================================= */}

                                            <div className="stock-box">


                                                <div className="stock-box-header">

                                                    <div>

                                                        <Boxes
                                                            size={15}
                                                        />

                                                        <span>
                                                            Inventory
                                                        </span>

                                                    </div>


                                                    <small>
                                                        {
                                                            product.unit
                                                        }
                                                    </small>

                                                </div>


                                                <div className="stock-values">


                                                    {/* TOTAL */}

                                                    <div>

                                                        <span>
                                                            Total
                                                        </span>

                                                        <strong>
                                                            {formatNumber(
                                                                total
                                                            )}
                                                        </strong>

                                                    </div>


                                                    {/* RESERVED */}

                                                    <div>

                                                        <span>
                                                            Reserved
                                                        </span>

                                                        <strong>
                                                            {formatNumber(
                                                                reserved
                                                            )}
                                                        </strong>

                                                    </div>


                                                    {/* AVAILABLE */}

                                                    <div>

                                                        <span>
                                                            Available
                                                        </span>

                                                        <strong
                                                            className={
                                                                available > 0
                                                                    ? "available-stock"
                                                                    : "out-stock"
                                                            }
                                                        >
                                                            {formatNumber(
                                                                available
                                                            )}
                                                        </strong>

                                                    </div>

                                                </div>


                                            </div>


                                            {/* =================================
                                                MOQ
                                            ================================= */}

                                            <div className="product-moq">

                                                Minimum Order:

                                                <strong>
                                                    {
                                                        product.minimum_order_quantity
                                                    }{" "}
                                                    {
                                                        product.unit
                                                    }
                                                </strong>

                                            </div>


                                            {/* =================================
                                                MANAGE BUTTON
                                            ================================= */}

                                            <button
                                                className="manage-product-button"
                                                onClick={() =>
                                                    openProduct(
                                                        product.id
                                                    )
                                                }
                                            >

                                                <Edit3
                                                    size={15}
                                                />

                                                Manage Product

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


export default SellerProducts;