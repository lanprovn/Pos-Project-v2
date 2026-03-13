import { z } from "zod";

// --- PRODUCT SCHEMAS ---
export const productSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Tên sản phẩm ít nhất 2 ký tự"),
    price: z.number().min(0, "Giá không được nhỏ hơn 0"),
    category: z.string().min(1, "Vui lòng chọn danh mục"),
    image: z.string().url("Hình ảnh không đúng định dạng").or(z.string().optional()),
    stock: z.number().int().min(0, "Tồn kho không hợp lệ"),
    options: z.array(z.any()).optional(),
});

export const updateProductSchema = z.object({
    id: z.string(),
    data: productSchema
});

export const adjustStockSchema = z.object({
    id: z.string(),
    quantity: z.number(),
    diff: z.number().optional()
});

export const categorySchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Tên danh mục ít nhất 2 ký tự"),
    icon: z.string().optional()
});

export const updateCategorySchema = z.object({
    id: z.string(),
    name: z.string().min(2, "Tên danh mục ít nhất 2 ký tự"),
});

// --- ORDER SCHEMAS ---
export const orderItemSchema = z.object({
    id: z.string().optional(),
    productId: z.string().optional(),
    name: z.string(),
    price: z.number(),
    quantity: z.number().min(0),
    selectedOptions: z.array(z.any()).optional(),
    note: z.string().optional().nullable(),
});

export const createOrderSchema = z.object({
    items: z.array(orderItemSchema).min(1, "Đơn hàng phải có ít nhất 1 món"),
    subtotal: z.number().min(0),
    total: z.number().min(0),
    discount: z.number().min(0).max(100),
    paymentMethod: z.string(),
    diningOption: z.enum(["dine-in", "take-away"]),
    tableId: z.string().optional().nullable(),
    customerId: z.string().optional().nullable(),
});

export const updatePaymentStatusSchema = z.object({
    orderId: z.string(),
    status: z.string(),
    paymentMethod: z.string().optional()
});

export const updateOrderStatusSchema = z.object({
    id: z.string(),
    fulfillmentStatus: z.string()
});

export const tableIdSchema = z.object({
    tableId: z.string()
});

// --- CUSTOMER SCHEMAS ---
export const customerSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Tên khách hàng quá ngắn"),
    phone: z.string().regex(/^[0-9+ ]+$/, "Số điện thoại không hợp lệ").optional().or(z.literal("")),
    email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
});

export const createCustomerSchema = z.object({
    name: z.string().min(2, "Tên khách hàng quá ngắn"),
    phone: z.string().regex(/^[0-9+ ]+$/, "Số điện thoại không hợp lệ"),
});

export const phoneSchema = z.object({
    phone: z.string()
});

export const idSchema = z.object({
    id: z.string()
});

// --- AUTH/USER SCHEMAS ---
export const loginSchema = z.object({
    username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
    password: z.string().min(1, "Vui lòng nhập mật khẩu")
});

export const verifyPinSchema = z.object({
    userId: z.string(),
    pin: z.string().min(4, "PIN phải có ít nhất 4 số")
});

export const userSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Tên quá ngắn"),
    username: z.string().min(3, "Tên đăng nhập quá ngắn"),
    role: z.enum(["admin", "staff", "cashier"]),
    status: z.enum(["active", "inactive"]),
    avatar: z.string().optional()
});

export const updateUserSchema = z.object({
    id: z.string(),
    data: userSchema
});

// --- TABLE SCHEMAS ---
export const updateTableStatusSchema = z.object({
    id: z.string(),
    status: z.enum(["available", "occupied", "reserved"]),
    orderId: z.string().optional(),
    parentId: z.string().nullable().optional()
});

export const mergeTablesSchema = z.object({
    sourceTableId: z.string(),
    targetTableId: z.string()
});

export const releaseTableGroupSchema = z.object({
    tableId: z.string()
});

// --- HELD ORDER SCHEMAS ---
export const heldOrderSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Tên đơn chờ không được trống"),
    items: z.string().or(z.array(z.any())),
    subtotal: z.number().optional(),
    total: z.number().optional(),
    discount: z.number().optional(),
    diningOption: z.string().optional(),
    note: z.string().optional().nullable(),
    tableId: z.string().optional().nullable()
});

// --- PROMOTION SCHEMAS ---
export const validateVoucherSchema = z.object({
    code: z.string().min(1, "Mã voucher không được trống")
});

// Empty schema for no-input actions
export const emptySchema = z.object({});
