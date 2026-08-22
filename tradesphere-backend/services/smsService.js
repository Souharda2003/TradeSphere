const BREVO_API_URL =
    "https://api.brevo.com/v3/transactionalSMS/send";


/*
==================================================
NORMALIZE INDIAN PHONE NUMBER
==================================================
*/

function normalizeIndianPhone(
    phone
) {

    if (!phone) {

        return null;

    }


    let value =
        String(phone)
            .trim()
            .replace(
                /[\s()-]/g,
                ""
            );


    /*
    9876543210
    */

    if (
        /^[6-9]\d{9}$/.test(
            value
        )
    ) {

        return `91${value}`;

    }


    /*
    +919876543210
    */

    if (
        /^\+91[6-9]\d{9}$/.test(
            value
        )
    ) {

        return value.substring(1);

    }


    /*
    919876543210
    */

    if (
        /^91[6-9]\d{9}$/.test(
            value
        )
    ) {

        return value;

    }


    return null;

}


/*
==================================================
SEND TRANSACTIONAL SMS
==================================================
*/

async function sendSMS({

    phone,

    message,

    tag = "TradeSphere"

}) {

    const recipient =
        normalizeIndianPhone(
            phone
        );


    if (!recipient) {

        console.warn(
            "SMS skipped: invalid phone number",
            phone
        );

        return {

            success:
                false,

            skipped:
                true,

            message:
                "Invalid phone number."

        };

    }


    if (
        !process.env.BREVO_API_KEY
    ) {

        console.warn(
            "BREVO_API_KEY is missing. SMS skipped."
        );

        return {

            success:
                false,

            skipped:
                true,

            message:
                "BREVO_API_KEY is not configured."

        };

    }


    const sender =
        process.env.SMS_SENDER ||
        "TradeSphere";


    try {

        const response =
            await fetch(
                BREVO_API_URL,
                {

                    method:
                        "POST",

                    headers: {

                        accept:
                            "application/json",

                        "api-key":
                            process.env.BREVO_API_KEY,

                        "content-type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            sender,

                            recipient,

                            content:
                                message,

                            type:
                                "transactional",

                            tag,

                            unicodeEnabled:
                                true

                        })

                }
            );


        const data =
            await response.json();


        if (
            !response.ok
        ) {

            console.error(
                "BREVO SMS ERROR:",
                data
            );

            return {

                success:
                    false,

                message:
                    data?.message ||
                    "SMS provider rejected the request."

            };

        }


        console.log(
            "SMS SENT:",
            data
        );


        return {

            success:
                true,

            messageId:
                data?.messageId ||
                null

        };

    } catch (error) {

        console.error(
            "SEND SMS ERROR:",
            error
        );


        return {

            success:
                false,

            message:
                error.message

        };

    }

}


module.exports = {

    sendSMS,

    normalizeIndianPhone

};