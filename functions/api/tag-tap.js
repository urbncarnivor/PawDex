import { buildPushHTTPRequest } from "@pushforge/builder";
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
let pushSent = false;

const savedSubscription = await env.PUSH_SUBSCRIPTIONS.get(
  `companion:${companionId}`
);

if (
  savedSubscription &&
  env.VAPID_PUBLIC_KEY &&
  env.VAPID_PRIVATE_KEY
) {
  const decodeBase64Url = (value) => {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return Uint8Array.from(atob(padded), (character) =>
      character.charCodeAt(0)
    );
  };

  const encodeBase64Url = (bytes) =>
    btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  const publicKeyBytes = decodeBase64Url(env.VAPID_PUBLIC_KEY);
  const privateJWK = {
    kty: "EC",
    crv: "P-256",
    x: encodeBase64Url(publicKeyBytes.slice(1, 33)),
    y: encodeBase64Url(publicKeyBytes.slice(33, 65)),
    d: env.VAPID_PRIVATE_KEY,
  };
  try {
    const subscription = JSON.parse(savedSubscription);

    const pushRequest = await buildPushHTTPRequest({
      privateJWK,
      subscription,
      message: {
        payload: {
          title: "PawDex Alert: Aspen",
          body: `Aspen's profile was opened near ${locationText}.`,
          tag: `pawdex-${companionId}`,
          url: "/aspen.html",
        },
        adminContact: "mailto:info@pawdex.io",
        options: {
          ttl: 300,
          urgency: "high",
          topic: `pawdex-${companionId}`,
        },
      },
    });

    const pushResponse = await fetch(pushRequest.endpoint, {
      method: "POST",
      headers: pushRequest.headers,
      body: pushRequest.body,
    });

if (!pushResponse.ok) {
  const errorBody = await pushResponse.text();

  console.error("Push service rejected request:", {
    status: pushResponse.status,
    statusText: pushResponse.statusText,
    body: errorBody,
  });

  const deliveryError = new Error(
    `Push service returned ${pushResponse.status}: ${errorBody}`
  );

  deliveryError.statusCode = pushResponse.status;
  throw deliveryError;
}
    pushSent = true;
  } catch (pushError) {
    console.error("Push delivery error:", pushError);

    if (
      pushError.statusCode === 404 ||
      pushError.statusCode === 410
    ) {
      await env.PUSH_SUBSCRIPTIONS.delete(
        `companion:${companionId}`
      );
    }
  }
}
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
