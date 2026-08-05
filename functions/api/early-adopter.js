function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendEmail(apiKey, message) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(message)
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Resend error:", result);
    throw new Error("Email delivery failed.");
  }

  return result;
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();

    const signup = {
      ownerName: String(body.ownerName || "").trim(),
      email: String(body.email || "").trim().toLowerCase(),
      companionName: String(body.companionName || "").trim(),
      companionType: String(body.companionType || "").trim(),
      purchaseInterest: body.purchaseInterest === true,
      marketingConsent: body.marketingConsent === true,
      eventSource: String(body.eventSource || "pawdex-website").trim(),
      createdAt: new Date().toISOString()
    };

    if (
      !signup.ownerName ||
      !signup.email ||
      !signup.companionName ||
      !signup.companionType ||
      !signup.marketingConsent
    ) {
      return Response.json(
        {
          success: false,
          message: "Please complete all required fields."
        },
        { status: 400 }
      );
    }

    if (!isValidEmail(signup.email)) {
      return Response.json(
        {
          success: false,
          message: "Please enter a valid email address."
        },
        { status: 400 }
      );
    }

    if (!env.RESEND_API_KEY || !env.PAWDEX_ALERT_EMAIL) {
      throw new Error("Email environment variables are missing.");
    }

        if (!env.PAWDEX_DB) {
      throw new Error("PawDex database binding is missing.");
    }

    const existingSignup = await env.PAWDEX_DB
      .prepare(
        `SELECT id
         FROM early_adopters
         WHERE email = ? COLLATE NOCASE
           AND companion_name = ? COLLATE NOCASE
         LIMIT 1`
      )
      .bind(signup.email, signup.companionName)
      .first();

    if (existingSignup) {
      return Response.json({
        success: true,
        alreadyRegistered: true,
        message: "This companion is already on the PawDex early-adopter list."
      });
    }

    const databaseResult = await env.PAWDEX_DB
      .prepare(
        `INSERT INTO early_adopters (
          owner_name,
          email,
          companion_name,
          companion_type,
          purchase_interest,
          marketing_consent,
          event_source
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        signup.ownerName,
        signup.email,
        signup.companionName,
        signup.companionType,
        signup.purchaseInterest ? 1 : 0,
        signup.marketingConsent ? 1 : 0,
        signup.eventSource
      )
      .run();

    if (!databaseResult.success) {
      throw new Error("PawDex signup could not be saved.");
    }

    const safeOwnerName = escapeHtml(signup.ownerName);
    const safeEmail = escapeHtml(signup.email);
    const safeCompanionName = escapeHtml(signup.companionName);
    const safeCompanionType = escapeHtml(signup.companionType);
    const safeEventSource = escapeHtml(signup.eventSource);

    await Promise.all([
      sendEmail(env.RESEND_API_KEY, {
        from: "PawDex Early Access <early-access@notifications.pawdex.io>",
        to: [signup.email],
        subject: "Welcome to the PawDex Early-Adopter Program",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;padding:28px;background:#071827;color:#ffffff;border-radius:18px;">
            <div style="font-size:12px;letter-spacing:3px;color:#00e5ff;font-weight:bold;">
              PAWDEX EARLY ACCESS
            </div>

            <h1 style="color:#39ff14;margin-bottom:10px;">
              Welcome to PawDex, ${safeOwnerName}.
            </h1>

            <p style="font-size:18px;line-height:1.6;">
              Your early-adopter signup for <strong>${safeCompanionName}</strong>
              has been received.
            </p>

            <div style="margin:24px 0;padding:20px;background:#101827;border:1px solid #8b5cf6;border-radius:14px;">
              <p style="margin:0 0 8px;color:#a1a1aa;">Your reserved offer</p>
              <p style="margin:0;font-size:26px;color:#39ff14;font-weight:bold;">
                $10 off your first Original PawDex Tag
              </p>
            </div>

            <p style="line-height:1.6;">
              No payment was collected today. Your discount is reserved under
              <strong>${safeEmail}</strong>.
            </p>

            <p style="line-height:1.6;">
              PawDex tags are designed with no monthly subscription, lifetime
              profile updates, and a free first replacement if the original tag
              is damaged or broken.
            </p>

            <p style="line-height:1.6;">
              We’ll contact you as PawDex prepares for launch.
            </p>

            <p style="margin-top:30px;color:#a1a1aa;font-size:13px;">
              Every companion. Every story. Every entry belongs in the database.
            </p>
          </div>
        `
      }),

      sendEmail(env.RESEND_API_KEY, {
        from: "PawDex Signups <signups@notifications.pawdex.io>",
        to: [env.PAWDEX_ALERT_EMAIL],
        subject: `New PawDex early adopter: ${signup.ownerName}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;padding:26px;background:#071827;color:#ffffff;border-radius:18px;">
            <h1 style="color:#39ff14;">New Early-Adopter Signup</h1>

            <p><strong>Owner:</strong> ${safeOwnerName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Companion:</strong> ${safeCompanionName}</p>
            <p><strong>Companion type:</strong> ${safeCompanionType}</p>
            <p><strong>Purchase interest:</strong> ${
              signup.purchaseInterest ? "Yes" : "No"
            }</p>
            <p><strong>Source:</strong> ${safeEventSource}</p>
            <p><strong>Submitted:</strong> ${escapeHtml(signup.createdAt)}</p>
          </div>
        `
      })
    ]);

    console.log("PawDex early-adopter signup:", signup);

    return Response.json({
      success: true,
      message: "Your PawDex early-adopter discount has been reserved."
    });
  } catch (error) {
    console.error("PawDex signup error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to complete signup right now."
      },
      { status: 500 }
    );
  }
}