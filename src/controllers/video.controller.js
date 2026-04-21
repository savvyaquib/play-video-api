import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType = -1, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const sortOrder = sortType === "asc" ? 1 : -1

    const aggregateVideos = Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId || req.user._id),
                title: { $regex: query, $options: "i" }
            }

        },
        {
            $sort: {
                [sortBy]: sortOrder
            }
        }
    ]);

    const options = {
        page: Number(page),
        limit: Number(limit),
    };
    const videos = await Video.aggregatePaginate(aggregateVideos, options)
    return res
        .status(200)
        .json(new ApiResponse(200, videos, "All videos fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    const videoLocalPath = req.files?.videoFile?.[0]?.path;

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    const video = await uploadOnCloudinary(videoLocalPath)

    if (!video) {
        throw new ApiError(400, "Video file is required")
    }

    const newVideo = await Video.create({
        title: title,
        description: description,
        videoFile: video.url,
        thumbnail: thumbnail.url,
        duration: video.duration | 0,
        owner: req.user?._id


    })
    return res
        .status(200)
        .json(new ApiResponse(200, newVideo, "Your video is uploaded successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video is fetched successfully"))

})

const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video by id
    const { videoId } = req.params
    const { title, description } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const thumbnailLocalPath = req.file?.path;

    if (!title && !description && !thumbnailLocalPath) {
        throw new ApiError(400, "You have to update field to make changes")
    }

    const updateFields = {}

    if (title) updateFields.title = title
    if (description) updateFields.description = description

    if (thumbnailLocalPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

        if (!thumbnail?.url) {
            throw new ApiError(400, "Thumbnail upload failed")
        }

        updateFields.thumbnail = thumbnail.url
    }


    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: updateFields
        },
        { new: true, runValidators: true }
    )

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video details updated successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
