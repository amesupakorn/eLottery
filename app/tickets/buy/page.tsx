"use client";

import Link from "next/link";
import { ChevronLeft, Ticket, Info, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Draw } from "@/types/draw";

const product = {
  unitPrice: 100,     
};

export default function BuyTicketSimplePage() {

  const [draw, setDraw] = useState<Draw>();

  useEffect(() => {
    const fetchDraw = async () => {
      try{
        const res = await api.get("/draws?status=SCHEDULED");
        const draws = res.data.draws || [];
        setDraw(draws[0]);
      } catch (err) {
        console.error("Error fetch", err);
      }
    }

    fetchDraw();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">

      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-gray-500/20 backdrop-blu">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center gap-2">
           <Link href="/tickets" className="rounded-full p-2 -ml-2 hover:bg-gray-100 text-white hover:text-black">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-semibold text-white">{draw?.draw_code}</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-md px-4 py-5 space-y-5">
        {/* สลากการ์ด */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white p-4 shadow">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 bg-white/25 backdrop-blur px-2 py-1 rounded-full text-xs">
              <Ticket className="h-4 w-4" />
              <span>{draw?.draw_code}</span>
            </div>
            <span className="text-sm opacity-90">สลากดิจิทัล 1 ปี</span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs opacity-90">งวดปัจจุบัน</p>
              <p className="text-3xl font-semibold leading-none">{draw?.id}</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-90">มูลค่าหน่วยละ</p>
              <p className="text-2xl font-semibold">฿ 100.00</p>
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
              href={draw ? `/tickets/buy/confirm?draw=${encodeURIComponent(draw.draw_code)}` : "#"}
              className={`flex-1 rounded-xl py-3 text-center text-sm font-semibold text-white ${
                draw ? "bg-amber-500 hover:bg-amber-600" : "bg-amber-300 cursor-not-allowed"
              }`}
              aria-disabled={!draw}
            >
              ซื้อสลาก
          </Link>
        </div>
      </div>
    </main>
  );
}