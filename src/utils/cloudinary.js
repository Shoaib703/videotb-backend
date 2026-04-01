import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret:process.env.CLOUDINARY_API_SECRET
});

const uploadonCloudinary= async (localFilePath) => {
    try{
        if(!localFilePath) {return null}

        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })

        // console.log("file is uploaded on cloudinary ",
            // response.url);
            fs.unlinkSync(localFilePath)
            return response;
    }catch(error){
        fs.unlinkSync(localFilePath)
        return null;
    }
}



export {uploadonCloudinary}











// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";

// cloudinary.config({ 
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//   api_key: process.env.CLOUDINARY_API_KEY, 
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// const uploadonCloudinary = async (localFilePath) => {
//   try {
//     if (!localFilePath) {
//       console.log(" No file path provided.");
//       return null;
//     }

//     console.log(" Uploading to Cloudinary:", localFilePath);

//     // Check if file exists
//     if (!fs.existsSync(localFilePath)) {
//       console.log(" File not found at:", localFilePath);
//       return null;
//     }

//     const response = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: "auto",
//     });

//     console.log(" Uploaded successfully:", response.secure_url);

//     fs.unlinkSync(localFilePath); // delete local temp file after upload
//     return response;
//   } catch (error) {
//     console.error(" Cloudinary Upload Error:", error);
//     if (fs.existsSync(localFilePath)) {
//       fs.unlinkSync(localFilePath);
//     }
//     return null;
//   }
// };

// export { uploadonCloudinary };
