const {
    BrevoClient
} = require("@getbrevo/brevo");


/* =========================================
   BREVO CLIENT
========================================= */

const brevo =
    new BrevoClient({

        apiKey:
            process.env.BREVO_API_KEY,

        maxRetries: 2

    });


/* =========================================
   GENERIC SEND EMAIL
========================================= */

async function sendEmail({

    to,

    toName = "",

    subject,

    htmlContent,

    textContent = ""

}) {

    try {

        /* ================================
           ENV CHECK
        ================================= */

        if (
            !process.env.BREVO_API_KEY
        ) {

            throw new Error(
                "BREVO_API_KEY is missing from .env"
            );

        }


        if (
            !process.env.EMAIL_FROM
        ) {

            throw new Error(
                "EMAIL_FROM is missing from .env"
            );

        }


        if (
            !to
        ) {

            throw new Error(
                "Recipient email is missing."
            );

        }


        console.log(
            "================================="
        );

        console.log(
            "BREVO EMAIL"
        );

        console.log(
            "From:",
            process.env.EMAIL_FROM
        );

        console.log(
            "To:",
            to
        );

        console.log(
            "Subject:",
            subject
        );


        /* ================================
           SEND EMAIL
        ================================= */

        const response =
            await brevo
                .transactionalEmails
                .sendTransacEmail({

                    sender: {

                        email:
                            process.env.EMAIL_FROM,

                        name:
                            "TradeSphere"

                    },

                    to: [

                        {

                            email:
                                to,

                            name:
                                toName || "Customer"

                        }

                    ],

                    subject:
                        subject,

                    htmlContent:
                        htmlContent,

                    textContent:
                        textContent

                });


        console.log(
            "BREVO EMAIL SENT SUCCESSFULLY"
        );

        console.log(
            response
        );

        console.log(
            "================================="
        );


        return response;


    } catch (error) {

        console.error(
            "================================="
        );

        console.error(
            "BREVO EMAIL ERROR"
        );

        console.error(
            "MESSAGE:",
            error.message
        );

        console.error(
            "STATUS:",
            error.statusCode ||
            error.response?.status
        );

        console.error(
            "BODY:",
            error.response?.data ||
            error.body ||
            error
        );

        console.error(
            "================================="
        );


        throw error;

    }

}


/* =========================================
   SEND ORDER OTP
========================================= */

async function sendOrderOTP({

    email,

    customerName,

    otp

}) {

    /* ================================
       VALIDATION
    ================================= */

    if (
        !email
    ) {

        throw new Error(
            "Customer email is missing."
        );

    }


    if (
        !otp
    ) {

        throw new Error(
            "OTP is missing."
        );

    }


    const name =
        customerName ||
        "Customer";


    /* ================================
       HTML EMAIL
    ================================= */

    const htmlContent = `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
/>

<title>
    TradeSphere OTP
</title>

</head>


<body
style="
margin:0;
padding:0;
background:#f8fafc;
font-family:Arial,Helvetica,sans-serif;
"
>


<div
style="
padding:40px 15px;
"
>


<div
style="
max-width:540px;
margin:auto;
background:#ffffff;
border:1px solid #e2e8f0;
border-radius:20px;
padding:40px;
"
>


<div
style="
font-size:25px;
font-weight:900;
color:#0f172a;
"
>

TradeSphere

</div>


<div
style="
margin-top:5px;
color:#64748b;
font-size:12px;
"
>

Export & Import Marketplace

</div>


<div
style="
height:1px;
background:#e2e8f0;
margin:25px 0;
"
>
</div>


<h2
style="
margin:0;
color:#0f172a;
font-size:22px;
"
>

Verify your order

</h2>


<p
style="
color:#475569;
line-height:1.7;
font-size:14px;
"
>

Hello
<strong>
${name}
</strong>,

</p>


<p
style="
color:#64748b;
line-height:1.7;
font-size:13px;
"
>

We received a request to verify
your TradeSphere order.

Enter the following OTP on
the checkout page.

</p>


<div
style="
margin:30px 0;
padding:20px;
background:#eff6ff;
border:1px solid #dbeafe;
border-radius:14px;
text-align:center;
"
>


<div
style="
color:#64748b;
font-size:10px;
font-weight:700;
letter-spacing:2px;
"
>

VERIFICATION CODE

</div>


<div
style="
margin-top:10px;
color:#1d4ed8;
font-size:34px;
font-weight:900;
letter-spacing:8px;
"
>

${otp}

</div>


</div>


<p
style="
color:#64748b;
font-size:12px;
"
>

This OTP is valid for
<strong>
5 minutes
</strong>.

</p>


<p
style="
color:#94a3b8;
font-size:11px;
line-height:1.6;
"
>

If you did not request this
verification code, you can
safely ignore this email.

</p>


<div
style="
margin-top:30px;
color:#cbd5e1;
font-size:10px;
text-align:center;
"
>

© TradeSphere

</div>


</div>

</div>

</body>

</html>

`;


    /* ================================
       TEXT EMAIL
    ================================= */

    const textContent =

`TradeSphere Order Verification

Hello ${name},

Your order verification OTP is:

${otp}

This OTP is valid for 5 minutes.

If you did not request this OTP,
please ignore this email.`;


    /* ================================
       SEND
    ================================= */

    return sendEmail({

        to:
            email,

        toName:
            name,

        subject:
            "TradeSphere - Order Verification OTP",

        htmlContent:
            htmlContent,

        textContent:
            textContent

    });

}


/* =========================================
   EXPORTS
========================================= */

module.exports = {

    sendEmail,

    sendOrderOTP

};