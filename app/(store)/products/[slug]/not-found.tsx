export default function ProductNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-body text-3xl">Product Not Found</h1>
      <p className="mt-4 text-black/60">
        This fragrance may no longer be available.
      </p>
      <a href="/products" className="mt-6 text-brown underline">
        Browse all perfumes
      </a>
    </div>
  );
}
