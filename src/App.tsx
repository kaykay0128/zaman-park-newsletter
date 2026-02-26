import { useEffect, useState } from "react";
import "./index.css";

declare global {
    interface Window {
        turnstile?: any;
    }
}

function App() {
    const [email, setEmail] = useState("");
    const [turnstileToken, setTurnstileToken] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    // Use env if you set VITE_TURNSTILE_SITE_KEY in Cloudflare Pages build vars
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "PASTE_YOUR_SITE_KEY_HERE";

    useEffect(() => {
        // Load Turnstile script once
        const existing = document.querySelector('script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]');
        if (existing) return;

        const s = document.createElement("script");
        s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        s.async = true;
        s.defer = true;
        document.body.appendChild(s);
    }, []);

    const subscribe = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setMsg("");

        const clean = email.trim().toLowerCase();
        if (!clean) return setMsg("Please enter your email.");

        if (!turnstileToken) return setMsg("Please complete the verification.");

        setLoading(true);
        try {
            const res = await fetch("/api/newsletter/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: clean, turnstileToken }),
            });

            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                setMsg(data.message || "Check your inbox to confirm.");
                setEmail("");
                setTurnstileToken("");
                // reset widget (optional)
                window.turnstile?.reset?.();
            } else {
                setMsg(data.message || `Subscription failed (HTTP ${res.status}).`);
            }
        } catch {
            setMsg("Network/server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="hero">
            <div className="hero-content">
                {/* ... your existing hero text ... */}

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

                {/* Turnstile widget */}
                <div
                    className="cf-turnstile"
                    data-sitekey={siteKey}
                    data-callback={(token: string) => setTurnstileToken(token)}
                />

                {msg && <div className="status">{msg}</div>}
            </div>
        </div>
    );
}

export default App;

                        .cf - turnstile { margin - top: 14px; display: flex; justify - content: center; }