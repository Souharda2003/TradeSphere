import {
    useEffect,
    useState
} from "react";

import {
    ShoppingCart,
    Package,
    ArrowLeft,
    Minus,
    Plus,
    CheckCircle
} from "lucide-react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import api from "../../services/api";

import "../../styles/product-details.css";


function ProductDetails() {

    const navigate =
        useNavigate();

    const { id } =
        useParams();


    const [product, setProduct] =
        useState(null);

    const [images, setImages] =
        useState([]);

    const [selectedImage, setSelectedImage] =
        useState(0);

    const [quantity, setQuantity] =
        useState(1);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");
const [cartLoading, setCartLoading] =
    useState(false);

const [cartMessage, setCartMessage] =
    useState("");

const [cartError, setCartError] =
    useState("");

    useEffect(() => {

        loadProduct();

    }, [id]);

async function handleAddToCart() {

    try {

        setCartLoading(true);

        setCartMessage("");

        setCartError("");


        const token =
            localStorage.getItem(
                "token"
            );


        /*
        ==================================
        LOGIN CHECK
        ==================================
        */

        if (!token) {

            navigate(
                `/login?redirect=/products/${id}`
            );

            return;
        }


        /*
        ==================================
        ADD TO CART
        ==================================
        */

        const response =
            await api.post(
                "/cart",
                {

                    productId:
                        product.id,

                    quantity:
                        quantity

                }
            );


        setCartMessage(
            response.data.message ||
            "Added to cart successfully."
        );


    } catch (error) {

        console.error(
            "ADD TO CART ERROR:",
            error
        );


        setCartError(

            error.response
                ?.data
                ?.message ||

            "Unable to add product to cart."

        );

    } finally {

        setCartLoading(false);
    }
}
    async function loadProduct() {

        try {

            setLoading(true);

            const response =
                await api.get(
                    `/products/${id}`
                );


            setProduct(
                response.data.product
            );

            setImages(
                response.data.images || []
            );


        } catch (error) {

            console.error(
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


    function increaseQuantity() {

        const available =
            Number(
                product?.available_quantity || 0
            );


        if (
            quantity < available
        ) {

            setQuantity(
                previous =>
                    previous + 1
            );
        }
    }


    function decreaseQuantity() {

        const minimum =
            Number(
                product?.minimum_order_quantity || 1
            );


        if (
            quantity > minimum
        ) {

            setQuantity(
                previous =>
                    previous - 1
            );
        }
    }


    if (loading) {

        return (

            <div className="product-details-loading">
                Loading product...
            </div>

        );
    }


    if (
        !product
    ) {

        return (

            <div className="product-details-loading">

                <Package size={30} />

                <h2>
                    Product not found
                </h2>

                <button
                    className="premium-button"
                    onClick={() =>
                        navigate(
                            "/products"
                        )
                    }
                >
                    Back to Products
                </button>

            </div>

        );
    }


    const primaryImage =
        images.length > 0
            ? getImageUrl(
                images[selectedImage]
                    ?.image_url
            )
            : null;


    const available =
        Number(
            product.available_quantity || 0
        );


    const minimum =
        Number(
            product.minimum_order_quantity || 1
        );


    return (

        <div className="product-details-page">


            {/* HEADER */}

            <header className="product-details-header">

                <button
                    className="back-product-button"
                    onClick={() =>
                        navigate(
                            "/products"
                        )
                    }
                >

                    <ArrowLeft
                        size={17}
                    />

                    Products

                </button>


                <div className="details-brand">

                    <strong>
                        TradeSphere
                    </strong>

                    <span>
                        Export Marketplace
                    </span>

                </div>


                <button
                    className="details-cart-button"
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

            </header>


            {/* MAIN */}

            <main className="product-details-main">


                {/* IMAGE SECTION */}

                <section className="details-image-section">


                    <div className="details-main-image">

                        {primaryImage ? (

                            <img
                                src={
                                    primaryImage
                                }
                                alt={
                                    product.product_name
                                }
                            />

                        ) : (

                            <Package
                                size={70}
                            />

                        )}

                    </div>


                    {images.length > 1 && (

                        <div className="details-thumbnails">

                            {images.map(
                                (
                                    image,
                                    index
                                ) => (

                                    <button
                                        key={
                                            image.id
                                        }
                                        className={
                                            selectedImage === index
                                                ? "thumbnail active"
                                                : "thumbnail"
                                        }
                                        onClick={() =>
                                            setSelectedImage(
                                                index
                                            )
                                        }
                                    >

                                        <img
                                            src={
                                                getImageUrl(
                                                    image.image_url
                                                )
                                            }
                                            alt=""
                                        />

                                    </button>

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* PRODUCT INFORMATION */}

                <section className="details-information">


                    <span className="details-category">
                        {product.category}
                    </span>


                    <h1>
                        {product.product_name}
                    </h1>


                    <p className="details-sku">
                        SKU: {product.sku}
                    </p>


                    <p className="details-description">

                        {product.description ||
                            "Premium quality export product."}

                    </p>


                    <div className="details-price">

                        ₹
                        {Number(
                            product.price
                        ).toLocaleString(
                            "en-IN"
                        )}

                        <small>
                            / {product.unit}
                        </small>

                    </div>


                    <div className="details-availability">

                        <CheckCircle
                            size={17}
                        />

                        <div>

                            <strong>
                                In Stock
                            </strong>

                            <span>
                                {available}{" "}
                                {product.unit}
                                {" "}available
                            </span>

                        </div>

                    </div>


                    <div className="details-order-box">

                        <span>
                            Minimum Order Quantity
                        </span>

                        <strong>
                            {minimum}{" "}
                            {product.unit}
                        </strong>


                        <div className="details-quantity">

                            <button
                                onClick={
                                    decreaseQuantity
                                }
                            >
                                <Minus
                                    size={15}
                                />
                            </button>


                            <span>
                                {quantity}
                            </span>


                            <button
                                onClick={
                                    increaseQuantity
                                }
                            >
                                <Plus
                                    size={15}
                                />
                            </button>

                        </div>
                        {cartError && (

    <div className="cart-error-message">
        {cartError}
    </div>

)}


{cartMessage && (

    <div className="cart-success-message">
        {cartMessage}
    </div>

)}
                        <button
    className="add-cart-button"
    disabled={cartLoading}
    onClick={
        handleAddToCart
    }
>

    <ShoppingCart
        size={18}
    />

    {cartLoading
        ? "Adding..."
        : "Add to Cart"}

</button>

                    </div>

                </section>

            </main>

        </div>
    );
}


export default ProductDetails;