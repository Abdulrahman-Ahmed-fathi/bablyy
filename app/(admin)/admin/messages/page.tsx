"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = () => {
    setLoading(true);
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then(setMessages)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const updateRead = async (id: string, isRead: boolean) => {
    const res = await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isRead }),
    });

    if (res.ok) {
      setMessages((prev) =>
        prev.map((message) => (message.id === id ? { ...message, isRead } : message))
      );
      router.refresh();
    } else {
      toast.error("Failed to update message");
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;

    const res = await fetch("/api/admin/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setMessages((prev) => prev.filter((message) => message.id !== id));
      toast.success("Message deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete message");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-stone-900">Get in Touch</h2>
        <p className="mt-1 text-sm text-stone-500">Messages submitted from the about page contact form.</p>
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-stone-100" />
      ) : messages.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-500">
          No messages yet.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <article
              key={message.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-stone-900">{message.name}</h3>
                    {!message.isRead && <Badge className="bg-amber-500 text-stone-950">Unread</Badge>}
                  </div>
                  <a
                    href={`mailto:${message.email}`}
                    className="mt-1 block text-sm text-brown underline-offset-4 hover:underline"
                  >
                    {message.email}
                  </a>
                  <p className="mt-1 text-xs text-stone-400">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateRead(message.id, !message.isRead)}
                  >
                    {message.isRead ? (
                      <Mail className="mr-2 h-4 w-4" />
                    ) : (
                      <MailOpen className="mr-2 h-4 w-4" />
                    )}
                    {message.isRead ? "Mark Unread" : "Mark Read"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMessage(message.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
              <p className="mt-5 whitespace-pre-wrap rounded-xl bg-stone-50 p-4 text-sm leading-6 text-stone-700">
                {message.message}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
