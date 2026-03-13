"use server";

import { uploadService } from "@/services/uploadService";

export async function uploadImageAction(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) {
        return { success: false, message: 'No file provided' };
    }

    try {
        const url = await uploadService.uploadImage(file);
        return { success: true, url };
    } catch (error: any) {
        console.error('Upload Action Error:', error);
        return { success: false, message: error.message || "Upload failed" };
    }
}
