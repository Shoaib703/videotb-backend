// import {asyncHandler} from "../utils/asyncHandler.js";
// import { ApiError } from "../utils/ApiError.js";
// import{ User } from "../models/user.models.js";
// import jwt from "jsonwebtoken"

// export const verifyJWT =  asyncHandler(async(req,res,next)=>{
// try {
//         const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
//         if(!token){
//             throw new ApiError(401,"Unauthorized request")
//         }
    
//         const decodedtoken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
//         const user=await User.findById(decodedtoken?._id).select("-password -refreshToken")
    
//         if(!user){
//             throw new ApiError(401,"Invalid Access Token")
//         }
//         req.user=user;
//         next();
// } catch (error) {
//     throw new ApiError(401,error?.message||"Invalid access token")
// }

// })





import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return next(new ApiError(401, "Unauthorized request"));
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (e) {
        return next(new ApiError(401, "Invalid access token"));
    }

    const user = await User.findById(decoded?._id).select("-password -refreshToken");

    if (!user) {
        return next(new ApiError(401, "Invalid access token"));
    }

    req.user = user;
    next();
});
