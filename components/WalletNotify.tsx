"use client";

import { Mail, Bell } from "lucide-react";

type Props = {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
};

export default function WalletNotify({ open, onAccept, onDecline }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl animate-fade-in">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-full bg-amber-100 p-2">
            <Bell className="h-5 w-5 text-amber-600" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900">
            สมัครรับแจ้งเตือนเมื่อถูกรางวัลไหม?
          </h2>
        </div>

        <p className="text-xs text-gray-600 mb-3">
          ระบบสามารถส่งอีเมลแจ้งเตือนให้คุณทุกครั้งที่มีการออกรางวัล
          เพื่อไม่ให้พลาดข่าวสารจาก eLottery
        </p>

        <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
          <Mail className="h-4 w-4 text-amber-500" />
          <span>ใช้ E-mail เดียวกับบัญชีที่คุณสมัคร</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onDecline}
            className="flex-1 rounded-xl border border-gray-300 bg-white py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            ไม่เป็นไร
          </button>
          <button
            onClick={onAccept}
            className="flex-1 rounded-xl bg-amber-500 py-2 text-xs font-semibold text-white hover:bg-amber-600"
          >
            สมัครรับแจ้งเตือน
          </button>
        </div>
      </div>
    </div>
  );
}