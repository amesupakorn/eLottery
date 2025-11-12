"use client";

import { useState, useEffect } from "react";
import { Ticket, Settings, History, Search, Eye } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";


export default function TicketPage() {
  const [tab, setTab] = useState<"tickets" | "ledger">("tickets");

  // 3. เพิ่ม State สำหรับเก็บข้อมูลสลาก
  const [tickets, setTickets] = useState<TicketWithDraw[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null)
  
  const params = useParams();
  const userId = params.id as string;;



  // 5. เพิ่ม useEffect เพื่อดึงข้อมูลสลาก
  useEffect(() => {
    // จะดึงข้อมูลก็ต่อเมื่อ "ยืนยันตัวตนแล้ว" (authenticated)
    if (!userId) return;

    async function fetchTickets() {
      try {
        setIsLoading(true);
        // 💡 3. เรียก API โดยส่ง userId ไปใน Path
        // ตรงนี้ต้องตรงกับ Folder structure ของ api คุณ
        const res = await fetch(`/api/lottery/${userId}`);
        

        if (!res.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลสลากได้");
        }

        const data = await res.json();
        setTickets(data);
      } catch (err: any) {
        console.error(err);
        setFetchError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTickets();
  }, [userId]);// ให้ Effect นี้ทำงานใหม่ทุกครั้งที่สถานะ session เปลี่ยน

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">กำลังโหลดข้อมูลสลาก...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-red-500">เกิดข้อผิดพลาด: {fetchError}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-500 to-gray-950 px-4 pb-10 pt-10">
      <div className="mx-auto w-full max-w-md">
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
              {/* 6. อัปเดตจำนวนสลากแบบ Dynamic */}
              สลาก ({ !isLoading ? tickets.length : 0})
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
            {/* 7. เปลี่ยน Logic การแสดงผลตรงนี้ */}
            {tab === "tickets" && (
              <TicketContent
                status={status}
                isLoading={isLoading}
                tickets={tickets}
                error={fetchError}
              />
            )}
            {tab === "ledger" && <EmptyLedger />}
          </div>
        </section>
      </div>
    </main>
  );
}

/* ---------------- Components ---------------- */

type TicketWithDraw = {
  id: number;
  range_start: number;
  range_end: number;
  purchased_at: string;
  Draw: { draw_code: string };
};


function TicketCard({ ticket }: { ticket: TicketWithDraw }) {
  const startNum = ticket.range_start.toString().padStart(6, "0");
  const endNum = ticket.range_end.toString().padStart(6, "0");
  const purchaseDate = new Date(ticket.purchased_at).toLocaleString("th-TH");

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between border-b pb-2">
        <span className="text-sm font-semibold text-gray-500">
          งวดที่ #{ticket.Draw.draw_code}
        </span>
        <span className="text-xs text-gray-400">{purchaseDate}</span>
      </div>
      <div className="pt-3">
        <p className="font-mono text-lg font-bold text-gray-900">
          {startNum} - {endNum}
        </p>
      </div>
    </div>
  );
}

function TicketContent({
  status,
  isLoading,
  tickets,
  error,
}: {
  status: string;
  isLoading: boolean;
  tickets: TicketWithDraw[];
  error: string | null;
}) {
  // สถานะ: กำลังโหลด (ทั้ง session หรือ ข้อมูล)
  if (status === "loading" || isLoading) {
    return (
      <div className="text-center text-white py-10">
        <p>กำลังโหลดข้อมูลสลาก...</p>
      </div>
    );
  }

  // สถานะ: ไม่ได้ล็อกอิน
  if (status === "unauthenticated") {
    return (
      <div className="text-center text-white py-10">
        <p>กรุณาล็อกอินเพื่อดูสลากของคุณ</p>
        <Link href="/api/auth/signin">
           <button className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white">
             ไปหน้าล็อกอิน
           </button>
         </Link>
      </div>
    );
  }

  // สถานะ: เกิด Error ตอนดึงข้อมูล
  if (error) {
    return (
      <div className="text-center text-red-400 py-10">
        <p>เกิดข้อผิดพลาด: {error}</p>
      </div>
    );
  }

  // สถานะ: สำเร็จ แต่ไม่มีสลาก
  if (tickets.length === 0) {
    return <EmptyTickets />;
  }

  // สถานะ: สำเร็จ และมีสลาก
  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}

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