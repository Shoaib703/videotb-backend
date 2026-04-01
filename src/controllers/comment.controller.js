import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)){
        return res
        .status(402)
        .json(
            new ApiResponse(
                402,
                {},
                "qwertyuiop"
            )
        )
    }

    const cmts=await Comment.aggregate([
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $skip:(page-1)*limit
        },
        {
            $limit:limit
        }
    ])

    if(!cmts || cmts.length===0){
        return res
        .status(406)
        .json(
            new ApiResponse(
                406,
                {},
                "comment fetching failed "
            )
        )
    }


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {cmts},
            "comments fetched successfully"
        )
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
       const {comments}=req.body
    const _id=req.user._id
    const _vid=req.params.videoId;

    if(!comments||comments.length===0){
        return res
        .status(409)
        .json(
            new ApiResponse(
                409,
                {},
                "no comment"))
    }
    
    if(!_vid|| _vid.length===0||! mongoose.Types.ObjectId.isValid(_vid)){
        return res.status(404)
        .json(
            new ApiError(404,"no video id ")
        )
    }

    if(!_id || ! mongoose.Types.ObjectId.isValid(_id)){
        return res
        .status(404)
        .json(
                new ApiError(404,"no user id")
        )
    }

    const cmt=await Comment.create({
        content:comments,
        video:_vid,
        owner:_id
    })
    
    if(!cmt){
        return res
        .status(408)
        .json(
            new ApiResponse(
                408,
                {},
                "comment failed"
            )
        )
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,
            {cmt},
        "comment created successfully"
    ))
})

const updateComment = asyncHandler(async (req, res) => {
    console.log(3)
    // TODO: update a comment
    const{commentId}=req.params
    const{comment}=req.body
    const user=req.user._id

    if(!commentId || !mongoose.Types.ObjectId.isValid(commentId)){
        return res
        .status(404)
        .json(
            new ApiResponse(
                404,
                {},
                "invalid commentId"
            )
        )
    }


    const cmt=await Comment.findById(commentId)

    if(cmt.owner.toString()!==user.toString()){
        return res
        .status(411)
        .json(
            411,
            {},
            "you are not eligible to  edit the comment"
        )
    }
    

    if(!comment || comment.length===0){
        return res
        .status(404)
        .json(
            new ApiResponse(
                404,
                {},
                "send the comment"
            )
        )
    }

    const upt=await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content:comment
            }
        },
        {
            new:true
        }
    )


    if(!upt){
        return res
        .status(404)
        .json(
            404,
            {},
            "comment updation failed"
        )
    }


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {upt},
            "comment updated successfully"
        )
    )



})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId}=req.params
    const user=req.user._id

    if(!commentId || !mongoose.Types.ObjectId.isValid(commentId)){
        return res
        .status(404)
        .json(
            new ApiResponse(
                404,
                {},
                "provide valid comment Id"
            )
        )
    }

    const cmt=await Comment.findById(commentId)
    if(!cmt){
        return res
        .status(408)
        .json(
            new ApiResponse(
                408,
            {},
            "comment not found"
        )
    )
    }
    if(cmt.owner.toString()!==user.toString()){
        return res
        .status(405)
        .json(
            new ApiResponse(
                405,
                {},
                "you are not allowed to delete the comment"
            )
        )
    }


    const dc=await Comment.findByIdAndDelete(commentId)

    if(!dc){
        return res
        .status(406)
        .json(
            new ApiResponse(
                406,
                {},
                "failed to delete comment"
            )
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "comment deleted successfully"
        )
    )

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }