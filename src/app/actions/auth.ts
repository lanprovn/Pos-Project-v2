"use server";

import { prisma } from "@/lib/prisma";

export async function verifyPin(userId: string, pin: string) {
    try {
        interface UserDB { id: string; username: string; pin: string | null; password?: string }
        const user = await prisma.user.findUnique({
            where: { id: userId }
        }) as unknown as UserDB;

        if (!user) return { success: false, error: "User not found" };

        if (user.pin === pin) {
            return { success: true };
        }

        return { success: false, error: "Incorrect PIN" };
    } catch (error) {
        console.error("Error verifying PIN:", error);
        return { success: false, error: "Verification failed" };
    }
}

export async function loginAction(username: string, password: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user || user.password !== password) {
            return { success: false, error: "Sai tên đăng nhập hoặc mật khẩu" };
        }
        return { success: true, user };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: "Lỗi đăng nhập" };
    }
}

export async function getUsers() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, users };
    } catch (error) {
        console.error("Error fetching users:", error);
        return { success: false, error: "Failed to fetch users" };
    }
}

export async function createUserAction(data: { name: string; username: string; role: string; status: string; avatar?: string }) {
    try {
        const user = await prisma.user.create({
            data: {
                name: data.name,
                username: data.username,
                role: data.role,
                status: data.status,
                avatar: data.avatar,
                password: "123", // Default password
            }
        });
        return { success: true, user };
    } catch (error) {
        console.error("Error creating user:", error);
        return { success: false, error: "Failed to create user" };
    }
}

export async function updateUserAction(id: string, data: { name: string; username: string; role: string; status: string; avatar?: string }) {
    try {
        const user = await prisma.user.update({
            where: { id },
            data: {
                name: data.name,
                username: data.username,
                role: data.role,
                status: data.status,
                avatar: data.avatar
            }
        });
        return { success: true, user };
    } catch (error) {
        console.error("Error updating user:", error);
        return { success: false, error: "Failed to update user" };
    }
}

export async function deleteUserAction(id: string) {
    try {
        await prisma.user.delete({
            where: { id }
        });
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, error: "Failed to delete user" };
    }
}
