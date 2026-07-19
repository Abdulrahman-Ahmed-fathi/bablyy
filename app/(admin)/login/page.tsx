"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { loginSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, LockKeyhole, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string; password: string }>({
    resolver: zodResolver(loginSchema) as never,
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    setLoading(true);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      toast.error("Invalid email or password");
      return;
    }
    router.push("/admin");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-tr from-brown/15 via-[#FDFBF7] to-cream px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative luxury blur elements */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-gold/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-brown/5 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brown/5 text-brown shadow-luxury-sm">
            <LockKeyhole className="h-6 w-6 text-brown" />
          </div>
          <h1 className="mt-4 font-display text-4xl tracking-wider text-brown uppercase">
            Bably For Perfume
          </h1>
          <p className="mt-2 font-body text-sm text-black/50">
            Secure Administrator Sign In
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-cream-dark/60 bg-white/80 p-8 shadow-luxury backdrop-blur-md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-stone-700 font-medium text-xs uppercase tracking-wider">
                Email Address
              </Label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4.5 w-4.5 text-stone-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@store.com"
                  {...register("email")}
                  className="pl-10 pr-4 bg-white/50 border-stone-200 focus-visible:ring-brown focus-visible:border-brown placeholder:text-stone-300"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-stone-700 font-medium text-xs uppercase tracking-wider">
                  Password
                </Label>
              </div>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4.5 w-4.5 text-stone-400" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className="pl-10 pr-10 bg-white/50 border-stone-200 focus-visible:ring-brown focus-visible:border-brown placeholder:text-stone-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="mt-2 w-full h-11 bg-brown hover:bg-brown-light text-white font-medium tracking-wide shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Enter Dashboard"
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-stone-400">
            &copy; {new Date().getFullYear()} Maison de Parfum. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
