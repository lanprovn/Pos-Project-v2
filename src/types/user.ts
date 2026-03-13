export interface User {
    id: string;
    username: string;
    name: string;
    role: 'admin' | 'staff' | 'cashier';
    status: 'active' | 'inactive';
    avatar?: string | null;
    pin?: string | null;
    password?: string;
    createdAt: Date;
    updatedAt: Date;
}
