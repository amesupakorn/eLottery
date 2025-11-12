"use client";

import { useMemo, useState, useEffect } from "react";
import {
  History as HistoryIcon,
  Ticket as TicketIcon,
  ArrowDownCircle,
  ArrowUpCircle,
  Search,
} from "lucide-react";

import type { LedgerItem, TicketItem } from "@/types/history";
import api from "@/lib/axios";

export default function HistoryPage() {
  const [tab, setTab] = useState<"ledger" | "tickets">("ledger");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 px-4 pb-10 pt-10">
      <div className="mx-auto w-full max-w-md">
        {/* ✅ Tabs: ใส่กลับมาให้ครบ 2 ปุ่ม */}
        <div className="mt-4 grid grid-cols-2 rounded-xl bg-gray-100 p-1 text-sm">
          <button
            onClick={() => setTab("ledger")}
            className={`py-2 rounded-lg transition ${tab === "ledger" ? "bg-white text-amber-700 shadow" : "text-gray-600 hover:text-gray-800"}`}
          >
            เดินบัญชี
          </button>
          <button
            onClick={() => setTab("tickets")}
            className={`py-2 rounded-lg transition ${tab === "tickets" ? "bg-white text-amber-700 shadow" : "text-gray-600 hover:text-gray-800"}`}
          >
            สลากดิจิทัล
          </button>
        </div>

        {/* Filters */}
        <div className="mt-4 grid grid-cols-1 gap-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-xl border text-gray-500 border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-xl border text-gray-500 border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <section className="mt-4">
          {tab === "ledger" ? (
            <LedgerList q={q} from={from} to={to} />
          ) : (
            <TicketList q={q} from={from} to={to} />
          )}
        </section>
      </div>
    </main>
  );
}

/* ---------------- Components ---------------- */

