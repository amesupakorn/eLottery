"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, CalendarDays, Trophy, ChevronRight } from "lucide-react";
import { Draw, statusColors } from "@/types/draw";

export default function DrawHistoryPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/draws");
        const data = await res.json();
        setDraws(data.draws || []);
      } catch (err) {
        console.error("Failed to load draws:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">

      {/* Header */}
      <header className="sticky top-0 z-20 bg-gray-500/20 text-white shadow p-5 text-center">
        <h1 className="text-lg font-bold flex items-center justify-center gap-2">
          <Trophy className="h-5 w-5" /> ประวัติการออกรางวัล
        </h1>
      </header>

      {/* Content */}
      <div className="max-w-md mx-auto p-5">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          </div>
        ) : draws.length === 0 ? (
          <p className="text-center text-gray-500 py-10">ยังไม่มีประวัติการออกรางวัล</p>
        ) : (
          <ul className="space-y-4">
            {draws.map((draw) => (
              <li
                key={draw.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden"
              >
                <Link href={`/history/draws/${draw.id}`} className="flex justify-between items-center p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">
                      งวดที่: {draw.draw_code}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <CalendarDays className="h-4 w-4 text-gray-400" />
                      {new Date(draw.created_at).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      จำนวนรางวัลทั้งหมด:{" "}
                      <span className="font-medium text-gray-800">
                        {draw.total_results || 0}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col items-end">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full border ${
                        statusColors[draw.status] || "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {draw.status}
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400 mt-2" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}