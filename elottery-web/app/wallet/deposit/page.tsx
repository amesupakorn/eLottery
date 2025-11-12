"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle, QrCode, Wallet } from "lucide-react";
import Link from "next/link";

export default function DepositPage() {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"form" | "qr" | "success">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  // เมื่อกด "ยืนยันจำนวนเงิน" → แสดง QR Code
  const handleShowQR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert("กรุณากรอกจำนวนเงินที่ถูกต้อง");
      return;
    }

    // จำลองการสร้าง QR (ในระบบจริงอาจเรียก API จาก Payment Gateway)
    const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAYMENT:${amount}THB`;
    setQrUrl(qrImage);
    setStep("qr");
  };

  // เมื่อผู้ใช้ชำระเงินแล้ว → บันทึกในฐานข้อมูล
  const handleConfirmPayment = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });

      if (!res.ok) throw new Error("ไม่สามารถฝากเงินได้");
      setStep("success");
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-500 to-gray-950 px-4 pb-10 pt-10 text-white">
      <div className="mx-auto w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/wallet" className="text-white/70 hover:text-white">
            <ArrowLeft size={22} />
          </Link>
          <h1 className="text-2xl font-bold">ฝากเงินเข้ากระเป๋า</h1>
        </div>

        {/* ขั้นตอนที่ 1: กรอกจำนวนเงิน */}
        {step === "form" && (
          <form
            onSubmit={handleShowQR}
            className="bg-white/10 p-6 rounded-2xl backdrop-blur-md"
          >
            <label className="block mb-2 text-sm font-medium">
              จำนวนเงิน (บาท)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg p-3 text-black outline-none text-right"
              step="0.01"
              min="0"
            />

            <button
              type="submit"
              className="mt-5 w-full rounded-xl bg-emerald-400 py-3 font-semibold text-black hover:bg-emerald-300"
            >
              ถัดไป
            </button>
          </form>
        )}

        {/* ขั้นตอนที่ 2: แสดง QR ให้สแกน */}
        {step === "qr" && (
          <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md text-center">
            <h2 className="text-lg font-semibold mb-4">
              สแกน QR เพื่อชำระเงิน {amount} บาท
            </h2>
            <div className="flex justify-center mb-4">
              <img
                src={qrUrl}
                alt="QR Code"
                className="rounded-xl shadow-lg border border-white/20"
              />
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={isLoading}
              className="mt-3 w-full rounded-xl bg-emerald-400 py-3 font-semibold text-black hover:bg-emerald-300 disabled:opacity-60"
            >
              {isLoading ? "กำลังยืนยัน..." : "ยืนยันการชำระเงินแล้ว"}
            </button>

            <button
              onClick={() => setStep("form")}
              className="mt-3 w-full text-sm text-gray-300 underline"
            >
              ย้อนกลับ
            </button>
          </div>
        )}

        {/* ขั้นตอนที่ 3: ฝากสำเร็จ */}
        {step === "success" && (
          <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md text-center">
            <CheckCircle size={48} className="text-emerald-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold mb-2">ฝากเงินสำเร็จ!</h2>
            <p className="text-sm text-gray-300 mb-5">
              ระบบได้เพิ่มยอดเงิน {amount} บาท เข้ากระเป๋าเรียบร้อยแล้ว
            </p>
            <Link
              href="/wallet"
              className="inline-block w-full rounded-xl bg-emerald-400 py-3 font-semibold text-black hover:bg-emerald-300"
            >
              กลับไปหน้ากระเป๋าเงิน
            </Link>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-300">
          <Wallet className="inline-block mr-1" size={16} /> ยอดคงเหลือจะอัปเดตหลังฝากสำเร็จ
        </div>
      </div>
    </main>
  );
}
