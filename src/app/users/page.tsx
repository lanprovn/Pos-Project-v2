"use client";

import { useState, useEffect } from "react";
import { useAuthStore, type User } from "@/store/useAuthStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";
import { Search, Edit2, Trash2, UserPlus, Shield, User as UserIcon, Ban, CheckCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { getUsers, createUserAction, updateUserAction, deleteUserAction } from "@/app/actions/auth";

export default function UsersPage() {
    const { user: currentUser } = useAuthStore();
    const [staffList, setStaffList] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const refreshUsers = async () => {
        const res = await getUsers();
        if (res.success) setStaffList((res.users as any[]).map(u => ({ ...u, createdAt: new Date(u.createdAt).toISOString() })) as User[]);
    };

    useEffect(() => {
        const init = async () => {
            await refreshUsers();
        };
        init();
    }, []);

    const [formData, setFormData] = useState<{
        name: string;
        username: string;
        role: 'admin' | 'staff';
        status: 'active' | 'inactive';
    }>({
        name: "",
        username: "",
        role: "staff",
        status: "active"
    });

    const filteredUsers = staffList.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                username: user.username,
                role: user.role,
                status: user.status
            });
        } else {
            setEditingUser(null);
            setFormData({ name: "", username: "", role: "staff", status: "active" });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            await updateUserAction({ id: editingUser.id, data: formData as any });
        } else {
            await createUserAction({
                ...formData,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`
            });
        }
        await refreshUsers();
        setIsModalOpen(false);
    };

    const toggleStatus = async (user: User) => {
        await updateUserAction({ id: user.id, data: { ...user, status: user.status === 'active' ? 'inactive' : 'active' } as any });
        await refreshUsers();
    };

    const handleDelete = async (id: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
            await deleteUserAction({ id });
            await refreshUsers();
        }
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden premium-gradient">
            <Sidebar />

            <main className="flex-1 flex flex-col p-6 overflow-hidden">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Quản lý Nhân sự</h1>
                        <p className="text-muted-foreground text-sm">Quản lý tài khoản Admin và Nhân viên bán hàng.</p>
                    </div>

                    <div className="flex gap-3">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Tìm tên, tài khoản..."
                                className="w-full bg-white border border-black/5 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            <UserPlus size={20} />
                            Thêm nhân sự
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden bg-white rounded-3xl border border-black/5 shadow-sm flex flex-col">
                    <div className="overflow-y-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-secondary/50 backdrop-blur-md z-10">
                                <tr>
                                    <th className="p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider border-b border-black/5">Nhân sự</th>
                                    <th className="p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider border-b border-black/5">Tài khoản</th>
                                    <th className="p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider border-b border-black/5">Vai trò</th>
                                    <th className="p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider border-b border-black/5">Trạng thái</th>
                                    <th className="p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider border-b border-black/5 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {filteredUsers.map((u) => (
                                        <motion.tr
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            key={u.id}
                                            className="group hover:bg-secondary/30 transition-colors border-b border-dashed border-black/5 last:border-0"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden relative border border-black/5">
                                                        <Image
                                                            src={u.avatar || "/placeholder.png"}
                                                            alt={u.name}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-sm block">{u.name}</span>
                                                        <span className="text-xs text-muted-foreground">Tham gia: {new Date(u.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm font-medium text-slate-700">
                                                @{u.username}
                                            </td>
                                            <td className="p-4">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                                    u.role === 'admin' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                                                )}>
                                                    {u.role === 'admin' ? <Shield size={12} /> : <UserIcon size={12} />}
                                                    {u.role}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                                                    u.status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                                                )}>
                                                    <span className={cn("w-1.5 h-1.5 rounded-full", u.status === 'active' ? "bg-emerald-500" : "bg-orange-500")} />
                                                    {u.status === 'active' ? "Đang hoạt động" : "Bị khóa"}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        onClick={() => handleOpenModal(u)}
                                                        className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    {u.id !== currentUser?.id && (
                                                        <>
                                                            <button
                                                                onClick={() => toggleStatus(u)}
                                                                className={cn(
                                                                    "p-2 rounded-lg transition-colors",
                                                                    u.status === 'active' ? "text-muted-foreground hover:bg-orange-100 hover:text-orange-600" : "text-emerald-600 hover:bg-emerald-100"
                                                                )}
                                                                title={u.status === 'active' ? "Khóa tài khoản" : "Mở khóa"}
                                                            >
                                                                {u.status === 'active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(u.id)}
                                                                className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                                title="Xóa vĩnh viễn"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* User Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-black/5 bg-secondary/30 flex justify-between items-center text-xl font-bold">
                                {editingUser ? "Cập nhật Nhân sự" : "Thêm Nhân sự mới"}
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-black/5 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground mb-1 block">Họ và tên</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="VD: Nguyễn Văn A"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground mb-1 block">Tên đăng nhập (@)</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none font-mono"
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                                        placeholder="nguyenvana"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground mb-1 block">Vai trò</label>
                                        <select
                                            className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none bg-white"
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value as 'admin' | 'staff' })}
                                        >
                                            <option value="staff">Staff (Nhân viên)</option>
                                            <option value="admin">Admin (Quản trị)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground mb-1 block">Trạng thái</label>
                                        <select
                                            className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:ring-2 focus:ring-primary/50 outline-none bg-white"
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Locked</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-3 rounded-xl font-bold bg-secondary hover:bg-secondary/80 transition-all"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-3 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                                    >
                                        {editingUser ? "Lưu thay đổi" : "Tạo tài khoản"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
