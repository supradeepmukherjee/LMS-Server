import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Lecture Title is required'],
            trim: true,
            maxLength: [100, 'Lecture title can\'t exceed 100 characters']
        },
        description: {
            type: String,
            trim: true,
            maxLength: [500, 'Lecture Description can\'t exceed 500 characters']
        },
        resourceUrl: {
            type: String,
            required: [true, 'Resource(Video) URL is required']
        },
        duration: {
            type: Number,
            default: 0
        },
        publicId: {
            type: String,
            required: [true, 'Public ID is required for video management']
        },
        isPreview: {
            type: Boolean,
            default: false
        },
        order: {
            type: Number,
            required: [true, 'Lecture Order is required']
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

lectureSchema.pre('save', function (next) {
    if (this.duration) this.duration = Math.round(this.duration * 100) / 100
    next()
})

export const Lecture = mongoose.model('LmsLecture', lectureSchema)