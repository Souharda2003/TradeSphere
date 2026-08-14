require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {
    testDatabase
} = require("./config/db");


const authRoutes =
    require("./routes/authRoutes");

const userRoutes =
    require("./routes/userRoutes");

const customerRoutes =
    require("./routes/customerRoutes");

const sellerRoutes =
    require("./routes/sellerRoutes");

const productRoutes =
    require("./routes/productRoutes");

const path =
    require("path");

const cartRoutes =
    require("./routes/cartRoutes");
const otpRoutes =
    require("./routes/otpRoutes");
    
const orderRoutes =
    require("./routes/orderRoutes");
const notificationRoutes =
        require("./routes/notificationRoutes");
const app =
    express();


/*
=========================================
CORS
=========================================
*/

app.use(
    cors({

        origin:
            "http://localhost:5173",

        credentials:
            true

    })
);


/*
=========================================
BODY PARSER
=========================================
*/

app.use(
    express.json({
        limit: "10mb"
    })
);


app.use(
    express.urlencoded({
        extended: true
    })
);


/*
=========================================
STATIC UPLOADS
=========================================
*/

app.use(
    "/uploads",
    express.static(
        path.join(
            __dirname,
            "uploads"
        )
    )
);


/*
=========================================
HEALTH CHECK
=========================================
*/

app.get(
    "/api/health",

    (req, res) => {

        res.json({

            success:
                true,

            message:
                "TradeSphere Node.js Backend is running"

        });

    }
);


/*
=========================================
AUTH
=========================================
*/

app.use(
    "/api/auth",
    authRoutes
);


/*
=========================================
USER
=========================================
*/

app.use(
    "/api/user",
    userRoutes
);


/*
=========================================
CUSTOMER
=========================================
*/

app.use(
    "/api/customer",
    customerRoutes
);


/*
=========================================
SELLER
=========================================
*/

app.use(
    "/api/seller",
    sellerRoutes
);


/*
=========================================
PRODUCTS
=========================================
*/

app.use(
    "/api/products",
    productRoutes
);


/*
=========================================
CART
=========================================
*/

app.use(
    "/api/cart",
    cartRoutes
);
app.use(
    "/api/otp",
    otpRoutes
);


/*
=========================================
ORDERS
=========================================
*/

app.use(
    "/api/orders",
    orderRoutes
);
app.use(
    "/api/notifications",
    notificationRoutes
);


/*
=========================================
404 HANDLER
=========================================
*/

app.use(
    (req, res) => {

        console.log(
            "404 API:",
            req.method,
            req.originalUrl
        );


        res.status(404).json({

            success:
                false,

            message:
                "API endpoint not found",

            path:
                req.originalUrl

        });

    }
);


/*
=========================================
GLOBAL ERROR HANDLER
=========================================
*/

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "GLOBAL SERVER ERROR:",
            error
        );


        res.status(500).json({

            success:
                false,

            message:
                error.message ||
                "Internal server error"

        });

    }
);


/*
=========================================
PORT
=========================================
*/

const PORT =
    process.env.PORT ||
    5000;


/*
=========================================
START SERVER
=========================================
*/

async function startServer() {

    try {

        await testDatabase();


        app.listen(

            PORT,

            () => {


                console.log(
                    "TradeSphere Backend"
                );

                console.log(
                    `Server: http://localhost:${PORT}`
                );

                console.log(
                    `Health: http://localhost:${PORT}/api/health`
                );

                console.log(
                    `Cart: http://localhost:${PORT}/api/cart`
                );


            }

        );

    } catch (error) {

        console.error(
            "SERVER START ERROR:",
            error
        );

        process.exit(1);

    }

}


startServer();