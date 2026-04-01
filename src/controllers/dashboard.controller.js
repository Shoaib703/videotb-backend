import mongoose,{isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    
        
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {channelId}=req.body

    if(!channelId || !isValidObjectId(channelId)){
        return res
        .status(404)
        .json(
            new ApiResponse(
                404,
                {},
                "invalid channelId"
            )
        )
    }

    const all=await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(channelId)
            }
        }
    ])

    if(!all){
        return res
        .status(403)
        .json(
            new ApiResponse(
                403,
                {},
                "failed to fetch videos from the channel"
            )
        )
    }


    return res 
    .status(200)
    .json(
        new ApiResponse(
            200,
            {all},
            "all videos of the channel"
        )
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }