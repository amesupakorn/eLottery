"use client";

import Link from "next/link";
import { ChevronLeft, Ticket, Info, ShieldCheck } from "lucide-react";

const product = {
  id: "GOV-DEMO-1",
  name: "สลากดิจิทัล 1 ปี",
  drawCode: "624",   
  unitPrice: 100,     
};

export default function BuyTicketSimplePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-500 to-gray-950">

      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-amber-500/20 backdrop-blu">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center gap-2">
          <Link href="/tickets" className="rounded-full p-2 -ml-2 hover:bg-gray-100">
            <ChevronLeft className="h-5 w-5 text-white" />
          </Link>
          <h1 className="text-base font-semibold text-white">{product.name}</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-md px-4 py-5 space-y-5">
        {/* สลากการ์ด */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white p-4 shadow">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 bg-white/25 backdrop-blur px-2 py-1 rounded-full text-xs">
              <Ticket className="h-4 w-4" />
              <span>{product.id}</span>
            </div>
            <span className="text-sm opacity-90">{product.name}</span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs opacity-90">งวดปัจจุบัน</p>
              <p className="text-3xl font-semibold leading-none">{product.drawCode}</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-90">มูลค่าหน่วยละ</p>
              <p className="text-2xl font-semibold">฿ {product.unitPrice.toFixed(2)}</p>
            </div>
          </div>
        </section>

        {/* ข้อมูลสรุปสั้น ๆ */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p>สลากดิจิทัล มูลค่าหน่วยละ <b>฿ {product.unitPrice.toFixed(2)}</b> ลุ้นรางวัลตามงวด</p>
              <p className="mt-1 text-gray-500 text-xs">รายละเอียดเงินรางวัลและเงื่อนไขสามารถดูได้ในหน้าข้อมูลผลิตภัณฑ์</p>
            </div>
          </div>

          <Link
            href={`/tickets/product`}
            className="inline-flex items-center gap-2 text-sm text-amber-700 hover:text-amber-800 font-medium"
          >
            ดูรายละเอียดสลากทั้งหมด
          </Link>

          <p className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="h-4 w-4 text-amber-600" />
            การซื้อสลากผ่าน eLottery ปลอดภัยและเข้ารหัส
          </p>
        </section>

        {/* ปุ่มดำเนินการ (ต่อไปค่อยไปเลือกเลข/ยืนยัน) */}
        <div className="flex gap-3">
          <Link
            href="/tickets"
            className="flex-1 rounded-xl border border-gray-300 bg-white py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ย้อนกลับ
          </Link>
          <Link
            href={`/tickets/buy/confirm`}
            className="flex-1 rounded-xl bg-amber-500 py-3 text-center text-sm font-semibold text-white hover:bg-amber-600"
          >
            ซื้อสลาก
          </Link>
        </div>
      </div>
    </main>
  );
}