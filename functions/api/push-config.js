export async function onRequestGet({ env }) {
  if (!env.VAPID_PUBLIC_KEY) {
    return Response.json(
      { success: false, message: "Push notifications are not configured." },
      { status: 503 }
    );
  }

  return Response.json(
    {
      success: true,
      publicKey: env.VAPID_PUBLIC_KEY,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
