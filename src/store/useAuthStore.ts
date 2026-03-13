import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Role = 'admin' | 'staff';

import { loginAction } from "@/app/actions/auth";

export interface User {
    id: string;
    name: string;
    username: string;
    role: 'admin' | 'staff';
    avatar?: string;
    status: 'active' | 'inactive';
    createdAt: string;
}

interface AuthStore {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: (user) => set({ user, isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),
            _hasHydrated: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),
        }),
        {
            name: 'auth-storage-v2',
            storage: createJSONStorage(() => sessionStorage),
            onRehydrateStorage: (state) => {
                return () => state?.setHasHydrated(true);
            }
        }
    )
);

export const mockLogin = async (username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    const res = await loginAction({ username, password });
    if (res.success && res.user) {
        if (res.user.status === 'inactive') return { success: false, error: 'Tài khoản này đã bị khóa' };

        const user: User = {
            id: res.user.id,
            name: res.user.name,
            username: res.user.username,
            role: res.user.role as Role,
            avatar: res.user.avatar || undefined,
            status: res.user.status as 'active' | 'inactive',
            createdAt: res.user.createdAt.toISOString()
        };
        return { success: true, user };
    }

    return { success: false, error: !res.success ? res.error : 'Tên đăng nhập hoặc mật khẩu không đúng' };
};
