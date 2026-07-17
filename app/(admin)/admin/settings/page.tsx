"use client";

import { useEffect, useState } from "react";
import { SafeImage } from "@/components/store/SafeImage";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface SettingsForm {
  storeName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  instagram: string;
  facebook: string;
  whatsapp: string;
  aboutText: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  logoUrl: string;
  showOffersSection: boolean;
  aboutHeroImageUrl: string;
  aboutGalleryImages: string[];
  showAboutGallerySection: boolean;
}

const GALLERY_SLOTS = 6;

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SettingsForm>({
    storeName: "",
    tagline: "",
    phone: "",
    email: "",
    address: "",
    instagram: "",
    facebook: "",
    whatsapp: "",
    aboutText: "",
    heroTitle: "",
    heroSubtitle: "",
    heroImageUrl: "",
    logoUrl: "",
    showOffersSection: true,
    aboutHeroImageUrl: "",
    aboutGalleryImages: [],
    showAboutGallerySection: true,
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setForm({
          ...data,
          showOffersSection: data.showOffersSection ?? true,
          aboutHeroImageUrl: data.aboutHeroImageUrl || "",
          aboutGalleryImages: Array.isArray(data.aboutGalleryImages)
            ? data.aboutGalleryImages
            : [],
          showAboutGallerySection: data.showAboutGallerySection ?? true,
        });
        setLoading(false);
      });
  }, []);

  const update = (field: keyof SettingsForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const uploadGalleryImage = async (file: File, index: number) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/uploads", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to upload image");
      return;
    }
    setForm((prev) => {
      const updated = [...prev.aboutGalleryImages];
      updated[index] = data.path;
      return { ...prev, aboutGalleryImages: updated.filter(Boolean) };
    });
  };

  const removeGalleryImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      aboutGalleryImages: prev.aboutGalleryImages.filter((_, i) => i !== index),
    }));
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Settings saved");
    } else {
      toast.error("Failed to save settings");
    }
  };

  if (loading) {
    return <div className="h-96 animate-pulse rounded-2xl bg-stone-100" />;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-medium text-stone-900">General</h2>
        <div>
          <Label>Store Name</Label>
          <Input value={form.storeName} onChange={(e) => update("storeName", e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Tagline</Label>
          <Input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} className="mt-1" />
        </div>
        <ImageUpload
          label="Logo"
          value={form.logoUrl}
          onChange={(path) => update("logoUrl", path)}
          aspectClass="h-16 w-40"
          imageClassName="object-contain"
        />
        <div className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50 p-4">
          <div>
            <Label>Show Offers Section</Label>
            <p className="text-xs text-stone-500">Display promotional offers on the homepage</p>
          </div>
          <Switch
            checked={form.showOffersSection}
            onCheckedChange={(v) => update("showOffersSection", v)}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-medium text-stone-900">Hero Section</h2>
        <div>
          <Label>Hero Title</Label>
          <Input value={form.heroTitle} onChange={(e) => update("heroTitle", e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Hero Subtitle</Label>
          <Input value={form.heroSubtitle} onChange={(e) => update("heroSubtitle", e.target.value)} className="mt-1" />
        </div>
        <ImageUpload
          label="Hero Image"
          value={form.heroImageUrl}
          onChange={(path) => update("heroImageUrl", path)}
          aspectClass="aspect-[16/9] w-full max-w-md"
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-medium text-stone-900">Contact</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={form.email} onChange={(e) => update("email", e.target.value)} className="mt-1" />
          </div>
        </div>
        <div>
          <Label>WhatsApp Number (digits only)</Label>
          <Input value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Address</Label>
          <Input value={form.address} onChange={(e) => update("address", e.target.value)} className="mt-1" />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-medium text-stone-900">Social</h2>
        <div>
          <Label>Instagram URL</Label>
          <Input value={form.instagram} onChange={(e) => update("instagram", e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Facebook URL</Label>
          <Input value={form.facebook} onChange={(e) => update("facebook", e.target.value)} className="mt-1" />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-medium text-stone-900">About Page</h2>

        <div>
          <Label>About Text</Label>
          <p className="mb-1 text-xs text-stone-500">
            The first paragraph is shown as the large hero statement; the rest as supporting text.
            Separate paragraphs with a blank line.
          </p>
          <Textarea rows={6} value={form.aboutText} onChange={(e) => update("aboutText", e.target.value)} className="mt-1" />
        </div>

        <ImageUpload
          label="About Hero Image"
          value={form.aboutHeroImageUrl}
          onChange={(path) => update("aboutHeroImageUrl", path)}
          aspectClass="aspect-square w-full max-w-sm"
        />
        <p className="-mt-2 text-xs text-stone-500">
          Shown beside the story on the About page. Falls back to the homepage hero image if left empty.
        </p>

        <div className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50 p-4">
          <div>
            <Label>Show Gallery Section</Label>
            <p className="text-xs text-stone-500">Display the image carousel and Instagram link on the About page</p>
          </div>
          <Switch
            checked={form.showAboutGallerySection}
            onCheckedChange={(v) => update("showAboutGallerySection", v)}
          />
        </div>

        <div>
          <Label>Gallery Images (up to {GALLERY_SLOTS})</Label>
          <p className="mb-2 text-xs text-stone-500">Used in the About page carousel.</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: GALLERY_SLOTS }).map((_, i) => {
              const image = form.aboutGalleryImages[i];
              return (
                <div key={i}>
                  {image ? (
                    <div className="space-y-2">
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-stone-100">
                        <SafeImage src={image} alt={`Gallery ${i + 1}`} fill className="object-cover" sizes="200px" />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => removeGalleryImage(i)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label className="flex aspect-[3/4] w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-stone-200 text-center text-xs text-stone-500 hover:border-stone-300 hover:bg-stone-50">
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
              );
            })}
          </div>
        </div>
      </section>

      <Button onClick={save} disabled={saving} className="bg-stone-900 hover:bg-stone-800">
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}