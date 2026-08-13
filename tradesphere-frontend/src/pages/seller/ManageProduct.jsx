import {
    useEffect,
    useState
} from "react";

import {
    Package,
    Boxes,
    Plus,
    Minus,
    ArrowLeft,
    RefreshCw,
    Tag,
    MapPin
} from "lucide-react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import api from "../../services/api";

import BackButton
    from "../../components/BackButton";

import "../../styles/manage-product.css";


function ManageProduct() {

    const navigate =
        useNavigate();

    const { id } =
        useParams();


    const [product, setProduct] =
        useState(null);


    const [images, setImages] =
        useState([]);


    const [loading, setLoading] =
        useState(true);


    const [stockLoading, setStockLoading] =
        useState(false);


    const [stockAmount, setStockAmount] =
        useState("");


    const [message, setMessage] =
        useState("");


    const [error, setError] =
        useState("");


    /*
    ========================================
    LOAD PRODUCT
    ========================================
    */

    useEffect(() => {

        loadProduct();

    }, [id]);


    async function loadProduct() {

        try {

            setLoading(true);

            setError("");

            const response =
                await api.get(
                    `/products/seller/${id}`
                );


            setProduct(
                response.data.product
            );


            setImages(
                response.data.images || []
            );


        } catch (error) {

            console.error(
                "LOAD PRODUCT ERROR:",
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
    ========================================
    UPDATE STOCK
    ========================================
    */

    async function updateStock(
        operation
    ) {

        const amount =
            Number(stockAmount);


        if (
            !amount ||
            amount <= 0
        ) {

            setError(
                "Enter a valid stock quantity."
            );

            return;
        }


        setStockLoading(true);

        setError("");

        setMessage("");


        try {

            const response =
                await api.patch(

                    `/products/seller/${id}/stock`,

                    {
                        quantity:
                            amount,

                        operation:
                            operation
                    }

                );


            /*
            Update screen immediately
            */

            setProduct(
                previous => ({

                    ...previous,

                    quantity:
                        response.data.quantity,

                    reserved_quantity:
                        response.data.reservedQuantity,

                    available_quantity:
                        response.data.availableQuantity,

                    status:
                        response.data.status

                })
            );


            setStockAmount("");


            setMessage(

                operation === "ADD"

                    ? "Stock added successfully."

                    : "Stock removed successfully."

            );


        } catch (error) {

            console.error(
                "UPDATE STOCK ERROR:",
                error
            );


            setError(

                error.response
                    ?.data
                    ?.message ||

                "Unable to update stock."

            );

        } finally {

            setStockLoading(false);
        }
    }


    /*
    ========================================
    LOADING
    ========================================
    */

    if (loading) {

        return (

            <div className="manage-product-loading">

                <RefreshCw
                    size={22}
                    className="spin"
                />

                Loading product...

            </div>

        );
    }


    /*
    ========================================
    PRODUCT NOT FOUND
    ========================================
    */

    if (
        !product
    ) {

        return (

            <div className="manage-product-loading">

                <Package size={25} />

                <span>
                    Product not found.
                </span>

                <button
                    className="secondary-button"
                    onClick={() =>
                        navigate(
                            "/seller/products"
                        )
                    }
                >
                    Back to Products
                </button>

            </div>

        );
    }


    return (

        <div className="manage-product-page">


            {/* =================================
                HEADER
            ================================= */}

            <header className="manage-product-header">

                <BackButton />


                <div className="manage-product-header-title">

                    <div className="manage-product-logo">

                        <Package size={19} />

                    </div>

<button
    className="manage-product-button"
    onClick={() =>
        navigate(
            `/seller/products/${product.id}`
        )
    }
>
    <Edit3 size={15} />

    Manage Product
</button>

                </div>


                <button
                    className="secondary-button"
                    onClick={() =>
                        navigate(
                            "/seller/products"
                        )
                    }
                >

                    <ArrowLeft size={16} />

                    My Products

                </button>

            </header>


            {/* =================================
                MAIN
            ================================= */}

            <main className="manage-product-main">


                {/* =================================
                    ERROR / SUCCESS
                ================================= */}

                {error && (

                    <div className="manage-error">
                        {error}
                    </div>

                )}


                {message && (

                    <div className="manage-success">
                        {message}
                    </div>

                )}


                {/* =================================
                    PRODUCT TOP
                ================================= */}

                <section className="product-overview">


                    {/* IMAGE */}

                    <div className="manage-product-image">

                        {images.length > 0 ? (

                            <img
                                src={
                                    `http://localhost:5000${images[0].image_url}`
                                }

                                alt={
                                    product.product_name
                                }
                            />

                        ) : (

                            <Package size={50} />

                        )}

                    </div>


                    {/* INFORMATION */}

                    <div className="product-overview-info">

                        <div className="product-category">

                            {product.category}

                        </div>


                        <h1>
                            {product.product_name}
                        </h1>


                        <p className="product-description">

                            {product.description ||
                                "No product description available."}

                        </p>


                        <div className="product-meta">

                            <span>

                                <Tag size={13} />

                                SKU:
                                {" "}
                                {product.sku}

                            </span>


                            <span>

                                <MapPin size={13} />

                                {product.origin_country}

                            </span>


                            <span>

                                Unit:
                                {" "}
                                {product.unit}

                            </span>

                        </div>


                        <div className="manage-product-price">

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

                    </div>

                </section>


                {/* =================================
                    STOCK OVERVIEW
                ================================= */}

                <section className="inventory-section">


                    <div className="section-title">

                        <div>

                            <p>
                                INVENTORY
                            </p>

                            <h2>
                                Stock Management
                            </h2>

                        </div>


                        <span
                            className={
                                product.status ===
                                "ACTIVE"

                                    ? "stock-status active"

                                    : "stock-status out"
                            }
                        >
                            {product.status}
                        </span>

                    </div>


                    <div className="inventory-cards">


                        {/* TOTAL */}

                        <div className="inventory-card">

                            <div className="inventory-icon">

                                <Package
                                    size={20}
                                />

                            </div>


                            <span>
                                Total Stock
                            </span>


                            <strong>

                                {Number(
                                    product.quantity
                                ).toLocaleString(
                                    "en-IN"
                                )}

                            </strong>


                            <small>
                                {product.unit}
                            </small>

                        </div>


                        {/* RESERVED */}

                        <div className="inventory-card">

                            <div className="inventory-icon">

                                <Boxes
                                    size={20}
                                />

                            </div>


                            <span>
                                Reserved
                            </span>


                            <strong>

                                {Number(
                                    product.reserved_quantity
                                ).toLocaleString(
                                    "en-IN"
                                )}

                            </strong>


                            <small>
                                {product.unit}
                            </small>

                        </div>


                        {/* AVAILABLE */}

                        <div className="inventory-card available">

                            <div className="inventory-icon">

                                <Package
                                    size={20}
                                />

                            </div>


                            <span>
                                Available
                            </span>


                            <strong>

                                {Number(
                                    product.available_quantity
                                ).toLocaleString(
                                    "en-IN"
                                )}

                            </strong>


                            <small>
                                {product.unit}
                            </small>

                        </div>

                    </div>


                    {/* =================================
                        STOCK UPDATE
                    ================================= */}

                    <div className="stock-update-box">


                        <div className="stock-update-heading">

                            <h3>
                                Update Stock
                            </h3>

                            <p>
                                Add newly received stock
                                or remove available stock.
                            </p>

                        </div>


                        <div className="stock-update-form">


                            <div className="stock-amount">

                                <label>
                                    Quantity
                                </label>

                                <div className="quantity-input">

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.001"
                                        value={
                                            stockAmount
                                        }
                                        onChange={
                                            event =>
                                                setStockAmount(
                                                    event.target.value
                                                )
                                        }
                                        placeholder="Enter quantity"
                                    />

                                    <span>
                                        {product.unit}
                                    </span>

                                </div>

                            </div>


                            <div className="stock-buttons">


                                <button
                                    type="button"
                                    className="stock-add-button"
                                    disabled={
                                        stockLoading
                                    }
                                    onClick={() =>
                                        updateStock(
                                            "ADD"
                                        )
                                    }
                                >

                                    <Plus
                                        size={17}
                                    />

                                    {stockLoading
                                        ? "Updating..."
                                        : "Add Stock"}

                                </button>


                                <button
                                    type="button"
                                    className="stock-remove-button"
                                    disabled={
                                        stockLoading
                                    }
                                    onClick={() =>
                                        updateStock(
                                            "REMOVE"
                                        )
                                    }
                                >

                                    <Minus
                                        size={17}
                                    />

                                    {stockLoading
                                        ? "Updating..."
                                        : "Remove Stock"}

                                </button>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================
                    PRODUCT DETAILS
                ================================= */}

                <section className="product-details-section">

                    <div className="section-title">

                        <div>

                            <p>
                                PRODUCT INFORMATION
                            </p>

                            <h2>
                                Product Details
                            </h2>

                        </div>

                    </div>


                    <div className="details-grid">


                        <div className="detail-item">

                            <span>
                                Product Name
                            </span>

                            <strong>
                                {product.product_name}
                            </strong>

                        </div>


                        <div className="detail-item">

                            <span>
                                Category
                            </span>

                            <strong>
                                {product.category}
                            </strong>

                        </div>


                        <div className="detail-item">

                            <span>
                                SKU
                            </span>

                            <strong>
                                {product.sku}
                            </strong>

                        </div>


                        <div className="detail-item">

                            <span>
                                Unit
                            </span>

                            <strong>
                                {product.unit}
                            </strong>

                        </div>


                        <div className="detail-item">

                            <span>
                                Price
                            </span>

                            <strong>
                                ₹
                                {Number(
                                    product.price
                                ).toLocaleString(
                                    "en-IN"
                                )}
                            </strong>

                        </div>


                        <div className="detail-item">

                            <span>
                                Minimum Order
                            </span>

                            <strong>
                                {
                                    product.minimum_order_quantity
                                }{" "}
                                {product.unit}
                            </strong>

                        </div>


                        <div className="detail-item">

                            <span>
                                Origin
                            </span>

                            <strong>
                                {product.origin_country}
                            </strong>

                        </div>


                    </div>

                </section>


            </main>

        </div>
    );
}


export default ManageProduct;