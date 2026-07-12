"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Offer {
  id: string;
  title: string;
  description: string | null;
  discountPct: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  productId: string | null;
  product: { name: string } | null;
}

interface Product {
  id: string;
  name: string;
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    discountPct: 10,
    productId: "",
    startsAt: "",
    endsAt: "",
    isActive: true,
  });

  const fetchOffers = () => {
    fetch("/api/admin/offers").then((r) => r.json()).then(setOffers);
  };

  useEffect(() => {
    fetchOffers();
    fetch("/api/admin/products").then((r) => r.json()).then(setProducts);
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      discountPct: 10,
      productId: "",
      startsAt: "",
      endsAt: "",
      isActive: true,
    });
    setEditing(null);
  };

  const openEdit = (offer: Offer) => {
    setEditing(offer);
    setForm({
      title: offer.title,
      description: offer.description || "",
      discountPct: offer.discountPct,
      productId: offer.productId || "",
      startsAt: offer.startsAt ? offer.startsAt.slice(0, 10) : "",
      endsAt: offer.endsAt ? offer.endsAt.slice(0, 10) : "",
      isActive: offer.isActive,
    });
    setOpen(true);
  };

  const saveOffer = async () => {
    const payload = {
      ...form,
      productId: form.productId || null,
      startsAt: form.startsAt || null,
      endsAt: form.endsAt || null,
    };

    const url = editing ? `/api/admin/offers/${editing.id}` : "/api/admin/offers";
    const method = editing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success(editing ? "Offer updated" : "Offer created");
      setOpen(false);
      resetForm();
      fetchOffers();
    } else {
      toast.error("Failed to save offer");
    }
  };

  const deleteOffer = async (id: string) => {
    if (!confirm("Delete this offer?")) return;
    const res = await fetch(`/api/admin/offers/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Offer deleted");
      fetchOffers();
    }
  };

  return (
    <div className="space-y-6">
      <Button onClick={() => { resetForm(); setOpen(true); }}>Create Offer</Button>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Applies To</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((offer) => (
              <TableRow key={offer.id}>
                <TableCell className="font-medium">{offer.title}</TableCell>
                <TableCell>{offer.discountPct}%</TableCell>
                <TableCell>{offer.product?.name || "All Products"}</TableCell>
                <TableCell>{offer.isActive ? "Yes" : "No"}</TableCell>
                <TableCell className="text-xs">
                  {offer.startsAt ? new Date(offer.startsAt).toLocaleDateString() : "—"}
                  {" → "}
                  {offer.endsAt ? new Date(offer.endsAt).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell className="space-x-2">
                  <button onClick={() => openEdit(offer)} className="text-brown hover:underline">Edit</button>
                  <button onClick={() => deleteOffer(offer.id)} className="text-red-600 hover:underline">Delete</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Offer" : "Create Offer"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label>Discount %</Label>
              <Input type="number" min={1} max={100} value={form.discountPct} onChange={(e) => setForm({ ...form, discountPct: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Apply To</Label>
              <Select value={form.productId} onValueChange={(v) => setForm({ ...form, productId: v === "all" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="All Products" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <Label>Active</Label>
            </div>
            <Button onClick={saveOffer} className="w-full">Save Offer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
