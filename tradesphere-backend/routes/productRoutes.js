const express = require("express");

const router =
    express.Router();

const authenticateToken =
    require("../middleware/authMiddleware");

const requireRole =
    require("../middleware/roleMiddleware");

const upload =
    require("../middleware/uploadMiddleware");

const {
    createProduct,
    getSellerProducts,
    getSellerProduct,
    updateStock,
    getPublicProducts,
    getPublicProduct,
    updateSellerProduct,
    deleteSellerProduct
} = require("../controllers/productController");


router.get(
    "/",
    getPublicProducts
);

router.post(
    "/",
    authenticateToken,
    requireRole("SELLER"),
    upload.array("images", 6),
    createProduct
);


router.get(
    "/seller",
    authenticateToken,
    requireRole("SELLER"),
    getSellerProducts
);


router.get(
    "/seller/:id",
    authenticateToken,
    requireRole("SELLER"),
    getSellerProduct
);


router.put(
    "/seller/:id",
    authenticateToken,
    requireRole("SELLER"),
    updateSellerProduct
);
router.delete(
    "/seller/:id",
    authenticateToken,
    requireRole("SELLER"),
    deleteSellerProduct
);
router.patch(
    "/seller/:id/stock",
    authenticateToken,
    requireRole("SELLER"),
    updateStock
);
router.get(
    "/:id",
    getPublicProduct
);


module.exports = router;