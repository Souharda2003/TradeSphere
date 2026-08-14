import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    ArrowLeft,
    ShoppingCart,
    Package,
    Plus,
    Check,
    Minus,
    RefreshCw
} from "lucide-react";

import api from "../../services/api";

import "../../styles/product-details.css";


function ProductDetails() {

    const navigate =
        useNavigate();

    const { id } =
        useParams();


    const [product, setProduct] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [quantity, setQuantity] =
        useState(5);

    const [cartItem, setCartItem] =
        useState(null);

    const [addingToCart, setAddingToCart] =
        useState(false);

    const [added, setAdded] =
        useState(false);


    /*
    =========================================
    LOAD PRODUCT
    =========================================
    */

    useEffect(() => {

        loadProduct();

        loadCart();

    }, [id]);


    async function loadProduct() {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.get(
                    `/products/${id}`
                );


            console.log(
                "PRODUCT DETAILS:",
                response.data
            );


            setProduct(
                response.data.product
            );


        } catch (error) {

            console.error(
                "PRODUCT DETAILS ERROR:",
                error.response?.data ||
                error
            );


            setError(
                error.response
                    ?.data
                    ?.message ||
                "Unable to load product."
            );


        } finally {

            setLoading(false);

        }

    }


    /*
    =========================================
    LOAD CART
    =========================================
    */

    async function loadCart() {

        try {

            const response =
                await api.get(
                    "/cart"
                );


            const items =
                response.data.items ||
                [];


            const existingItem =
                items.find(
                    item =>
                        Number(
                            item.product_id
                        ) ===
                        Number(id)
                );


            if (existingItem) {

                setCartItem(
                    existingItem
                );

                setAdded(true);

                setQuantity(
                    Number(
                        existingItem.quantity
                    )
                );

            }


        } catch (error) {

            console.error(
                "LOAD CART ERROR:",
                error.response?.data ||
                error
            );

        }

    }


    /*
    =========================================
    FORMAT QUANTITY
    =========================================
    */

    function formatQuantity(
        value
    ) {

        const number =
            Number(value);


        if (
            !Number.isFinite(number)
        ) {

            return "0";

        }


        return String(
            number
        );

    }


    /*
    =========================================
    ADD TO CART
    =========================================
    */

    async function addToCart() {

        if (!product) {

            return;

        }


        const selectedQuantity =
            Number(quantity);


        if (
            !Number.isFinite(
                selectedQuantity
            ) ||
            selectedQuantity < 5
        ) {

            setError(
                `Minimum order quantity is 5 ${product.unit}.`
            );

            return;

        }


        try {

            setAddingToCart(
                true
            );

            setError("");


            const response =
                await api.post(
                    "/cart",
                    {

                        productId:
                            Number(
                                product.id
                            ),

                        quantity:
                            selectedQuantity

                    }
                );


            console.log(
                "ADD TO CART:",
                response.data
            );


            setAdded(true);


            await loadCart();


        } catch (error) {

            console.error(
                "ADD TO CART ERROR:",
                error.response?.data ||
                error
            );


            setError(
                error.response
                    ?.data
                    ?.message ||
                "Unable to add product to cart."
            );


        } finally {

            setAddingToCart(
                false
            );

        }

    }


    /*
    =========================================
    QUANTITY
    =========================================
    */

    function decreaseQuantity() {

        setQuantity(
            previous =>
                Math.max(
                    5,
                    Number(previous) - 5
                )
        );

    }


    function increaseQuantity() {

        const available =
            Number(
                product?.available_quantity ||
                0
            );


        setQuantity(
            previous =>
                Math.min(
                    available,
                    Number(previous) + 5
                )
        );

    }


    /*
    =========================================
    IMAGE
    =========================================
    */

    function getImageUrl(
        image
    ) {

        if (!image) {

            return null;

        }


        if (
            image.startsWith(
                "http"
            )
        ) {

            return image;

        }


        return (
            `http://localhost:5000${image}`
        );

    }


    /*
    =========================================
    LOADING
    =========================================
    */

    if (loading) {

        return (

            <div className="product-details-page">

                <div className="product-details-loading">

                    <RefreshCw
                        size={28}
                        className="spin"
                    />

                    <span>
                        Loading product...
                    </span>

                </div>

            </div>

        );

    }


    /*
    =========================================
    ERROR
    =========================================
    */

    if (
        error &&
        !product
    ) {

        return (

            <div className="product-details-page">

                <header className="product-details-header">

                    <button
                        type="button"
                        className="back-button"
                        onClick={() =>
                            navigate(
                                "/products"
                            )
                        }
                    >

                        <ArrowLeft
                            size={18}
                        />

                        Back to Products

                    </button>

                </header>


                <main className="product-details-error">

                    <Package
                        size={50}
                    />

                    <h2>
                        Product not found
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/products"
                            )
                        }
                    >
                        Browse Products
                    </button>

                </main>

            </div>

        );

    }


    const image =
        getImageUrl(
            product?.primary_image
        );


    const available =
        Number(
            product?.available_quantity ||
            0
        );


    const price =
        Number(
            product?.price ||
            0
        );


    const subtotal =
        Number(quantity) *
        price;


    return (

        <div className="product-details-page">


            {/* =================================
                HEADER
            ================================= */}

            <header
                className="product-details-header"
            >

                <button
                    type="button"
                    className="back-button"
                    onClick={() =>
                        navigate(
                            "/products"
                        )
                    }
                >

                    <ArrowLeft
                        size={18}
                    />

                    Back to Products

                </button>


                <div
                    className="product-details-header-actions"
                >

                    <button
                        type="button"
                        className="header-cart-button"
                        onClick={() =>
                            navigate(
                                "/cart"
                            )
                        }
                    >

                        <ShoppingCart
                            size={18}
                        />

                        Cart

                    </button>

                </div>

            </header>


            {/* =================================
                MAIN
            ================================= */}

            <main
                className="product-details-main"
            >


                {/* BREADCRUMB */}

                <div
                    className="product-breadcrumb"
                >

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/customer/dashboard"
                            )
                        }
                    >
                        Home
                    </button>

                    <span>
                        /
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/products"
                            )
                        }
                    >
                        Products
                    </button>

                    <span>
                        /
                    </span>

                    <strong>
                        {product.product_name}
                    </strong>

                </div>


                {/* =================================
                    PRODUCT
                ================================= */}

                <section
                    className="product-details-card"
                >


                    {/* IMAGE */}

                    <div
                        className="product-details-image-section"
                    >

                        <div
                            className="product-details-image-box"
                        >

                            {image ? (

                                <img
                                    src={image}
                                    alt={
                                        product.product_name
                                    }
                                />

                            ) : (

                                <Package
                                    size={90}
                                />

                            )}

                        </div>


                        {product.category && (

                            <span
                                className="product-details-category"
                            >
                                {
                                    product.category
                                }
                            </span>

                        )}

                    </div>


                    {/* INFORMATION */}

                    <div
                        className="product-details-content"
                    >

                        <p
                            className="product-details-eyebrow"
                        >
                            PRODUCT DETAILS
                        </p>


                        <small
                            className="product-details-sku"
                        >
                            SKU:{" "}
                            {product.sku}
                        </small>


                        <h1>
                            {
                                product.product_name
                            }
                        </h1>


                        <p
                            className="product-details-description"
                        >
                            {
                                product.description ||
                                "Premium quality export-import product."
                            }
                        </p>


                        <div
                            className="product-details-price"
                        >

                            ₹
                            {price.toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits:
                                        2,

                                    maximumFractionDigits:
                                        2
                                }
                            )}

                            <span>
                                /
                                {product.unit}
                            </span>

                        </div>


                        {/* PRODUCT INFORMATION */}

                        <div
                            className="product-information-grid"
                        >

                            <div>

                                <span>
                                    Category
                                </span>

                                <strong>
                                    {
                                        product.category ||
                                        "—"
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Unit
                                </span>

                                <strong>
                                    {
                                        product.unit
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Origin
                                </span>

                                <strong>
                                    {
                                        product.origin_country ||
                                        "—"
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Minimum Order
                                </span>

                                <strong>
                                    5{" "}
                                    {
                                        product.unit
                                    }
                                </strong>

                            </div>

                        </div>


                        {/* QUANTITY */}

                        {!added && (

                            <div
                                className="product-details-quantity-section"
                            >

                                <label>
                                    Quantity
                                </label>


                                <div
                                    className="product-details-quantity-control"
                                >

                                    <button
                                        type="button"
                                        onClick={
                                            decreaseQuantity
                                        }
                                        disabled={
                                            quantity <= 5
                                        }
                                    >

                                        <Minus
                                            size={17}
                                        />

                                    </button>


                                    <input
                                        type="number"
                                        min="5"
                                        step="1"
                                        value={
                                            formatQuantity(
                                                quantity
                                            )
                                        }
                                        onChange={e => {

                                            setQuantity(
                                                e.target.value
                                            );

                                        }}
                                    />


                                    <button
                                        type="button"
                                        onClick={
                                            increaseQuantity
                                        }
                                        disabled={
                                            quantity >=
                                            available
                                        }
                                    >

                                        <Plus
                                            size={17}
                                        />

                                    </button>

                                </div>

                            </div>

                        )}


                        {/* SUBTOTAL */}

                        {!added && (

                            <div
                                className="product-details-subtotal"
                            >

                                <span>
                                    Estimated subtotal
                                </span>

                                <strong>
                                    ₹
                                    {subtotal.toLocaleString(
                                        "en-IN",
                                        {
                                            minimumFractionDigits:
                                                2,

                                            maximumFractionDigits:
                                                2
                                        }
                                    )}
                                </strong>

                            </div>

                        )}


                        {/* ERROR */}

                        {error && (

                            <div
                                className="product-details-error-message"
                            >
                                {error}
                            </div>

                        )}


                        {/* BUTTON */}

                        {added ? (

                            <div
                                className="product-added-state"
                            >

                                <div>

                                    <Check
                                        size={20}
                                    />

                                    <div>

                                        <strong>
                                            In Cart
                                        </strong>

                                        <span>
                                            {
                                                formatQuantity(
                                                    cartItem?.quantity ||
                                                    quantity
                                                )
                                            }{" "}
                                            {
                                                product.unit
                                            }
                                        </span>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/cart"
                                        )
                                    }
                                >
                                    Go to Cart
                                </button>

                            </div>

                        ) : (

                            <button
                                type="button"
                                className="product-details-add-button"
                                disabled={
                                    addingToCart ||
                                    available < 5
                                }
                                onClick={
                                    addToCart
                                }
                            >

                                {addingToCart ? (

                                    <>
                                        <RefreshCw
                                            size={18}
                                            className="spin"
                                        />

                                        Adding...

                                    </>

                                ) : (

                                    <>
                                        <Plus
                                            size={19}
                                        />

                                        Add to Cart

                                    </>

                                )}

                            </button>

                        )}

                    </div>

                </section>

            </main>

        </div>

    );

}


export default ProductDetails;