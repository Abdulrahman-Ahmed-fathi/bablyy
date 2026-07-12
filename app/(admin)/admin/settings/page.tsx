"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/admin/ImageUpload";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
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
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setForm({
          ...data,
          showOffersSection: data.showOffersSection ?? true,
        });
        setLoading(false);
      });
  }, []);

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
        <h2 className="font-medium text-stone-900">About</h2>
        <div>
          <Label>About Text</Label>
          <Textarea rows={6} value={form.aboutText} onChange={(e) => update("aboutText", e.target.value)} className="mt-1" />
        </div>
      </section>

      <Button onClick={save} disabled={saving} className="bg-stone-900 hover:bg-stone-800">
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
