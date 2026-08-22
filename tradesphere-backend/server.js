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
    const invoiceRoutes =
    require("./routes/invoiceRoutes");
    const orderReturnRoutes =
    require(
        "./routes/orderReturnRoutes"
    );


    const sellerOrderRoutes =
    require("./routes/sellerOrderRoutes");   
    const notificationRoutes =
        require("./routes/notificationRoutes");
const app =
    express();


app.use(
    cors({

        origin:
            "http://localhost:5173",

        credentials:
            true

    })
);
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

app.use(
    "/uploads",
    express.static(
        path.join(
            __dirname,
            "uploads"
        )
    )
);

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

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/user",
    userRoutes
);
app.use(
    "/api/customer",
    customerRoutes
);


app.use(
    "/api/seller",
    sellerRoutes
);

app.use(
    "/api/products",
    productRoutes
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
app.use(
    "/api/orders",
    invoiceRoutes
);
app.use(
    "/api/order-returns",
    orderReturnRoutes
);
app.use(
    "/api/orders/seller",
    sellerOrderRoutes
);
app.use(
    "/api/notifications",
    notificationRoutes
);

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

const PORT =
    process.env.PORT ||
    5000;

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