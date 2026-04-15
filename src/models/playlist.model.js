import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true,
        },

        description: {
            type: String
        },

        videos: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
)

export const playlist = mongoose.model("Playlist", playlistSchema)