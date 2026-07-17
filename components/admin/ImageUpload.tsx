"use client";

import { useRef, useState } from "react";
import { SafeImage } from "@/components/store/SafeImage";
import toast from "react-hot-toast";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (path: string) => void;
  required?: boolean;
  aspectClass?: string;
  imageClassName?: string;
}

export function ImageUpload({
  label,
  value,
  onChange,
  required,
  aspectClass = "aspect-[3/4] w-32",
  imageClassName = "object-cover",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/uploads", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to upload image");
        return;
      }
      onChange(data.path);
      toast.success("Image uploaded");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && " *"}
      </Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />
      {value ? (
        <div className="flex items-start gap-4">
          <div className={`relative overflow-hidden rounded-lg bg-stone-100 ${aspectClass}`}>
            <SafeImage src={value} alt="Preview" fill className={imageClassName} sizes="200px" />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange("")}
            >
              <X className="mr-1 h-4 w-4" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 px-6 py-10 transition-colors hover:border-stone-300 hover:bg-stone-100"
        >
          <Upload className="h-8 w-8 text-stone-400" />
          <span className="text-sm text-stone-600">
            {uploading ? "Uploading..." : "Click to upload image"}
          </span>
          <span className="text-xs text-stone-400">JPEG, PNG, WebP, GIF, SVG — max 5MB</span>
        </button>
      )}
    </div>
  );
}
