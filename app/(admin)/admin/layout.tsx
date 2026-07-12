import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const pendingCount = await prisma.order.count({
    where: { status: "PENDING" },
  });
  const unreadMessages = await prisma.contactMessage.count({
    where: { isRead: false },
  });

  return (
    <div className="flex min-h-screen bg-stone-100">
      <AdminSidebar pendingCount={pendingCount} unreadMessages={unreadMessages} />
      <div className="flex flex-1 flex-col pb-16 md:ml-16 md:pb-0 lg:ml-0">
        <AdminTopbar title="Admin" email={session?.user?.email} />
        <div className="flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}
