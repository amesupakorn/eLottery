import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import dayjs from "dayjs";
import fs from "node:fs";
import path from "node:path";

export type PurchaseReceiptInput = {
  receiptId: string;    // รหัสใบเสร็จ/อ้างอิง
  drawCode: string;     // รหัสงวด
  productName: string;  // เช่น "สลากดิจิทัล 1 ปี"
  quantity: number;     // จำนวนหน่วย
  unitPrice: number;    // ราคา/หน่วย
  rangeStart: number;   // เลขเริ่มต้น
  rangeEnd: number;     // เลขสุดท้าย
  buyerName: string;    // ชื่อผู้ซื้อ
  buyerEmail: string;   // อีเมลผู้ซื้อ
  purchasedAt?: Date;   // เวลาซื้อ
  verifyUrl?: string;   // ลิงก์สำหรับตรวจสอบ (ใช้ทำ QR)
};

export async function buildPurchaseReceiptPDF(
  data: PurchaseReceiptInput
): Promise<Buffer> {
  const {
    receiptId,
    drawCode,
    productName,
    quantity,
    unitPrice,
    rangeStart,
    rangeEnd,
    buyerName,
    buyerEmail,
    purchasedAt = new Date(),
    verifyUrl,
  } = data;

  const total = unitPrice * quantity;

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 36, left: 36, right: 36, bottom: 36 },
    info: {
      Title: `eLottery Receipt ${receiptId}`,
      Author: "eLottery",
    },
  });

  const buffers: Buffer[] = [];
  doc.on("data", (chunk) => buffers.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
  });

  // โหลดฟอนต์ไทย (ต้องมีไฟล์จริง)
  const fontPath = path.join(process.cwd(), "assets", "fonts", "NotoSansThai-Regular.ttf");
  if (fs.existsSync(fontPath)) {
    doc.font(fontPath);
  } else {
    // fallback (ภาษาไทยอาจไม่สวย/ขาดหายถ้าไม่มีฟอนต์)
    doc.font("Helvetica");
  }

  // Header bar
  doc
    .roundedRect(0, 0, doc.page.width, 80, 0)
    .fill("#111827");
  doc.fill("#F59E0B").fontSize(20).text("eLottery", 36, 28);
  doc.fill("#FFFFFF").fontSize(12).text("Transaction Receipt", 36, 54);

  // การ์ด Success
  const cardY = 100;
  doc
    .roundedRect(36, cardY, doc.page.width - 72, 90, 12)
    .fill("#ECFDF5");
  doc
    .fill("#065F46")
    .fontSize(16)
    .text("การสั่งซื้อสำเร็จ", 54, cardY + 18);
  doc
    .fill("#065F46")
    .fontSize(12)
    .text("ระบบได้บันทึกคำสั่งซื้อสลากดิจิทัลของคุณเรียบร้อยแล้ว", 54, cardY + 44);

  // กล่องรายละเอียด
  const boxTop = cardY + 110;
  doc
    .roundedRect(36, boxTop, doc.page.width - 72, 300, 12)
    .fill("#FFFFFF")
    .stroke("#E5E7EB");

  const leftX = 54;
  const rightX = doc.page.width / 2 + 10;
  const lineH = 22;
  let y = boxTop + 20;

  doc.fill("#111827").fontSize(12).text("รายละเอียดคำสั่งซื้อ", leftX, y);
  y += 28;

  // ซ้าย
  doc.fill("#6B7280").text("เลขที่ใบเสร็จ", leftX, y);           doc.fill("#111827").text(receiptId, leftX + 130, y); y += lineH;
  doc.fill("#6B7280").text("ผู้ซื้อ", leftX, y);                   doc.fill("#111827").text(buyerName, leftX + 130, y); y += lineH;
  doc.fill("#6B7280").text("อีเมล", leftX, y);                    doc.fill("#111827").text(buyerEmail, leftX + 130, y); y += lineH;
  doc.fill("#6B7280").text("วันเวลาซื้อ", leftX, y);             doc.fill("#111827").text(dayjs(purchasedAt).format("DD/MM/YYYY HH:mm"), leftX + 130, y); y += lineH;

  // ขวา
  y = boxTop + 48;
  doc.fill("#6B7280").text("ผลิตภัณฑ์", rightX, y);              doc.fill("#111827").text(productName, rightX + 110, y); y += lineH;
  doc.fill("#6B7280").text("งวด", rightX, y);                    doc.fill("#111827").text(drawCode, rightX + 110, y); y += lineH;
  doc.fill("#6B7280").text("จำนวน", rightX, y);                  doc.fill("#111827").text(`${quantity} หน่วย`, rightX + 110, y); y += lineH;
  doc.fill("#6B7280").text("ราคา/หน่วย", rightX, y);            doc.fill("#111827").text(`฿ ${unitPrice.toFixed(2)}`, rightX + 110, y); y += lineH;
  doc.fill("#6B7280").text("รวมทั้งสิ้น", rightX, y);            doc.fill("#111827").text(`฿ ${total.toFixed(2)}`, rightX + 110, y); y += lineH;

  // เส้นคั่น
  doc
    .moveTo(54, boxTop + 180)
    .lineTo(doc.page.width - 54, boxTop + 180)
    .stroke("#E5E7EB");

  // แสดงช่วงเลขสลาก
  doc.fill("#111827").fontSize(12).text("ช่วงเลขสลากที่ได้รับ", 54, boxTop + 195);
  doc.fill("#4B5563").fontSize(12).text(`${rangeStart.toString().padStart(6, "0")} - ${rangeEnd.toString().padStart(6, "0")}`, 54, boxTop + 220);

  // QR Code (ถ้ามี verifyUrl)
  if (verifyUrl) {
    const qrPng = await QRCode.toBuffer(verifyUrl, { width: 180, margin: 1 });
    doc.image(qrPng, doc.page.width - 54 - 140, boxTop + 190, { width: 140 });
    doc.fill("#6B7280").fontSize(10).text("สแกนเพื่อตรวจสอบคำสั่งซื้อ", doc.page.width - 54 - 140, boxTop + 335, { width: 140, align: "center" });
  }

  // Footer
  doc.fill("#9CA3AF").fontSize(10).text("ขอบคุณที่ใช้บริการ eLottery", 36, doc.page.height - 48);

  doc.end();
  return done;
}