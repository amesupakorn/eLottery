"use client";

import { useEffect, useState } from "react";
import {
  Wallet as WalletIcon,
  ArrowDownCircle,
  ArrowUpCircle,
  History as HistoryIcon, // 👈 ป้องกันชนกับ window.History
  Eye,
} from "lucide-react";
import Link from "next/link";

function formatMoneyTHB(n: number, currency = "THB") {
  // แสดง "฿ 1,234.00" แบบเดิม
  const symbol = currency === "THB" ? "฿" : "";
  return `${symbol} ${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function WalletPage() {
  const [tab, setTab] = useState<"transactions" | "history">("transactions");
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("THB");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const u = new URL("/api/wallet", window.location.origin);
    u.searchParams.set("userId", "1001"); // เปลี่ยนเป็น user จริงตามระบบ auth ได้ภายหลัง

    setLoading(true);
    fetch(u.toString())
      .then((r) => r.json())
      .then((data) => {
        setBalance(Number(data.balance ?? 0));
        setCurrency(String(data.currency ?? "THB"));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-500 to-gray-950 px-4 pb-10 pt-10">
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
                <p className="text-5xl font-semibold leading-none">
                  {loading ? "…" : formatMoneyTHB(balance, currency)}
                </p>
                <p className="text-sm opacity-90">ยอดเงินคงเหลือ</p>
              </div>
              <WalletIcon className="h-14 w-14 opacity-30" />
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <Link href="/wallet/deposit">
               <Action icon={<ArrowDownCircle className="h-6 w-6" />} label="ฝากเงิน" />
            </Link>
            <Link href="/wallet/withdraw">
               <Action icon={<ArrowUpCircle className="h-6 w-6" />} label="ถอนเงิน" />
            </Link>
            <Link href="">
              <Action icon={<HistoryIcon className="h-6 w-6" />} label="ประวัติธุรกรรม" />
            </Link>
          </div>
        </section>

        {/* Tabs */}
        <section className="mt-6">
          <div className="grid grid-cols-2 rounded-xl bg-gray-100 p-1 text-sm">
            <button
              className={`py-2 rounded-lg transition ${
                tab === "transactions" ? "bg-white text-amber-700 shadow" : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setTab("transactions")}
            >
              ธุรกรรมล่าสุด
            </button>
            <button
              className={`py-2 rounded-lg transition ${
                tab === "history" ? "bg-white text-amber-700 shadow" : "text-gray-600 hover:text-gray-800"
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
    <button
      className="w-full h-full flex flex-col justify-center items-center
                 bg-white rounded-xl border border-gray-200 shadow-sm
                 hover:shadow-md hover:bg-emerald-50 transition
                 py-4 px-2"
    >
      <div className="text-emerald-500">{icon}</div>
      <span className="mt-2 text-xs font-medium text-gray-700">{label}</span>
    </button>
  );
}

function EmptyTransactions() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-10">
      <WalletIcon className="h-10 w-10 text-gray-400" />
      <p className="mt-2 text-sm font-medium text-gray-700">ยังไม่มีธุรกรรมล่าสุด</p>
      <p className="text-xs text-gray-500">เมื่อมีการฝากหรือถอน ระบบจะแสดงที่นี่</p>
    </div>
  );
}

function EmptyHistory() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-10">
      <HistoryIcon className="h-10 w-10 text-gray-400" />
      <p className="mt-2 text-sm font-medium text-gray-700">ยังไม่มีประวัติธุรกรรม</p>
      <p className="text-xs text-gray-500">ประวัติธุรกรรมทั้งหมดจะแสดงในส่วนนี้</p>
    </div>
  );
}
