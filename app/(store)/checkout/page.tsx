"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useCartStore } from "@/lib/cart";
import { checkoutSchema, EGYPTIAN_GOVERNORATES, type CheckoutFormData } from "@/lib/validations";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface SitewideOffer {
  discountPct: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sitewideOffer, setSitewideOffer] = useState<SitewideOffer | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema) as never,
  });

  const formData = watch();
  const subtotal = getSubtotal();
  const discount = sitewideOffer
    ? Math.round(subtotal * (sitewideOffer.discountPct / 100) * 100) / 100
    : 0;
  const total = Math.round((subtotal - discount) * 100) / 100;

  useEffect(() => {
    fetch("/api/offers/sitewide")
      .then((r) => r.json())
      .then((data) => setSitewideOffer(data?.discountPct ? data : null))
      .catch(() => {});
  }, []);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-container px-4 py-20 text-center lg:px-8">
        <p>Your cart is empty.</p>
        <Button className="mt-4" asChild>
          <Link href="/products">Browse Perfumes</Link>
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutFormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });

      const result = await res.json();

      if (res.status === 409) {
        toast.error("Some items are no longer available.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        toast.error(result.error || "Failed to place order.");
        setLoading(false);
        return;
      }

      clearCart();
      sessionStorage.setItem(
        "lastOrder",
        JSON.stringify({
          orderNumber: result.orderNumber,
          firstName: data.firstName,
          phone: data.phone,
        })
      );
      router.push(`/order-success?order=${result.orderNumber}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const goToStep2 = async () => {
    const valid = await trigger(["firstName", "lastName", "email", "phone"]);
    if (valid) setStep(2);
    else toast.error("Please fill in all required fields.");
  };

  const goToStep3 = async () => {
    if (!formData.governorate) {
      toast.error("Please select a governorate.");
      return;
    }
    const valid = await trigger(["address", "city", "governorate"]);
    if (valid) setStep(3);
    else toast.error("Please fill in all required fields.");
  };

  const steps = [
    { num: 1, label: "Personal Info" },
    { num: 2, label: "Delivery" },
    { num: 3, label: "Review" },
  ];

  return (
    <div className="mx-auto max-w-container px-4 py-12 lg:px-8">
      <h1 className="mb-8 font-display text-4xl md:text-5xl">Checkout</h1>

      <div className="mb-8 flex gap-4">
        {steps.map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => s.num < step && setStep(s.num)}
            className={`flex-1 border-b-2 pb-2 text-sm uppercase tracking-wider transition-colors ${
              step >= s.num ? "border-brown text-brown" : "border-cream-dark text-black/40"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {step === 1 && (
              <div className="space-y-4 rounded-2xl border border-cream-dark bg-white p-6 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" {...register("firstName")} className="mt-1" />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" {...register("lastName")} className="mt-1" />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" {...register("email")} className="mt-1" />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" {...register("phone")} placeholder="01012345678" className="mt-1" />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
                  )}
                </div>
                <Button type="button" onClick={goToStep2}>
                  Continue to Delivery
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 rounded-2xl border border-cream-dark bg-white p-6 shadow-sm">
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea id="address" {...register("address")} className="mt-1" />
                  {errors.address && (
                    <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" {...register("city")} className="mt-1" />
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>
                  )}
                </div>
                <div>
                  <Label>Governorate *</Label>
                  <Select
                    value={formData.governorate || ""}
                    onValueChange={(v) => setValue("governorate", v, { shouldValidate: true })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Governorate" />
                    </SelectTrigger>
                    <SelectContent>
                      {EGYPTIAN_GOVERNORATES.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.governorate && (
                    <p className="mt-1 text-xs text-red-600">{errors.governorate.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="notes">Order Notes</Label>
                  <Textarea id="notes" {...register("notes")} className="mt-1" />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="button" onClick={goToStep3}>
                    Review Order
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-cream-dark bg-white p-6 shadow-sm">
                  <h3 className="font-body text-lg">Personal Information</h3>
                  <p className="mt-2 text-sm text-black/70">
                    {formData.firstName} {formData.lastName}<br />
                    {formData.email}<br />
                    {formData.phone}
                  </p>
                </div>
                <div className="rounded-2xl border border-cream-dark bg-white p-6 shadow-sm">
                  <h3 className="font-body text-lg">Delivery</h3>
                  <p className="mt-2 text-sm text-black/70">
                    {formData.address}<br />
                    {formData.city}, {formData.governorate}
                    {formData.notes && <><br />Notes: {formData.notes}</>}
                  </p>
                </div>
                <div className="rounded-2xl border border-cream-dark bg-white p-6 shadow-sm">
                  <h3 className="font-body text-lg">Items</h3>
                  <ul className="mt-2 space-y-2 text-sm">
                    {items.map((item) => (
                      <li key={`${item.productId}-${item.variantId}`} className="flex justify-between">
                        <span>
                          {item.name}
                          {item.size && ` (${item.size})`} × {item.quantity}
                        </span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Placing Order..." : "Place Order"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div>
            <Card className="sticky top-24 rounded-2xl shadow-luxury-sm">
              <CardContent className="p-6">
                <h2 className="font-body text-xl">Order Summary</h2>
                <ul className="mt-4 space-y-2 text-sm">
                  {items.map((item) => (
                    <li key={`${item.productId}-${item.variantId}`} className="flex justify-between">
                      <span>
                        {item.name}
                        {item.size && ` (${item.size})`} × {item.quantity}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="mt-2 flex justify-between text-sm text-green-700">
                    <span>Sitewide Discount ({sitewideOffer?.discountPct}%)</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="mt-4 flex justify-between border-t border-cream-dark pt-4 font-body text-xl">
                  <span>Total</span>
                  <span className="text-brown">{formatPrice(total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}