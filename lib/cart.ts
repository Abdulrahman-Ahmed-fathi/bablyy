import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  variantId: string;
  size: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  slug: string;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const { items } = get();
        const existing = items.find(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        );
        const qty = item.quantity ?? 1;
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === item.productId && i.variantId === item.variantId
                ? { ...i, quantity: Math.min(i.quantity + qty, i.stock, 10) }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              { ...item, quantity: Math.min(qty, item.stock, 10) },
            ],
          });
        }
      },
      removeItem: (productId, variantId) => {
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        });
      },
      updateQuantity: (productId, variantId, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity: Math.min(quantity, i.stock, 10) }
              : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "maison-cart" }
  )
);