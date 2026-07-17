export async function onRequestPost(context) {
  try {
    const request = context.request;
    const env = context.env;
    const body = await request.json();

    const companionId = body.companionId;

    if (companionId !== "000001") {
      return Response.json(
        { success: false, message: "Unknown companion." },
        { status: 400 }
      );
    }

    if (!env.RESEND_API_KEY || !env.PAWDEX_ALERT_EMAIL) {
      throw new Error("Notification settings are missing.");
    }

    const location = {
      city: request.cf?.city || "Unknown",
      region: request.cf?.region || "Unknown",
      country: request.cf?.country || "Unknown",
      latitude: request.cf?.latitude || null,
      longitude: request.cf?.longitude || null,
    };

    const tappedAt = new Date();
    const centralTime = tappedAt.toLocaleString("en-US", {
      timeZone: "America/Chicago",
      dateStyle: "medium",
      timeStyle: "long",
    });

    const mapUrl =
      location.latitude && location.longitude
        ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
        : null;

    const locationText =
      `${location.city}, ${location.region}, ${location.country}`;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PawDex Alerts <alerts@notifications.pawdex.io>",
        to: [env.PAWDEX_ALERT_EMAIL],
        subject: "PawDex Alert: Aspen's profile was opened",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#071827;color:#ffffff;border-radius:16px;">
            <h1 style="color:#39ff14;">PawDex Tag Alert</h1>
            <p style="font-size:18px;"><strong>Aspen's PawDex profile was opened.</strong></p>
            <p><strong>PawDex ID:</strong> #001</p>
            <p><strong>Time:</strong> ${centralTime}</p>
            <p><strong>Approximate location:</strong> ${locationText}</p>
            ${
              mapUrl
                ? `<p><a href="${mapUrl}" style="display:inline-block;padding:12px 18px;background:#39ff14;color:#071827;text-decoration:none;border-radius:8px;font-weight:bold;">View Approximate Location</a></p>`
                : "<p>A map location was not available.</p>"
            }
            <p style="color:#a9b4c0;font-size:13px;margin-top:28px;">
              Location is estimated from the device's internet connection and may not represent its exact position.
            </p>
          </div>
        `,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend error:", emailResult);
      throw new Error("Email delivery request failed.");
    }

    const event = {
      companionId,
      tappedAt: tappedAt.toISOString(),
      location,
      emailId: emailResult.id,
    };

    console.log("PawDex alert sent:", event);

    return Response.json({
      success: true,
      message: "Owner alert sent.",
      event,
    });
  } catch (error) {
    console.error("Tag alert error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to send owner alert.",
      },
      { status: 500 }
    );
  }
}
