import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistStore {
  productIds: string[];
  toggle: (productId: string) => void;
  add: (productId: string) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  setAll: (productIds: string[]) => void;
  count: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (productId) => {
        const { productIds } = get();
        set({
          productIds: productIds.includes(productId)
            ? productIds.filter((id) => id !== productId)
            : [...productIds, productId],
        });
      },
      add: (productId) => {
        const { productIds } = get();
        if (!productIds.includes(productId)) {
          set({ productIds: [...productIds, productId] });
        }
      },
      remove: (productId) => {
        set({ productIds: get().productIds.filter((id) => id !== productId) });
      },
      has: (productId) => get().productIds.includes(productId),
      setAll: (productIds) => set({ productIds }),
      count: () => get().productIds.length,
    }),
    { name: "maison-wishlist" }
  )
);