import {
    CheckCircle,
    Package,
    ArrowRight,
    ShoppingBag
} from "lucide-react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import "../../styles/order-success.css";


function OrderSuccess() {

    const navigate =
        useNavigate();


    const {
        referenceNo
    } = useParams();


    return (

        <div className="order-success-page">


            <div className="order-success-card">


                <div className="success-icon">

                    <CheckCircle
                        size={42}
                    />

                </div>


                <p className="success-label">
                    ORDER CREATED
                </p>


                <h1>
                    Your order is on its way
                </h1>


                <p className="success-description">

                    Your email has been verified
                    and your order has been sent
                    to the seller for confirmation.

                </p>


                <div className="reference-box">

                    <span>
                        ORDER REFERENCE
                    </span>

                    <strong>
                        {referenceNo}
                    </strong>

                </div>


                <div className="order-status-flow">


                    <div className="status-step completed">

                        <CheckCircle
                            size={17}
                        />

                        <span>
                            Order Created
                        </span>

                    </div>


                    <div className="status-line" />


                    <div className="status-step current">

                        <Package
                            size={17}
                        />

                        <span>
                            Waiting for Seller
                        </span>

                    </div>


                    <div className="status-line" />


                    <div className="status-step">

                        <ShoppingBag
                            size={17}
                        />

                        <span>
                            Processing
                        </span>

                    </div>

                </div>


                <div className="success-actions">

                    <button
                        className="success-primary"
                        onClick={() =>
                            navigate(
                                "/profile/orders"
                            )
                        }
                    >

                        View My Orders

                        <ArrowRight
                            size={16}
                        />

                    </button>


                    <button
                        className="success-secondary"
                        onClick={() =>
                            navigate(
                                "/products"
                            )
                        }
                    >

                        Continue Shopping

                    </button>

                </div>

            </div>

        </div>
    );
}


export default OrderSuccess;