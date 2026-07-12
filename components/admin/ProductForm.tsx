"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Image from "next/image";
import { productSchema, type ProductFormData } from "@/lib/validations";
import { generateSlug } from "@/lib/utils";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData> & { id?: string };
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [extraImages, setExtraImages] = useState<string[]>(
    initialData?.images || []
  );
  const [notes, setNotes] = useState({
    top: initialData?.notes?.top?.join(", ") || "",
    heart: initialData?.notes?.heart?.join(", ") || "",
    base: initialData?.notes?.base?.join(", ") || "",
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as never,
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      comparePrice: initialData?.comparePrice,
      imageUrl: initialData?.imageUrl || "",
      images: initialData?.images || [],
      stock: initialData?.stock || 0,
      volume: initialData?.volume || "",
      gender: initialData?.gender || undefined,
      categoryId: initialData?.categoryId || "",
      isFeatured: initialData?.isFeatured || false,
      isActive: initialData?.isActive ?? true,
    },
  });

  const name = watch("name");
  const imageUrl = watch("imageUrl");
  const isFeatured = watch("isFeatured");
  const isActive = watch("isActive");

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!initialData?.slug && name) {
      setValue("slug", generateSlug(name));
    }
  }, [name, initialData?.slug, setValue]);

  const uploadGalleryImage = async (file: File, index: number) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/uploads", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to upload image");
      return;
    }
    const updated = [...extraImages];
    updated[index] = data.path;
    setExtraImages(updated.filter(Boolean));
  };

  const onSubmit = async (data: ProductFormData) => {
    const payload = {
      ...data,
      images: extraImages.filter(Boolean),
      notes: {
        top: notes.top.split(",").map((s) => s.trim()).filter(Boolean),
        heart: notes.heart.split(",").map((s) => s.trim()).filter(Boolean),
        base: notes.base.split(",").map((s) => s.trim()).filter(Boolean),
      },
      categoryId: data.categoryId || null,
      comparePrice: data.comparePrice || null,
    };

    const url = initialData?.id
      ? `/api/admin/products/${initialData.id}`
      : "/api/admin/products";
    const method = initialData?.id ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success(initialData?.id ? "Product updated" : "Product created");
      router.push("/admin/products");
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to save");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input id="name" {...register("name")} className="mt-1" />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" {...register("slug")} className="mt-1" />
          {errors.slug && <p className="text-xs text-red-600">{errors.slug.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea id="description" rows={4} {...register("description")} className="mt-1" />
        {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="price">Price *</Label>
          <Input id="price" type="number" step="0.01" {...register("price")} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="comparePrice">Compare Price</Label>
          <Input id="comparePrice" type="number" step="0.01" {...register("comparePrice")} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="stock">Stock *</Label>
          <Input id="stock" type="number" {...register("stock")} className="mt-1" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="volume">Volume</Label>
          <Input id="volume" placeholder="50ml" {...register("volume")} className="mt-1" />
        </div>
        <div>
          <Label>Gender</Label>
          <Select
            value={watch("gender") || ""}
            onValueChange={(v) => setValue("gender", v as "Unisex" | "Men" | "Women")}
          >
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Unisex">Unisex</SelectItem>
              <SelectItem value="Men">Men</SelectItem>
              <SelectItem value="Women">Women</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Category</Label>
          <Select value={watch("categoryId") || ""} onValueChange={(v) => setValue("categoryId", v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ImageUpload
        label="Main Image"
        value={imageUrl}
        onChange={(path) => setValue("imageUrl", path, { shouldValidate: true })}
        required
      />
      {errors.imageUrl && <p className="text-xs text-red-600">{errors.imageUrl.message}</p>}

      <div>
        <Label>Gallery Images (up to 4)</Label>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              {extraImages[i] ? (
                <div className="flex items-start gap-2">
                  <div className="relative h-24 w-20 overflow-hidden rounded-lg bg-stone-100">
                    <Image src={extraImages[i]} alt={`Gallery ${i + 1}`} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                      Replace
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadGalleryImage(file, i);
                        }}
                      />
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updated = [...extraImages];
                        updated.splice(i, 1);
                        setExtraImages(updated);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-stone-200 p-4 text-center text-xs text-stone-500 hover:border-stone-300">
                  Upload image {i + 1}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadGalleryImage(file, i);
                    }}
                  />
                </label>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Fragrance Notes</Label>
        <Input placeholder="Top notes (comma separated)" value={notes.top} onChange={(e) => setNotes({ ...notes, top: e.target.value })} />
        <Input placeholder="Heart notes" value={notes.heart} onChange={(e) => setNotes({ ...notes, heart: e.target.value })} />
        <Input placeholder="Base notes" value={notes.base} onChange={(e) => setNotes({ ...notes, base: e.target.value })} />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={isFeatured} onCheckedChange={(v) => setValue("isFeatured", v)} />
          <Label>Featured</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={isActive} onCheckedChange={(v) => setValue("isActive", v)} />
          <Label>Active</Label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
