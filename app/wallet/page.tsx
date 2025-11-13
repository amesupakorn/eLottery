"use client";

import { JSX, useEffect, useState } from "react";
import {
  Wallet as WalletIcon,
  ArrowDownCircle,
  ArrowUpCircle,
  History as HistoryIcon,
  Eye,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import { LedgerItem } from "@/types/history";

function formatMoneyTHB(n: number, currency = "THB") {
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
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState<boolean>(true);

  // ✅ โหลดข้อมูลกระเป๋า
  useEffect(() => {
    const fetchWallet = async () => {
      setLoading(true);
      try {
        const res = await api.get("/wallet");
        setBalance(Number(res.data.balance ?? 0));
        setCurrency(String(res.data.currency ?? "THB"));
      } catch (err) {
        console.error("Error fetching wallet:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, []);

  // ✅ โหลดธุรกรรมทั้งหมด
  useEffect(() => {
    const fetchTx = async () => {
      setTxLoading(true);
      try {
        const res = await fetch("/api/history/transactions");
        const data = await res.json();
        setTransactions(data.items ?? []);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setTxLoading(false);
      }
    };
    fetchTx();
  }, []);

  const latest = transactions.slice(0, 5); // 5 รายการล่าสุด

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
              <Action
                icon={<ArrowDownCircle className="h-6 w-6" />}
                label="ฝากเงิน"
              />
            </Link>
            <Link href="/wallet/withdraw">
              <Action
                icon={<ArrowUpCircle className="h-6 w-6" />}
                label="ถอนเงิน"
              />
            </Link>
            <Link href="/history">
              <Action
                icon={<HistoryIcon className="h-6 w-6" />}
                label="ประวัติธุรกรรม"
              />
            </Link>
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
            {txLoading ? (
              <EmptyLoading />
            ) : tab === "transactions" ? (
              latest.length ? (
                <TransactionList items={latest} />
              ) : (
                <EmptyTransactions />
              )
            ) : transactions.length ? (
              <TransactionList items={transactions} />
            ) : (
              <EmptyHistory />
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
                 hover:shadow-md hover:bg-emerald-50 transition
                 py-4 px-2"
    >
      <div className="text-emerald-500">{icon}</div>
      <span className="mt-2 text-xs font-medium text-gray-700">{label}</span>
    </button>
  );
}

function TransactionList({ items }: { items: any[] }) {
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
              {formatMoneyTHB(it.amount)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyTransactions() {
  return (
    <EmptyCard
      icon={<WalletIcon className="h-10 w-10 text-gray-400" />}
      title="ยังไม่มีธุรกรรมล่าสุด"
      note="เมื่อมีการฝากหรือถอน ระบบจะแสดงที่นี่"
    />
  );
}

function EmptyHistory() {
  return (
    <EmptyCard
      icon={<HistoryIcon className="h-10 w-10 text-gray-400" />}
      title="ยังไม่มีประวัติธุรกรรม"
      note="ประวัติธุรกรรมทั้งหมดจะแสดงในส่วนนี้"
    />
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

function Badge({ type }: { type: LedgerItem["type"] }) {
  const map: Record<string, { bg: string; icon: JSX.Element }> = {
    DEPOSIT:  { bg: "bg-emerald-100 text-emerald-700", icon: <ArrowDownCircle className="h-4 w-4" /> },
    WITHDRAW: { bg: "bg-red-100 text-red-700",         icon: <ArrowUpCircle className="h-4 w-4" /> },
    REFUND:   { bg: "bg-blue-100 text-blue-700",       icon: <HistoryIcon className="h-4 w-4" /> },
    PRIZE:    { bg: "bg-amber-100 text-amber-700",     icon: <WalletIcon className="h-4 w-4" /> },
    PURCHASE: { bg: "bg-gray-100 text-gray-700",       icon: <HistoryIcon className="h-4 w-4" /> },
  };

  const entry = map[type] ?? { bg: "bg-gray-100 text-gray-700", icon: <HistoryIcon className="h-4 w-4" /> };
  const { bg, icon } = entry;
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

function labelType(t: string) {
  switch (t) {
    case "DEPOSIT":
      return "ฝากเงิน";
    case "WITHDRAW":
      return "ถอนเงิน";
    case "PRIZE":
      return "รับรางวัล";
    case "PURCHASE":
      return "ซื้อสลาก";
    case "REFUND":
      return "คืนเงิน";
    default:
      return "ธุรกรรม";
  }
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}