import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm uppercase tracking-widest text-brown">404</p>
      <h1 className="mt-4 font-body text-4xl md:text-5xl">Page Not Found</h1>
      <p className="mt-4 max-w-md text-black/60">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Button className="mt-8" asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
