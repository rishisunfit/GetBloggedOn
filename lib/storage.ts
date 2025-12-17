import { supabase } from "./supabase";

/**
 * Upload an image file to Supabase storage
 * @param file - The image file to upload
 * @param userId - The user ID (for organizing files)
 * @returns The public URL of the uploaded image
 */
export async function uploadImageToStorage(
  file: File,
  userId: string
): Promise<string> {
  // Generate a unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}-${Math.random()
    .toString(36)
    .substring(7)}.${fileExt}`;

  // Upload the file
  const { data, error } = await supabase.storage
    .from("images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get the public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("images").getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Convert a data URL (base64) to a File object
 */
export function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * Upload a data URL image to Supabase storage
 */
export async function uploadDataURLToStorage(
  dataUrl: string,
  userId: string,
  filename: string = "generated-image.png"
): Promise<string> {
  const file = dataURLtoFile(dataUrl, filename);
  return uploadImageToStorage(file, userId);
}
