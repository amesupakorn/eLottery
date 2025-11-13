"use client";

import { useEffect, useState } from "react";
import { Ticket, Settings, History, Search, Eye, HistoryIcon, ArrowDownCircle, ArrowUpCircle, WalletIcon, TicketIcon } from "lucide-react";
import Link from "next/link";
import { TicketPurchase } from "@/types/tickets";
import api from "@/lib/axios";
import { LedgerItem, TicketItem } from "@/types/history";
import { useRouter, useSearchParams } from 'next/navigation';

export default function TicketPage() {
  const [tab, setTab] = useState<"tickets" | "ledger">("tickets");
  const params = useSearchParams();
  const receiptId = params.get("receipt");
    
  useEffect(() => {
    if (receiptId) {
      window.open(`/api/receipts/open?receiptId=${receiptId}`, "_blank");
      
      const url = new URL(window.location.href);
      url.searchParams.delete("receipt");
      window.history.replaceState({}, "", url.toString());
    }
  }, [receiptId]);
  
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [tickets, setTicket] = useState<TicketPurchase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTicket = async ( ) => {
      setLoading(true);

      try{
        const res = await api.get('/lottery');
        setTotal(res.data.total_value);
        setCount(res.data.count);
        setTicket(res.data.tickets);
    
      } catch(err){
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTicket();

  }, [])

  const latest = tickets.slice(0, 5);

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-500 to-gray-950 px-4 pb-10 pt-10">

      <div className="mx-auto w-full max-w-md">
        {/* Balance Card */}
        <section className="mt-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white p-4 shadow">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 bg-white/25 backdrop-blur px-2 py-1 rounded-full text-xs">
                <Eye className="h-4 w-4" />
                <span>บัญชีกระเป๋าสลาก</span>
              </div>
              <span className="text-sm opacity-90">สลากดิจิทัล</span>
            </div>

            <div className="mt-6 flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-5xl font-semibold leading-none">{total}</p>
                <p className="text-sm opacity-90">ยอดฝากสลากรวม</p>
              </div>
              <Ticket className="h-14 w-14 opacity-30" />
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <Link href="/tickets/buy" className="w-full h-full">
              <Action  icon={<Ticket className="h-6 w-6" />} label="ซื้อสลาก" />
            </Link>
            <Link href="/tickets/product" className="w-full h-full">
              <Action icon={<Search className="h-6 w-6" />} label="ข้อมูลผลิตภัณฑ์" />
            </Link>
            <Link href="/history" className="w-full h-full">
              <Action icon={<History className="h-6 w-6" />} label="ประวัติการถอน" />
            </Link>
          </div>
        </section>

        {/* Tabs */}
        <section className="mt-6">
          <div className="rounded-xl bg-gray-100 p-1 text-sm ">
            <button
              className="py-2 w-full rounded-lg transition bg-white text-amber-700 shadow"
            >
              จำนวนสลาก ({count})
            </button>
          </div>

          <div className="mt-5">
            {loading ? (
              <EmptyLoading />
            ) : (
              tickets.length ? (
                <TransactionList items={latest} />
              ) : (
                <EmptyTickets />
              )
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

/* ---------------- Components ---------------- */

function Action({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      className="w-full h-full flex flex-col justify-center items-center
                 bg-white rounded-xl border border-gray-200 shadow-sm
                 hover:shadow-md hover:bg-amber-50 transition
                 py-4 px-2"
    >
      <div className="text-amber-600">{icon}</div>
      <span className="mt-2 text-xs font-medium text-gray-700">{label}</span>
    </button>
  );
}

function EmptyTickets() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-10">
      <Ticket className="h-10 w-10 text-gray-400" />
      <p className="mt-2 text-sm font-medium text-gray-700">ยังไม่มีสลาก</p>
      <p className="text-xs text-gray-500">ซื้อสลากดิจิทัลได้ที่ปุ่ม “ซื้อสลาก”</p>
      <button className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">
        ซื้อสลาก
      </button>
    </div>
  );
}

function EmptyLedger() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-10">
      <History className="h-10 w-10 text-gray-400" />
      <p className="mt-2 text-sm font-medium text-gray-700">ยังไม่มีรายการเดินบัญชี</p>
      <p className="text-xs text-gray-500">เมื่อมีการเคลื่อนไหว จะปรากฏที่นี่</p>
    </div>
  );
}

function EmptyLoading() {
  return (
    <EmptyCard
      icon={<HistoryIcon className="h-8 w-8 text-gray-400 animate-spin" />}
      title="กำลังโหลดข้อมูล..."
      note="กำลังดึงข้อมูลธุรกรรมจากระบบ"
    />
  );
}

function EmptyCard({
  icon,
  title,
  note,
}: {
  icon: React.ReactNode;
  title: string;
  note: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-10">
      {icon}
      <p className="mt-2 text-sm font-medium text-gray-700">{title}</p>
      <p className="text-xs text-gray-500">{note}</p>
    </div>
  );
}

function TransactionList({ items }: { items: any[] }) {
  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it.id} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center justify-center rounded-xl p-2 text-white ${statusColor(it.status)}`}>
              <TicketIcon className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">เลข {it.range_start} - {it.range_end}</p>
              <p className="text-xs text-gray-500">สลากดิจิทัล · {formatDate(it.purchased_at)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{formatMoney(it.total_price)}</p>
              <p className={`text-[11px] ${statusTextColor(it.status)}`}>{labelTicketStatus(it.status)}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function formatMoney(n: number) {
  return "฿ " + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
}

function statusTextColor(s: TicketItem["status"]) {
  switch (s) {
    case "OWNED": return "text-amber-600";
    case "CANCELED": return "text-gray-500";
    case "WIN": return "text-emerald-600";
  }
}

function statusColor(s: TicketItem["status"]) {
  switch (s) {
    case "OWNED": return "bg-amber-500";
    case "CANCELED": return "bg-gray-400";
    case "WIN": return "bg-emerald-500";
  }
}

function labelTicketStatus(s: TicketItem["status"]) {
  switch (s) {
    case "OWNED": return "ถือครอง";
    case "CANCELED": return "ยกเลิก";
    case "WIN": return "ถูกรางวัล";
  }
}
