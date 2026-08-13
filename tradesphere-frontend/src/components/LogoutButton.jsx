import {
    LogOut
} from "lucide-react";

import {
    useNavigate
} from "react-router-dom";


function LogoutButton() {

    const navigate =
        useNavigate();


    const logout = () => {

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


        sessionStorage.clear();


        navigate(
            "/login"
        );
    };


    return (

        <button
            type="button"
            className="danger-button"
            onClick={logout}
        >

            <LogOut size={17} />

            Logout

        </button>
    );
}


export default LogoutButton;