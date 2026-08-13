const {
    verifyToken
} = require("../utils/jwt");


function authenticateToken(
    req,
    res,
    next
) {

    try {

        const authHeader =
            req.headers.authorization;


        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required"

            });
        }


        const token =
            authHeader.substring(7);


        const decoded =
            verifyToken(token);


        /*
         * Save authenticated user
         * information inside request.
         */

        req.user = decoded;


        next();


    } catch (error) {

        return res.status(401).json({

            success: false,

            message:
                "Invalid or expired token"

        });
    }
}


module.exports = authenticateToken;