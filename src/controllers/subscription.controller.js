import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId")
    }

    const channel = await User.findById(channelId)

    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    const subscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

    if (subscription) {
        // If subscription exists, delete it (unsubscribe)
        await Subscription.deleteOne({ _id: subscription._id })
        return res.status(200).json(new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully"))
    } else {
        // If subscription doesn't exist, create it (subscribe)
        await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        })
        return res.status(200).json(new ApiResponse(200, { subscribed: true }, "Subscribed successfully"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriberId")
    }

    const channel = await User.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(subscriberId) }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                }
            }

        }
    ])
    if (!channel) {
        throw new ApiError(400, "This channel doesn't exist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "Subscribers fetched successfully"))



})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}