export function register() {
  const required = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(
      `[Maison de Parfum] Missing required environment variables: ${missing.join(", ")}`
    );
  }

  const optional = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "ADMIN_EMAIL",
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_WHATSAPP_NUMBER",
  ];
  const missingOptional = optional.filter((key) => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn(
      `[Maison de Parfum] Optional env vars not set (emails will log to console): ${missingOptional.join(", ")}`
    );
  }
}
