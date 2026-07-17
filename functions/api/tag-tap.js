export async function onRequestPost(context) {
  try {
    const request = context.request;
    const body = await request.json();

    const companionId = body.companionId || "unknown";

    const location = {
      city: request.cf?.city || "Unknown",
      region: request.cf?.region || "Unknown",
      country: request.cf?.country || "Unknown",
      latitude: request.cf?.latitude || null,
      longitude: request.cf?.longitude || null,
    };

    const event = {
      companionId,
      tappedAt: new Date().toISOString(),
      location,
      userAgent: request.headers.get("user-agent") || "Unknown",
    };

    console.log("PawDex tag tapped:", event);

    return Response.json({
      success: true,
      message: "Owner notification event received.",
      event,
    });
  } catch (error) {
    console.error("Tag tap error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to record tag tap.",
      },
      { status: 500 }
    );
  }
}
