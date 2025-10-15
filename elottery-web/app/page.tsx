"use client";
import { CreditCard, Send, Wallet, Star, PlusCircle } from "lucide-react";

export default function DashboardPage() {
  const userName = "Supakorn";

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-500 to-gray-950">

      {/*Header */}
      <header className="relative overflow-hidden">
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 h-40 w-[120%] rounded-[48px] bg-amber-500/20" />

      <div className="relative z-10 px-6 pt-6 pb-6">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center gap-4">
            <div className="bg-white/25 backdrop-blur p-3 rounded-full border border-white/30 shadow-sm">
              <Wallet className="h-10 w-10 text-white" />
            </div>

            <div className="text-white">
              <p className="text-lg font-extrabold opacity-90">Welcome 👋</p>
              <p className="text-2xl md:text-3xl font-semibold tracking-tight">
                {userName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>

      {/* Quick actions */}
      <section className="mt-6 px-4">
        <div className="mx-auto w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-sm p-4">
          <h3 className="px-2 pb-2 text-sm font-medium text-gray-600">ทำรายการด่วน</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            <Action icon={<PlusCircle className="h-6 w-6" />} label="ฝากเงิน" />
            <Action icon={<Send className="h-6 w-6" />} label="โอนเงิน" />
            <Action icon={<CreditCard className="h-6 w-6" />} label="สลากดิจิทัล" />
            <Action icon={<Star className="h-6 w-6" />} label="เพิ่มเติม" />
          </div>
        </div>
      </section>

      {/* Notice */}
      <section className="px-4 mt-6">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-amber-500" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-900">แจ้งเตือน</h4>
              <p className="mt-1 text-sm text-amber-800">
                คุณถูกรางวัลสลากจำนวน <span className="font-semibold">40.00 บาท</span> 🎉
              </p>
              <p className="mt-1 text-xs text-amber-700/80">
                ดูประวัติการถูกรางวัลได้ที่เมนู “บัญชีสลาก”
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} eLottery
      </footer>
    </main>
  );
}

function Action({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow transition
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
    >
      <span className="text-amber-600 group-hover:text-amber-700 transition">
        {icon}
      </span>
      <span className="text-[11px] font-medium text-gray-700">{label}</span>
    </button>
  );
}