// lib/pdf/receipt.ts
import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import fs from "node:fs";
import path from "node:path";
import "fontkit";

export type ReceiptPayload = {
  receiptId: string;
  drawCode: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  rangeStart: number;
  rangeEnd: number;
  buyerName?: string;
  buyerEmail?: string;
  purchasedAt?: Date;
  verifyUrl?: string;
};

function fontPath(file: string) {
  return path.join(process.cwd(), "public", "font", file);
}

export async function buildPurchaseReceiptPDF(data: ReceiptPayload): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ autoFirstPage: false });

    // Use a normal English font like NotoSans or Roboto
    const regularFont = fs.readFileSync(fontPath("NotoSans-Regular.ttf"));
    const boldFont = fs.readFileSync(fontPath("NotoSans-Regular.ttf"));
    doc.registerFont("app-regular", regularFont);
    doc.registerFont("app-bold", boldFont);

    doc.addPage({
      size: "A4",
      margins: { top: 36, left: 36, right: 36, bottom: 36 },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const total = data.quantity * data.unitPrice;

    // ===== HEADER =====
    doc.font("app-bold").fontSize(18).text("eLottery Purchase Receipt", { align: "center" });
    doc.moveDown();

    doc.font("app-regular").fontSize(10);
    doc.text(`Receipt ID: ${data.receiptId}`);
    doc.text(`Draw Code: ${data.drawCode}`);
    doc.text(`Product: ${data.productName ?? "Digital Lottery Ticket"}`);
    doc.moveDown(0.5);

    // ===== PURCHASE DETAILS =====
    doc.font("app-bold").fontSize(12).text("Purchase Details");
    doc.moveDown(0.3);
    doc.font("app-regular").fontSize(10);
    doc.text(`Quantity: ${data.quantity} unit(s)`);
    doc.text(`Unit Price: $${data.unitPrice.toFixed(2)}`);
    doc.text(`Range: ${data.rangeStart} - ${data.rangeEnd}`);
    doc.moveDown(0.5);

    doc.font("app-bold").fontSize(12)
      .text(`Total: $${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, { align: "right" });

    doc.moveDown(1);

    // ===== BUYER INFO =====
    doc.font("app-bold").fontSize(12).text("Buyer Information");
    doc.font("app-regular").fontSize(10);
    doc.text(`Name: ${data.buyerName ?? "-"}`);
    doc.text(`Email: ${data.buyerEmail ?? "-"}`);
    if (data.purchasedAt) {
      doc.text(`Purchase Date: ${new Date(data.purchasedAt).toLocaleString("en-US")}`);
    }
    doc.moveDown(1);

    // ===== VERIFY LINK =====
    if (data.verifyUrl) {
      doc.font("app-bold").fontSize(12).text("Verification Link");
      doc.font("app-regular").fillColor("blue")
        .text(data.verifyUrl, { link: data.verifyUrl, underline: true });
      doc.fillColor("black");
      doc.moveDown(1);
    }

    // ===== FOOTER =====
    doc.font("app-regular").fontSize(9).fillColor("#555").text(
      "Note: This receipt confirms your digital lottery purchase. Please keep this document for reference. " +
      "All digital receipts are digitally signed and verifiable through the verification link above.",
      { align: "justify" }
    );

    doc.end();
  });
}