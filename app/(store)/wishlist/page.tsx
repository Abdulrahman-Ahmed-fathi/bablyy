import type { Metadata } from "next";
import WishlistClient from "./WishlistClient";

export const metadata: Metadata = {
  title: "Wishlist | Maison de Parfum",
};

export default function WishlistPage() {
  return <WishlistClient />;
}