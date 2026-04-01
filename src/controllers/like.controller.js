import mongoose, { isValidObjectId, Mongoose } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    const user = req.user._id

    if (!videoId || !isValidObjectId(videoId)) {
        return res
            .status(404)
            .json(
                new ApiError(404, "not a valid videoid")
            )
    }
    
    const check = await Like.aggregate([
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId),
                likedby:user
             }
        }
    ])
  
    
    if(check.length>0){
        const dlt=await Like.deleteOne(
            {
                video:videoId,
                likedby:user
            }
        )

        if(!dlt){
            return res
            .status(406)
            .josn(
                new ApiResponse(
                    406,
                    {},
                    "failed to toggle like"
                )
            )
        }


        return res
        .status(200)
        .json(
            new ApiResponse(
            200,
            {dlt},
            "like toggled successfully"
        )
    )
    }




    const like = await Like.create({
        video: videoId,
        likedby: user,
    })
    if (!like) {
        return res
            .status(404)
            .json(
                new ApiResponse(
                    404,
                    {},
                    "failed to like the video"
                )
            )
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { like },
                "video liked"
            )
        )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment
    const user=req.user._id
    if(!commentId||!isValidObjectId(commentId)){
        return res
        .status(403)
        .json(
            new ApiResponse(
                403,
                {},
                "not valid comment Id"
            )
        )
    }

    const check=await Like.aggregate([
        {
            $match:{
                comment:new mongoose.Types.ObjectId(commentId),
                likedby:user
            }
        }
    ]
    )

    if(check.length>0){
       
        const dlt=await Like.deleteOne(
            {
                comment:new mongoose.Types.ObjectId(commentId),
                likedby:user
            }
        )
    
  
        if(!dlt){
            return res
            .status(406)
            .json(
                new ApiResponse(
                    406,
                    {},
                    "comment toggle failed"
                )
            )
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
            {},
            "comment like toggled"
            )
        )
    }


    const likecomment=await Like.create(
        {
            comment:new mongoose.Types.ObjectId(commentId),
            likedby:user
        }
    )
    if(!likecomment){
        return res
        .status(409)
        .json(
            new ApiResponse(
                409,
                {},
                "failed to like comment"
            )
        )
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {likecomment},
            "comment liked"
        )
    )



})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
    const user=req.user._id
    if(!tweetId|| !isValidObjectId(tweetId)){
        return res
        .status(404)
        .json(
            new ApiResponse(
                404,
                {},
                "provide valid tweet ID"
            )
        )
    }

    const chk=await Like.aggregate([
        {
            $match:{
                owner:user,
                tweet:new mongoose.Types.ObjectId(tweetId)
            }
        }
    ])
    if(chk.length>0){
        const dlt=await Like.findByIdAndDelete(tweetId)

        if(!dlt){
            return res.status(404).json(new ApiResponse(404,{},"failed to delete tweeet like"))
        }

        return res.status(200)
        .json(
            new ApiResponse(200,{},"tweet like removed")
        )
    }


    const like=await Like.create(
        {
            tweet:new mongoose.Types.ObjectId(tweetId),
            likedby:user
        }
    )

    if(!like){
        return res
        .status(403)
        .json(new ApiResponse(403,{},"faile to like the tweet"))
    }
    return res
    .status(200)
    .json(new ApiResponse(
        200,{like},"tweet liked "
    ))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const user=req.user._id

    if(!user ||!isValidObjectId(user)){
        return res
        .status(404)
        .json(
            new ApiResponse(
                404,
                {},
                "provide valid user id"
            )
        )
    }


    const all=await Like.aggregate([
        {
            $match:{
                user:user,
                video:{$exists:true}
            }
        }
    ])
    if(!all){
        return res
        .status(403)
        .json(
            new ApiResponse(403,
                {},
                "no vido found"
            )
        )
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {all},
            "all liked videos by user"
        )
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}