// lib/storage/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

// ─── Upload profile photo ─────────────────────────────────────
export async function uploadProfilePhoto(
  file: Buffer | string,
  userId: string
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(
    typeof file === "string" ? file : `data:image/jpeg;base64,${file.toString("base64")}`,
    {
      folder: `buddhasangam/profiles/${userId}`,
      transformation: [
        { width: 800, height: 1000, crop: "fill", gravity: "face" },
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
      resource_type: "image",
    }
  );

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

// ─── Upload gallery photo ─────────────────────────────────────
export async function uploadGalleryPhoto(
  file: Buffer | string,
  userId: string
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(
    typeof file === "string" ? file : `data:image/jpeg;base64,${file.toString("base64")}`,
    {
      folder: `buddhasangam/gallery/${userId}`,
      transformation: [
        { width: 1200, height: 1200, crop: "limit" },
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
      resource_type: "image",
    }
  );

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

// ─── Delete photo ─────────────────────────────────────────────
export async function deletePhoto(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

// ─── Generate blur placeholder ────────────────────────────────
export function getBlurredUrl(url: string): string {
  return url.replace(
    "/upload/",
    "/upload/e_blur:1500,q_1,f_auto/"
  );
}

// ─── Get optimized thumbnail ──────────────────────────────────
export function getThumbnailUrl(url: string, width = 200, height = 200): string {
  return url.replace(
    "/upload/",
    `/upload/w_${width},h_${height},c_fill,g_face,q_auto,f_auto/`
  );
}

export default cloudinary;
