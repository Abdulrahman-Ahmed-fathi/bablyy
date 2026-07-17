"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/store/SafeImage";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  isActive: boolean;
  imageUrl: string;
  category: { name: string } | null;
}

type ToggleField = "isFeatured" | "isBestSeller" | "isNew" | "isActive";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    fetch(`/api/admin/products?${params}`)
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleField = async (id: string, field: ToggleField, value: boolean) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
      );
    } else {
      toast.error("Failed to update product");
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.softDeleted ? "Product deactivated" : "Product deleted");
      fetchProducts();
    } else {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button asChild>
          <Link href="/admin/products/new">Add New Product</Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Best Seller</TableHead>
              <TableHead>New</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={10}>Loading...</TableCell></TableRow>
            ) : products.length === 0 ? (
              <TableRow><TableCell colSpan={10} className="text-center text-gray-500">No products</TableCell></TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="relative h-12 w-10 overflow-hidden bg-gray-100">
                      <SafeImage src={p.imageUrl} alt="" fill className="object-cover" sizes="40px" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category?.name || "—"}</TableCell>
                  <TableCell>{formatPrice(p.price)}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell>
                    <Switch checked={p.isFeatured} onCheckedChange={(v) => toggleField(p.id, "isFeatured", v)} />
                  </TableCell>
                  <TableCell>
                    <Switch checked={p.isBestSeller} onCheckedChange={(v) => toggleField(p.id, "isBestSeller", v)} />
                  </TableCell>
                  <TableCell>
                    <Switch checked={p.isNew} onCheckedChange={(v) => toggleField(p.id, "isNew", v)} />
                  </TableCell>
                  <TableCell>
                    <Switch checked={p.isActive} onCheckedChange={(v) => toggleField(p.id, "isActive", v)} />
                  </TableCell>
                  <TableCell className="space-x-2 whitespace-nowrap">
                    <Link href={`/admin/products/${p.id}/edit`} className="text-brown hover:underline">Edit</Link>
                    <button onClick={() => deleteProduct(p.id)} className="text-red-600 hover:underline">Delete</button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}