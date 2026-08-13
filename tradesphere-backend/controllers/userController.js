const {
    pool
} = require("../config/db");


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


module.exports = {
    getCurrentUser
};