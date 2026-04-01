import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!channelId ||!isValidObjectId(channelId)){
        return res
        .status(404)
        .json(new  ApiError(
            404,"not valid channel Id"
        )
    )
    }

    const chk=await Subscription.aggregate([
        {$match:{
            channel:new mongoose.Types.ObjectId(channelId),
            subscriber:req.user._id
        }}
    ])
    // console.log(chk)
    // return res.status(200).json(new ApiResponse(200,{chk},"qwesrfdgf"))
    if(chk.length>0){
      const p=await  Subscription.deleteOne({
            
                channel:channelId,
            subscriber:req.user._id
            
        })
        if(!p){
            return res
            .status(404)
            .json(new ApiResponse(
                404,{},"failed to remove subscription"
            ))
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200,{p},"subscription removed successfully")
        )
    }

    const add=await Subscription.create({
        channel:new mongoose.Types.ObjectId(channelId),
        subscriber:req.user._id

    })
    if(!add){
        return res
        .status(404)
        .json(new ApiResponse(404,{},"failed to subscribe"))
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{add},"subscription added"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
const {channelId} = req.params
   if(!channelId || !isValidObjectId(channelId)){
    return res
    .status(404)
    .json(
        new ApiResponse(
            404,
            {},
            "not a valid channel id"
        )
    )
   } 


   const all=await Subscription.aggregate([
    {
        $match:{
            channel:new mongoose.Types.ObjectId(channelId)
        }
    }
   ])

   if(all.length===0){
    return res
    .status(404)
    .json(
        new ApiResponse(
            404,
            {},
            "failed to fetch the subscribers"
        )
    )
   }

   return res
   .status(200)
   .json(new ApiResponse
   (200,
   {all}
    ,"all subscribers of the channel"
   ))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
   const { subscriberId } = req.params
   if(!subscriberId || !isValidObjectId(subscriberId)){
    return res
    .status(402)
    .json(
        new ApiResponse(
            402,
            {},
            "invalid subscriber id"
        )
    )
   }

   const all=await Subscription.aggregate([
    {
        $match:{
            subscriber:new mongoose.Types.ObjectId(subscriberId)
        }
    }
   ])
   if(all.length<=0){
    return res
    .status(404)
    .json(
        new ApiResponse(
            404,
        {},
        "failed to fetch channels subscribed by user"
        )
    )
   }

   return res
   .status(200)
   .json(new ApiResponse(
    200,
    {all},
    "all channels subscribed by user"
   ))
   
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}