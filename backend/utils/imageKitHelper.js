import ImageKit from "@imagekit/nodejs";
import dotenv from "dotenv";

dotenv.config();

// Ensure credentials exist before initializing
let imagekit = null;
try {
  if (process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT) {
    imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });
  }
} catch (error) {
  console.log("ImageKit initialization skipped: ", error.message);
}

/**
 * Upload an image buffer to ImageKit
 * @param {Buffer} fileBuffer - The memory buffer of the file
 * @param {String} fileName - The desired file name
 * @param {String} folder - The destination folder path in ImageKit (e.g. '/samadhan/profiles')
 * @returns {Promise<String>} - The remote URL of the uploaded image
 */
export const uploadToImageKit = async (fileBuffer, fileName, folder = "/samadhan") => {
  if (!imagekit) {
    throw new Error("ImageKit is not configured. Missing environment variables.");
  }

  try {
    const response = await imagekit.files.upload({
      file: fileBuffer.toString("base64"), // Can be base64 string, absolute file path or stream
      fileName: fileName,
      folder: folder,
    });
    return response.url;
  } catch (error) {
    console.error("ImageKit Upload Error:", error);
    throw new Error("Failed to upload image to CDN");
  }
};
