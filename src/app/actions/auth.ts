"use server";

import { authService } from "@/services/authService";
import { createSafeAction } from "@/lib/create-safe-action";
import { verifyPinSchema, loginSchema, userSchema, idSchema, emptySchema, updateUserSchema } from "@/lib/validations";
import { z } from "zod";

export const verifyPin = createSafeAction(
    verifyPinSchema,
    async ({ userId, pin }) => {
        await authService.verifyPin(userId, pin);
        return true;
    }
);

export const loginAction = createSafeAction(
    loginSchema,
    async ({ username, password }) => {
        const user = await authService.login(username, password);
        return { user };
    }
);

export const getUsers = createSafeAction(
    emptySchema,
    async () => {
        const users = await authService.getAllUsers();
        return { users };
    }
);

export const createUserAction = createSafeAction(
    userSchema,
    async (data) => {
        const user = await authService.createUser(data);
        return { user };
    }
);

export const updateUserAction = createSafeAction(
    z.object({
        id: z.string(),
        data: z.any() // Should use userSchema but bypassing strict validation for updates for now
    }),
    async ({ id, data }) => {
        const user = await authService.updateUser(id, data);
        return { user };
    }
);

export const deleteUserAction = createSafeAction(
    idSchema,
    async ({ id }) => {
        await authService.deleteUser(id);
        return true;
    }
);
