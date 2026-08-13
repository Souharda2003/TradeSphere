import {
    useState
} from "react";

import {
    PackagePlus,
    ImagePlus,
    ArrowLeft
} from "lucide-react";

import {
    useNavigate
} from "react-router-dom";

import api
    from "../../services/api";

import BackButton
    from "../../components/BackButton";

import "../../styles/add-product.css";


function AddProduct() {

    const navigate =
        useNavigate();


    const [form, setForm] =
        useState({

            productName: "",

            category: "",

            description: "",

            sku: "",

            originCountry: "India",

            unit: "KG",

            price: "",

            minimumOrderQuantity: "1",

            initialStock: ""

        });


    const [images, setImages] =
        useState([]);


    const [loading, setLoading] =
        useState(false);


    const [error, setError] =
        useState("");


    const [success, setSuccess] =
        useState("");


    function handleChange(event) {

        const {
            name,
            value
        } = event.target;


        setForm(
            previous => ({

                ...previous,

                [name]: value

            })
        );
    }


    function handleImages(event) {

        const files =
            Array.from(
                event.target.files
            );


        if (
            files.length > 6
        ) {

            setError(
                "Maximum 6 images allowed."
            );

            return;
        }


        setImages(files);

        setError("");
    }


    async function handleSubmit(
        event
    ) {

        event.preventDefault();


        setLoading(true);

        setError("");

        setSuccess("");


        try {

            const formData =
                new FormData();


            formData.append(
                "productName",
                form.productName
            );


            formData.append(
                "category",
                form.category
            );


            formData.append(
                "description",
                form.description
            );


            formData.append(
                "sku",
                form.sku
            );


            formData.append(
                "originCountry",
                form.originCountry
            );


            formData.append(
                "unit",
                form.unit
            );


            formData.append(
                "price",
                form.price
            );


            formData.append(
                "minimumOrderQuantity",
                form.minimumOrderQuantity
            );


            formData.append(
                "initialStock",
                form.initialStock
            );


            images.forEach(
                file => {

                    formData.append(
                        "images",
                        file
                    );

                }
            );


            const response =
                await api.post(

                    "/products",

                    formData,

                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data"
                        }
                    }

                );


            if (
                response.data.success
            ) {

                setSuccess(
                    "Product created successfully."
                );


                setTimeout(
                    () => {

                        navigate(
                            "/seller/products"
                        );

                    },
                    1000
                );
            }


        } catch (error) {

            console.error(
                error
            );


            setError(

                error.response
                    ?.data
                    ?.message ||

                "Unable to create product."

            );


        } finally {

            setLoading(false);
        }
    }


    return (

        <div className="add-product-page">

            <header className="add-product-header">

                <BackButton />

                <div className="add-product-title">

                    <div className="add-product-logo">

                        <PackagePlus
                            size={19}
                        />

                    </div>

                    <div>

                        <strong>
                            Add Product
                        </strong>

                        <span>
                            Seller Center
                        </span>

                    </div>

                </div>

            </header>


            <main className="add-product-main">

                <div className="add-product-heading">

                    <p>
                        PRODUCT CATALOGUE
                    </p>

                    <h1>
                        Add a new product
                    </h1>

                    <span>
                        Add product information,
                        pricing and initial inventory.
                    </span>

                </div>


                {error && (

                    <div className="form-error">
                        {error}
                    </div>

                )}


                {success && (

                    <div className="form-success">
                        {success}
                    </div>

                )}


                <form
                    className="product-form"
                    onSubmit={
                        handleSubmit
                    }
                >

                    {/* =================================
                        BASIC INFORMATION
                    ================================= */}

                    <section className="product-form-card">

                        <div className="form-card-heading">

                            <h2>
                                Basic Information
                            </h2>

                            <span>
                                Product identity and
                                category
                            </span>

                        </div>


                        <div className="form-grid">

                            <div className="form-field full">

                                <label>
                                    Product Name *
                                </label>

                                <input
                                    name="productName"
                                    value={
                                        form.productName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. Premium Soyabean"
                                    required
                                />

                            </div>


                            <div className="form-field">

                                <label>
                                    Category *
                                </label>

                                <select
                                    name="category"
                                    value={
                                        form.category
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select category
                                    </option>

                                    <option value="Pulses">
                                        Pulses
                                    </option>

                                    <option value="Papad">
                                        Papad
                                    </option>

                                    <option value="Spices">
                                        Spices
                                    </option>

                                    <option value="Oil">
                                        Oil
                                    </option>

                                    <option value="Grains">
                                        Grains
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>

                                </select>

                            </div>


                            <div className="form-field">

                                <label>
                                    SKU *
                                </label>

                                <input
                                    name="sku"
                                    value={
                                        form.sku
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. SOY-001"
                                    required
                                />

                            </div>


                            <div className="form-field">

                                <label>
                                    Origin Country
                                </label>

                                <input
                                    name="originCountry"
                                    value={
                                        form.originCountry
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </div>


                            <div className="form-field full">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Describe product quality, packaging, origin, specifications..."
                                    rows="5"
                                />

                            </div>

                        </div>

                    </section>


                    {/* =================================
                        PRICING
                    ================================= */}

                    <section className="product-form-card">

                        <div className="form-card-heading">

                            <h2>
                                Pricing & Unit
                            </h2>

                            <span>
                                Define your selling
                                price and unit
                            </span>

                        </div>


                        <div className="form-grid">

                            <div className="form-field">

                                <label>
                                    Unit *
                                </label>

                                <select
                                    name="unit"
                                    value={
                                        form.unit
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="KG">
                                        Kilogram (KG)
                                    </option>

                                    <option value="TON">
                                        Ton
                                    </option>

                                    <option value="GRAM">
                                        Gram
                                    </option>

                                    <option value="LITRE">
                                        Litre
                                    </option>

                                    <option value="PIECE">
                                        Piece
                                    </option>

                                    <option value="BAG">
                                        Bag
                                    </option>

                                </select>

                            </div>


                            <div className="form-field">

                                <label>
                                    Price per Unit *
                                </label>

                                <input
                                    type="number"
                                    name="price"
                                    value={
                                        form.price
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    required
                                />

                            </div>


                            <div className="form-field">

                                <label>
                                    Minimum Order Quantity
                                </label>

                                <input
                                    type="number"
                                    name="minimumOrderQuantity"
                                    value={
                                        form.minimumOrderQuantity
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    min="0.001"
                                    step="0.001"
                                />

                            </div>

                        </div>

                    </section>


                    {/* =================================
                        STOCK
                    ================================= */}

                    <section className="product-form-card">

                        <div className="form-card-heading">

                            <h2>
                                Initial Inventory
                            </h2>

                            <span>
                                This stock belongs only
                                to this product
                            </span>

                        </div>


                        <div className="stock-input-box">

                            <div className="stock-icon">

                                <PackagePlus
                                    size={22}
                                />

                            </div>


                            <div>

                                <label>
                                    Initial Stock *
                                </label>

                                <input
                                    type="number"
                                    name="initialStock"
                                    value={
                                        form.initialStock
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    min="0"
                                    step="0.001"
                                    placeholder="Enter stock quantity"
                                    required
                                />

                            </div>


                            <strong>
                                {form.unit}
                            </strong>

                        </div>

                    </section>


                    {/* =================================
                        IMAGES
                    ================================= */}

                    <section className="product-form-card">

                        <div className="form-card-heading">

                            <h2>
                                Product Images
                            </h2>

                            <span>
                                Upload up to 6 images
                            </span>

                        </div>


                        <label
                            className="image-upload-box"
                        >

                            <ImagePlus
                                size={27}
                            />

                            <strong>
                                Add product images
                            </strong>

                            <span>
                                JPG, PNG or WEBP •
                                Maximum 5MB each
                            </span>


                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={
                                    handleImages
                                }
                            />

                        </label>


                        {images.length > 0 && (

                            <div className="selected-images">

                                {images.map(
                                    (
                                        file,
                                        index
                                    ) => (

                                        <div
                                            className="selected-image"
                                            key={
                                                index
                                            }
                                        >

                                            <img
                                                src={
                                                    URL.createObjectURL(
                                                        file
                                                    )
                                                }

                                                alt={
                                                    file.name
                                                }
                                            />

                                            <span>
                                                {index === 0
                                                    ? "Primary"
                                                    : `Image ${index + 1}`}
                                            </span>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </section>


                    {/* =================================
                        ACTIONS
                    ================================= */}

                    <div className="product-form-actions">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                navigate(
                                    "/seller"
                                )
                            }
                        >

                            <ArrowLeft
                                size={17}
                            />

                            Cancel

                        </button>


                        <button
                            type="submit"
                            className="premium-button"
                            disabled={
                                loading
                            }
                        >

                            <PackagePlus
                                size={17}
                            />

                            {loading
                                ? "Creating..."
                                : "Create Product"}

                        </button>

                    </div>

                </form>

            </main>

        </div>
    );
}


export default AddProduct;