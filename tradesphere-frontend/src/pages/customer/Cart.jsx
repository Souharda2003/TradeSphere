import {
    useEffect,
    useState
} from "react";

import {
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    ArrowLeft,
    Package,
    RefreshCw,
    ShoppingBag
} from "lucide-react";

import {
    useNavigate
} from "react-router-dom";

import api from "../../services/api";

import "../../styles/cart.css";


function Cart() {

    const navigate =
        useNavigate();


    const [items, setItems] =
        useState([]);


    const [totalAmount, setTotalAmount] =
        useState(0);


    const [loading, setLoading] =
        useState(true);


    const [updatingId, setUpdatingId] =
        useState(null);


    const [error, setError] =
        useState("");


    useEffect(() => {

        loadCart();

    }, []);


    /*
    =========================================
    LOAD CART
    =========================================
    */

    async function loadCart() {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.get(
                    "/cart"
                );


            setItems(
                response.data.items || []
            );


            setTotalAmount(
                Number(
                    response.data.totalAmount ||
                    0
                )
            );


        } catch (error) {

            console.error(
                "LOAD CART ERROR:",
                error
            );


            if (
                error.response?.status ===
                401
            ) {

                navigate(
                    "/login?redirect=/cart"
                );

                return;
            }


            setError(

                error.response
                    ?.data
                    ?.message ||

                "Unable to load cart."

            );

        } finally {

            setLoading(false);
        }
    }


    /*
    =========================================
    UPDATE QUANTITY
    =========================================
    */

    async function updateQuantity(
        item,
        newQuantity
    ) {

        if (
            newQuantity <= 0
        ) {

            removeItem(
                item.id
            );

            return;
        }


        setUpdatingId(
            item.id
        );


        try {

            await api.put(

                `/cart/${item.id}`,

                {
                    quantity:
                        newQuantity
                }

            );


            await loadCart();


        } catch (error) {

            setError(

                error.response
                    ?.data
                    ?.message ||

                "Unable to update quantity."

            );

        } finally {

            setUpdatingId(null);
        }
    }


    /*
    =========================================
    REMOVE
    =========================================
    */

    async function removeItem(
        itemId
    ) {

        try {

            setUpdatingId(
                itemId
            );


            await api.delete(
                `/cart/${itemId}`
            );


            await loadCart();


        } catch (error) {

            setError(

                error.response
                    ?.data
                    ?.message ||

                "Unable to remove item."

            );

        } finally {

            setUpdatingId(null);
        }
    }


    /*
    =========================================
    EMPTY CART
    =========================================
    */

    if (loading) {

        return (

            <div className="cart-loading">

                <RefreshCw
                    size={23}
                    className="spin"
                />

                Loading cart...

            </div>

        );
    }


    return (

        <div className="cart-page">


            {/* HEADER */}

            <header className="cart-header">

                <button
                    className="cart-back-button"
                    onClick={() =>
                        navigate(
                            "/products"
                        )
                    }
                >

                    <ArrowLeft
                        size={17}
                    />

                    Continue Shopping

                </button>


                <div className="cart-brand">

                    <ShoppingBag
                        size={18}
                    />

                    <strong>
                        My Cart
                    </strong>

                </div>


                <div className="cart-count">

                    {items.length}

                    {" "}

                    {items.length === 1
                        ? "Item"
                        : "Items"}

                </div>

            </header>


            <main className="cart-main">


                {error && (

                    <div className="cart-error">
                        {error}
                    </div>

                )}


                {/* =================================
                    EMPTY CART
                ================================= */}

                {items.length === 0 ? (

                    <div className="empty-cart">

                        <div className="empty-cart-icon">

                            <ShoppingCart
                                size={34}
                            />

                        </div>


                        <h1>
                            Your cart is empty
                        </h1>


                        <p>
                            Discover quality export
                            products and add them
                            to your cart.
                        </p>


                        <button
                            className="cart-primary-button"
                            onClick={() =>
                                navigate(
                                    "/products"
                                )
                            }
                        >

                            Explore Products

                        </button>

                    </div>

                ) : (

                    <div className="cart-layout">


                        {/* =================================
                            ITEMS
                        ================================= */}

                        <section className="cart-items-section">


                            <div className="cart-section-heading">

                                <div>

                                    <p>
                                        YOUR SELECTION
                                    </p>

                                    <h1>
                                        Shopping Cart
                                    </h1>

                                </div>


                                <span>
                                    {items.length} product
                                    {items.length !== 1
                                        ? "s"
                                        : ""}
                                </span>

                            </div>


                            <div className="cart-items">


                                {items.map(
                                    item => {

                                        const image =
                                            item.primary_image
                                                ?.startsWith(
                                                    "http"
                                                )

                                                ? item.primary_image

                                                : item.primary_image
                                                    ? `http://localhost:5000${item.primary_image}`

                                                    : null;


                                        const subtotal =
                                            Number(
                                                item.quantity
                                            ) *
                                            Number(
                                                item.unit_price
                                            );


                                        const minimum =
                                            Number(
                                                item.minimum_order_quantity ||
                                                1
                                            );


                                        const available =
                                            Number(
                                                item.available_quantity ||
                                                0
                                            );


                                        const updating =
                                            updatingId ===
                                            item.id;


                                        return (

                                            <article
                                                className="cart-item"
                                                key={
                                                    item.id
                                                }
                                            >


                                                {/* IMAGE */}

                                                <div className="cart-item-image">

                                                    {image ? (

                                                        <img
                                                            src={
                                                                image
                                                            }
                                                            alt={
                                                                item.product_name
                                                            }
                                                        />

                                                    ) : (

                                                        <Package
                                                            size={35}
                                                        />

                                                    )}

                                                </div>


                                                {/* INFO */}

                                                <div className="cart-item-info">

                                                    <span>
                                                        {
                                                            item.category
                                                        }
                                                    </span>


                                                    <h2>
                                                        {
                                                            item.product_name
                                                        }
                                                    </h2>


                                                    <small>
                                                        SKU:{" "}
                                                        {
                                                            item.sku
                                                        }
                                                    </small>


                                                    <div className="cart-item-price">

                                                        ₹
                                                        {Number(
                                                            item.unit_price
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}

                                                        <small>
                                                            /
                                                            {
                                                                item.unit
                                                            }
                                                        </small>

                                                    </div>


                                                    <div className="cart-item-stock">

                                                        Available:

                                                        {" "}

                                                        <strong>
                                                            {
                                                                available
                                                            }{" "}
                                                            {
                                                                item.unit
                                                            }
                                                        </strong>

                                                    </div>

                                                </div>


                                                {/* QUANTITY */}

                                                <div className="cart-item-actions">


                                                    <div className="cart-quantity">

                                                        <button
                                                            disabled={
                                                                updating
                                                            }
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item,

                                                                    Number(
                                                                        item.quantity
                                                                    ) - 1
                                                                )
                                                            }
                                                        >

                                                            <Minus
                                                                size={14}
                                                            />

                                                        </button>


                                                        <strong>
                                                            {
                                                                item.quantity
                                                            }
                                                        </strong>


                                                        <button
                                                            disabled={
                                                                updating
                                                            }
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item,

                                                                    Number(
                                                                        item.quantity
                                                                    ) + 1
                                                                )
                                                            }
                                                        >

                                                            <Plus
                                                                size={14}
                                                            />

                                                        </button>

                                                    </div>


                                                    <small>
                                                        Min:{" "}
                                                        {minimum}{" "}
                                                        {
                                                            item.unit
                                                        }
                                                    </small>


                                                    <strong className="cart-item-subtotal">

                                                        ₹
                                                        {subtotal.toLocaleString(
                                                            "en-IN"
                                                        )}

                                                    </strong>


                                                    <button
                                                        className="remove-cart-item"
                                                        disabled={
                                                            updating
                                                        }
                                                        onClick={() =>
                                                            removeItem(
                                                                item.id
                                                            )
                                                        }
                                                    >

                                                        <Trash2
                                                            size={15}
                                                        />

                                                        Remove

                                                    </button>

                                                </div>

                                            </article>

                                        );

                                    }
                                )}

                            </div>

                        </section>


                        {/* =================================
                            SUMMARY
                        ================================= */}

                        <aside className="cart-summary">


                            <p>
                                ORDER SUMMARY
                            </p>


                            <h2>
                                Cart Summary
                            </h2>


                            <div className="summary-line">

                                <span>
                                    Products
                                </span>

                                <strong>
                                    {items.length}
                                </strong>

                            </div>


                            <div className="summary-line">

                                <span>
                                    Subtotal
                                </span>

                                <strong>

                                    ₹
                                    {totalAmount.toLocaleString(
                                        "en-IN"
                                    )}

                                </strong>

                            </div>


                            <div className="summary-line">

                                <span>
                                    Delivery
                                </span>

                                <strong>
                                    Calculated at checkout
                                </strong>

                            </div>


                            <div className="summary-divider" />


                            <div className="summary-total">

                                <span>
                                    Total
                                </span>

                                <strong>

                                    ₹
                                    {totalAmount.toLocaleString(
                                        "en-IN"
                                    )}

                                </strong>

                            </div>


                            <button
                                className="checkout-button"
                                onClick={() =>
                                    navigate(
                                        "/checkout"
                                    )
                                }
                            >

                                Proceed to Checkout

                            </button>


                            <button
                                className="continue-button"
                                onClick={() =>
                                    navigate(
                                        "/products"
                                    )
                                }
                            >

                                Continue Shopping

                            </button>


                        </aside>

                    </div>

                )}

            </main>

        </div>
    );
}


export default Cart;