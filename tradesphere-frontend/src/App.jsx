import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Home
    from "./pages/Home";

import Login
    from "./pages/auth/Login";

import Register
    from "./pages/auth/Register";

import ChooseAccount
    from "./pages/auth/ChooseAccount";

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
import OrderDetails from "./pages/customer/OrderDetails";
import SellerDashboard
    from "./pages/seller/SellerDashboard";

import AddProduct
    from "./pages/seller/AddProduct";

import SellerProducts
    from "./pages/seller/SellerProducts";

import ManageProduct
    from "./pages/seller/ManageProduct";


function App() {

    return (

        <BrowserRouter>

            <Routes>

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
                <Route 
                path= "/products"
                element={
                    <CustomerProducts />
                }
                />
                <Route
    path="/products/:id"
    element={
        <ProductDetails />
    }
/>
                <Route
                    path="/cart"
                    element={
                        <Cart />
                    }
                />


                {/* CUSTOMER CHECKOUT */}

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

                    <Route
    path="/profile/orders/:referenceNo"
    element={<OrderDetails />}
/>
                {/* =================================
                    SELLER
                ================================= */}

                <Route
                    path="/seller"
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


                {/* SELLER PRODUCTS */}

                <Route
                    path="/seller/products"
                    element={
                        <SellerProducts />
                    }
                />


                {/* MANAGE PRODUCT */}

                <Route
                    path="/seller/products/:id"
                    element={
                        <ManageProduct />
                    }
                />


            </Routes>

        </BrowserRouter>

    );

}


export default App;