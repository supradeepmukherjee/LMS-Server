import mongoose from "mongoose";

const coursePurchaseSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LmsCourse',
            required: [true, 'Course Reference is required']
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LmsUser',
            required: [true, 'User reference is required']
        },
        amount: {
            type: Number,
            required: [true, 'Purchase amount is required'],
            min: [0, 'Amount must be non-negative']
        },
        currency: {
            type: String,
            required: [true, 'Currency is required'],
            uppercase: true,
            default: 'INR'
        },
        status: {
            type: String,
            enum: {
                values: ['Pending', 'Completed', 'Failed', 'Refunded'],
                message: 'Please select valid status'
            },
            default: 'pending'
        },
        paymentMethod: {
            type: String,
            required: [true, 'Payment method is required']
        },
        paymentId: {
            type: String,
            required: [true, 'Payment id is required']
        },
        refundId: String,
        refundAmt: {
            type: Number,
            min: [0, 'Refund Amt must be non-negative']
        },
        refundReason: String,
        metaData: {
            type: Map,
            of: String
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

coursePurchaseSchema.index({
    user: 1,
    course: 1,
    status: 1,
    createdAt: -1
})

coursePurchaseSchema.virtual('isRefundable').get(function () {
    if (this.status !== 'Completed') return false
    // const thirtyDaysAgo =
    return this.createdAt > new Date(Date.now() - (30 * 24 * 60 * 60000))
})

coursePurchaseSchema.methods.processRefund = async function (reason, amt) {
    this.reason = reason
    this.status = 'Refunded'
    this.refundAmt = amt || this.amount
    return this.save({ validateBeforeSave: false })
}

export const CoursePurchase = mongoose.model('LmsCoursePurchase', coursePurchaseSchema)