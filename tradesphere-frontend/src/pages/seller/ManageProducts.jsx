import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Search,
    SlidersHorizontal,
    Package,
    Pencil,
    Trash2,
    X
} from "lucide-react";

import api
    from "../../services/api";

import ManageProductModal
    from "../../components/seller/ManageProductModal";

import BackButton
    from "../../components/BackButton";

import LogoutButton
    from "../../components/LogoutButton";

import "../../styles/manage-products.css";


function ManageProducts() {

    const [
        products,
        setProducts
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        search,
        setSearch
    ] = useState("");


    const [
        filterOpen,
        setFilterOpen
    ] = useState(false);


    const [
        selectedCategory,
        setSelectedCategory
    ] = useState("ALL");


    const [
        selectedProduct,
        setSelectedProduct
    ] = useState(null);


    const [
        error,
        setError
    ] = useState("");


    /*
    =========================================
    LOAD SELLER PRODUCTS
    =========================================
    */

    async function loadProducts() {

        try {

            setLoading(true);

            setError("");

            const response =
                await api.get(
                    "/products/seller"
                );


            setProducts(
                response.data?.products || []
            );


        } catch (error) {

            console.error(
                "LOAD SELLER PRODUCTS ERROR:",
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


    useEffect(() => {

        loadProducts();

    }, []);


    /*
    =========================================
    GET UNIQUE CATEGORIES
    =========================================
    */

    const categories = useMemo(() => {

        const uniqueCategories = [

            ...new Set(

                products
                    .map(
                        product =>
                            product.category
                                ?.trim()
                    )
                    .filter(Boolean)

            )

        ];


        return uniqueCategories.sort(
            (a, b) =>
                a.localeCompare(b)
        );

    }, [products]);


    /*
    =========================================
    SEARCH + CATEGORY FILTER
    =========================================
    */

    const filteredProducts =
        useMemo(() => {

            const searchValue =
                search
                    .trim()
                    .toLowerCase();


            return products.filter(
                product => {

                    /*
                    SEARCH
                    */

                    const matchesSearch =

                        !searchValue ||

                        product.product_name
                            ?.toLowerCase()
                            .includes(
                                searchValue
                            ) ||

                        product.sku
                            ?.toLowerCase()
                            .includes(
                                searchValue
                            ) ||

                        product.category
                            ?.toLowerCase()
                            .includes(
                                searchValue
                            );


                    /*
                    CATEGORY
                    */

                    const matchesCategory =

                        selectedCategory ===
                        "ALL" ||

                        product.category
                            ?.trim()
                            .toLowerCase() ===
                        selectedCategory
                            .trim()
                            .toLowerCase();


                    return (
                        matchesSearch &&
                        matchesCategory
                    );

                }
            );

        }, [
            products,
            search,
            selectedCategory
        ]);


    /*
    =========================================
    DELETE PRODUCT
    =========================================
    */

    async function handleDelete(
        product
    ) {

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${product.product_name}"?`
            );


        if (!confirmed) {

            return;

        }


        try {

            await api.delete(
                `/products/seller/${product.id}`
            );


            await loadProducts();


        } catch (error) {

            console.error(
                "DELETE PRODUCT ERROR:",
                error
            );


            alert(
                error.response
                    ?.data
                    ?.message ||
                "Unable to delete product."
            );

        }

    }


    /*
    =========================================
    PRODUCT STATUS
    =========================================
    */

    function getProductStatus(
        product
    ) {

        const available =
            Number(
                product.available_quantity || 0
            );


        if (
            available <= 0
        ) {

            return "OUT_OF_STOCK";

        }


        if (
            product.status ===
            "INACTIVE"
        ) {

            return "INACTIVE";

        }


        return "ACTIVE";

    }


    /*
    =========================================
    LOADING
    =========================================
    */

    if (loading) {

        return (

            <div
                className="manage-products-loading"
            >

                Loading products...

            </div>

        );

    }


    /*
    =========================================
    UI
    =========================================
    */

    return (

        <div
            className="manage-products-page"
        >


            {/* =================================
                HEADER
            ================================= */}

            <header
                className="manage-products-header"
            >

                <div>

                    <BackButton />

                </div>


                <div>

                    <h4>
                        TradeSphere
                    </h4>

                    <p>
                        Manage Products
                    </p>

                </div>


                <LogoutButton />

            </header>


            {/* =================================
                MAIN
            ================================= */}

            <main
                className="manage-products-main"
            >


                {/* =================================
                    HEADING
                ================================= */}

                <section
                    className="manage-products-heading"
                >

                    <p>
                        SELLER CATALOGUE
                    </p>


                    <h1>
                        Manage Products
                    </h1>


                    <span>
                        Search, update and manage
                        your products.
                    </span>

                </section>


                {/* =================================
                    ERROR
                ================================= */}

                {error && (

                    <div
                        className="manage-products-error"
                    >

                        {error}

                    </div>

                )}


                {/* =================================
                    TOOLBAR
                ================================= */}

                <section
                    className="manage-products-toolbar"
                >


                    {/* SEARCH */}

                    <div
                        className="manage-search-box"
                    >

                        <Search
                            size={18}
                        />


                        <input
                            type="text"

                            placeholder={
                                "Search products..."
                            }

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


                        {search && (

                            <button
                                type="button"

                                onClick={() =>
                                    setSearch("")
                                }
                            >

                                <X
                                    size={16}
                                />

                            </button>

                        )}

                    </div>


                    {/* =================================
                        FILTER WRAPPER
                    ================================= */}

                    <div
                        className="manage-filter-wrapper"
                    >


                        {/* FILTER BUTTON */}

                        <button
                            type="button"

                            className={
                                "manage-filter-button"
                            }

                            onClick={() =>
                                setFilterOpen(
                                    previous =>
                                        !previous
                                )
                            }
                        >

                            <SlidersHorizontal
                                size={17}
                            />

                            Filter

                        </button>


                        {/* =================================
                            ONLY ONE FILTER POPUP
                        ================================= */}

                        {filterOpen && (

                            <div
                                className={
                                    "manage-filter-popup"
                                }
                            >


                                {/* HEADER */}

                                <div
                                    className={
                                        "manage-filter-popup-header"
                                    }
                                >

                                    <strong>
                                        Filter by category
                                    </strong>


                                    <button
                                        type="button"

                                        className={
                                            "manage-filter-close"
                                        }

                                        onClick={() =>
                                            setFilterOpen(
                                                false
                                            )
                                        }
                                    >

                                        <X
                                            size={18}
                                        />

                                    </button>

                                </div>


                                {/* CATEGORY LIST */}

                                <div
                                    className={
                                        "manage-filter-category-list"
                                    }
                                >


                                    {/* ALL PRODUCTS */}

                                    <button
                                        type="button"

                                        className={
                                            `manage-filter-category ${
                                                selectedCategory ===
                                                "ALL"
                                                    ? "active"
                                                    : ""
                                            }`
                                        }

                                        onClick={() => {

                                            setSelectedCategory(
                                                "ALL"
                                            );

                                            setFilterOpen(
                                                false
                                            );

                                        }}
                                    >

                                        All Products

                                    </button>


                                    {/* DYNAMIC CATEGORIES */}

                                    {categories.map(
                                        category => (

                                            <button
                                                type="button"

                                                key={
                                                    category
                                                }

                                                className={
                                                    `manage-filter-category ${
                                                        String(
                                                            selectedCategory
                                                        )
                                                            .toLowerCase() ===
                                                        String(
                                                            category
                                                        )
                                                            .toLowerCase()
                                                            ? "active"
                                                            : ""
                                                    }`
                                                }

                                                onClick={() => {

                                                    setSelectedCategory(
                                                        category
                                                    );

                                                    setFilterOpen(
                                                        false
                                                    );

                                                }}
                                            >

                                                {
                                                    category
                                                }

                                            </button>

                                        )
                                    )}

                                </div>

                            </div>

                        )}

                    </div>

                </section>


                {/* =================================
                    PRODUCT LIST
                ================================= */}

                <section
                    className="manage-products-list"
                >


                    {filteredProducts.length === 0 ? (

                        <div
                            className={
                                "manage-products-empty"
                            }
                        >

                            <Package
                                size={35}
                            />


                            <strong>
                                No products found
                            </strong>


                            <span>
                                Try another search.
                            </span>

                        </div>

                    ) : (

                        filteredProducts.map(
                            product => {

                                const status =
                                    getProductStatus(
                                        product
                                    );


                                return (

                                    <article
                                        key={
                                            product.id
                                        }

                                        className={
                                            "manage-product-list-card"
                                        }
                                    >


                                        {/* PRODUCT INFO */}

                                        <div
                                            className={
                                                "manage-product-list-main"
                                            }
                                        >

                                            <div
                                                className={
                                                    "manage-product-list-icon"
                                                }
                                            >

                                                <Package
                                                    size={24}
                                                />

                                            </div>


                                            <div>

                                                <h3>
                                                    {
                                                        product.product_name
                                                    }
                                                </h3>


                                                <span>
                                                    SKU:{" "}
                                                    {
                                                        product.sku
                                                    }
                                                </span>


                                                <div
                                                    className={
                                                        "manage-product-meta"
                                                    }
                                                >

                                                    <span>
                                                        Price: ₹
                                                        {
                                                            Number(
                                                                product.price ||
                                                                0
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )
                                                        }
                                                    </span>


                                                    <span>
                                                        Stock:{" "}
                                                        {
                                                            Number(
                                                                product.available_quantity ||
                                                                0
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )
                                                        }{" "}
                                                        {
                                                            product.unit
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                        </div>


                                        {/* STATUS */}

                                        <span
                                            className={
                                                `manage-product-status ${
                                                    status.toLowerCase()
                                                }`
                                            }
                                        >

                                            {
                                                status ===
                                                "OUT_OF_STOCK"

                                                    ? "OUT OF STOCK"

                                                    : status
                                            }

                                        </span>


                                        {/* ACTIONS */}

                                        <div
                                            className={
                                                "manage-product-card-actions"
                                            }
                                        >


                                            <button
                                                type="button"

                                                className={
                                                    "manage-product-button"
                                                }

                                                onClick={() =>
                                                    setSelectedProduct(
                                                        product
                                                    )
                                                }
                                            >

                                                <Pencil
                                                    size={15}
                                                />

                                                Manage

                                            </button>


                                            <button
                                                type="button"

                                                className={
                                                    "manage-product-delete-button"
                                                }

                                                onClick={() =>
                                                    handleDelete(
                                                        product
                                                    )
                                                }
                                            >

                                                <Trash2
                                                    size={15}
                                                />

                                                Delete

                                            </button>

                                        </div>

                                    </article>

                                );

                            }

                        )

                    )}

                </section>

            </main>


            {/* =================================
                MANAGE PRODUCT MODAL
            ================================= */}

            {selectedProduct && (

                <ManageProductModal

                    product={
                        selectedProduct
                    }

                    onClose={() =>
                        setSelectedProduct(
                            null
                        )
                    }

                    onUpdated={
                        loadProducts
                    }

                />

            )}

        </div>

    );

}


export default ManageProducts;