function LedgerList({ q, from, to }: { q: string; from: string; to: string }) {
  const [serverItems, setServerItems] = useState<LedgerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = new URL("/api/history/transactions", window.location.origin);
    if (from) u.searchParams.set("from", from);
    if (to) u.searchParams.set("to", to);

    setLoading(true);

    fetch(u.toString())
      .then((r) => r.json())
      .then((data) => {
        const txs = (data.items ?? []) as Array<{
          id: number | string;
          entry_type?: string;
          type?: string;
          amount: number | string;
          note?: string | null;
          occurredAt?: string;
          occurred_at?: string;
          direction?: "CREDIT" | "DEBIT";
        }>;

        const mapped = txs.map((t) => {
          const entry = (t.type ?? t.entry_type ?? "DEPOSIT") as string;
          const amountNum =
            typeof t.amount === "string" ? Number(t.amount) : t.amount ?? 0;
          const signed =
            t.direction === "CREDIT"
              ? Math.abs(amountNum)
              : -Math.abs(amountNum);

          return {
            id: String(t.id),
            type: entry === "WITHDRAWAL" ? "WITHDRAW" : (entry as any),
            amount: signed,
            note: t.note ?? undefined,
            occurredAt: (t.occurredAt ??
              t.occurred_at ??
              new Date().toISOString()) as string,
          };
        });

        setServerItems(mapped);
      })
      .finally(() => setLoading(false));
  }, [from, to]);
  const items = useMemo(() => {
    const f = (it: LedgerItem) => {
      const inRange =
        (!from || new Date(it.occurredAt) >= new Date(from)) &&
        (!to || new Date(it.occurredAt) <= new Date(to + "T23:59:59"));
      const keyword = q.trim().toLowerCase();
      const match =
        !keyword ||
        it.type.toLowerCase().includes(keyword) ||
        it.note?.toLowerCase().includes(keyword);
      return inRange && match;
    };
    return serverItems.filter(f);
  }, [serverItems, q, from, to]);

  if (loading) {
    return <EmptyCard icon={<HistoryIcon className="h-8 w-8 text-gray-400" />} title="กำลังโหลดรายการ" note="ดึงข้อมูลจากฐานข้อมูล..." />;
  }

  if (!items.length) {
    return (
      <EmptyCard
        icon={<HistoryIcon className="h-8 w-8 text-gray-400" />}
        title="ยังไม่มีรายการเดินบัญชี"
        note="เมื่อมีการฝาก/ถอน/ซื้อสลาก จะปรากฏที่นี่"
      />
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it.id} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Badge type={it.type} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                {labelType(it.type)}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(it.occurredAt)} · {it.note || "-"}
              </p>
            </div>
            <p className={`text-sm font-semibold ${it.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {it.amount >= 0 ? "+" : ""}
              {formatMoney(it.amount)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function TicketList({ q, from, to }: { q: string; from: string; to: string }) {
  const [items, setItems] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = new URL("/api/history/tickets", window.location.origin);
    if (from) u.searchParams.set("from", from);
    if (to) u.searchParams.set("to", to);

    setLoading(true);
    fetch(u.toString())
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []))
      .finally(() => setLoading(false));
  }, [from, to]);

  const filtered = useMemo(() => {
    const f = (it: TicketItem) => {
      const inRange =
        (!from || new Date(it.purchasedAt) >= new Date(from)) &&
        (!to || new Date(it.purchasedAt) <= new Date(to + "T23:59:59"));
      const keyword = q.trim().toLowerCase();
      const match =
        !keyword ||
        it.ticketNumber.includes(keyword) ||
        it.product.toLowerCase().includes(keyword) ||
        it.status.toLowerCase().includes(keyword);
      return inRange && match;
    };
    return items.filter(f);
  }, [items, from, to]);

  if (loading) {
    return <EmptyCard icon={<TicketIcon className="h-8 w-8 text-gray-400" />} title="กำลังโหลดสลาก" note="ดึงข้อมูลจากฐานข้อมูล..." />;
  }

  if (!filtered.length) {
    return <EmptyCard icon={<TicketIcon className="h-8 w-8 text-gray-400" />} title="ยังไม่มีสลากดิจิทัล" note="ซื้อสลากแล้วจะแสดงที่นี่" />;
  }

  return (
    <ul className="space-y-2">
      {filtered.map((it) => (
        <li key={it.id} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center justify-center rounded-xl p-2 text-white ${statusColor(it.status)}`}>
              <TicketIcon className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">เลข {it.ticketNumber}</p>
              <p className="text-xs text-gray-500">{it.product} · {formatDate(it.purchasedAt)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{formatMoney(it.price)}</p>
              <p className={`text-[11px] ${statusTextColor(it.status)}`}>{labelTicketStatus(it.status)}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ---------------- Shared UI ---------------- */

function EmptyCard({ icon, title, note }: { icon: React.ReactNode; title: string; note: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-10">
      {icon}
      <p className="mt-2 text-sm font-medium text-gray-700">{title}</p>
      <p className="text-xs text-gray-500">{note}</p>
    </div>
  );
}

function Badge({ type }: { type: LedgerItem["type"] }) {
  const map = {
    DEPOSIT:  { bg: "bg-emerald-100 text-emerald-700", icon: <ArrowDownCircle className="h-4 w-4" /> },
    WITHDRAW: { bg: "bg-red-100 text-red-700",         icon: <ArrowUpCircle className="h-4 w-4" /> },
    PRIZE:    { bg: "bg-amber-100 text-amber-700",     icon: <TicketIcon className="h-4 w-4" /> },
    PURCHASE: { bg: "bg-gray-100 text-gray-700",       icon: <TicketIcon className="h-4 w-4" /> },
    REFUND:   { bg: "bg-blue-100 text-blue-700",       icon: <HistoryIcon className="h-4 w-4" /> },
  } as const;
  const { bg, icon } = map[type];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ${bg}`}
    >
      {icon}
      {labelType(type)}
    </span>
  );
}

/* ---------------- Utils ---------------- */

function labelType(t: LedgerItem["type"]) {
  switch (t) {
    case "DEPOSIT": return "ฝากเงิน";
    case "WITHDRAW": return "ถอนเงิน";
    case "PRIZE": return "รับรางวัล";
    case "PURCHASE": return "ซื้อสลาก";
    case "REFUND": return "คืนเงิน";
  }
}

function labelTicketStatus(s: TicketItem["status"]) {
  switch (s) {
    case "OWNED": return "ถือครอง";
    case "CANCELED": return "ยกเลิก";
    case "WIN": return "ถูกรางวัล";
  }
}

function statusColor(s: TicketItem["status"]) {
  switch (s) {
    case "OWNED": return "bg-amber-500";
    case "CANCELED": return "bg-gray-400";
    case "WIN": return "bg-emerald-500";
  }
}
function statusTextColor(s: TicketItem["status"]) {
  switch (s) {
    case "OWNED": return "text-amber-600";
    case "CANCELED": return "text-gray-500";
    case "WIN": return "text-emerald-600";
  }
}

function formatMoney(n: number) {
  return "฿ " + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
}
