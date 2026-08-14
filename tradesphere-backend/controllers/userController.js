const { pool } = require("../config/db");


/*
=========================================
GET CURRENT USER
=========================================
*/

async function getMe(req, res) {

    try {

        const userId =
            req.user.userId;


        const [users] =
            await pool.execute(

                `
                SELECT
                    id,
                    full_name,
                    email,
                    phone,
                    gender,
                    address,
                    business_name,
                    country,
                    profile_picture,
                    role,
                    active,
                    created_at,
                    updated_at
                FROM users
                WHERE id = ?
                LIMIT 1
                `,

                [userId]

            );


        if (
            users.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found."

            });

        }


        return res.json({

            success: true,

            user:
                users[0]

        });


    } catch (error) {

        console.error(
            "GET USER ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load profile."

        });

    }

}


/*
=========================================
UPDATE CUSTOMER PROFILE
=========================================
*/

async function updateProfile(
    req,
    res
) {

    try {

        const userId =
            req.user.userId;


        const {

            full_name,
            email,
            phone,
            gender,
            address,
            business_name,
            country

        } = req.body;


        /*
        ================================
        VALIDATION
        ================================
        */

        if (
            !full_name ||
            !full_name.trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Full name is required."

            });

        }


        if (
            !email ||
            !email.trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email is required."

            });

        }


        if (
            !phone ||
            !phone.trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Phone number is required."

            });

        }


        if (
            !["MALE", "FEMALE"]
                .includes(
                    gender
                )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid gender."

            });

        }


        /*
        ================================
        CHECK EMAIL DUPLICATE
        ================================
        */

        const [emailUsers] =
            await pool.execute(

                `
                SELECT id
                FROM users
                WHERE email = ?
                AND id != ?
                LIMIT 1
                `,

                [
                    email.trim(),
                    userId
                ]

            );


        if (
            emailUsers.length > 0
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "This email is already used by another account."

            });

        }


        /*
        ================================
        UPDATE
        ================================
        */

        await pool.execute(

            `
            UPDATE users

            SET

                full_name = ?,

                email = ?,

                phone = ?,

                gender = ?,

                address = ?,

                business_name = ?,

                country = ?

            WHERE id = ?

            `,

            [

                full_name.trim(),

                email.trim(),

                phone.trim(),

                gender,

                address
                    ? address.trim()
                    : null,

                business_name
                    ? business_name.trim()
                    : null,

                country
                    ? country.trim()
                    : null,

                userId

            ]

        );


        /*
        ================================
        GET UPDATED USER
        ================================
        */

        const [users] =
            await pool.execute(

                `
                SELECT

                    id,
                    full_name,
                    email,
                    phone,
                    gender,
                    address,
                    business_name,
                    country,
                    profile_picture,
                    role,
                    active,
                    created_at,
                    updated_at

                FROM users

                WHERE id = ?

                LIMIT 1
                `,

                [userId]

            );


        return res.json({

            success: true,

            message:
                "Profile updated successfully.",

            user:
                users[0]

        });


    } catch (error) {

        console.error(
            "UPDATE PROFILE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to update profile."

        });

    }

}
async function getCurrentUser(
    req,
    res
) {

    try {

        const [
            users
        ] = await pool.execute(

            `
            SELECT
                id,
                full_name,
                email,
                phone,
                role,
                gender,
                business_name,
                address,
                country,
                active,
                created_at
            FROM users
            WHERE id = ?
            LIMIT 1
            `,

            [req.user.userId]
        );


        if (
            users.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });
        }


        return res.json({

            success: true,

            user: users[0]

        });


    } catch (error) {

        console.error(
            "GET CURRENT USER ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to fetch user"

        });
    }
}

async function uploadProfilePicture(
    req,
    res
) {

    try {

        const userId =
            req.user.userId;


        if (!req.file) {

            return res.status(400).json({

                success: false,

                message:
                    "Please select an image."

            });

        }


        const profilePicture =
            `/uploads/profile/${req.file.filename}`;


        await pool.execute(

            `
            UPDATE users

            SET profile_picture = ?

            WHERE id = ?

            `,

            [
                profilePicture,
                userId
            ]

        );


        return res.json({

            success: true,

            message:
                "Profile picture updated successfully.",

            profilePicture

        });


    } catch (error) {

        console.error(
            "PROFILE PICTURE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to update profile picture."

        });

    }

}
module.exports = {
    getMe,
    updateProfile,
    getCurrentUser,
    uploadProfilePicture
};