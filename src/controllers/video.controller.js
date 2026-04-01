import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadonCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    if(!userId || !( mongoose.Types.ObjectId.isValid(userId))){
        return res
        .status(402)
        .json(
            new ApiResponse(402,
                {},
                "the userId is wrong..."
            )
        )
    }

    const sumup=[]

    // sumup.push({
    //     $match:{
    //         owner:mongoose.Types.ObjectId(userId)
    //     }
    // })

   if(query && query.trim()!==""){
    sumup.push({
        $match:{
            $or:[
                {title:
                    {
                        $regex:query,$options:'i'
                    }
                },
                {
                    description:{
                        $regex:query,$options:'i'
                    }
                }
            ]
        }
    })
   }

   sumup.push({
    $group: {
        _id: "$_id",
        doc: { $first: "$$ROOT" }
    }
})

sumup.push({
    $replaceRoot: { newRoot: "$doc" }
})
   sumup.push({
    $sort:{
        [sortBy]:sortType === "asc"?1:-1
    }
   })

   sumup.push(
    {$skip:Number(page-1)*Number(limit)},
    {$limit:Number(limit)}
   )


   const video=await Video.aggregate(sumup)


   return res
   .status(200)
   .json(
    new ApiResponse(
        200,
        {video},
        "all the possible videos found"
    )
   )



})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const videolocalpath=req.files?.videoFile?.[0].path
    const thumbnaillocalpath=req.files?.thumbnail?.[0].path

    if(!videolocalpath || videolocalpath===undefined){
        return res
        .status(404)
        .json(
            new ApiResponse(404,{},"video path not found")
        )
    }
    
    if(!thumbnaillocalpath){
        return res
        .status(404)
        .json(
            new ApiResponse(404,{},"thumbnail is required ")
        )
    }
    
        if(!title){
           return res
        .status(404)
        .json(
            new ApiResponse(404,{},"title is required")
        )
        }
    
        if(!description){
           return res
        .status(404)
        .json(
            new ApiResponse(404,{},"description is required ")
        )
        }
    const video =await uploadonCloudinary(videolocalpath)
    const thumbnail=await uploadonCloudinary(thumbnaillocalpath)
    
    if(!video){
        throw new ApiError(409,"video not uploaded ")
    }


    const mvideo =await Video.create({
        videofile:video.url,
        thumbnail:thumbnail.url,
        title:title,
        description:description,
        duration:video.duration,
        views:0,
        isPublished:true,
        owner:req.user._id
    }) 



    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                video:mvideo
            },
            "video uploaded successfully"
        )

    ) 
    
})





const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    
    if(!videoId){
        return res
        .status(406)
        .json(
           new ApiResponse( 406,
            {},
            "video not available"
        )
    )
    }

    // const video=await Video.findById(videoId)

    const video =await  Video.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"user",
                localField:"owner",
                foreignField:"_id",
                as:"user"
            },
        },
        // {
        //     $unwind:"$user",     
        // },
        {
        $project:{
            owner:"$user.username",
            videofile:1,
            thumbnail:1,
            duration:1,
            title:1,
            description:1,
            views:1,
        }
    }]
    )
    
    
    if(!video){
        return res
        .status(407)
        .json(
            new ApiResponse(
                407,
                {},
                "video not found in db"
            )
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            { video:video[0]},
            "video found"
        )
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
     if(!new mongoose.Types.ObjectId(videoId)){
        return res
        .status(406)
        .json(
           new ApiResponse( 406,
            {},
            "video not available // wrong input"
        )
    )
    }

    const{title,description}=req.body;

    if(!(title||description)){
        return res
        .status(409)
        .json(
            new ApiError(409,"send all details")
        )
    }

    const thumbnaillocalpath=req?.file?.path
    if(!thumbnaillocalpath){
        return res
        .status(406)
        .json(
            new ApiResponse(
                406,
                {},
                "thumbnail not recieved"
            )
        )
    }

    const thumbnail= await uploadonCloudinary(thumbnaillocalpath);

    const updt= await Video.findByIdAndUpdate(
        videoId,{
            $set:{
                title:title,
                description:description,
                thumbnail:thumbnail.url
            }
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {updt,videoId,title,description},
            "video updated successfully"
        )
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
      if( !videoId||! mongoose.Types.ObjectId.isValid(videoId)){
        return res
        .status(406)
        .json(
           new ApiResponse( 406,
            {},
            "video not available  // not found video"
        )
    )
    }
    if(!req.user._id){
        return res
        .status(411)
        .json(
            new ApiResponse(
            411,
            {},
            "user not found"
        )
    )
    }
     const vdeo=await Video.findById(videoId)
    if(!vdeo.owner){
        return res
        .status(412)
        .json(
            new ApiResponse(
            412,
            {},
            "video owner not found"
        )
    )
    }
    if (vdeo.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json(
        new ApiResponse(403, {}, "You are not allowed to delete this video")
    );
    }
    const video= await Video.findByIdAndDelete(videoId)

    if(!video){
        return res
        .status(405)
        .json(
            new ApiResponse(
                405,
                {},
                "video failed to be deleted"
            )
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "video deleted"
        )
    )


})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!(videoId ||mongoose.Types.ObjectId(videoId))){
        return res
        .status(406)
        .json(
            new ApiResponse(406,
                {},
                "video not found"
            )
        )
    }
    if(!req.user._id){
        return res
        .status(411)
        .json(
            new ApiResponse(
            411,
            {},
            "user not found"
        )
    )
    }
    const video=await Video.findById(videoId)
    if(!video.owner){
        return res
        .status(412)
        .json(
            new ApiResponse(
            412,
            {},
            "video owner not found"
        )
    )
    }
    if (video.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json(
        new ApiResponse(403, {}, "You are not allowed to take this action on  this video")
    );
    }
    const stat=await video.isPublished
    const tps= await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                isPublished:!stat
            }
        }
    )
    
    if(!tps){
        return res
        .status(410)
        .json(
            new ApiResponse(
                410,
                {},
                "the action failed"
            )
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {tps},
            "the video status is toggled successfully"
        )
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}