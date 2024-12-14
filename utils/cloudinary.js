import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME
})

const uploadMedia = async file => {
    try {
        const uploadRes = await cloudinary.uploader.upload(file, { resource_type: 'auto' })
        return uploadRes
    } catch (err) {
        console.log('Failed to upload media', err)
    }
}

const delVideo = async id => {
    try {
        await cloudinary.uploader.destroy(id, { resource_type: 'video' })
    } catch (err) {
        console.log('Failed to upload media', err)
    }
}

const delMedia = async id => {
    try {
        await cloudinary.uploader.destroy(id)
    } catch (err) {
        console.log('Failed to delete media', err)
    }
}

export { uploadMedia, delVideo, delMedia }