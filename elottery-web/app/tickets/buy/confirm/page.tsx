"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  Wallet,
  Ticket,
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
} from "lucide-react";

const WALLET_BALANCE = 3500; // ยอดเงินในกระเป๋า (mock)
const MIN_AMOUNT = 1000;
const STEP = 1000;
const UNIT_PRICE = 100; // หน่วยละ 100 บาท
const DRAW_CODE = "624";

export default function BuyTicketWalletPage() {
  const [amount, setAmount] = useState(MIN_AMOUNT);

  const totalUnits = Math.floor(amount / UNIT_PRICE);
  const startNumber = "000000";
  const endNumber = (totalUnits - 1)
    .toString()
    .padStart(6, "0");

  const formattedAmount = useMemo(
    () =>
      "฿ " +
      amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [amount]
  );

  const formattedWallet = useMemo(
    () =>
      "฿ " +
      WALLET_BALANCE.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );

  const isEnough = amount <= WALLET_BALANCE;
  const isValidMin = amount >= MIN_AMOUNT;
  const canContinue = isValidMin && isEnough;

  const onChangeRaw = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = Number((e.target.value || "").replace(/[^\d]/g, ""));
    setAmount(n);
  };
  const dec = () => setAmount((v) => Math.max(MIN_AMOUNT, v - STEP));
  const inc = () => setAmount((v) => v + STEP);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canContinue) return;
    alert(
      `ยืนยันการซื้อสลาก\nยอดเงิน: ${formattedAmount}\nจำนวนหน่วย: ${totalUnits} หน่วย\nช่วงหมายเลข: ${startNumber} - ${endNumber}`
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-500/20 backdrop-blur">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center gap-2">
          <Link href="/tickets" className="rounded-full p-2 -ml-2 hover:bg-gray-100 text-white hover:text-black">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          
          <h1 className="text-base font-semibold text-white">ซื้อสลากดิจิทัล</h1>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-md px-4 py-5 space-y-5"
      >
        {/* FROM → TO Flow */}
        <section className="relative flex flex-col items-center text-center">
          <div className="flex items-center justify-between w-full max-w-sm">
            {/* จาก Wallet */}
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-emerald-100 p-3">
                <Wallet className="h-6 w-6 text-emerald-700" />
              </div>
              <p className="mt-1 text-xs text-white font-medium">กระเป๋าเงินของฉัน</p>
            </div>

            {/* ลูกศรตรงกลาง */}
            <ArrowRight className="h-6 w-6 text-white" />

            {/* ไปยัง สลาก */}
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-amber-100 p-3">
                <Ticket className="h-6 w-6 text-amber-700" />
              </div>
              <p className="mt-1 text-xs text-white font-medium">สลากดิจิทัล</p>
            </div>
          </div>
        </section>

        {/* บัตรข้อมูลกระเป๋า */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">ยอดเงินในกระเป๋า</p>
            <p className="text-sm font-semibold text-emerald-700">{formattedWallet}</p>
          </div>
        </section>

        {/* เลือกจำนวนเงิน */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-800">จำนวนเงินที่ต้องการใช้ซื้อ</p>
            <span className="text-[11px] text-gray-500">
              ขั้นต่ำ {MIN_AMOUNT.toLocaleString()} บาท
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="inline-flex items-center rounded-xl border border-gray-200">
              <button type="button" onClick={dec} className="p-2 hover:bg-gray-50">
                <Minus className="h-4 w-4 text-gray-800" />
              </button>
              <input
                inputMode="numeric"
                value={amount}
                onChange={onChangeRaw}
                className="w-28 text-center text-lg font-semibold outline-none text-gray-800"
              />
              <button type="button" onClick={inc} className="p-2 hover:bg-gray-50">
                <Plus className="h-4 w-4 text-gray-800" />
              </button>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">ยอดซื้อ</p>
              <p className="text-lg font-bold text-amber-700">{formattedAmount}</p>
            </div>
          </div>

          {/* ป้าย shortcut ยอดด่วน */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[1000, 2000, 5000, 10000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(v)}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  amount === v
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {v.toLocaleString()} ฿
              </button>
            ))}
          </div>
        </section>

        {/* คำนวณหน่วยและหมายเลข */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">จำนวนหน่วย</span>
            <span className="font-semibold text-gray-900">{totalUnits.toLocaleString()} หน่วย</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">ช่วงหมายเลข</span>
            <span className="font-mono font-semibold text-gray-900">
              {startNumber} - {endNumber}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            * หน่วยละ {UNIT_PRICE.toLocaleString()} บาท
          </p>
        </section>

        {/* ข้อความเตือน */}
        {!isValidMin && (
          <p className="text-xs text-red-600">
            กรุณากรอกจำนวนเงินขั้นต่ำ {MIN_AMOUNT.toLocaleString()} บาท
          </p>
        )}
        {!isEnough && (
          <p className="text-xs text-red-600">ยอดเงินในกระเป๋าไม่เพียงพอ</p>
        )}
        <p className="flex items-center gap-2 text-xs text-gray-500 dark:text-white">
          <ShieldCheck className="h-4 w-4 text-amber-600" />
          ชำระด้วยกระเป๋า eLottery ปลอดภัยและเข้ารหัส
        </p>

        {/* ปุ่ม */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/tickets"
            className="flex-1 rounded-xl border border-gray-300 bg-white py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ย้อนกลับ
          </Link>
          <button
            type="submit"
            disabled={!canContinue}
            className={`flex-1 rounded-xl py-3 text-center text-sm font-semibold text-white transition ${
              canContinue
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-amber-300 cursor-not-allowed"
            }`}
          >
            ดำเนินการต่อ
          </button>
        </div>
      </form>
    </main>
  );
}