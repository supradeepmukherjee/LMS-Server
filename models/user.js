import mongoose from "mongoose";
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxLength: [37, 'Name cannot exceed 37 characters']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            unique: true,
            lowercase: true,
            match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email']
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minLength: [8, 'Password must be of atleast 8 characters'],
            select: false
        },
        role: {
            type: String,
            enum: {
                values: ['student', 'teacher', 'admin'],
                message: 'Please select a valid role'
            },
            default: 'student'
        },
        chavi: {
            type: String,
            default: 'default-chavi.png',
        },
        bio: {
            type: String,
            maxLength: [200, 'Bio can\'t exceed 200 characters']
        },
        enrolledCourses: [{
            course: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'LmsCourse'
            },
            enrolledAt: {
                type: Date,
                default: Date.now
            }
        }],
        createdCourses: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LmsCourse'
        }],
        resetPasswordToken: String,
        resetPasswordExpiry: Date,
        lastActive: {
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

userSchema.pre('save', async function (next) {
    if (!his.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12)
    next()
})

userSchema.methods.comparePassword = async function (p) {
    return await bcrypt.compare(p, this.password)
}

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(17).toString('hex')
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.resetPasswordExpiry = Date.now() + 600000
    return resetToken
}

userSchema.methods.updateLastActive = function () {
    this.lastActive = Date.now()
    return this.lastActive({ validateBeforeSave: false })
}

userSchema.virtual('totalEnrolledCourses').get(function () {
    return this.enrolledCourses.length
})

export const User = mongoose.model('LmsUser', userSchema)