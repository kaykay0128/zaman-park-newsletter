import Footer from "./components/Footer";
import { useState } from "react";
import "./index.css";
import ThreePillars from "./components/ThreePillars";
import QuoteSection from "./components/QuoteSection";
import SubscribeSection from "./components/SubscribeSection";

function App() {
    const [email, setEmail] = useState("");

    return (
        <>
            {/* HERO */}
            <div className="hero">
                <div className="hero-content">
                    <p className="category">History • Politics • Legacy</p>
                    <h1>Zaman Park</h1>
                    <div className="divider"></div>
                    <p className="description">
                        A landmark of political resilience and transformation.
                    </p>
                    <div className="cta">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button>Subscribe</button>
                    </div>
                </div>
            </div>

            <ThreePillars />
            <QuoteSection />
            <SubscribeSection />
            <Footer />
        </>
    );
}

export default App;