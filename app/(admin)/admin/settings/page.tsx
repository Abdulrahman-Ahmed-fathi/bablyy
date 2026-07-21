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
import { Plus, Trash2, Edit2, MapPin } from "lucide-react";

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
  showMapSection: boolean;
  mapLocations: {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
  }[];
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
    showMapSection: true,
    mapLocations: [],
  });

  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [locName, setLocName] = useState("");
  const [locAddress, setLocAddress] = useState("");
  const [locLat, setLocLat] = useState("");
  const [locLng, setLocLng] = useState("");
  const [isAdding, setIsAdding] = useState(false);

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
          showMapSection: data.showMapSection ?? true,
          mapLocations: Array.isArray(data.mapLocations) ? data.mapLocations : [],
        });
        setLoading(false);
      });
  }, []);

  const handleAddLocation = () => {
    if (!locName || !locAddress || !locLat || !locLng) {
      toast.error("Please fill in all location fields");
      return;
    }
    const newLoc = {
      id: Math.random().toString(36).substring(2, 11),
      name: locName,
      address: locAddress,
      lat: parseFloat(locLat) || 0,
      lng: parseFloat(locLng) || 0,
    };
    update("mapLocations", [...form.mapLocations, newLoc]);
    setLocName("");
    setLocAddress("");
    setLocLat("");
    setLocLng("");
    setIsAdding(false);
    toast.success("Location added. Click 'Save Settings' to apply.");
  };

  const handleStartEdit = (loc: { id: string; name: string; address: string; lat: number; lng: number }) => {
    setEditingLocationId(loc.id);
    setLocName(loc.name);
    setLocAddress(loc.address);
    setLocLat(loc.lat.toString());
    setLocLng(loc.lng.toString());
    setIsAdding(false);
  };

  const handleSaveEdit = () => {
    if (!locName || !locAddress || !locLat || !locLng) {
      toast.error("Please fill in all location fields");
      return;
    }
    const updated = form.mapLocations.map((loc) => {
      if (loc.id === editingLocationId) {
        return {
          id: loc.id,
          name: locName,
          address: locAddress,
          lat: parseFloat(locLat) || 0,
          lng: parseFloat(locLng) || 0,
        };
      }
      return loc;
    });
    update("mapLocations", updated);
    setEditingLocationId(null);
    setLocName("");
    setLocAddress("");
    setLocLat("");
    setLocLng("");
    toast.success("Location updated. Click 'Save Settings' to apply.");
  };

  const handleCancelEdit = () => {
    setEditingLocationId(null);
    setLocName("");
    setLocAddress("");
    setLocLat("");
    setLocLng("");
    setIsAdding(false);
  };

  const handleRemoveLocation = (id: string) => {
    update(
      "mapLocations",
      form.mapLocations.filter((loc) => loc.id !== id)
    );
    toast.success("Location removed. Click 'Save Settings' to apply.");
  };

  const update = <K extends keyof SettingsForm>(field: K, value: SettingsForm[K]) => {
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

      <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-medium text-stone-900">Physical Store Locations & Map</h2>
        
        <div className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50 p-4">
          <div>
            <Label>Show Map Section</Label>
            <p className="text-xs text-stone-500">Display the interactive map on the About page</p>
          </div>
          <Switch
            checked={form.showMapSection}
            onCheckedChange={(v) => update("showMapSection", v)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Store Locations ({form.mapLocations.length})</Label>
            {!isAdding && !editingLocationId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAdding(true);
                  setLocName("");
                  setLocAddress("");
                  setLocLat("");
                  setLocLng("");
                }}
                className="flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Add Location
              </Button>
            )}
          </div>

          {/* Add / Edit Form */}
          {(isAdding || editingLocationId) && (
            <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-50/50 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                {editingLocationId ? "Edit Location" : "New Location"}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Location Name</Label>
                  <Input
                    placeholder="e.g. Cairo Branch, Downtown Showroom"
                    value={locName}
                    onChange={(e) => setLocName(e.target.value)}
                    className="mt-1 bg-white"
                  />
                </div>
                <div>
                  <Label>Full Address</Label>
                  <Input
                    placeholder="e.g. 15 El-Nasr Rd, Nasr City"
                    value={locAddress}
                    onChange={(e) => setLocAddress(e.target.value)}
                    className="mt-1 bg-white"
                  />
                </div>
                <div>
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="e.g. 30.0444"
                    value={locLat}
                    onChange={(e) => setLocLat(e.target.value)}
                    className="mt-1 bg-white"
                  />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="e.g. 31.2357"
                    value={locLng}
                    onChange={(e) => setLocLng(e.target.value)}
                    className="mt-1 bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={editingLocationId ? handleSaveEdit : handleAddLocation}
                  className="bg-brown text-white hover:bg-brown-light"
                >
                  {editingLocationId ? "Update Location" : "Add Location"}
                </Button>
              </div>
            </div>
          )}

          {/* Locations List */}
          <div className="space-y-3">
            {form.mapLocations.length === 0 ? (
              <p className="text-center text-xs text-stone-400 py-4 border border-dashed border-stone-200 rounded-lg">
                No physical locations defined. The map will be empty.
              </p>
            ) : (
              form.mapLocations.map((loc) => (
                <div
                  key={loc.id}
                  className="flex items-start justify-between rounded-xl border border-stone-150 bg-white p-4 shadow-sm"
                >
                  <div className="flex gap-3">
                    <MapPin className="mt-1 h-4 w-4 shrink-0 text-amber-600" />
                    <div>
                      <h4 className="text-sm font-semibold text-stone-900">{loc.name}</h4>
                      <p className="text-xs text-stone-500 mt-0.5">{loc.address}</p>
                      <p className="text-[10px] text-stone-400 mt-1">
                        Coordinates: {loc.lat}, {loc.lng}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartEdit(loc)}
                      disabled={isAdding || !!editingLocationId}
                      className="h-8 w-8 p-0 text-stone-500 hover:text-stone-900"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveLocation(loc.id)}
                      disabled={isAdding || !!editingLocationId}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <Button onClick={save} disabled={saving} className="bg-brown text-white hover:bg-brown-light">
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}