import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    Package,
    Save,
    RefreshCw
} from "lucide-react";

import api from "../../services/api";

import BackButton
    from "../../components/BackButton";

import LogoutButton
    from "../../components/LogoutButton";

import "../../styles/manage-product.css";


function ManageProduct() {

    const {
        id
    } = useParams();


    const navigate =
        useNavigate();


    const [product, setProduct] =
        useState(null);


    const [loading, setLoading] =
        useState(true);


    const [saving, setSaving] =
        useState(false);


    const [message, setMessage] =
        useState("");


    const [error, setError] =
        useState("");


    const [form, setForm] =
        useState({

            product_name: "",

            sku: "",

            unit: "",

            price: "",

            minimum_order_quantity: "",

            status: "ACTIVE",

            available_quantity: ""

        });


    useEffect(() => {

        loadProduct();

    }, [id]);


    async function loadProduct() {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.put(
                    `/seller/products/${id}`
                );


            const data =
                response.data.product;


            setProduct(
                data
            );


            setForm({

                product_name:
                    data.product_name ||
                    "",

                sku:
                    data.sku ||
                    "",

                unit:
                    data.unit ||
                    "",

                price:
                    data.price ??
                    "",

                minimum_order_quantity:
                    data.minimum_order_quantity ??
                    "",

                status:
                    data.status ||
                    "ACTIVE",

                available_quantity:
                    data.available_quantity ??
                    ""

            });


        } catch (error) {

            console.error(
                "MANAGE PRODUCT ERROR:",
                error
            );


            setError(

                error.response
                    ?.data
                    ?.message ||

                "Unable to load product."

            );

        } finally {

            setLoading(false);

        }

    }


    function handleChange(
        event
    ) {

        const {
            name,
            value
        } = event.target;


        setForm(
            previous => ({

                ...previous,

                [name]:
                    value

            })
        );

    }


    async function handleSave(
        event
    ) {

        event.preventDefault();


        try {

            setSaving(true);

            setMessage("");

            setError("");


            const response =
                await api.put(

                    `/seller/products/${id}`,

                    {

                        product_name:
                            form.product_name,

                        sku:
                            form.sku,

                        unit:
                            form.unit,

                        price:
                            Number(
                                form.price
                            ),

                        minimum_order_quantity:
                            Number(
                                form.minimum_order_quantity
                            ),

                        status:
                            form.status,

                        available_quantity:
                            Number(
                                form.available_quantity
                            )

                    }

                );


            setMessage(

                response.data.message ||
                "Product updated successfully."

            );


            await loadProduct();


        } catch (error) {

            console.error(
                "UPDATE PRODUCT ERROR:",
                error
            );


            setError(

                error.response
                    ?.data
                    ?.message ||

                "Unable to update product."

            );

        } finally {

            setSaving(false);

        }

    }


    if (loading) {

        return (

            <div className="manage-product-loading">

                <RefreshCw
                    size={20}
                    className="manage-product-spin"
                />

                Loading product...

            </div>

        );

    }


    return (

        <div className="manage-product-page">


            <header className="manage-product-header">

                <BackButton />

                <div className="manage-product-brand">

                    <Package
                        size={18}
                    />

                    Manage Product

                </div>


                <LogoutButton />

            </header>


            <main className="manage-product-main">


                <div className="manage-product-heading">

                    <p>
                        SELLER PRODUCT MANAGEMENT
                    </p>

                    <h1>
                        Manage Product
                    </h1>

                    <span>
                        Update product details,
                        pricing and stock.
                    </span>

                </div>


                {message && (

                    <div className="manage-success">

                        {message}

                    </div>

                )}


                {error && (

                    <div className="manage-error">

                        {error}

                    </div>

                )}


                <form
                    className="manage-product-card"
                    onSubmit={
                        handleSave
                    }
                >


                    <div className="manage-product-preview">

                        <div className="manage-product-icon">

                            <Package
                                size={30}
                            />

                        </div>


                        <div>

                            <strong>
                                {
                                    product?.product_name
                                }
                            </strong>

                            <span>
                                SKU:
                                {" "}
                                {
                                    product?.sku ||
                                    "N/A"
                                }
                            </span>

                        </div>

                    </div>


                    <div className="manage-form-grid">


                        <div className="manage-field">

                            <label>
                                Product Name
                            </label>

                            <input
                                name="product_name"
                                value={
                                    form.product_name
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                        </div>


                        <div className="manage-field">

                            <label>
                                SKU
                            </label>

                            <input
                                name="sku"
                                value={
                                    form.sku
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                        </div>


                        <div className="manage-field">

                            <label>
                                Unit
                            </label>

                            <select
                                name="unit"
                                value={
                                    form.unit
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            >

                                <option value="">
                                    Select Unit
                                </option>

                                <option value="KG">
                                    KG
                                </option>

                                <option value="TON">
                                    TON
                                </option>

                                <option value="GM">
                                    GM
                                </option>

                                <option value="BAG">
                                    BAG
                                </option>

                                <option value="PCS">
                                    PCS
                                </option>

                            </select>

                        </div>


                        <div className="manage-field">

                            <label>
                                Price
                            </label>

                            <input
                                type="number"
                                name="price"
                                min="0"
                                step="0.01"
                                value={
                                    form.price
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                        </div>


                        <div className="manage-field">

                            <label>
                                Minimum Order Quantity
                            </label>

                            <input
                                type="number"
                                name="minimum_order_quantity"
                                min="1"
                                value={
                                    form.minimum_order_quantity
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                        </div>


                        <div className="manage-field">

                            <label>
                                Available Stock
                            </label>

                            <input
                                type="number"
                                name="available_quantity"
                                min="0"
                                step="0.01"
                                value={
                                    form.available_quantity
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                        </div>


                        <div className="manage-field">

                            <label>
                                Product Status
                            </label>

                            <select
                                name="status"
                                value={
                                    form.status
                                }
                                onChange={
                                    handleChange
                                }
                            >

                                <option value="ACTIVE">
                                    Active
                                </option>

                                <option value="INACTIVE">
                                    Inactive
                                </option>

                            </select>

                        </div>


                    </div>


                    <div className="manage-product-actions">

                        <button
                            type="button"
                            className="manage-cancel-button"
                            onClick={() =>
                                navigate(
                                    "/seller/products"
                                )
                            }
                        >

                            Cancel

                        </button>


                        <button
                            type="submit"
                            className="manage-save-button"
                            disabled={
                                saving
                            }
                        >

                            {saving ? (

                                <>

                                    <RefreshCw
                                        size={15}
                                        className="manage-product-spin"
                                    />

                                    Saving...

                                </>

                            ) : (

                                <>

                                    <Save
                                        size={15}
                                    />

                                    Save Changes

                                </>

                            )}

                        </button>

                    </div>


                </form>

            </main>

        </div>

    );

}


export default ManageProduct;