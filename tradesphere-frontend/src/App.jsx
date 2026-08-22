import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";


// ==========================================
// PUBLIC PAGES
// ==========================================

import Home
    from "./pages/Home";

import Login
    from "./pages/auth/Login";

import Register
    from "./pages/auth/Register";

import ChooseAccount
    from "./pages/auth/ChooseAccount";


// ==========================================
// CUSTOMER PAGES
// ==========================================

import CustomerDashboard
    from "./pages/customer/CustomerDashboard";

import CustomerProducts
    from "./pages/customer/CustomerProducts";

import ProductDetails
    from "./pages/customer/ProductDetails";

import Cart
    from "./pages/customer/Cart";

import Checkout
    from "./pages/customer/Checkout";

import OrderSuccess
    from "./pages/customer/OrderSuccess";

import Profile
    from "./pages/customer/Profile";

import MyOrders
    from "./pages/customer/MyOrders";

import OrderDetails
    from "./pages/customer/OrderDetails";


// ==========================================
// SELLER PAGES
// ==========================================

import SellerDashboard
    from "./pages/seller/SellerDashboard";

import AddProduct
    from "./pages/seller/AddProduct";

import SellerOrders
    from "./pages/seller/SellerOrders";

import ManageProducts
    from "./pages/seller/ManageProducts";


function App() {

    return (

        <BrowserRouter>

            <Routes>


                {/* =================================
                    PUBLIC
                ================================= */}

                <Route
                    path="/"
                    element={
                        <Home />
                    }
                />


                <Route
                    path="/login"
                    element={
                        <Login />
                    }
                />


                <Route
                    path="/register"
                    element={
                        <Register />
                    }
                />


                <Route
                    path="/choose-account"
                    element={
                        <ChooseAccount />
                    }
                />



                {/* =================================
                    CUSTOMER
                ================================= */}

                <Route
                    path="/customer"
                    element={
                        <CustomerDashboard />
                    }
                />


                <Route
                    path="/customer/dashboard"
                    element={
                        <CustomerDashboard />
                    }
                />


                {/* CUSTOMER PRODUCTS */}

                <Route
                    path="/products"
                    element={
                        <CustomerProducts />
                    }
                />


                {/* PRODUCT DETAILS */}

                <Route
                    path="/products/:id"
                    element={
                        <ProductDetails />
                    }
                />


                {/* CART */}

                <Route
                    path="/cart"
                    element={
                        <Cart />
                    }
                />


                {/* CHECKOUT */}

                <Route
                    path="/checkout"
                    element={
                        <Checkout />
                    }
                />


                {/* ORDER SUCCESS */}

                <Route
                    path="/order-success/:referenceNo"
                    element={
                        <OrderSuccess />
                    }
                />


                {/* PROFILE */}

                <Route
                    path="/profile"
                    element={
                        <Profile />
                    }
                />


                {/* CUSTOMER ORDERS */}

                <Route
                    path="/profile/orders"
                    element={
                        <MyOrders />
                    }
                />


                {/* CUSTOMER ORDER DETAILS */}

                <Route
                    path="/profile/orders/:referenceNo"
                    element={
                        <OrderDetails />
                    }
                />



                {/* =================================
                    SELLER
                ================================= */}


                {/* SELLER DASHBOARD */}

                <Route
                    path="/seller"
                    element={
                        <SellerDashboard />
                    }
                />


                {/* SELLER DASHBOARD - OPTIONAL
                    If you want /seller/dashboard
                    to also work
                */}

                <Route
                    path="/seller/dashboard"
                    element={
                        <SellerDashboard />
                    }
                />


                {/* ADD PRODUCT */}

                <Route
                    path="/seller/products/add"
                    element={
                        <AddProduct />
                    }
                />


                {/* SELLER ORDERS */}

                <Route
                    path="/seller/orders"
                    element={
                        <SellerOrders />
                    }
                />


                {/* MANAGE PRODUCTS */}

                <Route
                    path="/seller/products"
                    element={
                        <ManageProducts />
                    }
                />


            </Routes>

        </BrowserRouter>

    );

}
export default App;