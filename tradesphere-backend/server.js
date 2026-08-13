const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

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
dotenv.config();


const app =
    express();


/* =====================================
   CORS
===================================== */

app.use(
    cors({

        origin:
            "http://localhost:5173",

        credentials: true

    })
);


/* =====================================
   BODY PARSER
===================================== */

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


/* =====================================
   HEALTH
===================================== */

app.get(
    "/api/health",

    (req, res) => {

        res.json({

            success: true,

            message:
                "TradeSphere Node.js Backend is running"

        });

    }
);


/* =====================================
   AUTH
===================================== */

app.use(
    "/api/auth",
    authRoutes
);


/* =====================================
   USER
===================================== */

app.use(
    "/api/user",
    userRoutes
);


/* =====================================
   CUSTOMER
===================================== */

app.use(
    "/api/customer",
    customerRoutes
);


/* =====================================
   SELLER
===================================== */

app.use(
    "/api/seller",
    sellerRoutes
);

app.use(
    "/api/products",
    productRoutes
);
app.use(
    "/uploads",
    express.static(
        path.join(
            __dirname,
            "uploads"
        )
    )
);
app.use(
    "/api/cart",
    cartRoutes
);
app.use(
    "/api/otp",
    otpRoutes
);

app.use(
    "/api/orders",
    orderRoutes
);

    
/* =====================================
   404
===================================== */

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API endpoint not found"

        });

    }
);

app.use(
    (error, req, res, next) => {

        console.error(error);


        res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }
);

const PORT =
    process.env.PORT || 5000;


async function startServer() {

    try {

        await testDatabase();


        app.listen(
            PORT,

            () => {

                console.log(
                    "================================="
                );

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
                    "================================="
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