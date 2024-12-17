import { ApiError, catchAsync } from "../middleware/error.js";
import generate from '../utils/generateToken.js'
import { User } from '../models/user.js'
import { delMedia, uploadMedia } from '../utils/cloudinary.js'

const createUserAccount = catchAsync(async (req, res) => {
    const { name, email, password, role = 'student' } = req.body
    const exists = await User.findOne({ email })
    if (exists) throw new ApiError('User already exists', 400)
    const user = await User.create({ name, email, password, role })
    await user.updateLastActive()
    generate(res, user, 'Account Created Successfully')
})

const authenticateUser = catchAsync(async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+password')
    if (!user || (await user.comparePassword(password))) throw new ApiError('Invalid Email/Password', 400)
    await user.updateLastActive()
    generate(res, user, 'Welcome Back' + user.name)
})

const logout = (req, res) => {
    res.cookie('token', '', { maxAge: 0 })
    res.status(200).json({
        success: true,
        msg: 'Signed out Successfully'
    })
}

const getUserProfile = catchAsync(async (req, res) => {
    const user = await User.findById(req.id).populate({
        path: 'enrolledCourses.course',
        select: 'title thumbnail description'
    })
    if (!user) throw new ApiError('User not Found', 404)
    res.status(200).json({
        success: true,
        data: {
            ...user.toJSON(),
            totalEnrolledCourses: user.totalEnrolledCourses
        }
    })
})

const updateUserProfile = catchAsync(async (req, res) => {
    if (req.file) {
        const { secure_url } = await uploadMedia(req.file.path)
        req.body.chavi = secure_url
        const user = await User.findById(req.id)
        if (user.chavi && user.chavi !== 'default-chavi.png') await delMedia(user.chavi)
    }
    const updatedUser = await User.findByIdAndUpdate(req.id, req.body, {
        new: true,
        runValidators: true
    })
    if (!updatedUser) throw new ApiError('User not Found', 404)
    res.status(200).json({
        success: true,
        msg: 'Profile Updated Successfully',
        data: req.body
    })
})

export { authenticateUser, createUserAccount, getUserProfile, logout, updateUserProfile }