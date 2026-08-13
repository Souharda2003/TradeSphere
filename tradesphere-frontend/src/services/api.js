import axios from "axios";


const api = axios.create({

    baseURL:
        "http://localhost:5000/api",

    headers: {
        "Content-Type":
            "application/json"
    }

});


/*
========================================
REQUEST INTERCEPTOR
========================================
*/

api.interceptors.request.use(

    (config) => {

        const token =
            localStorage.getItem(
                "accessToken"
            );


        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }


        return config;

    },

    (error) => {

        return Promise.reject(
            error
        );

    }

);


/*
========================================
RESPONSE INTERCEPTOR
========================================
*/

api.interceptors.response.use(

    response => response,


    error => {

        if (
            error.response?.status === 401
        ) {

            localStorage.removeItem(
                "accessToken"
            );

            localStorage.removeItem(
                "userId"
            );

            localStorage.removeItem(
                "role"
            );

            localStorage.removeItem(
                "fullName"
            );

            localStorage.removeItem(
                "gender"
            );


            /*
             * Do not redirect if
             * already on login page.
             */

            if (
                window.location.pathname !==
                "/login"
            ) {

                window.location.href =
                    "/login";
            }

        }


        return Promise.reject(
            error
        );

    }

);


export default api;