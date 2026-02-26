import { useState } from "react";
import "./index.css";

function App() {
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const subscribe = async (e?: React.FormEvent) => {
        e?.preventDefault();

        const clean = email.trim().toLowerCase();
        if (!clean || !clean.includes("@")) {
            setMsg("Please enter a valid email address.");
            return;
        }

        setLoading(true);
        setMsg("Submitting...");

        try {
            const res = await fetch("/api/newsletter/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: clean }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                setMsg(data.message || "Subscribed! Check your inbox.");
                setEmail("");
            } else {
                setMsg(data.message || `Subscription failed (HTTP ${res.status}).`);
            }
        } catch (err) {
            console.error(err);
            setMsg("Network/server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="hero">
                <div className="hero-content">
                    <p className="category">History • Politics • Legacy</p>
                    <h1>Zaman Park</h1>
                    <div className="divider"></div>
                    <p className="description">
                        A landmark of political resilience and transformation. Explore the movement, the history,
                        and the legacy.
                    </p>

                    <form className="cta" onSubmit={subscribe}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(ev) => setEmail(ev.target.value)}
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? "Submitting..." : "Subscribe"}
                        </button>
                    </form>

                    {msg && <div className="status">{msg}</div>}
                </div>
            </div>
        </>
    );
}

export default App;