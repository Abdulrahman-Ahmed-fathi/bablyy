import nodemailer from "nodemailer";
import type { Order, OrderItem, Product } from "@prisma/client";

type OrderWithItems = Order & {
  items: (OrderItem & { product?: Product })[];
};

const brandColors = {
  black: "#0A0A0A",
  cream: "#F5EFE6",
  brown: "#3D1C10",
};

function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null;
  if (process.env.SMTP_HOST.includes("@")) {
    console.error("[Email] SMTP_HOST must be a mail server hostname, not an email address.");
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function itemsTableHtml(
  items: OrderWithItems["items"]
): string {
  const rows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #E8DDD0;">${item.name}</td>
          <td style="padding:8px;border-bottom:1px solid #E8DDD0;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #E8DDD0;text-align:right;">${item.price.toFixed(2)} EGP</td>
        </tr>`
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <thead><tr style="background:${brandColors.cream};">
      <th style="padding:8px;text-align:left;">Product</th>
      <th style="padding:8px;text-align:center;">Qty</th>
      <th style="padding:8px;text-align:right;">Price</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export async function sendOrderEmails(
  order: OrderWithItems,
  storeName = "Maison de Parfum"
): Promise<void> {
  const transporter = createTransporter();
  const adminEmail = process.env.ADMIN_EMAIL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const customerName = `${order.firstName} ${order.lastName}`;
  const trackingUrl = `${siteUrl}/order-status?order=${encodeURIComponent(order.orderNumber)}`;

  const adminHtml = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:${brandColors.cream};padding:32px;">
      <h1 style="color:${brandColors.brown};margin:0 0 16px;">New Order #${order.orderNumber}</h1>
      <p style="color:${brandColors.black};">Date: ${new Date(order.createdAt).toLocaleString()}</p>
      <h2 style="color:${brandColors.brown};font-size:18px;">Customer</h2>
      <p style="color:${brandColors.black};line-height:1.6;">
        ${customerName}<br/>
        ${order.phone}<br/>
        ${order.email}<br/>
        ${order.address}, ${order.city}, ${order.governorate}
      </p>
      ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ""}
      <h2 style="color:${brandColors.brown};font-size:18px;">Items</h2>
      ${itemsTableHtml(order.items)}
      <p style="font-size:18px;color:${brandColors.brown};"><strong>Total: ${order.total.toFixed(2)} EGP</strong></p>
      <a href="${siteUrl}/admin/orders/${order.id}" style="display:inline-block;background:${brandColors.brown};color:white;padding:12px 24px;text-decoration:none;margin-top:16px;">View in Dashboard</a>
    </div>`;

  const customerHtml = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:${brandColors.cream};padding:32px;">
      <h1 style="color:${brandColors.brown};margin:0 0 8px;">${storeName}</h1>
      <p style="color:${brandColors.black};font-size:16px;">Dear ${order.firstName},</p>
      <p style="color:${brandColors.black};">Thank you for your order. We have received it and will contact you shortly.</p>

      <div style="background:white;padding:24px;margin:24px 0;text-align:center;border:1px solid #E8DDD0;">
        <p style="margin:0;color:${brandColors.black};font-size:14px;">Order Number</p>
        <p style="margin:8px 0 0;font-size:28px;color:${brandColors.brown};font-weight:bold;">${order.orderNumber}</p>
      </div>

      <h2 style="color:${brandColors.brown};font-size:18px;">Delivery Details</h2>
      <p style="color:${brandColors.black};line-height:1.6;">
        ${customerName}<br/>
        ${order.phone}<br/>
        ${order.address}, ${order.city}, ${order.governorate}
      </p>
      ${order.notes ? `<p style="color:${brandColors.black};"><strong>Notes:</strong> ${order.notes}</p>` : ""}

      <h2 style="color:${brandColors.brown};font-size:18px;">Order Summary</h2>
      ${itemsTableHtml(order.items)}
      <div style="text-align:right;margin:8px 0;">
        <p style="margin:4px 0;color:${brandColors.black};">Subtotal: ${order.subtotal.toFixed(2)} EGP</p>
        ${order.discount > 0 ? `<p style="margin:4px 0;color:#16a34a;">Discount: -${order.discount.toFixed(2)} EGP</p>` : ""}
        <p style="margin:4px 0;font-size:18px;color:${brandColors.brown};"><strong>Total: ${order.total.toFixed(2)} EGP</strong></p>
      </div>

      <div style="background:white;padding:20px;margin:24px 0;border:1px solid #E8DDD0;text-align:center;">
        <p style="margin:0 0 12px;color:${brandColors.black};">
          Want to check your order status? Visit our tracking page and enter your order number above,
          or use the button below.
        </p>
        <a href="${trackingUrl}" style="display:inline-block;background:${brandColors.brown};color:white;padding:12px 28px;text-decoration:none;">
          Track Your Order
        </a>
      </div>

      <p style="color:${brandColors.black};">We will contact you on <strong>${order.phone}</strong> to confirm delivery.</p>
      <p style="color:${brandColors.black};margin-top:24px;">With gratitude,<br/>${storeName}</p>
    </div>`;

  if (!transporter) {
    console.log("[Email] SMTP not configured. Order emails logged to console:");
    console.log(`Admin email to: ${adminEmail}`);
    console.log(`Customer email to: ${order.email}`);
    console.log(`Order: ${order.orderNumber}, Total: ${order.total}`);
    console.log(`Tracking URL: ${trackingUrl}`);
    return;
  }

  try {
    if (adminEmail) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: adminEmail,
        subject: `New Order #${order.orderNumber} - ${customerName}`,
        html: adminHtml,
      });
    }

    if (order.email) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: order.email,
        subject: `Order Confirmed - ${order.orderNumber} - ${storeName}`,
        html: customerHtml,
      });
    } else {
      console.warn("[Email] Order has no customer email; skipping confirmation email.");
    }
  } catch (error) {
    console.error("[Email] Failed to send order emails:", error);
  }
}

export async function sendContactEmail(data: {
  name: string;
  email: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  const transporter = createTransporter();
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.log("[Email] ADMIN_EMAIL not set. Contact form logged:");
    console.log(data);
    return { ok: true };
  }

  const html = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:${brandColors.cream};padding:32px;">
      <h1 style="color:${brandColors.brown};margin:0 0 16px;">New Contact Message</h1>
      <p style="color:${brandColors.black};line-height:1.6;">
        <strong>From:</strong> ${data.name}<br/>
        <strong>Email:</strong> ${data.email}
      </p>
      <div style="background:white;padding:20px;margin:20px 0;border:1px solid #E8DDD0;">
        <p style="color:${brandColors.black};white-space:pre-wrap;">${data.message}</p>
      </div>
    </div>`;

  if (!transporter) {
    console.log("[Email] SMTP not configured. Contact message logged to console.");
    return { ok: true };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: adminEmail,
      replyTo: data.email,
      subject: `Contact Form - ${data.name}`,
      html,
    });
    return { ok: true };
  } catch (error) {
    console.error("[Email] Failed to send contact email:", error);
    return { ok: false, error: "Failed to send message" };
  }
}