import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export default cloudinary;

export const uploadToCloudinary = async (fileUri: string, folder: string = 'pos-coffee') => {
    try {
        const result = await cloudinary.uploader.upload(fileUri, {
            folder: folder,
            resource_type: 'auto',
        });
        return { success: true, url: result.secure_url, public_id: result.public_id };
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        return { success: false, error };
    }
};
