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

router.get(
    "/",
    authenticateToken,
    getCart
);


router.post(
    "/",
    authenticateToken,
    addToCart
);

router.put(
    "/:itemId",
    authenticateToken,
    updateCartItem
);

router.delete(
    "/:itemId",
    authenticateToken,
    removeCartItem
);


router.delete(
    "/",
    authenticateToken,
    clearCart
);


module.exports = router;