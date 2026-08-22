function requireRole(...allowedRoles) {

    return function (req, res, next) {

        try {

            if (!req.user) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Authentication required."

                });

            }


            const userRole =
                String(
                    req.user.role ||
                    req.user.userRole ||
                    ""
                )
                .trim()
                .toUpperCase();


            const normalizedRoles =
                allowedRoles.map(
                    role =>
                        String(role)
                            .trim()
                            .toUpperCase()
                );


            console.log(
                "ROLE CHECK:",
                {
                    userRole,
                    allowedRoles:
                        normalizedRoles,
                    user:
                        req.user
                }
            );


            if (
                !normalizedRoles.includes(
                    userRole
                )
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Access denied. Seller role required.",

                    userRole,

                    allowedRoles:
                        normalizedRoles

                });

            }


            next();

        } catch (error) {

            console.error(
                "ROLE MIDDLEWARE ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to verify user role."

            });

        }

    };

}


module.exports =
    requireRole;