"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle2 } from "lucide-react";

type PrizeTier = { rank: string; count: number; amount: number };
type ProductDetail = {
  name: string;            
  prizeTiers: PrizeTier[]; 
  notes: string[];       
};

function useProduct(slug: string): ProductDetail {
  return useMemo(
    () => ({
      name: "สลากดิจิทัล 1 ปี",
      prizeTiers: [
        { rank: "อันดับที่ 1", count: 1, amount: 10_000_000 },
        { rank: "อันดับที่ 2", count: 1, amount: 1_000_000 },
        { rank: "อันดับที่ 3", count: 5, amount: 10_000 },
      ],
      notes: [
        "ออกรางวัลทุกวันที่ 16 ของเดือน",
        "กำหนดงวดและหมวดอักษรเฉพาะรางวัลที่ 1 และรางวัลที่ 2",
        "โอนเงินรางวัลเข้าบัญชีอัตโนมัติในวันถัดจากวันออกรางวัล",
        "มีสิทธิ์ลุ้นรางวัล 12 เดือน ตลอดระยะเวลาการฝาก",
      ],
    }),
    [slug]
  );
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const data = useProduct(params.slug);

  return (
    // <main className="min-h-screen bg-gradient-to-b from-amber-500 to-gray-950">
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">

      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-gray-500/20 backdrop-blur text-white">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center gap-2">
          <Link href="/tickets" className="rounded-full p-2 -ml-2 hover:bg-gray-100 text-white hover:text-black">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-semibold text-white">{data.name}</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-md px-4 py-5">

        {/* Prize box */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">เงินรางวัล</h2>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="py-2.5 px-4 text-left font-medium">รางวัล</th>
                  <th className="py-2.5 px-4 text-right font-medium">จำนวน</th>
                  <th className="py-2.5 px-4 text-right font-medium">เงินรางวัล</th>
                </tr>
              </thead>
              <tbody>
                {data.prizeTiers.map((t, idx) => (
                  <tr key={idx} className="border-t border-gray-100">
                    <td className="py-2.5 px-4 text-gray-800">{t.rank}</td>
                    <td className="py-2.5 px-4 text-right text-gray-700">{t.count.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right font-semibold text-gray-900">
                      {t.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          <div className="px-4 py-3 border-t border-gray-100">
            <ul className="space-y-2">
              {data.notes.map((n, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-amber-600 shrink-0" />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-6 flex gap-3">
          <Link
            href="/tickets"
            className="flex-1 rounded-xl border border-gray-300 bg-white py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ย้อนกลับ
          </Link>
          <Link
            href={`/tickets/buy`}
            className="flex-1 rounded-xl bg-amber-500 py-3 text-center text-sm font-semibold text-white hover:bg-amber-600"
          >
            ซื้อสลาก
          </Link>
        </div>
      </div>
    </main>
  );
}