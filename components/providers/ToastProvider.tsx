"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#F5EFE6",
          color: "#0A0A0A",
          border: "1px solid #3D1C10",
        },
      }}
    />
  );
}
