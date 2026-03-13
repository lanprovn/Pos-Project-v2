import { cloudinary } from "@/lib/cloudinary";

export class UploadService {
    async uploadImage(file: File) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise<string>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: 'pos-coffee-new' },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result?.secure_url as string);
                    }
                }
            ).end(buffer);
        });
    }
}

export const uploadService = new UploadService();
