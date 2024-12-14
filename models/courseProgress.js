import mongoose from "mongoose";

const lectureProgressSchema = new mongoose.Schema({
    lecture: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LmsLecture',
        required: [true, 'Lecture Reference is required']
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    watchTime: {
        type: Number,
        default: 0
    },
    lastWatched: {
        type: Date,
        default: Date.now
    }
})

const courseProgressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LmsUser',
            required: [true, 'User Reference is required']
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LmsCourse',
            required: [true, 'Course Reference is required']
        },
        isCompleted: {
            type: Boolean,
            default: false
        },
        completionPercent: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        lectureProgress: [lectureProgressSchema],
        lastAccess: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

courseProgressSchema.pre('save', function (next) {
    const lectureProgress = this.lectureProgress
    if (lectureProgress.length > 0) {
        const completedLectures = lectureProgress.filter(l => l.isCompleted).length
        this.completionPercent = Math.round((completedLectures / lectureProgress.length) * 100)
        this.isCompleted = this.completionPercent === 100
    }
    next()
})

courseProgressSchema.methods.updateLastAccess = function () {
    this.lastAccess = Date.now()
    return this.save({ validateBeforeSave: false })
}

export const CourseProgress = mongoose.model('LmsCourseProgress', courseProgressSchema)