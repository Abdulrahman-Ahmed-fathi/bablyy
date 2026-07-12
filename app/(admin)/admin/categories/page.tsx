"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/admin/ImageUpload";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { generateSlug } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  _count: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  const fetchCategories = () => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then(setCategories);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: generateSlug(name), imageUrl: newImageUrl }),
    });
    if (res.ok) {
      toast.success("Category created");
      setName("");
      setNewImageUrl("");
      fetchCategories();
    } else {
      toast.error("Failed to create category");
    }
  };

  const updateCategory = async (id: string) => {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        slug: generateSlug(editName),
        imageUrl: editImageUrl,
      }),
    });
    if (res.ok) {
      toast.success("Category updated");
      setEditingId(null);
      fetchCategories();
    }
  };

  const deleteCategory = async (id: string) => {
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      toast.success("Category deleted");
      fetchCategories();
    } else {
      toast.error(data.error || "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={addCategory} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-medium">New Category</h2>
        <div>
          <Label htmlFor="catName">Name</Label>
          <Input
            id="catName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            required
            className="mt-1"
          />
        </div>
        <ImageUpload label="Category Image" value={newImageUrl} onChange={setNewImageUrl} aspectClass="aspect-[4/3] w-40" />
        <Button type="submit">Add Category</Button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>
                  {editingId === cat.id ? (
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  ) : (
                    cat.name
                  )}
                </TableCell>
                <TableCell>{cat.slug}</TableCell>
                <TableCell>{cat._count.products}</TableCell>
                <TableCell>
                  {editingId === cat.id ? (
                    <ImageUpload
                      label=""
                      value={editImageUrl}
                      onChange={setEditImageUrl}
                      aspectClass="aspect-[4/3] w-24"
                    />
                  ) : cat.imageUrl ? (
                    <span className="text-xs text-stone-500">Uploaded</span>
                  ) : (
                    <span className="text-xs text-stone-400">None</span>
                  )}
                </TableCell>
                <TableCell className="space-x-2">
                  {editingId === cat.id ? (
                    <>
                      <button type="button" onClick={() => updateCategory(cat.id)} className="text-brown">Save</button>
                      <button type="button" onClick={() => setEditingId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(cat.id);
                          setEditName(cat.name);
                          setEditImageUrl(cat.imageUrl || "");
                        }}
                        className="text-brown hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCategory(cat.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
