"use client";

import { useState } from "react";
import { Ticket, Settings, History, Search, Eye } from "lucide-react";
import Link from "next/link";

export default function TicketPage() {
  const [tab, setTab] = useState<"tickets" | "ledger">("tickets");

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-500 to-gray-950 px-4 pb-10 pt-10">

      <div className="mx-auto w-full max-w-md">
        {/* Balance Card */}
        <section className="mt-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white p-4 shadow">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 bg-white/25 backdrop-blur px-2 py-1 rounded-full text-xs">
                <Eye className="h-4 w-4" />
                <span>4000xxxx3961</span>
              </div>
              <span className="text-sm opacity-90">สลากดิจิทัล</span>
            </div>

            <div className="mt-6 flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-5xl font-semibold leading-none">0.00</p>
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
            <Link href="/tickets/product" className="w-full h-full">
              <Action icon={<History className="h-6 w-6" />} label="ประวัติการถอน" />
            </Link>
          </div>
        </section>

        {/* Tabs */}
        <section className="mt-6">
          <div className="grid grid-cols-2 rounded-xl bg-gray-100 p-1 text-sm">
            <button
              className={`py-2 rounded-lg transition ${
                tab === "tickets"
                  ? "bg-white text-amber-700 shadow"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setTab("tickets")}
            >
              สลาก (0)
            </button>
            <button
              className={`py-2 rounded-lg transition ${
                tab === "ledger"
                  ? "bg-white text-amber-700 shadow"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setTab("ledger")}
            >
              รายการเดินบัญชี
            </button>
          </div>

          {/* Content */}
          <div className="mt-5">
            {tab === "tickets" ? <EmptyTickets /> : <EmptyLedger />}
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