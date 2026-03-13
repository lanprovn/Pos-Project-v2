import { userRepo } from "@/repositories/userRepo";

export class AuthService {
    async verifyPin(userId: string, pin: string) {
        const user = await userRepo.findById(userId);
        if (!user) throw new Error("User not found");
        
        if (user.pin !== pin) {
            throw new Error("Incorrect PIN");
        }
        return true;
    }

    async login(username: string, password: string) {
        const user = await userRepo.findByUsername(username);
        if (!user || user.password !== password) {
            throw new Error("Sai tên đăng nhập hoặc mật khẩu");
        }
        return user;
    }

    async getAllUsers() {
        return await userRepo.findAll();
    }

    async createUser(data: any) {
        return await userRepo.create({
            ...data,
            password: "123", // Default password
        });
    }

    async updateUser(id: string, data: any) {
        return await userRepo.update(id, data);
    }

    async deleteUser(id: string) {
        return await userRepo.delete(id);
    }
}

export const authService = new AuthService();
