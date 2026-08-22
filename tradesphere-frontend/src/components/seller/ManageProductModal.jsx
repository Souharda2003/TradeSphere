import {
    useEffect,
    useState
} from "react";
import {
    X,
    Save,
    RefreshCw
} from "lucide-react";
import api from "../../services/api";
function ManageProductModal({
    product,
    onClose,
    onUpdated
}) {
    const [
        saving,
        setSaving
    ] = useState(false);
    const [
        error,
        setError
    ] = useState("");
    const [
        message,
        setMessage
    ] = useState("");
    const [
        form,
        setForm
    ] = useState({
        product_name: "",
        category: "",
        description: "",
        sku: "",
        origin_country: "",
        unit: "",
        price: "",
        minimum_order_quantity: "",
        status: "ACTIVE",
        available_quantity: ""
    });
    useEffect(() => {
        if (!product) {
            return;
        }
        setForm({

    product_name:
        product.product_name || "",

    category:
        product.category || "",

    description:
        product.description || "",

    sku:
        product.sku || "",

    origin_country:
        product.origin_country || "India",

    unit:
        product.unit || "",

    price:
        product.price ?? "",

    minimum_order_quantity:
        product.minimum_order_quantity ?? "",

    status:
        product.status || "ACTIVE",

    available_quantity:
        product.available_quantity ?? ""

});
    }, [product]);
    function handleChange(event) {
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

    async function handleSave(event) {
        event.preventDefault();
        try {
            setSaving(true);
            setError("");
            setMessage("");
            if (
                !form.product_name.trim()
            ) {

                setError(
                    "Product name is required."
                );

                return;

            }


            if (
                !form.sku.trim()
            ) {

                setError(
                    "SKU is required."
                );

                return;

            }


            const price =
                Number(
                    form.price
                );


            const minimumOrderQuantity =
                Number(
                    form.minimum_order_quantity
                );


            const availableQuantity =
                Number(
                    form.available_quantity
                );


            if (
                Number.isNaN(price) ||
                price < 0
            ) {

                setError(
                    "Invalid product price."
                );

                return;

            }


            if (
                Number.isNaN(
                    minimumOrderQuantity
                ) ||
                minimumOrderQuantity <= 0
            ) {

                setError(
                    "Minimum order quantity must be greater than zero."
                );

                return;

            }


            if (
                Number.isNaN(
                    availableQuantity
                ) ||
                availableQuantity < 0
            ) {

                setError(
                    "Invalid stock quantity."
                );

                return;

            }
            const response =
    await api.put(

        `/products/seller/${product.id}`,

        {

            product_name:
                form.product_name.trim(),

            category:
                form.category.trim(),

            description:
                form.description.trim(),

            sku:
                form.sku.trim(),

            origin_country:
                form.origin_country.trim(),

            unit:
                form.unit,

            price,

            minimum_order_quantity:
                minimumOrderQuantity,

            status:
                form.status,

            available_quantity:
                availableQuantity

        }

    );


            setMessage(

                response.data?.message ||
                "Product updated successfully."

            );
            if (onUpdated) {

                await onUpdated();

            }

            setTimeout(() => {

                onClose();

            }, 700);


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


    if (!product) {

        return null;

    }


    return (

        <div
            className="manage-product-modal-overlay"
            onMouseDown={event => {

                if (
                    event.target ===
                    event.currentTarget
                ) {

                    onClose();

                }

            }}
        >

            <div
                className="manage-product-modal"
            >
                <div
                    className="manage-product-modal-header"
                >

                    <div>

                        <p>
                            SELLER PRODUCT MANAGEMENT
                        </p>

                        <h2>
                            Manage Product
                        </h2>

                    </div>


                    <button

                        type="button"

                        className="manage-product-close"

                        onClick={onClose}

                    >

                        <X size={20} />

                    </button>

                </div>
                {message && (

                    <div
                        className="manage-success"
                    >

                        {message}

                    </div>

                )}
                {error && (

                    <div
                        className="manage-error"
                    >

                        {error}

                    </div>

                )}
                <form
                    onSubmit={
                        handleSave
                    }
                >

                    <div
                        className="manage-form-grid"
                    >
                        <div
                            className="manage-field"
                        >

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
        Category
    </label>

    <input
        name="category"
        value={form.category}
        onChange={handleChange}
        required
    />

</div>
<div className="manage-field">

    <label>
        Origin Country
    </label>

    <input
        name="origin_country"
        value={form.origin_country}
        onChange={handleChange}
    />

</div>
<div
    className="manage-field manage-field-full"
>

    <label>
        Description
    </label>

    <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        rows="4"
        placeholder="Product description"
    />

</div>
                        <div
                            className="manage-field"
                        >

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

                        <div
                            className="manage-field"
                        >

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
                        <div
                            className="manage-field"
                        >

                            <label>
                                Price
                            </label>

                            <input

                                type="number"

                                min="0"

                                step="0.01"

                                name="price"

                                value={
                                    form.price
                                }

                                onChange={
                                    handleChange
                                }

                                required

                            />

                        </div>
                        <div
                            className="manage-field"
                        >

                            <label>
                                Minimum Order Quantity
                            </label>

                            <input

                                type="number"

                                min="1"

                                name="minimum_order_quantity"

                                value={
                                    form.minimum_order_quantity
                                }

                                onChange={
                                    handleChange
                                }

                                required

                            />

                        </div>
                        <div
                            className="manage-field"
                        >

                            <label>
                                Available Stock
                            </label>

                            <input

                                type="number"

                                min="0"

                                step="0.01"

                                name="available_quantity"

                                value={
                                    form.available_quantity
                                }

                                onChange={
                                    handleChange
                                }

                                required

                            />

                        </div>
                        <div
                            className="manage-field"
                        >

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

                                <option value="OUT_OF_STOCK">
                                    Out of Stock
                                </option>

                                <option value="INACTIVE">
                                    Inactive
                                </option>

                            </select>

                        </div>

                    </div>

                    <div
                        className="manage-product-actions"
                    >

                        <button

                            type="button"

                            className="manage-cancel-button"

                            onClick={
                                onClose
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

            </div>

        </div>

    );

}


export default ManageProductModal;