"use client";

import { useCartStore, type DiningOption } from "@/store/useCartStore";
import { formatCurrency, cn } from "@/lib/utils";
import { Plus, Minus, Trash2, Search, ShoppingCart, CreditCard, Edit3, MessageSquare, Utensils, ShoppingBag, ClipboardList, Save, History, X, Timer, ChevronRight, ArrowRightLeft, Combine, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import type { Product, OptionValue } from "@/store/useProductStore";
import { useProductStore } from "@/store/useProductStore";
import { useOrderStore, type Order } from "@/store/useOrderStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { ProductOptionsModal } from "@/components/pos/ProductOptionsModal";
import { useHoldOrderStore, type HeldOrder } from "@/store/useHoldOrderStore";
import { useTableStore, type Table } from "@/store/useTableStore";
import { TableSelectionModal } from "@/components/pos/TableSelectionModal";
import type { CartItem } from "@/store/useCartStore";

// Import Server Actions
import { getProducts, getCategories } from "@/app/actions/product";
import { createOrder, getOrders, updateOrder, updateOrderPaymentStatus, getActiveOrderForTable, moveOrder, mergeOrders } from "@/app/actions/order";
import { getHeldOrders, saveHeldOrder, deleteHeldOrder } from "@/app/actions/held-order";
import { getTables, updateTableStatus as updateTableStatusDB, releaseTableGroup } from "@/app/actions/table";

export default function POSPage() {
  const {
    items, addItem, removeItem, updateQuantity, updateItemOptions,
    updateItemNote, setDiningOption, diningOption,
    subtotal, total, discount, clearCart, loadCart
  } = useCartStore();
  const router = useRouter();
  const { products, setProducts, updateStock } = useProductStore();
  const { orders, setOrders } = useOrderStore();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  const [isLoadingMain, setIsLoadingMain] = useState(true);

  const [activeNoteCartId, setActiveNoteCartId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [dbCategories, setDbCategories] = useState<string[]>(["All"]);
  const [notification, setNotification] = useState<string | null>(null);

  const [selectedProductForOptions, setSelectedProductForOptions] = useState<Product | null>(null);
  const [editingCartId, setEditingCartId] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isRecentOrdersDrawerOpen, setIsRecentOrdersDrawerOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [tableSelectionMode, setTableSelectionMode] = useState<'default' | 'move' | 'merge'>('default');

  // Sync DB to Stores on Mount & Periodically
  useEffect(() => {
    if (isAuthenticated) {
      const hydrateData = async () => {
        setIsLoadingMain(true);
        const [prodRes, orderRes, heldRes, tableRes, catRes] = await Promise.all([
          getProducts(),
          getOrders(20),
          getHeldOrders(),
          getTables(),
          getCategories()
        ]);

        if (catRes.success && catRes.categories) {
          setDbCategories(['All', ...catRes.categories.map((c: { name: string }) => c.name)]);
        }

        if (prodRes.success) {
          interface DBProduct { categoryName: string;[key: string]: unknown }
          setProducts((prodRes.products as unknown as DBProduct[]).map(p => ({
            ...(p as unknown as Product),
            category: p.categoryName || 'Other'
          })));
        }
        if (orderRes.success) setOrders(orderRes.orders as unknown as Order[]);
        if (heldRes.success) useHoldOrderStore.getState().setHeldOrders(heldRes.orders as unknown as HeldOrder[]);
        if (tableRes.success) useTableStore.getState().setTables(tableRes.data as Table[]);

        setIsLoadingMain(false);
      };

      hydrateData();

      // Polling for updates (Tables & Orders) every 15 seconds
      const pollInterval = setInterval(async () => {
        const [tableRes, orderRes] = await Promise.all([getTables(), getOrders(20)]);
        if (tableRes.success) useTableStore.getState().setTables(tableRes.data as Table[]);
        if (orderRes.success) setOrders(orderRes.orders as unknown as Order[]);
      }, 15000);

      return () => clearInterval(pollInterval);
    }
  }, [isAuthenticated, setProducts, setOrders]);

  // Auth Guard
  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, _hasHydrated, router]);

  // Hold Order State
  const { heldOrders, addHeldOrder, removeHeldOrder } = useHoldOrderStore();
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [isHeldOrdersListOpen, setIsHeldOrdersListOpen] = useState(false);
  const [holdCustomerName, setHoldCustomerName] = useState("");

  // Table State
  const { tables, selectedTableId, setSelectedTable, updateTableStatus } = useTableStore();
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  const filteredProducts = products.filter(p =>
    (activeCategory === "All" || p.category === activeCategory) &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductClick = (product: Product) => {
    if (product.stock <= 0) return;
    if (product.options && product.options.length > 0) {
      setEditingCartId(null);
      setSelectedProductForOptions(product);
    } else {
      addItem(product);
    }
  };

  const handleEditCartItem = (cartId: string) => {
    const item = items.find(i => i.cartId === cartId);
    if (!item) return;
    const product = products.find(p => p.id === item.id);
    if (!product) return;
    setEditingCartId(cartId);
    setSelectedProductForOptions(product);
  };

  const handleAddToCartFromModal = (product: Product, options: OptionValue[], quantity: number) => {
    if (editingCartId) {
      updateItemOptions(editingCartId, options);
      setNotification(`Đã cập nhật ${product.name}`);
    } else {
      for (let i = 0; i < quantity; i++) {
        addItem(product, options);
      }
      setNotification(`Đã thêm ${quantity} x ${product.name}`);
    }
    setTimeout(() => setNotification(null), 2000);
    setEditingCartId(null);
  };

  const handleCheckoutClick = () => {
    if (items.length === 0) return;
    setIsPaymentModalOpen(true);
  };

  const handleConfirmItems = async () => {
    if (items.length === 0 || !selectedTableId) return;

    const orderData = {
      items: [...items],
      subtotal: subtotal(),
      total: total(),
      discount,
      diningOption,
      paymentMethod: 'cash', // Default
      tableId: selectedTableId,
      status: 'pending_payment'
    };

    let result;
    if (activeOrderId) {
      result = await updateOrder(activeOrderId, orderData);
    } else {
      result = await createOrder(orderData);
    }

    if (result.success && result.order) {
      if (!activeOrderId) {
        setActiveOrderId(result.order.id);
        await updateTableStatusDB(selectedTableId, 'occupied');
        updateTableStatus(selectedTableId, 'occupied');
      }
      setNotification(activeOrderId ? "Đã cập nhật món thành công" : "Đã ghi món thành công");
      setTimeout(() => setNotification(null), 2000);

      clearCart();
      setSelectedTable(null);
      setActiveOrderId(null);
    } else {
      const err = (result as { error?: string }).error || "Unknown error";
      alert("Lỗi ghi món: " + err);
    }
  };

  const handlePaymentComplete = async (paymentMethod: 'cash' | 'transfer') => {
    if (items.length === 0) return;

    let result;
    if (activeOrderId) {
      // Finalize existing pending order
      result = await updateOrderPaymentStatus(activeOrderId, 'completed', paymentMethod);

      // Update quantities in DB since they weren't updated in createOrder if it was pending?
      // Actually my createOrder doesn't update stock. POS page handles stock update locally in useEffect or manually.
      // Let's ensure stock is updated only once.
    } else {
      const orderData = {
        items: [...items],
        subtotal: subtotal(),
        total: total(),
        discount,
        diningOption,
        paymentMethod,
        tableId: selectedTableId || undefined,
        status: 'completed'
      };
      result = await createOrder(orderData);
    }

    if (result.success && result.order) {

      // Update Table Status if Dine-in
      if (selectedTableId) {
        await updateTableStatusDB(selectedTableId, 'available');
        // Re-fetch all tables to sync linked ones
        const tableRes = await getTables();
        if (tableRes.success) useTableStore.getState().setTables(tableRes.data as Table[]);
        setSelectedTable(null);
      }

      // Update local stock and orders list
      if (!activeOrderId) {
        items.forEach(item => updateStock(item.id, -item.quantity));
      }
      // If it was activeOrder, should we have updated stock when sending to bar or now?
      // Best to update stock when "sending to bar" (confirming the items)

      const newOrderRes = await getOrders(20);
      if (newOrderRes.success) setOrders(newOrderRes.orders as unknown as Order[]);

      clearCart();
      setActiveOrderId(null);
      setIsPaymentModalOpen(false);
      setNotification("Thanh toán thành công!");

      setTimeout(() => {
        setNotification(null);
      }, 2000);
    } else {
      alert("Lỗi thanh toán: " + (result as { error?: string }).error);
    }
  };

  const handleTableSelect = async (table: Table) => {
    if (tableSelectionMode === 'move') {
      if (!selectedTableId) return;
      const res = await moveOrder(selectedTableId, table.id);
      if (res.success) {
        // Re-fetch all tables to sync linked ones
        const tableRes = await getTables();
        if (tableRes.success) useTableStore.getState().setTables(tableRes.data as Table[]);

        const sourceNum = tables.find(t => t.id === selectedTableId)?.number;
        setNotification(`Đã chuyển đơn từ Bàn ${sourceNum} sang Bàn ${table.number}`);
        setTimeout(() => setNotification(null), 2000);
      } else {
        const err = (res as { error?: string }).error || "Unknown error";
        alert("Lỗi chuyển bàn: " + err);
      }
      setTableSelectionMode('default');
      setIsTableModalOpen(false);
      return;
    }

    if (tableSelectionMode === 'merge') {
      if (!selectedTableId) return;
      const res = await mergeOrders(selectedTableId, table.id);
      if (res.success) {
        // Re-fetch all tables to sync linked ones
        const tableRes = await getTables();
        if (tableRes.success) useTableStore.getState().setTables(tableRes.data as Table[]);

        setSelectedTable(table.id);
        // Reload order for target table
        const orderRes = await getActiveOrderForTable(table.id);
        if (orderRes.success && orderRes.order) {
          const order = orderRes.order as unknown as Order;
          loadCart(order.items as unknown as CartItem[], order.diningOption as DiningOption, order.discount);
          setActiveOrderId(order.id);
        }
        setNotification(`Đã gộp đơn vào Bàn ${table.number}`);
        setTimeout(() => setNotification(null), 2000);
      } else {
        const err = (res as { error?: string }).error || "Unknown error";
        alert("Lỗi gộp bàn: " + err);
      }
      setTableSelectionMode('default');
      setIsTableModalOpen(false);
      return;
    }

    // Default mode
    setSelectedTable(table.id);
    setIsTableModalOpen(false);

    if (table.status === 'occupied') {
      const res = await getActiveOrderForTable(table.id);
      if (res.success && res.order) {
        const order = res.order as unknown as Order;
        loadCart(order.items as unknown as CartItem[], order.diningOption as DiningOption, order.discount);
        setActiveOrderId(order.id);

        if (table.parentTableId) {
          const parent = tables.find(t => t.id === table.parentTableId);
          setNotification(`Bàn ${table.number} đã gộp vào Bàn ${parent?.number || '?'}`);
        } else {
          setNotification(`Đã tải đơn của Bàn ${table.number}`);
        }
        setTimeout(() => setNotification(null), 2000);
      }
    } else {
      if (items.length > 0 && !activeOrderId) {
        setNotification(`Đã gán món nháp cho Bàn ${table.number}`);
        setTimeout(() => setNotification(null), 2000);
      } else {
        clearCart();
        setActiveOrderId(null);
      }
    }
  };



  const handleHoldOrderClick = () => {
    if (items.length === 0) return;
    setIsHoldModalOpen(true);
  };

  const confirmHoldOrder = async () => {
    const data = {
      customerName: holdCustomerName || `Khách ${heldOrders.length + 1}`,
      items: [...items],
      subtotal: subtotal(),
      total: total(),
      discount,
      diningOption,
    };

    const res = await saveHeldOrder(data);
    if (res.success) {
      addHeldOrder(res.order as unknown as HeldOrder);
      clearCart();
      setIsHoldModalOpen(false);
      setHoldCustomerName("");
      setNotification("Đã lưu đơn vào danh sách chờ");
      setTimeout(() => setNotification(null), 2000);
    }
  };

  const handleResumeHeldOrder = async (order: HeldOrder) => {
    if (items.length > 0) {
      if (!confirm("Giỏ hàng hiện tại không trống. Bạn có muốn lưu đơn hiện tại và mở đơn chờ này không?")) {
        return;
      }
    }

    const res = await deleteHeldOrder(order.id);
    if (res.success) {
      clearCart();
      loadCart(order.items, order.diningOption, order.discount);
      removeHeldOrder(order.id);
      setIsHeldOrdersListOpen(false);
      setNotification(`Đã mở lại đơn của ${order.customerName}`);
      setTimeout(() => setNotification(null), 2000);
    }
  };

  if (isLoadingMain || !_hasHydrated || !isAuthenticated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">Đang tải dữ liệu từ hệ thống...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden premium-gradient">
      <Sidebar />

      <main className="flex-1 flex flex-col p-8 overflow-hidden">
        <header className="flex items-center gap-8 mb-10">
          <div className="flex-1 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Hôm nay bạn muốn uống gì?..."
              className="w-full bg-white/60 backdrop-blur-md border border-black/5 shadow-sm rounded-[1.5rem] py-4 pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-lg font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsRecentOrdersDrawerOpen(true)}
              className="bg-white border border-black/5 shadow-sm px-6 py-4 rounded-[1.2rem] text-sm font-bold flex items-center gap-2 hover:bg-secondary/50 transition-all active:scale-95"
            >
              <History size={18} className="text-primary" />
              Lịch sử đơn
            </button>
          </div>
        </header>

        <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {dbCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                activeCategory === cat
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-white border border-black/5 text-muted-foreground hover:bg-secondary/50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide">
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 pb-10">
            {filteredProducts.map((product) => (
              <motion.div
                layout
                key={product.id}
                whileHover={{ y: -4 }}
                className={cn(
                  "bg-white border border-black/5 rounded-2xl overflow-hidden hover:border-primary/50 shadow-sm hover:shadow-md transition-all group cursor-pointer relative",
                  product.stock === 0 && "opacity-50 cursor-not-allowed grayscale"
                )}
                onClick={() => handleProductClick(product)}
              >
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    unoptimized
                  />
                  {product.stock > 0 ? (
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Plus className="text-white w-8 h-8" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                      <span className="text-white font-bold text-sm bg-destructive px-3 py-1 rounded-full uppercase tracking-wider">Hết hàng</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-sm h-10 line-clamp-2">{product.name}</h3>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-primary font-bold">{formatCurrency(product.price)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>


      <section className="w-96 border-l border-black/5 flex flex-col bg-white">
        <div className="p-6 border-b border-black/5 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Giỏ hàng ({items.reduce((a, b) => a + b.quantity, 0)})
          </h2>
          {heldOrders.length > 0 && (
            <button
              onClick={() => setIsHeldOrdersListOpen(true)}
              className="relative p-2 hover:bg-secondary/80 rounded-full transition-colors group"
            >
              <History className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {heldOrders.length}
              </span>
            </button>
          )}
        </div>


        {/* Dining Options */}
        <div className="flex px-6 py-4 gap-2 bg-secondary/10 border-b border-black/5">
          {[
            { id: 'dine-in', label: 'Tại chỗ', icon: Utensils },
            { id: 'take-away', label: 'Mang về', icon: ShoppingBag },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                if (opt.id === diningOption && opt.id === 'dine-in' && !selectedTableId) {
                  setIsTableModalOpen(true);
                  return;
                }

                if (opt.id === 'take-away') {
                  if (activeOrderId && diningOption === 'dine-in') {
                    if (!confirm("Đang có đơn hàng gán cho bàn này. Chuyển sang mang về sẽ giữ nguyên món nhưng không gắn với bàn nữa?")) return;
                    setActiveOrderId(null);
                  }
                  setSelectedTable(null);
                }

                setDiningOption(opt.id as DiningOption);
                if (opt.id === 'dine-in' && !selectedTableId) setIsTableModalOpen(true);
              }}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl border transition-all relative overflow-hidden",
                diningOption === opt.id
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                  : "bg-white text-muted-foreground border-black/5 hover:bg-secondary/50"
              )}
            >
              <opt.icon size={16} className={cn(diningOption === opt.id ? "animate-pulse" : "")} />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-wider">{opt.label}</span>
              </div>
              {diningOption === opt.id && (
                <motion.div
                  layoutId="activeOption"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/40"
                />
              )}
            </button>
          ))}
        </div>

        {/* Table Control Panel - Only show when Dine-in and Table Selected */}
        <AnimatePresence>
          {diningOption === 'dine-in' && selectedTableId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 mb-4 overflow-hidden"
            >
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-xl shadow-sm">
                      {tables.find(t => t.id === selectedTableId)?.number}
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Đang phục vụ</div>
                      <div className="text-xs font-bold text-amber-900 truncate max-w-[100px]">
                        {tables.find(t => t.id === selectedTableId)?.name}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (items.length > 0 || activeOrderId) {
                        if (!confirm("Thoát bàn sẽ bỏ chọn bàn hiện tại?")) return;
                      }
                      setSelectedTable(null);
                      setActiveOrderId(null);
                      if (items.length === 0) setDiningOption('take-away');
                    }}
                    className="p-2 hover:bg-amber-100 rounded-lg text-amber-700 transition-colors"
                    title="Thoát bàn"
                  >
                    <LogOut size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setTableSelectionMode('move');
                      setIsTableModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 py-2 bg-white border border-amber-200 rounded-xl text-[10px] font-black text-amber-700 hover:bg-amber-100 transition-colors shadow-sm"
                  >
                    <ArrowRightLeft size={12} /> CHUYỂN BÀN
                  </button>
                  <button
                    onClick={() => {
                      setTableSelectionMode('merge');
                      setIsTableModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 py-2 bg-white border border-amber-200 rounded-xl text-[10px] font-black text-amber-700 hover:bg-amber-100 transition-colors shadow-sm"
                  >
                    <Combine size={12} /> GỘP BÀN
                  </button>
                  <button
                    onClick={async () => {
                      if (!selectedTableId) return;
                      if (!confirm("Xác nhận dọn bàn này và đưa về trạng thái Trống?")) return;
                      const res = await releaseTableGroup(selectedTableId);
                      if (res.success) {
                        const tableRes = await getTables();
                        if (tableRes.success) useTableStore.getState().setTables(tableRes.data as Table[]);
                        setSelectedTable(null);
                        setActiveOrderId(null);
                        clearCart();
                        setNotification("Đã dọn bàn thành công");
                        setTimeout(() => setNotification(null), 2000);
                      }
                    }}
                    className="flex items-center justify-center gap-2 py-2 bg-white border border-red-200 rounded-xl text-[10px] font-black text-red-600 hover:bg-red-50 transition-colors shadow-sm col-span-2 mt-2"
                  >
                    <Trash2 size={12} /> DỌN BÀN / GIẢI PHÓNG
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <ShoppingCart className="w-12 h-12 mb-4" />
                <p>Giỏ hàng đang trống</p>
              </div>
            ) : (
              items.map((item) => (
                <React.Fragment key={item.cartId}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-4 bg-secondary/50 p-3 rounded-xl border border-black/5"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden relative shrink-0">
                      <Image
                        src={item.image || "/placeholder.png"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
                          {item.selectedOptions.map(o => o.name).join(", ")}
                        </p>
                      )}
                      {item.note && (
                        <div className="bg-yellow-100/50 text-yellow-800 text-[10px] px-2 py-0.5 rounded-md mb-2 flex items-center gap-1">
                          <MessageSquare size={10} />
                          {item.note}
                        </div>
                      )}
                      <p className="text-primary text-sm font-bold">{formatCurrency(item.price)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => updateQuantity(item.cartId, item.quantity - 1)} className="p-1 rounded-md bg-white border border-black/5 hover:bg-secondary/80"><Minus size={14} /></button>
                        <span className="text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartId, item.quantity + 1)} className="p-1 rounded-md bg-white border border-black/5 hover:bg-secondary/80"><Plus size={14} /></button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button onClick={() => removeItem(item.cartId)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                      <button onClick={() => handleEditCartItem(item.cartId)} className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors">
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => setActiveNoteCartId(activeNoteCartId === item.cartId ? null : item.cartId)}
                        className={cn("p-2 rounded-lg transition-colors", item.note ? "text-yellow-600 bg-yellow-50" : "text-slate-400 hover:bg-slate-100")}
                      >
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  </motion.div>

                  {/* Note Inline Edit */}
                  <AnimatePresence>
                    {activeNoteCartId === item.cartId && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-2 mb-2"
                      >
                        <input
                          autoFocus
                          type="text"
                          placeholder="Thêm ghi chú (VD: Không đá, Ít đường...)"
                          className="w-full text-xs px-3 py-2 rounded-lg border border-yellow-200 bg-yellow-50 focus:outline-none"
                          value={item.note || ""}
                          onChange={(e) => updateItemNote(item.cartId, e.target.value)}
                          onBlur={() => setActiveNoteCartId(null)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 border-t border-black/5 bg-secondary/30">
          <div className="flex justify-between mb-2">
            <span className="text-muted-foreground">Tạm tính</span>
            <span>{formatCurrency(subtotal())}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-muted-foreground">Giảm giá</span>
            <span className="text-red-500 font-bold">-{formatCurrency((subtotal() * discount) / 100)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold mb-4 pt-4 border-t border-white/10">
            <span>Tổng cộng</span>
            <span className="text-primary">{formatCurrency(total())}</span>
          </div>

          {diningOption === 'dine-in' && selectedTableId && activeOrderId && (
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => {
                  setTableSelectionMode('move');
                  setIsTableModalOpen(true);
                }}
                className="flex-1 py-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-bold hover:bg-amber-100 transition-all flex items-center justify-center gap-1"
              >
                <ChevronRight size={14} className="rotate-180" />
                Chuyển bàn
              </button>
              <button
                onClick={() => {
                  setTableSelectionMode('merge');
                  setIsTableModalOpen(true);
                }}
                className="flex-1 py-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold hover:bg-indigo-100 transition-all flex items-center justify-center gap-1"
              >
                <Plus size={14} />
                Gộp bàn
              </button>
            </div>
          )}

          <div className="flex gap-3 mb-3">
            <button
              onClick={() => {
                clearCart();
                setActiveOrderId(null);
                setSelectedTable(null);
              }}
              disabled={items.length === 0}
              className="flex-1 py-3 rounded-xl border border-black/5 text-muted-foreground font-bold text-sm hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50"
            >
              Hủy đơn
            </button>
            {diningOption === 'dine-in' && (
              <button
                onClick={handleConfirmItems}
                disabled={items.length === 0 || !selectedTableId}
                className="flex-1 py-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 font-bold text-sm hover:bg-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={16} />
                Ghi món
              </button>
            )}
            {diningOption === 'take-away' && (
              <button
                onClick={handleHoldOrderClick}
                disabled={items.length === 0}
                className="flex-1 py-3 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 font-bold text-sm hover:bg-orange-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={16} />
                Lưu đơn
              </button>
            )}
          </div>
          <button
            disabled={items.length === 0}
            onClick={handleCheckoutClick}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          >
            <CreditCard size={20} />
            {activeOrderId ? "Thanh toán (Billing)" : "Thanh toán ngay"}
          </button>
        </div>
      </section>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 backdrop-blur-md"
          >
            <div className="bg-white/20 p-2 rounded-full">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Thành công!</h4>
              <p className="text-xs text-emerald-50">{notification}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProductOptionsModal
        key={selectedProductForOptions ? `${selectedProductForOptions.id}-${editingCartId || 'new'}` : 'closed'}
        isOpen={!!selectedProductForOptions}
        onClose={() => {
          setSelectedProductForOptions(null);
          setEditingCartId(null);
        }}
        product={selectedProductForOptions}
        initialOptions={editingCartId ? items.find(i => i.cartId === editingCartId)?.selectedOptions : []}
        mode={editingCartId ? 'edit' : 'add'}
        onAddToCart={handleAddToCartFromModal}
      />

      <PaymentModal
        key={isPaymentModalOpen ? 'payment-open' : 'payment-closed'}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        subtotal={subtotal()}
        discount={discount}
        totalAmount={total()}
        onComplete={handlePaymentComplete}
      />

      {/* Recent Orders Drawer */}
      <AnimatePresence>
        {isRecentOrdersDrawerOpen && (
          <div className="fixed inset-0 z-[140] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRecentOrdersDrawerOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-96 h-full bg-white shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-black/5 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-3">
                    <ClipboardList className="text-primary" />
                    Đơn hàng gần đây
                  </h2>
                  <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mt-1">Lịch sử giao dịch hôm nay</p>
                </div>
                <button
                  onClick={() => setIsRecentOrdersDrawerOpen(false)}
                  className="p-3 hover:bg-white rounded-full transition-all shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                {orders.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-30">
                    <ClipboardList size={64} className="mb-4" />
                    <p className="font-bold">Chưa có đơn hàng nào</p>
                  </div>
                ) : (
                  orders.filter(o =>
                    new Date(o.date).toDateString() === new Date().toDateString()
                  ).slice(0, 15).map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white p-5 rounded-3xl border border-black/5 shadow-sm space-y-3 hover:border-primary/30 transition-all group"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-black text-muted-foreground uppercase opacity-50 block mb-1">Mã đơn hàng</span>
                          <span className="font-black text-lg group-hover:text-primary transition-colors">#{order.id.slice(-6).toUpperCase()}</span>
                        </div>
                        <span className={cn(
                          "px-3 py-1.5 rounded-full text-[10px] font-black uppercase shadow-sm",
                          order.fulfillmentStatus === 'pending' ? "bg-amber-100 text-amber-700" :
                            order.fulfillmentStatus === 'preparing' ? "bg-blue-100 text-blue-700" :
                              order.fulfillmentStatus === 'ready' ? "bg-emerald-100 text-emerald-700" :
                                "bg-gray-100 text-gray-700"
                        )}>
                          {order.fulfillmentStatus === 'pending' ? 'Chờ xử lý' :
                            order.fulfillmentStatus === 'preparing' ? 'Đang pha chế' :
                              order.fulfillmentStatus === 'ready' ? 'Sẵn sàng' : 'Hoàn tất'}
                        </span>
                      </div>
                      <div className="h-px bg-black/5 w-full" />
                      <div className="flex justify-between items-end">
                        <div className="text-[10px] text-muted-foreground font-bold">
                          <Timer size={10} className="inline mr-1 mb-0.5" />
                          {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <span className="font-black text-primary text-lg">{formatCurrency(order.total)}</span>
                      </div>

                      {order.status === 'cancelled' && (
                        <div className="pt-2 border-t border-black/5">
                          <p className="text-[10px] text-red-500 font-bold italic">
                            Đã hủy bởi {order.cancelledBy}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Lý do: {order.cancellationReason}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              <div className="p-6 border-t border-black/5 bg-white">
                <button
                  onClick={() => setIsRecentOrdersDrawerOpen(false)}
                  className="w-full py-4 bg-secondary text-secondary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-secondary/80 transition-all"
                >
                  Đóng lịch sử
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TableSelectionModal
        isOpen={isTableModalOpen}
        onClose={() => {
          setIsTableModalOpen(false);
          setTableSelectionMode('default');
        }}
        selectionMode={tableSelectionMode}
        sourceTableId={selectedTableId || undefined}
        onSelect={handleTableSelect}
      />



      {/* Hold Order Naming Modal */}
      <AnimatePresence>
        {isHoldModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden p-8"
            >
              <h3 className="text-xl font-bold mb-4">Lưu đơn hàng chờ</h3>
              <p className="text-sm text-muted-foreground mb-6">Nhập tên khách hàng hoặc số bàn để dễ nhận diện khi mở lại đơn.</p>
              <input
                autoFocus
                type="text"
                placeholder="VD: Bàn 5, Chị Lan..."
                className="w-full text-lg p-4 rounded-xl border border-black/10 focus:ring-4 focus:ring-primary/20 outline-none mb-6"
                value={holdCustomerName}
                onChange={(e) => setHoldCustomerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmHoldOrder()}
              />
              <div className="flex gap-3">
                <button onClick={() => setIsHoldModalOpen(false)} className="flex-1 py-4 rounded-xl border border-black/5 font-bold hover:bg-secondary/50">Hủy</button>
                <button onClick={confirmHoldOrder} className="flex-1 py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20">Lưu ngay</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Held Orders List Modal */}
      <AnimatePresence>
        {isHeldOrdersListOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="bg-background w-full max-w-md h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-black/5 flex justify-between items-center bg-white">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Danh sách đơn chờ
                </h3>
                <button onClick={() => setIsHeldOrdersListOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {heldOrders.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-4">
                    <History size={48} />
                    <p>Không có đơn hàng nào đang chờ</p>
                  </div>
                ) : (
                  heldOrders.map((order) => (
                    <div key={order.id} className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm hover:border-primary/30 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{order.customerName}</h4>
                          <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleTimeString()} • {order.items.length} món</p>
                        </div>
                        <span className="font-bold text-primary">{formatCurrency(order.total)}</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleResumeHeldOrder(order)}
                          className="flex-1 py-2 rounded-lg bg-primary/10 text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all"
                        >
                          Mở lại đơn
                        </button>
                        <button
                          onClick={() => removeHeldOrder(order.id)}
                          className="p-2 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Held Orders List Modal */}
    </div>
  );
}
