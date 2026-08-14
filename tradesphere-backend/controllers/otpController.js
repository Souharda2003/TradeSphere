const crypto = require("crypto");

const {pool} =
    require("../config/db");

const {
    sendOrderOTP
} = require(
    "../services/mailService"
);


/*
=========================================
GENERATE RANDOM OTP
=========================================
*/

function generateOTP() {

    return String(
        crypto.randomInt(
            100000,
            1000000
        )
    );
}


/*
=========================================
HASH OTP
=========================================
*/

function hashOTP(
    otp
) {

    return crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");
}


async function sendOrderOTPCode(
    req,
    res
) {

    try {

        /* =================================
           AUTHENTICATED USER
        ================================= */

        const userId =
            req.user?.userId;


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required."

            });

        }


        /* =================================
           GET CUSTOMER
        ================================= */

        const [
            users
        ] = await pool.execute(

            `
            SELECT

                id,

                full_name AS name,

                email,

                role

            FROM users

            WHERE id = ?

            LIMIT 1
            `,

            [
                userId
            ]

        );


        /* =================================
           USER NOT FOUND
        ================================= */

        if (
            users.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found."

            });

        }


        const user =
            users[0];


        /* =================================
           CUSTOMER CHECK
        ================================= */

        if (
            user.role !==
            "CUSTOMER"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Only customers can place orders."

            });

        }


        /* =================================
           EMAIL CHECK
        ================================= */

        if (
            !user.email ||
            !String(
                user.email
            ).trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please add an email address to your profile."

            });

        }


        const customerEmail =
            String(
                user.email
            ).trim();


        const customerName =
            user.full_name ||
            "Customer";


        /* =================================
           DELETE OLD OTP
        ================================= */

        await pool.execute(

            `
            DELETE FROM email_otps

            WHERE user_id = ?

            AND purpose =
                'ORDER_VERIFICATION'
            `,

            [
                userId
            ]

        );


        /* =================================
           GENERATE OTP
        ================================= */

        const otp =
            generateOTP();


        const otpHash =
            hashOTP(
                otp
            );


        const expiresAt =
            new Date(
                Date.now() +
                5 * 60 * 1000
            );


        /* =================================
           SAVE OTP
        ================================= */

        await pool.execute(

            `
            INSERT INTO email_otps
            (
                user_id,

                email,

                otp_hash,

                purpose,

                expires_at,

                verified,

                attempts
            )

            VALUES
            (
                ?,
                ?,
                ?,
                'ORDER_VERIFICATION',
                ?,
                FALSE,
                0
            )
            `,

            [
                userId,

                customerEmail,

                otpHash,

                expiresAt
            ]

        );


        /* =================================
           SEND EMAIL
        ================================= */

        await sendOrderOTP({

            email:
                customerEmail,

            customerName:
                customerName,

            otp

        });


        /* =================================
           SUCCESS
        ================================= */

        return res.json({

            success: true,

            message:
                "OTP sent to your email.",

            email:
                maskEmail(
                    customerEmail
                )

        });


    } catch (error) {

        console.error(
            "================================="
        );

        console.error(
            "SEND ORDER OTP ERROR"
        );

        console.error(
            "MESSAGE:",
            error.message
        );

        console.error(
            "STACK:",
            error.stack
        );

        console.error(
            "================================="
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to send OTP."

        });

    }

}
function maskEmail(
    email
) {

    const [
        name,
        domain
    ] =
        email.split("@");


    if (
        name.length <= 2
    ) {

        return (
            name[0] +
            "***@" +
            domain
        );
    }


    return (
        name.substring(
            0,
            2
        ) +
        "***@" +
        domain
    );
}


async function verifyOrderOTP(
    req,
    res
) {

    try {

        /* =================================
           AUTHENTICATED USER
        ================================= */

        const userId =
            req.user?.userId;


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required."

            });

        }


        /* =================================
           OTP
        ================================= */

        const {
            otp
        } = req.body;


        if (
            !otp ||
            !/^\d{6}$/.test(
                String(otp)
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Enter a valid 6-digit OTP."

            });

        }


        /* =================================
           GET LATEST OTP
        ================================= */

        const [
            records
        ] = await pool.execute(

            `
            SELECT *

            FROM email_otps

            WHERE user_id = ?

            AND purpose =
                'ORDER_VERIFICATION'

            AND verified = FALSE

            ORDER BY created_at DESC

            LIMIT 1
            `,

            [
                userId
            ]

        );


        /* =================================
           OTP NOT FOUND
        ================================= */

        if (
            records.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "OTP not found. Please request a new OTP."

            });

        }


        const record =
            records[0];


        /* =================================
           EXPIRY
        ================================= */

        if (
            new Date(
                record.expires_at
            ) < new Date()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "OTP expired. Please request a new OTP."

            });

        }


        /* =================================
           ATTEMPT LIMIT
        ================================= */

        const attempts =
            Number(
                record.attempts || 0
            );


        if (
            attempts >= 5
        ) {

            return res.status(429).json({

                success: false,

                message:
                    "Too many incorrect attempts. Please request a new OTP."

            });

        }


        /* =================================
           HASH INPUT
        ================================= */

        const inputHash =
            hashOTP(
                String(otp)
            );


        /* =================================
           WRONG OTP
        ================================= */

        if (
            inputHash !==
            record.otp_hash
        ) {

            await pool.execute(

                `
                UPDATE email_otps

                SET attempts =
                    attempts + 1

                WHERE id = ?
                `,

                [
                    record.id
                ]

            );


            return res.status(400).json({

                success: false,

                message:
                    "Incorrect OTP."

            });

        }


        /* =================================
           VERIFIED
        ================================= */

        await pool.execute(

            `
            UPDATE email_otps

            SET verified = TRUE

            WHERE id = ?
            `,

            [
                record.id
            ]

        );


        return res.json({

            success: true,

            message:
                "Email verified successfully."

        });


    } catch (error) {

        console.error(
            "================================="
        );

        console.error(
            "VERIFY ORDER OTP ERROR"
        );

        console.error(
            "MESSAGE:",
            error.message
        );

        console.error(
            "STACK:",
            error.stack
        );

        console.error(
            "================================="
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to verify OTP."

        });

    }

}

module.exports = {

    sendOrderOTPCode,

    verifyOrderOTP

};