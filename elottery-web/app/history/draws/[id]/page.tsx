"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Trophy,
  CalendarDays,
  Crown,
  Medal,
  Award,
  Loader2,
} from "lucide-react";
import React from "react";
import type { DrawDetail, ResultItem } from "@/types/draw";


function thMoney(x: string | number) {
  const n = typeof x === "string" ? Number(x) : x;
  return "฿ " + (Number.isFinite(n) ? n.toLocaleString("th-TH") : x);
}

function thDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
}

const tierIcon = (name: string) => {
  if (name.includes("อันดับที่ 1")) return <Crown className="h-5 w-5 text-amber-700" />;
  if (name.includes("อันดับที่ 2")) return <Medal className="h-5 w-5 text-amber-700" />;
  if (name.includes("อันดับที่ 3")) return <Award className="h-5 w-5 text-amber-700" />;
  return <Award className="h-5 w-5 text-amber-700" />;
};

export default function DrawDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [data, setData] = useState<DrawDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/draws/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        setData(json as DrawDetail);
      } catch (e: any) {
        setErr("ไม่พบข้อมูลงวดนี้ หรือมีข้อผิดพลาดในการเชื่อมต่อ");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const grouped = useMemo(() => {
    const map = new Map<string, ResultItem[]>();
    (data?.results ?? []).forEach((r) => {
      const key = r.prize_tier;
      map.set(key, [...(map.get(key) || []), r]);
    });
    return map;
  }, [data]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-500 to-gray-950">

      {/* Header */}
      <header className="sticky top-0 z-20 bg-amber-500/20 backdrop-blur">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center gap-2">
          <Link href="/history" className="rounded-full p-2 -ml-2 hover:bg-gray-100 text-white hover:text-black">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-semibold text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-white" />
            รายละเอียดงวด
          </h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-md px-4 py-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          </div>
        ) : err ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {err}
          </div>
        ) : !data ? (
          <p className="text-center text-gray-500">ไม่พบข้อมูล</p>
        ) : (
          <>
            {/* Info Card */}
            <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500">งวดที่</p>
                  <p className="text-lg font-semibold text-gray-900">{data.draw_code}</p>
                  <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    {thDate(data.created_at)}
                  </p>
                  {data.product_name && (
                    <p className="mt-1 text-xs text-gray-500">ผลิตภัณฑ์: {data.product_name}</p>
                  )}
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full border ${
                    data.status === "PUBLISHED"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : data.status === "DRAWING"
                      ? "bg-blue-100 text-blue-800 border-blue-200"
                      : data.status === "LOCKED"
                      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                      : data.status === "SCHEDULED"
                      ? "bg-gray-100 text-gray-700 border-gray-200"
                      : "bg-red-100 text-red-800 border-red-200"
                  }`}
                >
                  {data.status}
                </span>
              </div>
            </section>

            {/* Prize tiers summary */}
            <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900">ชั้นรางวัล</h2>
              <ul className="mt-3 space-y-2">
                {data.prize_tiers.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      {tierIcon(t.name)}
                      <span className="text-sm font-medium text-gray-800">{t.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-500">{thMoney(t.prize_amount)}</p>
                      <p className="text-[11px] text-gray-500">จำนวน {t.winners_count} รางวัล</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Results grouped by tier */}
            <section className="mt-5">
              <h2 className="mb-3 text-sm font-semibold text-white">หมายเลขที่ถูกรางวัล</h2>

              {[...grouped.keys()].length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-10 text-center text-sm text-gray-600">
                  ยังไม่มีผลรางวัลสำหรับงวดนี้
                </div>
              ) : (
                [...grouped.entries()].map(([tier, items]) => (
                  <div key={tier} className="mb-4 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {tierIcon(tier)}
                        <p className="text-sm font-semibold text-gray-900">{tier}</p>
                      </div>
                      <span className="text-[11px] text-gray-500">
                        ทั้งหมด {items.length} หมายเลข
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {items.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-center rounded-lg border border-gray-100 bg-gray-50 px-2 py-2"
                        >
                          <span className="font-mono text-sm font-semibold text-gray-800">
                            {r.ticket_number}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </section>

            {/* Back */}
            <div className="mt-6">
              <Link
                href="/history"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                ย้อนกลับไปหน้าประวัติ
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}