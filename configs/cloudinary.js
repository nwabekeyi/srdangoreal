// cloudinary.js
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "../secrets.js";

// -----------------------------
// Upload File (Frontend)
// -----------------------------
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");

  const data = await res.json();
  return {
    url: data.secure_url,
    publicId: data.public_id, // Return public_id for manual deletion in Cloudinary Dashboard
  };
}