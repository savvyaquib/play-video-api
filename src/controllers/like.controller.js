import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const likedVideo = await Like.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
                likedBy: new mongoose.Types.ObjectId(req.user._id)
            }
        }
    ])

    if (likedVideo.length > 0) {
        await Like.deleteOne({ _id: likedVideo[0]._id })
        return res.status(200).json(new ApiResponse(200, { liked: false }, "Video unliked successfully"))

    } else {
        await Like.create({
            video: videoId,
            likedBy: req.user._id
        })
        return res.status(200).json(new ApiResponse(200, { liked: true }, "Video liked successfully"))
    }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}