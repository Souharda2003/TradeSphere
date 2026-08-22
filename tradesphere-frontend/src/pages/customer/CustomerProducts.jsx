import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Search,
    ShoppingCart,
    Package,
    RefreshCw,
    SlidersHorizontal,
    X,
    Plus,
    Check
} from "lucide-react";

import {
    useNavigate
} from "react-router-dom";

import api from "../../services/api";

import "../../styles/customer-products.css";


function CustomerProducts() {

    const navigate = useNavigate();
    const [products, setProducts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");
    const [search, setSearch] =
        useState("");

    const [category, setCategory] =
        useState("");

    const [showFilter, setShowFilter] =
        useState(false);
    const [cartItems, setCartItems] =
        useState([]);

    const [cartLoading, setCartLoading] =
        useState(false);

    const [addedProductId, setAddedProductId] =
        useState(null);


    const [delivery, setDelivery] =
        useState({

            address: "",
            city: "",
            state: "",
            pincode: ""

        });


    const [showConfirmModal, setShowConfirmModal] =
        useState(false);

    const [showOtpModal, setShowOtpModal] =
        useState(false);

    const [otp, setOtp] =
        useState("");

    const [sendingOtp, setSendingOtp] =
        useState(false);

    const [verifyingOtp, setVerifyingOtp] =
        useState(false);

    const [orderError, setOrderError] =
        useState("");


    useEffect(() => {

        loadProducts();

    }, []);


    async function loadProducts() {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.get(
                    "/products"
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

    useEffect(() => {

        loadCart();

    }, []);


async function loadCart() {

    try {

        const response =
            await api.get(
                "/cart"
            );


        console.log(
            "CART RESPONSE:",
            response.data
        );


        setCartItems(
            response.data.items || []
        );


    } catch (error) {

        console.error(
            "LOAD CART ERROR:",
            error.response?.data || error
        );


        setCartItems([]);


        if (
            error.response?.status !== 401
        ) {

            setError(
                error.response
                    ?.data
                    ?.message ||
                "Unable to load cart."
            );

        }

    }

}
const cartCount =
    useMemo(() => {

        return cartItems.length;

    }, [cartItems]);
function getCartItem(productId) {

    return cartItems.find(
        item =>
            Number(item.product_id) ===
            Number(productId)
    );

}
const cartTotal =
    useMemo(() => {

        return cartItems.reduce(

            (
                total,
                item
            ) => {

                const quantity =
                    Number(
                        item.quantity || 0
                    );


                const price =
                    Number(
                        item.unit_price ??
                        item.price ??
                        0
                    );


                return (
                    total +
                    quantity * price
                );

            },

            0

        );

    }, [cartItems]);
    const categories =
        useMemo(() => {

            return [
                ...new Set(

                    products
                        .map(
                            product =>
                                product.category
                        )
                        .filter(Boolean)

                )

            ].sort();

        }, [products]);


    const filteredProducts =
        useMemo(() => {

            const keyword =
                search
                    .trim()
                    .toLowerCase();


            return products.filter(
                product => {

                    const matchesSearch =
                        !keyword ||

                        product.product_name
                            ?.toLowerCase()
                            .includes(keyword) ||

                        product.sku
                            ?.toLowerCase()
                            .includes(keyword) ||

                        product.description
                            ?.toLowerCase()
                            .includes(keyword);


                    const matchesCategory =
                        !category ||

                        product.category ===
                            category;


                    return (
                        matchesSearch &&
                        matchesCategory
                    );

                }
            );

        }, [
            products,
            search,
            category
        ]);
    function getImageUrl(image) {

        if (!image) {

            return null;

        }


        if (
            image.startsWith("http")
        ) {

            return image;

        }


        return (
            `http://localhost:5000${image}`
        );

    }


async function addToCart(product) {
    try {
        setCartLoading(true);
        setError("");

        const response = await api.post(
            "/cart",
            {
                productId: Number(product.id),
                quantity: 5
            }
        );

        console.log(
            "ADD TO CART RESPONSE:",
            response.data
        );

        await loadCart();

        setAddedProductId(product.id);

        setTimeout(() => {
            setAddedProductId(null);
        }, 1800);

    } catch (error) {

        console.error(
            "ADD TO CART ERROR:",
            error.response?.data || error
        );

        setError(
            error.response?.data?.message ||
            "Unable to add product to cart."
        );

    } finally {
        setCartLoading(false);
    }
}


    function openProduct(productId) {

        navigate(
            `/products/${productId}`
        );

    }


    function handleContinue() {

        if (
            cartCount <= 0
        ) {

            setOrderError(
                "Your cart is empty."
            );

            return;

        }


        setOrderError("");

        setShowConfirmModal(true);

    }
async function handleConfirmOrder() {

    /*
    =========================================
    VALIDATE DELIVERY INFORMATION
    =========================================
    */

    if (
        !delivery.address.trim() ||
        !delivery.city.trim() ||
        !delivery.state.trim() ||
        !delivery.pincode.trim()
    ) {

        setOrderError(
            "Please complete your delivery information."
        );

        return;
    }


    /*
    =========================================
    VALIDATE PINCODE
    =========================================
    */

    if (
        delivery.pincode.length !== 6
    ) {

        setOrderError(
            "Please enter a valid 6-digit pincode."
        );

        return;
    }


    try {

        setSendingOtp(true);

        setOrderError("");


        /*
        =========================================
        SEND ORDER OTP
        =========================================
        */

        await api.post(
            "/otp/order/send"
        );


        /*
        =========================================
        OPEN OTP MODAL
        =========================================
        */

        setShowConfirmModal(false);

        setOtp("");

        setShowOtpModal(true);


    } catch (error) {

        console.error(
            "SEND ORDER OTP ERROR:",
            error.response?.data ||
            error.message ||
            error
        );


        setOrderError(
            error.response
                ?.data
                ?.message ||
            "Unable to send OTP."
        );


    } finally {

        setSendingOtp(false);

    }

}
async function handleVerifyOtp() {

    /*
    =========================================
    VALIDATE OTP
    =========================================
    */

    if (
        otp.length !== 6
    ) {

        setOrderError(
            "Please enter the 6-digit OTP."
        );

        return;
    }


    try {

        setVerifyingOtp(true);

        setOrderError("");


        /*
        =========================================
        STEP 1
        VERIFY OTP
        =========================================
        */

        await api.post(
            "/otp/order/verify",
            {
                otp
            }
        );


        /*
        =========================================
        STEP 2
        CREATE ORDER
        =========================================
        */

        const response =
            await api.post(
                "/orders",
                {
                    deliveryAddress:
                        delivery.address,

                    deliveryCity:
                        delivery.city,

                    deliveryState:
                        delivery.state,

                    deliveryPincode:
                        delivery.pincode,

                    deliveryCharge:
                        0
                }
            );


        /*
        =========================================
        STEP 3
        CLOSE OTP MODAL
        =========================================
        */

        setShowOtpModal(false);

        setOtp("");

        setOrderError("");


        /*
        =========================================
        STEP 4
        REFRESH CART
        =========================================
        */

        await loadCart();


        /*
        =========================================
        STEP 5
        ORDER SUCCESS
        =========================================
        */

        const referenceNo =
            response.data?.order?.referenceNo;


        if (referenceNo) {

            navigate(
                `/order-success/${referenceNo}`
            );

        } else {

            navigate(
                "/profile/orders"
            );

        }


    } catch (error) {

        console.error(
            "VERIFY OTP / CREATE ORDER ERROR:",
            error.response?.data ||
            error.message ||
            error
        );


        setOrderError(
            error.response
                ?.data
                ?.message ||
            "Invalid OTP or unable to place the order."
        );


    } finally {

        setVerifyingOtp(false);

    }

}
    return (

        <div className="customer-products-page">


            <header className="customer-products-header">


                <div
                    className="customer-logo"
                    onClick={() =>
                        navigate(
                            "/customer/dashboard"
                        )
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
                        type="button"
                        onClick={() =>
                            navigate(
                                "/customer/dashboard"
                            )
                        }
                    >
                        Home
                    </button>


                    <button
                        type="button"
                        className="nav-active"
                    >
                        Products
                    </button>

                </nav>


                <div className="customer-header-actions">


                    {/* CART */}

                    <button
                        className="customer-cart-button"
                        type="button"
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
                            {cartCount}
                        </b>

                    </button>


                    {/* CONTINUE */}

                    <button
                        className="continue-button"
                        type="button"
                        onClick={
                            handleContinue
                        }
                    >
                        Continue
                    </button>

                </div>

            </header>


            <main className="customer-products-main">
                <section
                    className="customer-products-hero"
                >
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

                <section
                    className="customer-search-area"
                >

                    <div
                        className="customer-search"
                    >

                        <Search
                            size={19}
                        />

                        <input
                            type="text"
                            placeholder="Search soyabean, papad, spices..."
                            value={search}
                            onChange={event =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    {/* FILTER */}

                    <div
                        className="customer-filter-wrapper"
                    >

                        <button
                            type="button"
                            className={
                                "customer-filter-icon" +
                                (
                                    showFilter
                                        ? " active"
                                        : ""
                                )
                            }
                            onClick={() =>
                                setShowFilter(
                                    previous =>
                                        !previous
                                )
                            }
                        >

                            <SlidersHorizontal
                                size={18}
                            />

                        </button>


                        {showFilter && (

                            <div
                                className="customer-filter-dropdown"
                            >

                                <div
                                    className="filter-dropdown-header"
                                >

                                    <span>
                                        Filter by category
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowFilter(
                                                false
                                            )
                                        }
                                    >
                                        <X size={15} />
                                    </button>

                                </div>


                                <button
                                    type="button"
                                    className={
                                        !category
                                            ? "filter-option selected"
                                            : "filter-option"
                                    }
                                    onClick={() => {

                                        setCategory("");

                                        setShowFilter(
                                            false
                                        );

                                    }}
                                >
                                    All Products
                                </button>


                                {categories.map(
                                    item => (

                                        <button
                                            type="button"
                                            key={item}
                                            className={
                                                category === item
                                                    ? "filter-option selected"
                                                    : "filter-option"
                                            }
                                            onClick={() => {

                                                setCategory(
                                                    item
                                                );

                                                setShowFilter(
                                                    false
                                                );

                                            }}
                                        >

                                            <span>
                                                {item}
                                            </span>

                                            {category === item && (
                                                <Check
                                                    size={15}
                                                />
                                            )}

                                        </button>

                                    )
                                )}

                            </div>

                        )}

                    </div>

                </section>


                {/* SELECTED FILTER */}

                {category && (

                    <div className="selected-filter">

                        <span>
                            Category:
                            <strong>
                                {category}
                            </strong>
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setCategory("")
                            }
                        >
                            <X size={14} />
                        </button>

                    </div>

                )}

                {error && (

                    <div
                        className="customer-products-error"
                    >

                        {error}

                        <button
                            type="button"
                            onClick={
                                loadProducts
                            }
                        >
                            Try Again
                        </button>

                    </div>

                )}

                {loading ? (

                    <div
                        className="customer-products-loading"
                    >

                        <RefreshCw
                            size={22}
                            className="spin"
                        />

                        <span>
                            Loading products...
                        </span>

                    </div>

                ) : filteredProducts.length === 0 ? (

                    <div
                        className="customer-no-products"
                    >

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
                    <section
                        className="customer-product-grid"
                    >

                        {filteredProducts.map(
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


                                const isAdded =
                                    addedProductId ===
                                    product.id;
                                const cartItem =
                                    getCartItem(
                                        product.id
                                    );
                                const isInCart =
                                    Boolean(cartItem);

                                return (

                                    <article
                                        className="customer-product-card"
                                        key={
                                            product.id
                                        }
                                    >


                                        {/* IMAGE BOX */}

                                        <div
                                            className="customer-product-image"
                                        >

                                            <div
                                                className="product-image-box"
                                            >

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
                                                        className="default-product-icon"
                                                    />

                                                )}

                                            </div>


                                            {product.category && (

                                                <span>
                                                    {
                                                        product.category
                                                    }
                                                </span>

                                            )}

                                        </div>


                                        {/* CONTENT */}

                                        <div
                                            className="customer-product-content"
                                        >

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

                                                {
                                                    product.description?.length >
                                                    80 &&
                                                    "..."
                                                }
                                            </p>


                                            <div
                                                className="customer-product-price"
                                            >

                                                ₹
                                                {
                                                    Number(
                                                        product.price
                                                    ).toLocaleString(
                                                        "en-IN",
                                                        {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        }
                                                    )
                                                }

                                                <small>
                                                    /
                                                    {
                                                        product.unit
                                                    }
                                                </small>

                                            </div>


                                            <div
                                                className="customer-product-stock"
                                            >

                                                <span>
                                                    Available
                                                </span>

                                                <strong>
                                                    {
                                                        available
                                                    }{" "}
                                                    {
                                                        product.unit
                                                    }
                                                </strong>

                                            </div>


                                            {/* BUTTONS */}

                                            <div
                                                className="product-card-actions"
                                            >

                                                <button
                                                    type="button"
                                                    className="view-product-button"
                                                    onClick={() =>
                                                        openProduct(
                                                            product.id
                                                        )
                                                    }
                                                >
                                                    View Product
                                                </button>

<button
    type="button"
    className={
        isInCart || isAdded
            ? "add-cart-button added"
            : "add-cart-button"
    }
    disabled={
        cartLoading ||
        available <= 0 ||
        isInCart
    }
    onClick={() =>
        addToCart(product)
    }
>

    {isInCart || isAdded ? (
        <>

            In Cart
            {cartItem && (
                <span>
                    {" "}·{" "}
                    {Number(
                        cartItem.quantity
                    ).toLocaleString(
                        "en-IN"
                    )}{" "}
                    {product.unit}
                </span>
            )}
        </>

    ) : (

        <>
            

            Add to Cart
        </>

    )}

</button>

                                            </div>

                                        </div>

                                    </article>

                                );

                            }
                        )}

                    </section>

                )}

            </main>


            {showConfirmModal && (

                <div
                    className="checkout-modal-overlay"
                >

                    <div
                        className="checkout-modal"
                    >

                        <button
                            className="modal-close"
                            type="button"
                            onClick={() =>
                                setShowConfirmModal(
                                    false
                                )
                            }
                        >
                            ×
                        </button>


                        <p
                            className="modal-eyebrow"
                        >
                            ORDER CONFIRMATION
                        </p>


                        <h2>
                            Confirm your order
                        </h2>


                        <p
                            className="modal-description"
                        >
                            Review your cart and
                            provide delivery information.
                        </p>


                        <div
                            className="modal-summary"
                        >

                            <div>

                                <span>
                                    Items
                                </span>

                                <strong>
                                    {cartCount}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Total
                                </span>

                                <strong>
                                    ₹
                                    {cartTotal.toLocaleString(
                                        "en-IN",
                                        {
                                            minimumFractionDigits: 2
                                        }
                                    )}
                                </strong>

                            </div>

                        </div>


                        {/* DELIVERY */}

                        <div
                            className="delivery-form"
                        >

                            <input
                                type="text"
                                placeholder="Delivery Address"
                                value={
                                    delivery.address
                                }
                                onChange={e =>
                                    setDelivery({
                                        ...delivery,
                                        address:
                                            e.target.value
                                    })
                                }
                            />


                            <div
                                className="delivery-row"
                            >

                                <input
                                    type="text"
                                    placeholder="City"
                                    value={
                                        delivery.city
                                    }
                                    onChange={e =>
                                        setDelivery({
                                            ...delivery,
                                            city:
                                                e.target.value
                                        })
                                    }
                                />


                                <input
                                    type="text"
                                    placeholder="State"
                                    value={
                                        delivery.state
                                    }
                                    onChange={e =>
                                        setDelivery({
                                            ...delivery,
                                            state:
                                                e.target.value
                                        })
                                    }
                                />

                            </div>


                            <input
                                type="text"
                                placeholder="Pincode"
                                maxLength={6}
                                value={
                                    delivery.pincode
                                }
                                onChange={e =>
                                    setDelivery({
                                        ...delivery,
                                        pincode:
                                            e.target.value
                                            .replace(
                                                /\D/g,
                                                ""
                                            )
                                    })
                                }
                            />

                        </div>


                        {orderError && (

                            <div
                                className="checkout-error"
                            >
                                {orderError}
                            </div>

                        )}


                        <div
                            className="modal-actions"
                        >

                            <button
                                type="button"
                                className="modal-secondary"
                                onClick={() =>{
                                    setShowConfirmModal(
                                        false
                                    )
                                    navigate("/cart");
                                }}
                            >
                                Review Cart
                            </button>


                            <button
                                type="button"
                                className="modal-primary"
                                disabled={
                                    sendingOtp
                                }
                                onClick={
                                    handleConfirmOrder
                                }
                            >

                                {sendingOtp
                                    ? "Sending OTP..."
                                    : "Confirm & Continue"}

                            </button>

                        </div>

                    </div>

                </div>

            )}

            {showOtpModal && (

                <div
                    className="checkout-modal-overlay"
                >

                    <div
                        className="checkout-modal otp-modal"
                    >

                        <button
                            className="modal-close"
                            type="button"
                            onClick={() =>
                                setShowOtpModal(
                                    false
                                )
                            }
                        >
                            ×
                        </button>


                        <div
                            className="modal-icon"
                        >
                            @
                        </div>


                        <p
                            className="modal-eyebrow"
                        >
                            EMAIL VERIFICATION
                        </p>


                        <h2>
                            Verify your order
                        </h2>


                        <p
                            className="modal-description"
                        >
                            We have sent a verification
                            OTP to your registered email.
                        </p>


                        <input
                            className="otp-input"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp}
                            onChange={e =>
                                setOtp(
                                    e.target.value
                                        .replace(
                                            /\D/g,
                                            ""
                                        )
                                )
                            }
                            placeholder="Enter 6-digit OTP"
                        />


                        {orderError && (

                            <div
                                className="checkout-error"
                            >
                                {orderError}
                            </div>

                        )}


                        <button
                            type="button"
                            className="modal-primary otp-submit"
                            disabled={
                                verifyingOtp ||
                                otp.length !== 6
                            }
                            onClick={
                                handleVerifyOtp
                            }
                        >

                            {verifyingOtp
                                ? "Verifying..."
                                : "Verify & Place Order"}

                        </button>


                        <button
                            type="button"
                            className="otp-resend"
                            disabled={
                                sendingOtp
                            }
                            onClick={
                                handleConfirmOrder
                            }
                        >
                            Resend OTP
                        </button>

                    </div>

                </div>

            )}

        </div>

    );

}


export default CustomerProducts;