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
    const [loading, setLoading] =
        useState(true);
    const [updatingId, setUpdatingId] =
        useState(null);
    const [error, setError] =
        useState("");

    useEffect(() => {
        loadCart();
    }, []);

async function loadCart() {

    try {

        setLoading(true);

        setError("");

        const response =
            await api.get(
                "/cart"
            );

        console.log(
            "CART RESPONSE:",
            response.data
        );

        setItems(
            response.data.items || []
        );

    } catch (error) {

        console.error(
            "LOAD CART ERROR:",
            error.response?.data || error
        );

        if (
            error.response?.status === 401
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
function formatQuantity(value) {

    const number =
        Number(value);

    if (
        !Number.isFinite(number)
    ) {
        return "";
    }

    /*
    Whole number হলে decimal দেখাবে না

    20.000  -> 20
    5500.000 -> 5500
    */

    if (
        Number.isInteger(number)
    ) {
        return String(number);
    }

    /*
    Decimal থাকলে meaningful decimal রাখবে

    76.056 -> 76.056
    */

    return String(number);
}
const totalAmount =
    items.reduce(
        (total, item) => {

            const quantity =
                Number(item.quantity) || 0;

            const unitPrice =
                Number(item.unit_price) ||
                Number(item.price) ||
                0;

            return (
                total +
                quantity * unitPrice
            );

        },
        0
    );
async function updateQuantity(
    item,
    newQuantity
) {

    const minimum = 5;

    const quantity =
        Number(newQuantity);


    /*
    =========================================
    INVALID NUMBER
    =========================================
    */

    if (
        !Number.isFinite(quantity) ||
        quantity <= 0
    ) {

        setError(
            `Please enter a valid quantity. Minimum is ${minimum} ${item.unit}.`
        );

        await loadCart();

        return;
    }


    /*
    =========================================
    MINIMUM 5
    =========================================
    */

    if (
        quantity < minimum
    ) {

        setError(
            `Minimum order quantity is ${minimum} ${item.unit}.`
        );

        await loadCart();

        return;
    }



    const available =
        Number(
            item.available_quantity || 0
        );


    if (
        quantity > available
    ) {

        setError(
            `Requested quantity is greater than available stock.`
        );

        await loadCart();

        return;
    }


    setError("");

    setUpdatingId(
        item.id
    );


    try {

        await api.put(
            `/cart/${item.id}`,
            {
                quantity: quantity
            }
        );


        /*
        =====================================
        UPDATE UI IMMEDIATELY
        =====================================
        */

        setItems(
            previousItems =>
                previousItems.map(
                    currentItem => {

                        if (
                            currentItem.id ===
                            item.id
                        ) {

                            return {
                                ...currentItem,
                                quantity:
                                    quantity
                            };

                        }

                        return currentItem;

                    }
                )
        );


        /*
        =====================================
        SYNC WITH DATABASE
        =====================================
        */

        await loadCart();


    } catch (error) {

        console.error(
            "UPDATE QUANTITY ERROR:",
            error.response?.data ||
            error
        );


        setError(
            error.response
                ?.data
                ?.message ||
            "Unable to update quantity."
        );


        await loadCart();


    } finally {

        setUpdatingId(
            null
        );

    }
}
    async function removeItem(
        itemId
    ) {

        try {

            setUpdatingId(
                itemId
            );

            setError("");


            await api.delete(
                `/cart/${itemId}`
            );


            await loadCart();


        } catch (error) {

            console.error(
                "REMOVE ITEM ERROR:",
                error.response?.data || error
            );


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


            {/* =================================
                HEADER
            ================================= */}

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


                {/* ERROR */}

                {error && (

                    <div className="cart-error">

                        {error}

                        <button
                            type="button"
                            onClick={() => {

                                setError("");

                                loadCart();

                            }}
                        >
                            ×
                        </button>

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

                                    {items.length}

                                    {" "}

                                    product
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


                                        const quantity =
                                            Number(
                                                item.quantity || 0
                                            );


                                        const unitPrice =
                                            Number(
                                                item.unit_price || 0
                                            );


                                        const subtotal =
                                            quantity *
                                            unitPrice;


                                        const minimum =
                                            5;


                                        const available =
                                            Number(
                                                item.available_quantity || 0
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

                                                        {unitPrice.toLocaleString(
                                                            "en-IN",
                                                            {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            }
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

                                                <div className="cart-item-actions">


                                                    <div className="cart-quantity">


                                                        {/* MINUS */}

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                updating ||
                                                                quantity <= 5
                                                            }
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item,
                                                                    Math.max(
                                                                        5,
                                                                        quantity - 1
                                                                    )
                                                                )
                                                            }
                                                        >

                                                            <Minus
                                                                size={14}
                                                            />

                                                        </button>


                                                        {/* USER INPUT */}

                                                        <input
                                                            type="number"
                                                            className="cart-quantity-input"
                                                            min="5"
                                                            max={
                                                                available
                                                            }
                                                            step="0.001"
                                                            value={
                                                                formatQuantity(item.quantity)
                                                            }
                                                            disabled={
                                                                updating
                                                            }
                                                            onChange={(e) => {

                                                                const value =
                                                                    e.target.value;


                                                                setItems(
                                                                    previousItems =>

                                                                        previousItems.map(
                                                                            currentItem =>

                                                                                currentItem.id ===
                                                                                item.id

                                                                                    ? {
                                                                                        ...currentItem,
                                                                                        quantity:
                                                                                            value
                                                                                    }

                                                                                    : currentItem
                                                                        )
                                                                );

                                                            }}
                                                            onBlur={(e) => {

    const value =
        e.target.value;

    updateQuantity(
        item,
        value
    );

}}
                                                            onKeyDown={(e) => {

                                                                if (
                                                                    e.key ===
                                                                    "Enter"
                                                                ) {

                                                                     e.preventDefault();

            e.currentTarget.blur();

                                                                }

                                                            }}
                                                               onWheel={(e) => {

        e.currentTarget.blur();

    }}
                                                        />


                                                        {/* PLUS */}

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                updating ||
                                                                quantity >=
                                                                available
                                                            }
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item,
                                                                    Math.min(
                                                                        available,
                                                                        quantity + 1
                                                                    )
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
                                                            "en-IN",
                                                            {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            }
                                                        )}

                                                    </strong>


                                                    {/* REMOVE */}

                                                    <button
                                                        className="remove-cart-item"
                                                        type="button"
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
                                        "en-IN",
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }
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
                                        "en-IN",
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }
                                    )}

                                </strong>

                            </div>


                            <button
                                className="checkout-button"
                                type="button"
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
                                type="button"
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