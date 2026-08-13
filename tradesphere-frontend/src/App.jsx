import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ChooseAccount from "./pages/auth/ChooseAccount";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import AddProduct from "./pages/seller/AddProduct";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerProducts from "./pages/seller/SellerProducts";
import ManageProduct from "./pages/seller/ManageProduct";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import OrderSuccess from "./pages/customer/OrderSuccess";
function App() {

    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/choose-account"
                    element={<ChooseAccount />}
                />
<Route
    path="/customer"
    element={<CustomerDashboard />}
/>

<Route
    path="/seller"
    element={<SellerDashboard />}
/>
<Route
    path="/seller/products/add"
    element={
        <AddProduct />
    }
/>
<Route
    path="/seller/products"
    element={
        <SellerProducts />
    }
/>
<Route
    path="/seller/products/:id"
    element={
        <ManageProduct />
    }
/>
<Route
    path="/cart"
    element={
        <Cart />
    }
/><Route
    path="/checkout"
    element={
        <Checkout />
    }
/>
<Route
    path="/order-success/:referenceNo"
    element={
        <OrderSuccess />
    }
/>
            </Routes>

        </BrowserRouter>
    );
}

export default App;


// import {
//     BrowserRouter,
//     Routes,
//     Route
// } from "react-router-dom";


// import Home
//     from "./pages/Home";

// import Login
//     from "./pages/auth/Login";

// import Register
//     from "./pages/auth/Register";

// import ChooseAccount
//     from "./pages/auth/ChooseAccount";

// import CustomerDashboard
//     from "./pages/customer/CustomerDashboard";

// import SellerDashboard
//     from "./pages/seller/SellerDashboard";


// function App() {

//     return (

//         <BrowserRouter>

//             <Routes>

//                 {/* HOME */}

//                 <Route
//                     path="/"
//                     element={<Home />}
//                 />


//                 {/* AUTH */}

//                 <Route
//                     path="/login"
//                     element={<Login />}
//                 />

//                 <Route
//                     path="/register"
//                     element={<Register />}
//                 />

//                 <Route
//                     path="/choose-account"
//                     element={
//                         <ChooseAccount />
//                     }
//                 />


//                 {/* CUSTOMER */}

//                 <Route
//                     path="/customer"
//                     element={
//                         <CustomerDashboard />
//                     }
//                 />


//                 {/* SELLER */}

//                 <Route
//                     path="/seller"
//                     element={
//                         <SellerDashboard />
//                     }
//                 />

//             </Routes>

//         </BrowserRouter>
//     );
// }


// export default App;


