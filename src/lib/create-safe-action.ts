import { z } from "zod";

export type ActionState<T> = 
    | ({ success: true } & T)
    | { success: false; error: string; validationErrors?: Record<string, string[]> };

export function createSafeAction<TInput, TOutput>(
    schema: z.Schema<TInput>,
    handler: (data: TInput) => Promise<TOutput>
) {
    return async (input?: TInput): Promise<ActionState<TOutput>> => {
        const validatedFields = schema.safeParse(input ?? {});

        if (!validatedFields.success) {
            return {
                success: false,
                error: "Dữ liệu không hợp lệ",
                validationErrors: validatedFields.error.flatten().fieldErrors as Record<string, string[]>,
            };
        }

        try {
            const result = await handler(validatedFields.data);
            return {
                success: true,
                ...result,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || "Đã có lỗi xảy ra",
            };
        }
    };
}
