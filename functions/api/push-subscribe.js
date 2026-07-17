export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();

    if (!env.PUSH_SETUP_PIN || body.pin !== env.PUSH_SETUP_PIN) {
      return Response.json(
        { success: false, message: "Incorrect setup PIN." },
        { status: 403 }
      );
    }

    const companionId = body.companionId || "000001";
    const subscription = body.subscription;

    if (
      !subscription?.endpoint ||
      !subscription?.keys?.p256dh ||
      !subscription?.keys?.auth
    ) {
      return Response.json(
        { success: false, message: "Invalid push subscription." },
        { status: 400 }
      );
    }

    await env.PUSH_SUBSCRIPTIONS.put(
      `companion:${companionId}`,
      JSON.stringify(subscription)
    );

    return Response.json({
      success: true,
      message: "Instant PawDex alerts enabled.",
    });
  } catch (error) {
    console.error("Push subscription error:", error);

    return Response.json(
      { success: false, message: "Unable to enable instant alerts." },
      { status: 500 }
    );
  }
}
