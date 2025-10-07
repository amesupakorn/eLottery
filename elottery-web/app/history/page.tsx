"use client";

import { useMemo, useState } from "react";
import { History, Ticket, ArrowDownCircle, ArrowUpCircle, Search } from "lucide-react";
import type { LedgerItem, TicketItem } from "@/types/history"

const ledgerMock: LedgerItem[] = [
  { id: "L001", type: "DEPOSIT", amount: 500.0, note: "PromptPay", occurredAt: "2025-10-05T12:15:00Z" },
  { id: "L002", type: "PURCHASE", amount: -80.0, note: "ซื้อสลาก 2 ใบ", occurredAt: "2025-10-05T13:30:00Z" },
  { id: "L003", type: "PRIZE", amount: 40.0, note: "ถูกรางวัลเลขท้าย", occurredAt: "2025-10-05T18:00:00Z" },
  { id: "L004", type: "WITHDRAW", amount: -200.0, note: "โอนไปบัญชีธนาคาร", occurredAt: "2025-10-06T03:00:00Z" },
];

const ticketsMock: TicketItem[] = [
  { id: "T001", ticketNumber: "000123", product: "สลากออมสิน ดิจิทัล", status: "OWNED", price: 40, purchasedAt: "2025-10-05T13:31:00Z" },
  { id: "T002", ticketNumber: "987654", product: "สลากออมสิน ดิจิทัล", status: "WIN", price: 40, purchasedAt: "2025-10-05T13:31:00Z" },
];

export default function HistoryPage() {
  const [tab, setTab] = useState<"ledger" | "tickets">("ledger");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white px-4 pb-10 pt-10">
      <div className="mx-auto w-full max-w-md">
        {/* Tabs */}
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
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={tab === "ledger" ? "ค้นหาโน้ต / ประเภทรายการ" : "ค้นหาหมายเลขสลาก / ผลิตภัณฑ์"}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Lists */}
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
    return ledgerMock.filter(f);
  }, [q, from, to]);

  if (!items.length) return <EmptyCard icon={<History className="h-8 w-8 text-gray-400" />} title="ยังไม่มีรายการเดินบัญชี" note="เมื่อมีการฝาก/ถอน/ซื้อสลาก จะปรากฏที่นี่" />;

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
              <p className="text-xs text-gray-500">{formatDate(it.occurredAt)} · {it.note || "-"}</p>
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
  const items = useMemo(() => {
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
    return ticketsMock.filter(f);
  }, [q, from, to]);

  if (!items.length) return <EmptyCard icon={<Ticket className="h-8 w-8 text-gray-400" />} title="ยังไม่มีสลากดิจิทัล" note="ซื้อสลากแล้วจะแสดงที่นี่" />;

  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it.id} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center justify-center rounded-xl p-2 text-white ${statusColor(it.status)}`}>
              <Ticket className="h-5 w-5" />
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
    DEPOSIT: { bg: "bg-emerald-100 text-emerald-700", icon: <ArrowDownCircle className="h-4 w-4" /> },
    WITHDRAW: { bg: "bg-red-100 text-red-700", icon: <ArrowUpCircle className="h-4 w-4" /> },
    PRIZE: { bg: "bg-amber-100 text-amber-700", icon: <Ticket className="h-4 w-4" /> },
    PURCHASE: { bg: "bg-gray-100 text-gray-700", icon: <Ticket className="h-4 w-4" /> },
    REFUND: { bg: "bg-blue-100 text-blue-700", icon: <History className="h-4 w-4" /> },
  } as const;
  const { bg, icon } = map[type];
  return <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ${bg}`}>{icon}{labelType(type)}</span>;
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