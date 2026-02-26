const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Keep it short; you can expand later
const blockedDomains = new Set([
    "mailinator.com",
    "10minutemail.com",
    "tempmail.com",
    "yopmail.com",
    "guerrillamail.com",
]);

async function verifyTurnstile(secret, token, remoteip) {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, response: token, remoteip }),
    });

    const data = await res.json().catch(() => ({}));
    return data; // { success: boolean, ... }
}

export async function onRequestPost(context) {
    try {
        const body = await context.request.json().catch(() => ({}));
        const email = (body.email || "").trim().toLowerCase();
        const turnstileToken = (body.turnstileToken || "").trim();

        // --- Env checks ---
        const BREVO_API_KEY = context.env.BREVO_API_KEY;
        const LIST_ID = Number(context.env.BREVO_LIST_ID);
        const DOI_TEMPLATE_ID = Number(context.env.BREVO_DOI_TEMPLATE_ID);
        const DOI_REDIRECT_URL = context.env.BREVO_DOI_REDIRECT_URL;
        const TURNSTILE_SECRET_KEY = context.env.TURNSTILE_SECRET_KEY;

        if (!BREVO_API_KEY || !TURNSTILE_SECRET_KEY || !DOI_REDIRECT_URL || !LIST_ID || !DOI_TEMPLATE_ID) {
            console.error("Missing server env vars");
            return Response.json({ message: "Server configuration error" }, { status: 500 });
        }

        // --- Validate email format ---
        if (!emailRegex.test(email)) {
            return Response.json({ message: "Please enter a valid email address." }, { status: 400 });
        }

        // --- Block disposable domains ---
        const domain = email.split("@")[1] || "";
        if (blockedDomains.has(domain)) {
            return Response.json({ message: "Disposable email addresses are not allowed." }, { status: 400 });
        }

        // --- Turnstile required ---
        if (!turnstileToken) {
            return Response.json({ message: "Please complete the verification." }, { status: 400 });
        }

        const remoteip =
            context.request.headers.get("CF-Connecting-IP") ||
            context.request.headers.get("X-Forwarded-For") ||
            undefined;

        const t = await verifyTurnstile(TURNSTILE_SECRET_KEY, turnstileToken, remoteip);

        if (!t.success) {
            console.error("Turnstile failed:", t);
            return Response.json({ message: "Verification failed. Please try again." }, { status: 400 });
        }

        // --- Brevo Double Opt-In (sends confirmation email, adds to list after click) ---
        // Endpoint + required fields: email, includeListIds, redirectionUrl, templateId :contentReference[oaicite:1]{index=1}
        const doiRes = await fetch("https://api.brevo.com/v3/contacts/doubleOptinConfirmation", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": BREVO_API_KEY,
            },
            body: JSON.stringify({
                email,
                includeListIds: [LIST_ID],
                redirectionUrl: DOI_REDIRECT_URL,
                templateId: DOI_TEMPLATE_ID,
            }),
        });

        if (!doiRes.ok) {
            const errText = await doiRes.text();
            console.error("Brevo DOI error:", errText);
            return Response.json({ message: "Email service error" }, { status: 500 });
        }

        return Response.json(
            { message: "Almost done — check your inbox to confirm your subscription." },
            { status: 200 }
        );
    } catch (e) {
        console.error("Subscribe error:", e);
        return Response.json({ message: "Internal server error" }, { status: 500 });
    }
}