import Razorpay from "razorpay";
import { Course } from '../models/course.js'
import { CoursePurchase } from '../models/coursePurchase.js'
import { ApiError, catchAsync } from "../middleware/error";
import crypto from 'crypto'

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
})

const createOrder = catchAsync(async (req, res) => {
    const course = await Course.findById(req.body.id)
    if (!course) throw new ApiError('Course not Found', 404)
    const newPurchase = new CoursePurchase({
        course: course.id,
        user: req.id,
        amount: course.price,
        status: 'Pending'
    })
    const order = await razorpay.orders.create({
        amount: course.price * 100,
        currency: 'INR',
        receipt: 'course_' + course.id
    })
    newPurchase.paymentId = order.id
    await newPurchase.save()
    res.status(200).json({
        success: true,
        order,
        course: {
            name: course.title,
            desc: course.description
        }
    })
})

const verify = catchAsync(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
    if (razorpay_signature !== crypto.createHmac('sha256', process.env.RAZORPAY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex')) throw new ApiError('Payment Verification failed', 400)
    const purchase = await CoursePurchase.findOne({ paymentId: razorpay_order_id })
    if (!purchase) throw new ApiError('Purchase Record Not Found', 404)
    purchase.status = 'Completed'
    await purchase.save()
    res.status(200).json({
        success: true,
        msg: 'Payment Verification Successful',
    })
})

export { createOrder, verify }