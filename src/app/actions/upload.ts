"use server";

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export async function uploadImageAction(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) {
        return { success: false, message: 'No file provided' };
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, _reject) => {
            cloudinary.uploader.upload_stream(
                { folder: 'pos-coffee-new' },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary Upload Action Error:', error);
                        resolve({ success: false, message: error.message });
                    } else {
                        resolve({ success: true, url: result?.secure_url });
                    }
                }
            ).end(buffer);
        });
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Upload failed" };
    }
}
