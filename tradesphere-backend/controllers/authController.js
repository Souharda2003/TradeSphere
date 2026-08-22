const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
    pool
} = require("../config/db");


// =====================================================
// GENERATE JWT
// =====================================================

function generateToken(user) {

    return jwt.sign(

        {
            userId: user.id,

            role: user.role,

            phone: user.phone
        },

        process.env.JWT_SECRET,

        {
            expiresIn:
                process.env.JWT_EXPIRES_IN ||
                "1d"
        }

    );
}


// =====================================================
// REGISTER
// =====================================================

async function register(req, res) {

    try {

        const {
            fullName,
            email,
            phone,
            password,
            role,
            gender,
            businessName,
            address,
            country
        } = req.body;


        // =================================================
        // NORMALIZE DATA
        // =================================================

        const normalizedFullName =
            String(fullName || "")
                .trim();


        const normalizedEmail =
            String(email || "")
                .trim()
                .toLowerCase();


        const normalizedPhone =
            String(phone || "")
                .trim();


        const normalizedRole =
            String(role || "")
                .trim()
                .toUpperCase();


        const normalizedGender =
            gender
                ? String(gender)
                    .trim()
                    .toUpperCase()
                : null;


        const normalizedBusinessName =
            String(businessName || "")
                .trim();


        const normalizedAddress =
            String(address || "")
                .trim();


        const normalizedCountry =
            String(country || "India")
                .trim();


        // =================================================
        // REQUIRED FIELD VALIDATION
        // =================================================

        if (
            !normalizedFullName ||
            !normalizedEmail ||
            !normalizedPhone ||
            !password ||
            !normalizedRole
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Required fields are missing"

            });

        }


        // =================================================
        // ROLE VALIDATION
        // =================================================

        if (
            ![
                "CUSTOMER",
                "SELLER"
            ].includes(
                normalizedRole
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid account type"

            });

        }


        // =================================================
        // GENDER VALIDATION
        // =================================================

        if (
            ![
                "MALE",
                "FEMALE"
            ].includes(
                normalizedGender
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please select MALE or FEMALE"

            });

        }


        // =================================================
        // PHONE VALIDATION
        // =================================================

        if (
            !/^\d{10}$/.test(
                normalizedPhone
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Phone number must contain exactly 10 digits"

            });

        }


        // =================================================
        // EMAIL VALIDATION
        // =================================================

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(
                    normalizedEmail
                )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid email address"

            });

        }


        // =================================================
        // PASSWORD VALIDATION
        // =================================================

        if (
            password.length < 8
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain at least 8 characters"

            });

        }


        // =================================================
        // SELLER BUSINESS VALIDATION
        // =================================================

        if (
            normalizedRole === "SELLER" &&
            !normalizedBusinessName
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Business name is required for seller account"

            });

        }


        // =================================================
        // CHECK PHONE + ROLE
        //
        // SAME PHONE IS ALLOWED FOR:
        //
        // 9876543210 + CUSTOMER
        // 9876543210 + SELLER
        //
        // BUT NOT:
        //
        // 9876543210 + CUSTOMER
        // 9876543210 + CUSTOMER
        // =================================================

        const [
            phoneUsers
        ] = await pool.execute(

            `
            SELECT
                id
            FROM users
            WHERE phone = ?
            AND role = ?
            LIMIT 1
            `,

            [
                normalizedPhone,
                normalizedRole
            ]

        );


        if (
            phoneUsers.length > 0
        ) {

            return res.status(409).json({

                success: false,

                message:
                    `A ${normalizedRole.toLowerCase()} account already exists with this phone number`

            });

        }

        const [
            emailUsers
        ] = await pool.execute(

            `
            SELECT
                id
            FROM users
            WHERE email = ?
            AND role = ?
            LIMIT 1
            `,

            [
                normalizedEmail,
                normalizedRole
            ]

        );


        if (
            emailUsers.length > 0
        ) {

            return res.status(409).json({

                success: false,

                message:
                    `This email is already registered as ${normalizedRole.toLowerCase()}.`

            });

        }


        // =================================================
        // HASH PASSWORD
        // =================================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                12
            );


        // =================================================
        // INSERT USER
        // =================================================

        const [
            result
        ] = await pool.execute(

            `
            INSERT INTO users
            (
                full_name,
                email,
                phone,
                password,
                role,
                gender,
                business_name,
                address,
                country,
                active
            )

            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,

            [
                normalizedFullName,

                normalizedEmail,

                normalizedPhone,

                hashedPassword,

                normalizedRole,

                normalizedGender,

                normalizedRole === "SELLER"
                    ? normalizedBusinessName
                    : null,

                normalizedAddress || null,

                normalizedCountry || "India",

                1
            ]

        );


        console.log(
            "USER CREATED:",
            result.insertId
        );


        // =================================================
        // SUCCESS
        // =================================================

        return res.status(201).json({

            success: true,

            message:
                "Account created successfully",

            userId:
                result.insertId

        });


    } catch (error) {

        // =================================================
        // DATABASE ERROR
        // =================================================

        console.error(
            "===================================="
        );

        console.error(
            "REGISTER DATABASE ERROR"
        );

        console.error(
            "Code:",
            error.code
        );

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "SQL Message:",
            error.sqlMessage
        );

 console.error(
        "SQL:",
        error.sql
    );


    return res.status(500).json({

        success: false,

        message:
            "Database registration error",

        errorCode:
            error.code,

        errorMessage:
            error.sqlMessage ||
            error.message

    });

    }
}
async function login(req, res) {

    try {

        const {
            phone,
            password
        } = req.body;


        // =================================================
        // VALIDATION
        // =================================================

        if (
            !phone ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Phone and password are required"

            });

        }


        const normalizedPhone =
            String(phone)
                .trim();


        // =================================================
        // FIND ALL ACCOUNTS WITH PHONE
        // =================================================

        const [
            users
        ] = await pool.execute(

            `
            SELECT *
            FROM users
            WHERE phone = ?
            AND active = 1
            ORDER BY id ASC
            `,

            [
                normalizedPhone
            ]

        );


        if (
            users.length === 0
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid phone number or password"

            });

        }


        // =================================================
        // CHECK PASSWORD
        // =================================================

        const validUsers = [];


        for (
            const user of users
        ) {

            const valid =
                await bcrypt.compare(
                    password,
                    user.password
                );


            if (valid) {

                validUsers.push(
                    user
                );

            }

        }


        if (
            validUsers.length === 0
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid phone number or password"

            });

        }


        // =================================================
        // ONE ACCOUNT
        // =================================================

        if (
            validUsers.length === 1
        ) {

            const user =
                validUsers[0];


            const token =
                generateToken(
                    user
                );


            return res.json({

                success: true,

                multipleAccounts:
                    false,

                message:
                    "Login successful",

                token,

                userId:
                    user.id,

                fullName:
                    user.full_name,

                role:
                    user.role,

                gender:
                    user.gender

            });

        }


        // =================================================
        // MULTIPLE ACCOUNTS
        // =================================================

        const accounts =
            validUsers.map(
                user => ({

                    id:
                        user.id,

                    role:
                        user.role,

                    fullName:
                        user.full_name,

                    gender:
                        user.gender

                })
            );


        return res.json({

            success: true,

            multipleAccounts:
                true,

            message:
                "Multiple accounts found",

            accounts

        });


    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to login"

        });

    }
}


// =====================================================
// CHOOSE ACCOUNT
// =====================================================

async function chooseAccount(
    req,
    res
) {

    try {

        const {
            accountId,
            phone,
            password
        } = req.body;


        // =================================================
        // VALIDATION
        // =================================================

        if (
            !accountId ||
            !phone ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Account, phone and password are required"

            });

        }


        const normalizedPhone =
            String(phone)
                .trim();


        // =================================================
        // FIND SELECTED ACCOUNT
        // =================================================

        const [
            rows
        ] = await pool.execute(

            `
            SELECT *
            FROM users
            WHERE id = ?
            AND phone = ?
            AND active = 1
            LIMIT 1
            `,

            [
                accountId,
                normalizedPhone
            ]

        );


        if (
            rows.length === 0
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid account selection"

            });

        }


        const user =
            rows[0];


        // =================================================
        // VERIFY PASSWORD
        // =================================================

        const passwordValid =
            await bcrypt.compare(

                password,

                user.password

            );


        if (
            !passwordValid
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid password"

            });

        }


        // =================================================
        // GENERATE TOKEN
        // =================================================

        const token =
            generateToken(
                user
            );


        return res.json({

            success: true,

            message:
                "Login successful",

            token,

            userId:
                user.id,

            fullName:
                user.full_name,

            role:
                user.role,

            gender:
                user.gender

        });


    } catch (error) {

        console.error(
            "SELECT ACCOUNT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to select account"

        });

    }
}


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    register,

    login,

    chooseAccount

};