import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    // console.log(5)
    //TODO: create tweet
    const{tweet}=req.body;
    const user=req.user._id
    if(!tweet||tweet.length===0){
        return res
        .status(404)
        .json(
            new ApiError(
                404,
                "provide tweet"
            )
        )
    }

    const tw=await Tweet.create({
        content:tweet,
        owner:user
    } )

    if(!tw){
        return res
        .status(403 )
        .json(
            new ApiResponse(
                403,
                {},
                "tweet publishing failed"
            )
        )
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {tw},
            "tweet published successfully"
        )
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId}=req.params
    console.log(userId)
    if(!userId ||!isValidObjectId(userId)){
        return res
        .status(404)
        .json(
            new ApiResponse(
                404,
                {},
                "not valid userId"
            )
        )
    }
    const all=await Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
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
            "failed to gather the tweeets by user"
            )
        )
    }
    return res
    .status(
200
    )
    .json(
        new ApiResponse(
            200,
            {all},
            "all tweets by the user"
        )
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweet }=req.body;
    const{tweetId}=req.params
    const user=req.user._id
    if(!tweetId || !isValidObjectId(tweetId)){
        return res
        .status(404)
        .json(
            new ApiResponse(
                404,
                {},
                "tweetId is invalid"
            )
        )
    }

    const orginal=await Tweet.findById(tweetId)

    if(orginal.owner.toString()!==user.toString()){
        return res
        .status(404)
        .json(
            new ApiResponse(
                404,
                {},
                "you are not eligible to edit the tweet"
            )
        )
    }

    const upt=await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content:tweet
            }
        }
    )

    if(!upt){
        return res
        .status(406)
        .json(
            new ApiResponse(
                406,
                {},
                "tweet update failed"
            )
        )
    }

    return res
    .status(404)
    .json(
        new ApiResponse(
            404,
            {upt},
            "tweet updated successfully"
        )
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const{tweetId}=req.params
    const user=req.user._id
    if(!tweetId || !isValidObjectId(tweetId)){
        return res
        .status(
            403
        )
        .json(
            new ApiResponse(
                403,
                {},
                "provide valid tweetId"
            )
        )
    }
    const tweet=await Tweet.findById(tweetId)
    // console.log(tweet)
    if(tweet.owner.toString()!==user.toString()){
        return res
        .status(401)
        .json(
            401,
            {},
            "you are not allowed to delete someone else's tweet"
        )
    }


    const dlt=await Tweet.findByIdAndDelete(tweetId)

    if(!dlt){
        return res
        .status(402)
        .json(
            new ApiResponse(
                401,
                {},
                "failed to delete tweet"
            )
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {dlt},
            "tweet deleted"
        )
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}