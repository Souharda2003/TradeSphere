const express =
    require("express");


const router =
    express.Router();


const authenticateToken =
    require("../middleware/authMiddleware");


const {

    createReturnRequest,

    getCustomerReturnRequest,

    getSellerReturnRequests,

    askCustomerReturnReason,

    acceptReturn,

    rejectReturn

} = require(
    "../controllers/orderReturnController"
);


/*
==================================================
CUSTOMER
==================================================
*/


/*
POST

/api/order-returns/:referenceNo/return

Customer submits return request
*/

router.post(

    "/:referenceNo/return",

    authenticateToken,

    createReturnRequest

);


/*
GET

/api/order-returns/:referenceNo/return

Customer gets return status
*/

router.get(

    "/:referenceNo/return",

    authenticateToken,

    getCustomerReturnRequest

);


/*
==================================================
SELLER
==================================================
*/


/*
GET

/api/order-returns/seller/all

Seller gets all return requests
*/

router.get(

    "/seller/all",

    authenticateToken,

    getSellerReturnRequests

);


/*
POST

/api/order-returns/seller/:returnId/ask-reason

Seller asks customer for more details
*/

router.post(

    "/seller/:returnId/ask-reason",

    authenticateToken,

    askCustomerReturnReason

);


/*
PATCH

/api/order-returns/seller/:returnId/accept

Seller accepts return
*/

router.patch(

    "/seller/:returnId/accept",

    authenticateToken,

    acceptReturn

);


/*
PATCH

/api/order-returns/seller/:returnId/reject

Seller rejects return
*/

router.patch(

    "/seller/:returnId/reject",

    authenticateToken,

    rejectReturn

);


module.exports =
    router;