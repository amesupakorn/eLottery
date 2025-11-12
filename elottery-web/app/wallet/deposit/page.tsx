"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle, ChevronLeft, Wallet } from "lucide-react";
import Link from "next/link";

export default function DepositPage() {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"form" | "qr" | "success">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  const quickAmounts = [500, 1000, 2000, 5000];

  const handleShowQR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert("กรุณากรอกจำนวนเงินที่ถูกต้อง");
      return;
    }

    const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAYMENT:${amount}THB`;
    setQrUrl(qrImage);
    setStep("qr");
  };

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
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <header className="sticky top-0 z-30 bg-gray-500/20 backdrop-blu">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center gap-2">
           <Link href="/tickets" className="rounded-full p-2 -ml-2 hover:bg-gray-100 text-white hover:text-black">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-semibold text-white">ฝากเงินเข้ากระเป๋า</h1>
        </div>
      </header>
        {/* Step 1: Form */}
        <div className="mx-auto w-full max-w-md mt-12">
        {step === "form" && (
          <form
            onSubmit={handleShowQR}
            className="bg-white/10 p-6 rounded-2xl backdrop-blur-md shadow-xl"
          >
            <label className="block mb-2 text-sm font-medium text-white/80">
              จำนวนเงิน (บาท)
            </label>

            {/* input */}
            <div className="relative mb-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full rounded-xl p-4 pr-12 text-right bg-white text-gray-900 text-lg font-semibold shadow-inner focus:ring-2 focus:ring-emerald-400 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                THB
              </span>
            </div>

            {/* quick select */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(String(amt))}
                  className={`py-2 rounded-xl font-semibold border transition ${
                    amount === String(amt)
                      ? "bg-emerald-400/50 text-emerald-50 border-emerald-300"
                      : "bg-white border-white/20 text-gray-900 hover:bg-white/20"
                  }`}
                >
                  {amt.toLocaleString()}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-400 py-3 font-semibold text-black hover:bg-emerald-300 transition"
            >
              ถัดไป
            </button>
          </form>
        )}

        {/* Step 2: QR */}
        {step === "qr" && (
          <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md text-center shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              สแกน QR เพื่อชำระเงิน {Number(amount).toLocaleString()} บาท
            </h2>

            <div className="flex justify-center mb-4">
              <img
                src={qrUrl}
                alt="QR Code"
                className="rounded-xl shadow-lg border border-white/20 w-48 h-48 bg-white p-2"
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

        {/* Step 3: Success */}
        {step === "success" && (
          <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md text-center shadow-xl">
            <CheckCircle size={56} className="text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">ฝากเงินสำเร็จ!</h2>
            <p className="text-sm text-gray-300 mb-5">
              ระบบได้เพิ่มยอดเงิน {Number(amount).toLocaleString()} บาท เข้ากระเป๋าเรียบร้อยแล้ว
            </p>
            <Link
              href="/wallet"
              className="inline-block w-full rounded-xl bg-emerald-400 py-3 font-semibold text-black hover:bg-emerald-300 transition"
            >
              กลับไปหน้ากระเป๋าเงิน
            </Link>
          </div>
        )}

        {/* footer note */}
        <div className="mt-8 text-center text-sm text-gray-300">
          <Wallet className="inline-block mr-1" size={16} />
          ยอดคงเหลือจะอัปเดตหลังฝากสำเร็จ
        </div>
      </div>
    </main>
  );
}