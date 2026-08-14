import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    ArrowLeft,
    Camera,
    CheckCircle,
    Edit3,
    Mail,
    MapPin,
    Phone,
    UserRound,
    X
} from "lucide-react";

import {
    useNavigate
} from "react-router-dom";

import api from "../../services/api";

import "../../styles/profile.css";


function Profile() {

    const navigate =
        useNavigate();

    const fileInputRef =
        useRef(null);


    const [user, setUser] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [uploadingPicture, setUploadingPicture] =
        useState(false);

    const [showEdit, setShowEdit] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");


    const [form, setForm] =
        useState({

            full_name: "",
            email: "",
            phone: "",
            gender: "",
            address: "",
            business_name: "",
            country: ""

        });


    useEffect(() => {

        loadProfile();

    }, []);


    async function loadProfile() {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.get(
                    "/user/me"
                );


            const currentUser =
                response.data.user;


            setUser(
                currentUser
            );


            setForm({

                full_name:
                    currentUser.full_name ||
                    "",

                email:
                    currentUser.email ||
                    "",

                phone:
                    currentUser.phone ||
                    "",

                gender:
                    currentUser.gender ||
                    "",

                address:
                    currentUser.address ||
                    "",

                business_name:
                    currentUser.business_name ||
                    "",

                country:
                    currentUser.country ||
                    ""

            });


        } catch (error) {

            console.error(
                "LOAD PROFILE ERROR:",
                error
            );


            if (
                error.response?.status ===
                401
            ) {

                navigate(
                    "/login"
                );

                return;

            }


            setError(

                error.response
                    ?.data
                    ?.message ||

                "Unable to load profile."

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


    async function saveProfile() {

        try {

            setSaving(true);

            setError("");

            setMessage("");


            const response =
                await api.put(

                    "/user/profile",

                    form

                );


            setUser(
                response.data.user
            );


            setForm({

                full_name:
                    response.data.user.full_name ||
                    "",

                email:
                    response.data.user.email ||
                    "",

                phone:
                    response.data.user.phone ||
                    "",

                gender:
                    response.data.user.gender ||
                    "",

                address:
                    response.data.user.address ||
                    "",

                business_name:
                    response.data.user.business_name ||
                    "",

                country:
                    response.data.user.country ||
                    ""

            });


            setShowEdit(
                false
            );


            setMessage(
                "Profile updated successfully."
            );


        } catch (error) {

            console.error(
                "UPDATE PROFILE ERROR:",
                error
            );


            setError(

                error.response
                    ?.data
                    ?.message ||

                "Unable to update profile."

            );

        } finally {

            setSaving(false);

        }

    }


    async function handlePictureChange(
        event
    ) {

        const file =
            event.target.files?.[0];


        if (!file) {

            return;

        }


        try {

            setUploadingPicture(
                true
            );

            setError("");

            setMessage("");


            const formData =
                new FormData();


            formData.append(
                "profilePicture",
                file
            );


            const response =
                await api.post(

                    "/user/profile/avatar",

                    formData,

                    {
                        headers: {

                            "Content-Type":
                                "multipart/form-data"

                        }

                    }

                );


            setUser(
                previous => ({

                    ...previous,

                    profile_picture:
                        response.data.profilePicture

                })

            );


            setMessage(
                "Profile picture updated successfully."
            );


        } catch (error) {

            console.error(
                "PROFILE PICTURE ERROR:",
                error
            );


            setError(

                error.response
                    ?.data
                    ?.message ||

                "Unable to upload profile picture."

            );

        } finally {

            setUploadingPicture(
                false
            );

            event.target.value =
                "";

        }

    }


    function getProfileImage() {

        if (
            !user?.profile_picture
        ) {

            return "";

        }


        if (
            user.profile_picture
                .startsWith(
                    "http"
                )
        ) {

            return user.profile_picture;

        }


        return (
            "http://localhost:5000" +
            user.profile_picture
        );

    }


    if (loading) {

        return (

            <div className="profile-loading">

                Loading profile...

            </div>

        );

    }


    if (!user) {

        return null;

    }


    return (

        <div className="profile-page">


            {/* HEADER */}

            <header className="profile-header">

                <button
                    type="button"
                    className="profile-back-button"
                    onClick={() =>
                        navigate(
                            "/customer/dashboard"
                        )
                    }
                >

                    <ArrowLeft
                        size={17}
                    />

                    Dashboard

                </button>


                <div className="profile-header-title">

                    <strong>
                        My Profile
                    </strong>

                    <span>
                        Manage your account
                    </span>

                </div>


                <button
                    type="button"
                    className="profile-orders-button"
                    onClick={() =>
                        navigate(
                            "/profile/orders"
                        )
                    }
                >

                    My Orders

                </button>

            </header>


            <main className="profile-main">


                {error && (

                    <div className="profile-error">

                        {error}

                    </div>

                )}


                {message && (

                    <div className="profile-success">

                        <CheckCircle
                            size={16}
                        />

                        {message}

                    </div>

                )}


                {/* PROFILE HERO */}

                <section className="profile-hero">

                    <div className="profile-avatar-wrapper">

                        <div className="profile-avatar">

                            {getProfileImage() ? (

                                <img
                                    src={
                                        getProfileImage()
                                    }
                                    alt="Profile"
                                />

                            ) : (

                                <UserRound
                                    size={55}
                                />

                            )}

                        </div>


                        <button
                            type="button"
                            className="profile-camera-button"
                            disabled={
                                uploadingPicture
                            }
                            onClick={() =>
                                fileInputRef
                                    .current
                                    ?.click()
                            }
                        >

                            <Camera
                                size={16}
                            />

                        </button>


                        <input
                            ref={
                                fileInputRef
                            }
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            hidden
                            onChange={
                                handlePictureChange
                            }
                        />

                    </div>


                    <div className="profile-hero-info">

                        <p>
                            CUSTOMER ACCOUNT
                        </p>

                        <h1>
                            {user.full_name}
                        </h1>

                        <span>
                            {user.email}
                        </span>

                    </div>


                    <button
                        type="button"
                        className="profile-edit-button"
                        onClick={() => {

                            setError("");

                            setMessage("");

                            setShowEdit(
                                true
                            );

                        }}
                    >

                        <Edit3
                            size={16}
                        />

                        Edit Profile

                    </button>

                </section>


                {/* DETAILS */}

                <section className="profile-details-card">

                    <div className="profile-section-heading">

                        <div>

                            <p>
                                ACCOUNT INFORMATION
                            </p>

                            <h2>
                                Personal details
                            </h2>

                        </div>

                    </div>


                    <div className="profile-details-grid">


                        <ProfileDetail
                            icon={
                                <UserRound
                                    size={18}
                                />
                            }
                            label="Full Name"
                            value={
                                user.full_name
                            }
                        />


                        <ProfileDetail
                            icon={
                                <Mail
                                    size={18}
                                />
                            }
                            label="Email"
                            value={
                                user.email
                            }
                        />


                        <ProfileDetail
                            icon={
                                <Phone
                                    size={18}
                                />
                            }
                            label="Phone"
                            value={
                                user.phone
                            }
                        />


                        <ProfileDetail
                            icon={
                                <UserRound
                                    size={18}
                                />
                            }
                            label="Gender"
                            value={
                                user.gender
                            }
                        />


                        <ProfileDetail
                            icon={
                                <MapPin
                                    size={18}
                                />
                            }
                            label="Address"
                            value={
                                user.address ||
                                "Not provided"
                            }
                        />


                        <ProfileDetail
                            icon={
                                <MapPin
                                    size={18}
                                />
                            }
                            label="Country"
                            value={
                                user.country ||
                                "Not provided"
                            }
                        />


                        <ProfileDetail
                            icon={
                                <UserRound
                                    size={18}
                                />
                            }
                            label="Business Name"
                            value={
                                user.business_name ||
                                "Not provided"
                            }
                        />


                        <ProfileDetail
                            icon={
                                <CheckCircle
                                    size={18}
                                />
                            }
                            label="Account Role"
                            value={
                                user.role
                            }
                        />

                    </div>

                </section>


                {/* ACCOUNT STATUS */}

                <section className="profile-status-card">

                    <div>

                        <strong>
                            Account status
                        </strong>

                        <span>
                            Your TradeSphere account
                            is currently active.
                        </span>

                    </div>


                    <div className="profile-active-badge">

                        <span />

                        {user.active
                            ? "ACTIVE"
                            : "INACTIVE"}

                    </div>

                </section>

            </main>


            {/* EDIT MODAL */}

            {showEdit && (

                <div
                    className="profile-modal-overlay"
                    onMouseDown={event => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            setShowEdit(
                                false
                            );

                        }

                    }}
                >

                    <div className="profile-modal">

                        <div className="profile-modal-header">

                            <div>

                                <p>
                                    EDIT PROFILE
                                </p>

                                <h2>
                                    Update your details
                                </h2>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setShowEdit(
                                        false
                                    )
                                }
                            >

                                <X
                                    size={18}
                                />

                            </button>

                        </div>


                        <div className="profile-form">


                            <label>

                                Full Name

                                <input
                                    name="full_name"
                                    value={
                                        form.full_name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </label>


                            <label>

                                Email

                                <input
                                    type="email"
                                    name="email"
                                    value={
                                        form.email
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </label>


                            <div className="profile-form-row">

                                <label>

                                    Phone

                                    <input
                                        name="phone"
                                        value={
                                            form.phone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </label>


                                <label>

                                    Gender

                                    <select
                                        name="gender"
                                        value={
                                            form.gender
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="">
                                            Select gender
                                        </option>

                                        <option value="MALE">
                                            Male
                                        </option>

                                        <option value="FEMALE">
                                            Female
                                        </option>

                                    </select>

                                </label>

                            </div>


                            <label>

                                Address

                                <input
                                    name="address"
                                    value={
                                        form.address
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />

                            </label>


                            <div className="profile-form-row">

                                <label>

                                    Country

                                    <input
                                        name="country"
                                        value={
                                            form.country
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </label>


                                <label>

                                    Business Name

                                    <input
                                        name="business_name"
                                        value={
                                            form.business_name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </label>

                            </div>


                        </div>


                        <div className="profile-modal-footer">

                            <button
                                type="button"
                                className="profile-cancel-button"
                                onClick={() =>
                                    setShowEdit(
                                        false
                                    )
                                }
                            >

                                Cancel

                            </button>


                            <button
                                type="button"
                                className="profile-save-button"
                                disabled={
                                    saving
                                }
                                onClick={
                                    saveProfile
                                }
                            >

                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}


function ProfileDetail({
    icon,
    label,
    value
}) {

    return (

        <div className="profile-detail">

            <div className="profile-detail-icon">

                {icon}

            </div>


            <div>

                <span>
                    {label}
                </span>

                <strong>
                    {value}
                </strong>

            </div>

        </div>

    );

}


export default Profile;