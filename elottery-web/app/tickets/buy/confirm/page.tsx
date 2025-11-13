"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronLeft,
  Wallet,
  Ticket,
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
} from "lucide-react";
import api from "@/lib/axios";
import { useAlert } from "@/context/AlertContext";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

const MIN_AMOUNT = 1000;
const STEP = 1000;
const UNIT_PRICE = 100;
const DRAW_CODE = "624";


function useDebounce(value: any, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
    setDebouncedValue(value);
    }, delay);
    return () => {
    clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function BuyTicketWalletPage() {
  const sp = useSearchParams();
  const drawCode = sp.get("draw"); 
  const [draw, setDraw] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await res.json();
      setUser(data.user); // เก็บใน state / context
    })();
  }, []);

  useEffect(() => {
    if (!drawCode) return;
    (async () => {
      // ถ้าต้องการรายละเอียดงวดจาก backend
      const res = await api.get(`/draws?status=SCHEDULED`);
      const found = (res.data?.draws || []).find((d: any) => d.draw_code === drawCode);
      setDraw(found || null);
    })();
  }, [drawCode]);

  const { setError, setSuccess } = useAlert();
  const [amount, setAmount] = useState(MIN_AMOUNT);
  const [wallet, setWallet] = useState<number>(0);
  const totalUnits = Math.floor(amount / UNIT_PRICE);
  const router = useRouter();
  const [previewRange, setPreviewRange] = useState({
    start: "...",
    end: "...",
  });
  const [isLoadingRange, setIsLoadingRange] = useState(false);
  const debouncedTotalUnits = useDebounce(totalUnits, 300);

  
    useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await api.get("/wallet");
        setWallet(Number(res.data.balance ?? 0));
      } catch (err) {
        console.error("Error fetching wallet:", err);
      }
    };

    fetchWallet();
  }, []);

  const formattedAmount = useMemo(
    () =>
      "฿ " +
      amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [amount]
  );

  const isEnough = amount <= wallet;
  const isValidMin = amount >= MIN_AMOUNT;
  const canContinue = isValidMin && isEnough;

  const onChangeRaw = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = Number((e.target.value || "").replace(/[^\d]/g, ""));
    setAmount(n);
  };

  const dec = () => setAmount((v) => Math.max(MIN_AMOUNT, v - STEP));
  const inc = () => setAmount((v) => v + STEP);

  useEffect(() => {
       if (debouncedTotalUnits > 0) {
          setIsLoadingRange(true);
      
          async function fetchPreviewRange() {
            try {
               const res = await fetch(
                 `/api/lottery/preview?drawCode=${DRAW_CODE}&quantity=${debouncedTotalUnits}`
               );
               if (!res.ok) throw new Error("Failed to fetch preview");

               const data = await res.json(); // { rangeStart, rangeEnd }

               setPreviewRange({
                 start: data.rangeStart.toString().padStart(6, "0"),
                 end: data.rangeEnd.toString().padStart(6, "0"),
               });
            } catch (error) {
               console.error(error);
               setPreviewRange({ start: "Error", end: "Error" });
            } finally {
               setIsLoadingRange(false);
            }
          }

          fetchPreviewRange();
       } else {
          setPreviewRange({ start: "...", end: "..." });
       }
     }, [debouncedTotalUnits]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canContinue) return;

    try {
      const quantity = Math.floor(amount / UNIT_PRICE);
      const payload = {
        drawCode: drawCode,
        quantity: quantity,
      };

      console.log("--- CLIENT SENDING PAYLOAD ---", payload);

      const res = await fetch("/api/lottery/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const purchase = await res.json();

      if (!res.ok) {
        setError(`เกิดข้อผิดพลาด: ${purchase.message || "ไม่สามารถทำรายการได้"}`);
        return;
      }

      console.log("--- PURCHASE SUCCESS ---", purchase);
      
      // 🔹 STEP 2: สร้างใบเสร็จ (PDF) จากข้อมูลการซื้อจริง
      const quantityInt = Math.floor(amount / UNIT_PRICE);
      
      const payloads = {
        receiptId: `RCPT-${purchase.id}`,
        purchaseId: purchase.id,
        userId: user.id,
        drawId: purchase.draw_id,
        drawCode,
        productName: "Digital Lottery Ticket",
        quantity: quantityInt,
        unitPrice: UNIT_PRICE,
        rangeStart: purchase.range_start,
        rangeEnd: purchase.range_end,
        buyerName: user.full_name ?? user.name,
        buyerEmail: user.email,
      };
      
      const pdfRes = await fetch("/api/receipts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloads),
      });
      
      const pdfJson = await pdfRes.json();
      
      
      if (pdfRes.ok && pdfJson.receiptId) {
        setSuccess(
        ` ซื้อสลากสำเร็จ\nยอดเงิน: ${formattedAmount}\nจำนวนหน่วย: ${quantity}\nช่วงหมายเลข: ${purchase.range_start} - ${purchase.range_end}\n\nรหัสคำสั่งซื้อ #${purchase.id}`
        );
        const receiptId = pdfJson.receiptId;
        router.push(`/tickets?receipt=${encodeURIComponent(receiptId)}`);
      }
      
      // 🔹 STEP 3: แสดงข้อความสำเร็จ

      // ✅ กลับไปหน้ารายการสลาก
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-500/20 backdrop-blur">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center gap-2">
          <Link href="/tickets" className="rounded-full p-2 -ml-2 hover:bg-gray-100 text-white hover:text-black">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          
          <h1 className="text-base font-semibold text-white">ซื้อสลากดิจิทัล {drawCode}</h1>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-md px-4 py-5 space-y-5"
      >
        {/* FROM → TO Flow */}
        <section className="relative flex flex-col items-center text-center">
          <div className="flex items-center justify-between w-full max-w-sm">
            {/* จาก Wallet */}
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-emerald-100 p-3">
                <Wallet className="h-6 w-6 text-emerald-700" />
              </div>
              <p className="mt-1 text-xs text-white font-medium">กระเป๋าเงินของฉัน</p>
            </div>

            {/* ลูกศรตรงกลาง */}
            <ArrowRight className="h-6 w-6 text-white" />

            {/* ไปยัง สลาก */}
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-amber-100 p-3">
                <Ticket className="h-6 w-6 text-amber-700" />
              </div>
              <p className="mt-1 text-xs text-white font-medium">สลากดิจิทัล</p>
            </div>
          </div>
        </section>

        {/* บัตรข้อมูลกระเป๋า */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">ยอดเงินในกระเป๋า</p>
            <p className="text-sm font-semibold text-emerald-700">฿ {wallet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </section>

        {/* เลือกจำนวนเงิน */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-800">จำนวนเงินที่ต้องการใช้ซื้อ</p>
            <span className="text-[11px] text-gray-500">
              ขั้นต่ำ {MIN_AMOUNT.toLocaleString()} บาท
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="inline-flex items-center rounded-xl border border-gray-200">
              <button type="button" onClick={dec} className="p-2 hover:bg-gray-50">
                <Minus className="h-4 w-4 text-gray-800" />
              </button>
              <input
                inputMode="numeric"
                value={amount}
                onChange={onChangeRaw}
                className="w-28 text-center text-lg font-semibold outline-none text-gray-800"
              />
              <button type="button" onClick={inc} className="p-2 hover:bg-gray-50">
                <Plus className="h-4 w-4 text-gray-800" />
              </button>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">ยอดซื้อ</p>
              <p className="text-lg font-bold text-amber-700">{formattedAmount}</p>
            </div>
          </div>

          {/* ป้าย shortcut ยอดด่วน */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[1000, 2000, 5000, 10000].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(v)}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  amount === v
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {v.toLocaleString()} ฿
              </button>
            ))}
          </div>
        </section>

        {/* คำนวณหน่วยและหมายเลข */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">จำนวนหน่วย</span>
            <span className="font-semibold text-gray-900">{totalUnits.toLocaleString()} หน่วย</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">ช่วงหมายเลข</span>
            <span className="font-mono font-semibold text-gray-900">
              {isLoadingRange 
              ? "กำลังโหลด..." 
              : `${previewRange.start} - ${previewRange.end}`
              }
            </span>
          </div>
          <p className="text-xs text-gray-500">
            * หน่วยละ {UNIT_PRICE.toLocaleString()} บาท
          </p>
        </section>

        {/* ข้อความเตือน */}
        {!isValidMin && (
          <p className="text-xs text-red-600">
            กรุณากรอกจำนวนเงินขั้นต่ำ {MIN_AMOUNT.toLocaleString()} บาท
          </p>
        )}
        {!isEnough && (
          <p className="text-xs text-red-600">ยอดเงินในกระเป๋าไม่เพียงพอ</p>
        )}
        <p className="flex items-center gap-2 text-xs text-gray-500 dark:text-white">
          <ShieldCheck className="h-4 w-4 text-amber-600" />
          ชำระด้วยกระเป๋า eLottery ปลอดภัยและเข้ารหัส
        </p>

        {/* ปุ่ม */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/tickets"
            className="flex-1 rounded-xl border border-gray-300 bg-white py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ย้อนกลับ
          </Link>
          <button
            type="submit"
            disabled={!canContinue}
            className={`flex-1 rounded-xl py-3 text-center text-sm font-semibold text-white transition ${
              canContinue
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-amber-300 cursor-not-allowed"
            }`}
          >
            ดำเนินการต่อ
          </button>
        </div>
      </form>
    </main>
  );
}