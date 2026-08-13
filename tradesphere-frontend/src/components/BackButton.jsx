import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "../styles/components.css";

function BackButton({
    label = "Back",
    fallback = "/"
}) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate(fallback);
        }
    };

    return (
        <button
            type="button"
            className="back-button"
            onClick={handleBack}
        >
            <ArrowLeft size={17} />
            <span>{label}</span>
        </button>
    );
}

export default BackButton;