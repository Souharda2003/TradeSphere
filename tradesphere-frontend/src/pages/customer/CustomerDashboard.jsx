import {
    useEffect,
    useState
} from "react";

import api from "../../services/api";

import BackButton
    from "../../components/BackButton";

import LogoutButton
    from "../../components/LogoutButton";

import "../../styles/dashboard.css";


function CustomerDashboard() {

    const [user, setUser] =
        useState(null);


    const [loading, setLoading] =
        useState(true);


    useEffect(() => {

        loadUser();

    }, []);


    async function loadUser() {

        try {

            const response =
                await api.get(
                    "/user/me"
                );


            setUser(
                response.data.user
            );


        } catch (error) {

            console.error(
                error
            );


        } finally {

            setLoading(false);
        }
    }


    if (loading) {

        return (
            <div className="dashboard-page">
                Loading...
            </div>
        );
    }


    return (

        <div className="dashboard-page">

            <header className="dashboard-header">

                <BackButton />

                <LogoutButton />

            </header>


            <main className="dashboard-main">

                <p className="dashboard-eyebrow">
                    CUSTOMER WORKSPACE
                </p>


                <h1>
                    Welcome,
                    {" "}
                    {user?.full_name}
                </h1>


                <p className="dashboard-description">

                    Discover export-import products,
                    manage your cart and track orders.

                </p>


                <div className="dashboard-grid">

                    <div className="dashboard-card">

                        <strong>
                            Browse Products
                        </strong>

                        <span>
                            Explore available products.
                        </span>

                    </div>


                    <div className="dashboard-card">

                        <strong>
                            My Orders
                        </strong>

                        <span>
                            Track your purchases.
                        </span>

                    </div>


                    <div className="dashboard-card">

                        <strong>
                            My Profile
                        </strong>

                        <span>
                            Manage your profile.
                        </span>

                    </div>

                </div>

            </main>

        </div>
    );
}


export default CustomerDashboard;