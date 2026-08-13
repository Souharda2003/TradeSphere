import { motion } from "motion/react";
import {
    ArrowRight,
    Globe2,
    ShieldCheck,
    Package,
    TrendingUp,
    Search
} from "lucide-react";

import "../styles/home.css";

function Home() {
    return (
        <div className="home-page">

            {/* NAVBAR */}

            <nav className="home-navbar">

                <div className="home-logo">
                    <span>TS</span>
                    <strong>TradeSphere</strong>
                </div>

                <div className="nav-links">
                    <a href="#products">Products</a>
                    <a href="#business">Business</a>
                    <a href="#about">About</a>
                </div>

                <div className="nav-actions">

                    <a
                        href="/login"
                        className="nav-login"
                    >
                        Login
                    </a>

                    <a
                        href="/register"
                        className="nav-register"
                    >
                        Register
                    </a>

                </div>

            </nav>


            {/* HERO */}

            <main>

                <section className="hero-section">

                    <div className="hero-content">

                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 20
                            }}
                            animate={{
                                opacity: 1,
                                y: 0
                            }}
                            transition={{
                                duration: 0.7
                            }}
                            className="hero-badge"
                        >
                            <Globe2 size={15} />

                            Global Export &
                            Import Marketplace
                        </motion.div>


                        <motion.h1
                            initial={{
                                opacity: 0,
                                y: 30
                            }}
                            animate={{
                                opacity: 1,
                                y: 0
                            }}
                            transition={{
                                duration: 0.8,
                                delay: 0.1
                            }}
                        >
                            Trade Globally.
                            <span>
                                Trade Smarter.
                            </span>
                        </motion.h1>


                        <motion.p
                            initial={{
                                opacity: 0,
                                y: 20
                            }}
                            animate={{
                                opacity: 1,
                                y: 0
                            }}
                            transition={{
                                duration: 0.7,
                                delay: 0.2
                            }}
                        >
                            Discover trusted products, connect
                            with sellers and manage your trade
                            orders from one powerful platform.
                        </motion.p>


                     


                        <div className="hero-actions">

                            <a
                                href="/register"
                                className="hero-primary"
                            >
                                Start Trading
                                <ArrowRight size={18} />
                            </a>

                            <a
                                href="#products"
                                className="hero-secondary"
                            >
                                Explore Products
                            </a>

                        </div>

                    </div>


                    {/* HERO VISUAL */}

                    <motion.div
                        className="hero-visual"
                        initial={{
                            opacity: 0,
                            scale: 0.9
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1
                        }}
                        transition={{
                            duration: 1
                        }}
                    >

                        <div className="hero-glow"></div>

                        <div className="trade-card">

                            <div className="trade-card-top">

                                <div>
                                    <small>
                                        GLOBAL TRADE
                                    </small>

                                    <h3>
                                        Export Network
                                    </h3>
                                </div>

                                <Globe2 />

                            </div>


                            <div className="trade-map">

                                <div className="map-line line-one"></div>
                                <div className="map-line line-two"></div>

                                <div className="map-dot dot-one"></div>
                                <div className="map-dot dot-two"></div>
                                <div className="map-dot dot-three"></div>

                            </div>


                            <div className="trade-stat">

                                <div>
                                    <span>
                                        Active Sellers
                                    </span>

                                    <strong>
                                        2,480+
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Products
                                    </span>

                                    <strong>
                                        12K+
                                    </strong>
                                </div>

                            </div>

                        </div>

                    </motion.div>

                </section>


                {/* TRUST SECTION */}

                <section className="trust-section">

                    <div className="trust-card">

                        <ShieldCheck />

                        <div>
                            <strong>
                                Secure Trading
                            </strong>

                            <span>
                                Verified accounts &
                                protected orders
                            </span>
                        </div>

                    </div>


                    <div className="trust-card">

                        <Package />

                        <div>
                            <strong>
                                Smart Inventory
                            </strong>

                            <span>
                                Real-time stock management
                            </span>
                        </div>

                    </div>


                    <div className="trust-card">

                        <TrendingUp />

                        <div>
                            <strong>
                                Business Growth
                            </strong>

                            <span>
                                Built for modern traders
                            </span>
                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Home;