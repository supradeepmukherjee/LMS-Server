import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Course Title is required'],
            trim: true,
            maxLength: [100, 'Course Title can\'t exceed 100 characters']
        },
        subtitle: {
            type: String,
            trim: true,
            maxLength: [200, 'Course Subtitle can\'t exceed 200 characters']
        },
        description: {
            type: String,
            trim: true,
            maxLength: [500, 'Course Description can\'t exceed 500 characters']
        },
        category: {
            type: String,
            required: [true, 'Course category is required'],
            trim: true,
        },
        level: {
            type: String,
            enum: {
                values: ['beginner', 'intermediate', 'advanced'],
                message: 'Please select a valid course level'
            },
            default: 'beginner'
        },
        price: {
            type: Number,
            required: [true, 'Course price is required'],
            min: [0, 'Course price must be non-negative']
        },
        thumbnail: {
            type: String,
            required: [true, 'Course Thumbnail is required']
        },
        enrolledStudents: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LmsUser'
        }],
        lectures: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LmsLecture'
        }],
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LmsUser',
            required: [true, 'Course instructor is required']
        },
        isPublished: {
            type: Boolean,
            default: false
        },
        totalDuration: {
            type: Number,
            default: 0
        },
        totalLectures: {
            type: Number,
            default: 0
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

courseSchema.virtual('avgRating').get(function () {

})

courseSchema.pre('save', function () {
    if (this.lectures) this.totalLectures = this.lectures.length
    next()
})

export const Course=mongoose.model('LmsCourse',courseSchema)