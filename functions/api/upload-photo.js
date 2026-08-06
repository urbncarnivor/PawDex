const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const ALLOWED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif"
]);

function getExtension(contentType) {
  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif"
  };

  return extensions[contentType] || "jpg";
}

function makeSlug(value) {
  return String(value || "companion")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "companion";
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    if (!env.PAWDEX_DB || !env.PAWDEX_PHOTOS) {
      throw new Error("PawDex photo storage is not configured.");
    }

    const formData = await request.formData();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const companionName = String(
      formData.get("companionName") || ""
    ).trim();
    const photo = formData.get("photo");

    if (!email || !companionName || !photo || typeof photo === "string") {
      return Response.json(
        {
          success: false,
          message: "A valid companion photo is required."
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_PHOTO_TYPES.has(photo.type)) {
      return Response.json(
        {
          success: false,
          message: "Please upload a JPG, PNG, WebP, HEIC, or HEIF image."
        },
        { status: 400 }
      );
    }

    if (photo.size > MAX_PHOTO_SIZE) {
      return Response.json(
        {
          success: false,
          message: "The companion photo must be 5 MB or smaller."
        },
        { status: 400 }
      );
    }

    const signup = await env.PAWDEX_DB
      .prepare(
        `SELECT id
         FROM early_adopters
         WHERE email = ? COLLATE NOCASE
           AND companion_name = ? COLLATE NOCASE
         LIMIT 1`
      )
      .bind(email, companionName)
      .first();

    if (!signup) {
      return Response.json(
        {
          success: false,
          message: "Complete the PawDex signup before uploading a photo."
        },
        { status: 404 }
      );
    }

    const extension = getExtension(photo.type);
    const photoKey =
      `early-adopters/${signup.id}/` +
      `${Date.now()}-${crypto.randomUUID()}-` +
      `${makeSlug(companionName)}.${extension}`;

    await env.PAWDEX_PHOTOS.put(photoKey, photo.stream(), {
      httpMetadata: {
        contentType: photo.type,
        cacheControl: "private, max-age=3600"
      },
      customMetadata: {
        signupId: String(signup.id),
        companionName
      }
    });

    await env.PAWDEX_DB
      .prepare(
        `UPDATE early_adopters
         SET photo_key = ?
         WHERE id = ?`
      )
      .bind(photoKey, signup.id)
      .run();

    return Response.json({
      success: true,
      photoKey,
      message: "Companion photo uploaded successfully."
    });
  } catch (error) {
    console.error("PawDex photo upload error:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to upload the companion photo right now."
      },
      { status: 500 }
    );
  }
}