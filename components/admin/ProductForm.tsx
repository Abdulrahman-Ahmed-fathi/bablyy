"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { SafeImage } from "@/components/store/SafeImage";
import { Plus, Trash2 } from "lucide-react";
import { productFormSchema, type ProductFormData } from "@/lib/validations";
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

interface VariantInput {
  size: string;
  price: number;
  stock: number;
  isDefault: boolean;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData> & { id?: string };
}

const emptyVariant: VariantInput = { size: "", price: 0, stock: 0, isDefault: true };

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
  const [variants, setVariants] = useState<VariantInput[]>(
    initialData?.variants && initialData.variants.length > 0
      ? initialData.variants
      : [emptyVariant]
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema) as never,
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      comparePrice: initialData?.comparePrice,
      imageUrl: initialData?.imageUrl || "",
      images: initialData?.images || [],
      gender: initialData?.gender || undefined,
      categoryId: initialData?.categoryId || "",
      isFeatured: initialData?.isFeatured || false,
      isBestSeller: initialData?.isBestSeller || false,
      isNew: initialData?.isNew || false,
      isActive: initialData?.isActive ?? true,
    },
  });

  const name = watch("name");
  const imageUrl = watch("imageUrl");
  const isFeatured = watch("isFeatured");
  const isBestSeller = watch("isBestSeller");
  const isNew = watch("isNew");
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

  const updateVariant = (index: number, field: keyof VariantInput, value: string | number | boolean) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const setDefaultVariant = (index: number) => {
    setVariants((prev) => prev.map((v, i) => ({ ...v, isDefault: i === index })));
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, { size: "", price: 0, stock: 0, isDefault: false }]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((v) => v.isDefault)) {
        updated[0].isDefault = true;
      }
      return updated;
    });
  };

  const onSubmit = async (data: ProductFormData) => {
    const cleanedVariants = variants
      .map((v) => ({ ...v, size: v.size.trim() }))
      .filter((v) => v.size);

    if (cleanedVariants.length === 0) {
      toast.error("Add at least one size with a price.");
      return;
    }
    if (cleanedVariants.some((v) => !v.price || v.price <= 0)) {
      toast.error("Each size needs a price greater than 0.");
      return;
    }
    if (!cleanedVariants.some((v) => v.isDefault)) {
      cleanedVariants[0].isDefault = true;
    }

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
      variants: cleanedVariants,
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
          <Label htmlFor="comparePrice">Compare Price</Label>
          <Input id="comparePrice" type="number" step="0.01" {...register("comparePrice")} className="mt-1" />
          <p className="mt-1 text-xs text-stone-500">Optional &quot;was&quot; price, shown struck through.</p>
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
                    <SafeImage src={extraImages[i]} alt={`Gallery ${i + 1}`} fill className="object-cover" sizes="80px" />
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
        <Input placeholder="Base notes" value={notes.base} onChange={(e) => setNotes({ ...notes, base: e.target.value })} />
      </div>

      <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Sizes &amp; Pricing *</Label>
            <p className="text-xs text-stone-500">
              Add every size this perfume comes in. Mark one as the default shown first to shoppers.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addVariant}>
            <Plus className="mr-1 h-4 w-4" /> Add Size
          </Button>
        </div>

        <div className="space-y-3">
          {variants.map((variant, i) => (
            <div
              key={i}
              className="grid grid-cols-2 gap-3 rounded-lg border border-stone-200 bg-white p-3 sm:grid-cols-[auto_1fr_1fr_1fr_auto] sm:items-end sm:gap-2"
            >
              <div className="col-span-2 flex items-center gap-2 sm:col-span-1 sm:flex-col sm:items-center sm:gap-1">
                <Label className="text-[10px] uppercase text-stone-400 sm:order-1">Default</Label>
                <input
                  type="radio"
                  name="defaultVariant"
                  checked={variant.isDefault}
                  onChange={() => setDefaultVariant(i)}
                  className="h-4 w-4 accent-stone-900"
                  aria-label={`Set size ${i + 1} as default`}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-xs">Size</Label>
                <Input
                  placeholder="e.g. 50ml"
                  value={variant.size}
                  onChange={(e) => updateVariant(i, "size", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Price (EGP)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={variant.price || ""}
                  onChange={(e) => updateVariant(i, "price", Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Stock</Label>
                <Input
                  type="number"
                  value={variant.stock || ""}
                  onChange={(e) => updateVariant(i, "stock", Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={variants.length === 1}
                onClick={() => removeVariant(i)}
                aria-label="Remove size"
                className="col-span-2 sm:col-span-1 sm:w-10 sm:p-0"
              >
                <Trash2 className="mr-2 h-4 w-4 text-red-600 sm:mr-0" />
                <span className="sm:hidden">Remove Size</span>
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:items-center sm:gap-6 rounded-xl border border-stone-100 bg-stone-50 p-4">
        <div className="flex items-center gap-2">
          <Switch checked={isFeatured} onCheckedChange={(v) => setValue("isFeatured", v)} />
          <Label>Featured</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={isBestSeller} onCheckedChange={(v) => setValue("isBestSeller", v)} />
          <Label>Best Seller</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={isNew} onCheckedChange={(v) => setValue("isNew", v)} />
          <Label>New Arrival</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={isActive} onCheckedChange={(v) => setValue("isActive", v)} />
          <Label>Active</Label>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? "Saving..." : "Save Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
          Cancel
        </Button>
      </div>
    </form>
  );
}