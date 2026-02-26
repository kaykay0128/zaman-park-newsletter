export async function onRequestPost(context) {
    try {
        const body = await context.request.json().catch(() => ({}));
        const email = (body.email || "").trim().toLowerCase();

        if (!email || !email.includes("@")) {
            return Response.json({ message: "Invalid email address" }, { status: 400 });
        }

        const apiKey = context.env.BREVO_API_KEY;
        const listId = Number(context.env.BREVO_LIST_ID); // set in Cloudflare variables

        if (!apiKey) {
            console.error("Missing BREVO_API_KEY");
            return Response.json({ message: "Server configuration error" }, { status: 500 });
        }
        if (!listId || Number.isNaN(3)) {
            console.error("Missing/invalid BREVO_LIST_ID");
            return Response.json({ message: "Server configuration error" }, { status: 500 });
        }

        // 1) Add/update contact in Brevo + add to list
        const contactRes = await fetch("https://api.brevo.com/v3/contacts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": apiKey,
            },
            body: JSON.stringify({
                email,
                listIds: [listId],
                updateEnabled: true,
            }),
        });

        // Brevo returns 201 created OR 204 updated (depending), and sometimes 400/401/409 etc.
        if (!contactRes.ok) {
            const errText = await contactRes.text();
            console.error("Brevo Contact Error:", errText);
            return Response.json({ message: "Failed to save subscriber" }, { status: 500 });
        }

        // 2) Send welcome/confirmation email
        const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": apiKey,
            },
            body: JSON.stringify({
                sender: { name: "Zaman Park", email: "newsletter@zamanpark.com" },
                to: [{ email }],
                subject: "Welcome to Zaman Park",
                htmlContent: `
          <h2>Welcome to Zaman Park</h2>
          <p>History • Politics • Legacy</p>
          <p>Thanks for subscribing. Coming soon — stay tuned.</p>
        `,
            }),
        });

        if (!emailRes.ok) {
            const errText = await emailRes.text();
            console.error("Brevo Email Error:", errText);
            return Response.json({ message: "Subscriber saved, but email failed" }, { status: 500 });
        }

        return Response.json({ message: "Subscribed! Check your inbox." }, { status: 200 });
    } catch (e) {
        console.error("Subscribe server error:", e);
        return Response.json({ message: "Internal server error" }, { status: 500 });
    }
}