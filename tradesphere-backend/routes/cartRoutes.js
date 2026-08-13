const express = require("express");

const router =
    express.Router();


const authenticateToken =
    require("../middleware/authMiddleware");


const {

    getCart,

    addToCart,

    updateCartItem,

    removeCartItem,

    clearCart

} = require(
    "../controllers/cartController"
);


/*
=========================================
ALL CART ROUTES REQUIRE LOGIN
=========================================
*/

router.use(
    authenticateToken
);


/*
=========================================
GET CART
=========================================
*/

router.get(
    "/",
    getCart
);


/*
=========================================
ADD TO CART
=========================================
*/

router.post(
    "/",
    addToCart
);


/*
=========================================
UPDATE CART ITEM
=========================================
*/

router.put(
    "/:itemId",
    updateCartItem
);


/*
=========================================
REMOVE CART ITEM
=========================================
*/

router.delete(
    "/:itemId",
    removeCartItem
);


/*
=========================================
CLEAR CART
=========================================
*/

router.delete(
    "/",
    clearCart
);


module.exports = router;