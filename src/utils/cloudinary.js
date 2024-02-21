import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // Upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })
    console.log("File has been uploaded successfully on cloudinary ", response.url);
    return response;
  } catch (error) {
    // Removed the locally saved temporary file as the up;oad operation got failed
    fs.unlinkSync(localFilePath);
    return null;
  }
}

export default uploadOnCloudinary;