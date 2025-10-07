"use client";

import { useState } from "react";
import { Wallet, ArrowDownCircle, ArrowUpCircle, History, Settings, Eye } from "lucide-react";

export default function WalletPage() {
  const [tab, setTab] = useState<"transactions" | "history">("transactions");

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white px-4 pb-10 pt-10">

      <div className="mx-auto w-full max-w-md">
        {/* Wallet Card */}
        <section className="mt-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white p-4 shadow">
            <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 bg-white/25 backdrop-blur px-2 py-1 rounded-full text-xs">
                <Eye className="h-4 w-4" />
                <span>บัญชีกระเป๋าเงิน</span>
                </div>
                <span className="text-sm opacity-90">eLottery Wallet</span>
            </div>
                <div className="mt-6 flex items-end justify-between">
                    <div className="space-y-1">
                    <p className="text-5xl font-semibold leading-none">฿ 1,500.00</p>
                    <p className="text-sm opacity-90">ยอดเงินคงเหลือ</p>
                    </div>
                    <Wallet className="h-14 w-14 opacity-30" />
                </div>
            </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <Action icon={<ArrowDownCircle className="h-6 w-6" />} label="ฝากเงิน" />
            <Action icon={<ArrowUpCircle className="h-6 w-6" />} label="ถอนเงิน" />
            <Action icon={<History className="h-6 w-6" />} label="ประวัติธุรกรรม" />
          </div>
        </section>

        {/* Tabs */}
        <section className="mt-6">
          <div className="grid grid-cols-2 rounded-xl bg-gray-100 p-1 text-sm">
            <button
              className={`py-2 rounded-lg transition ${
                tab === "transactions"
                  ? "bg-white text-amber-700 shadow"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setTab("transactions")}
            >
              ธุรกรรมล่าสุด
            </button>
            <button
              className={`py-2 rounded-lg transition ${
                tab === "history"
                  ? "bg-white text-amber-700 shadow"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setTab("history")}
            >
              รายการทั้งหมด
            </button>
          </div>

          <div className="mt-5">
            {tab === "transactions" ? <EmptyTransactions /> : <EmptyHistory />}
          </div>
        </section>
      </div>
    </main>
  );
}

/* ---------------- Components ---------------- */

function Action({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="group rounded-xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
      <div className="flex flex-col items-center gap-2">
        <span className="text-amber-600 group-hover:text-amber-700">{icon}</span>
        <span className="text-[11px] font-medium text-gray-700">{label}</span>
      </div>
    </button>
  );
}

function EmptyTransactions() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-10">
      <Wallet className="h-10 w-10 text-gray-400" />
      <p className="mt-2 text-sm font-medium text-gray-700">ยังไม่มีธุรกรรมล่าสุด</p>
      <p className="text-xs text-gray-500">เมื่อมีการฝากหรือถอน ระบบจะแสดงที่นี่</p>
    </div>
  );
}

function EmptyHistory() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-10">
      <History className="h-10 w-10 text-gray-400" />
      <p className="mt-2 text-sm font-medium text-gray-700">ยังไม่มีประวัติธุรกรรม</p>
      <p className="text-xs text-gray-500">ประวัติธุรกรรมทั้งหมดจะแสดงในส่วนนี้</p>
    </div>
  );
}