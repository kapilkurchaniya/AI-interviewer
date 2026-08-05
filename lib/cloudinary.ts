import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a resume file (PDF/DOCX) to Cloudinary.
 * Uses resource_type 'raw' for non-image files.
 */
export async function uploadResumeToCloudinary(
  fileBuffer: Buffer,
  originalFilename: string
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "interviewverse/resumes",
        resource_type: "raw",
        public_id: `resume_${Date.now()}_${originalFilename.replace(/\.[^/.]+$/, "")}`,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return reject(error);
        }
        if (!result) {
          return reject(
            new Error("Cloudinary upload returned undefined result")
          );
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Upload an image to Cloudinary (for future use).
 */
export async function uploadImageToCloudinary(
  fileBuffer: Buffer,
  folder: string = "interviewverse"
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return reject(error);
        }
        if (!result) {
          return reject(
            new Error("Cloudinary upload returned undefined result")
          );
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export default cloudinary;
