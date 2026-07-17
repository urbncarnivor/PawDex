export async function onRequestGet(context) {
  const { env, params } = context;
  const companionId = params.companionId;

  const list = await env.PAWDEX_SCANS.list({
    prefix: `${companionId}:`,
    limit: 10,
  });

  const scans = await Promise.all(
    list.keys.map(async ({ name }) => {
      const value = await env.PAWDEX_SCANS.get(name);
      return value ? JSON.parse(value) : null;
    })
  );

  return Response.json({
    success: true,
    companionId,
    scans: scans.filter(Boolean).reverse(),
  });
}
