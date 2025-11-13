// index.js
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const REGION = process.env.AWS_REGION || "us-east-1";
const TOPIC_ARN = process.env.TOPIC_ARN;

const sns = new SNSClient({ region: REGION });

exports.handler = async (event) => {
  console.log("RAW EVENT:", JSON.stringify(event, null, 2));

  try {

    let body;
    if (event.body) {
      try {
        body =
          typeof event.body === "string"
            ? JSON.parse(event.body)
            : event.body;
      } catch (e) {
        console.error("JSON parse error:", e);
        body = {};
      }
    } else {
        body = event || {};
    }

    console.log("PARSED BODY:", JSON.stringify(body, null, 2));

    const drawId = body.drawId ?? body.draw_id ?? null;
    const drawCode = body.drawCode ?? body.draw_code ?? null;
    const productName = body.productName ?? null;

    const winners = Array.isArray(body.winners) ? body.winners : [];
    console.log("WINNERS:", JSON.stringify(winners, null, 2));

    // 🔹 สร้าง subject (กัน undefined ด้วย ||)
    const subject = `แจ้งผลออกรางวัล eLottery งวด ${drawCode || drawId || "-"}`;

    // 🔹 สร้างข้อความของแต่ละรางวัล กัน undefined ทุกช่อง
    const winnersText =
      winners.length === 0
        ? "- ไม่มีข้อมูลรางวัล"
        : winners
            .map((w, i) => {
              const tier =
                w.tier_name ||
                w.tier ||
                `รางวัลที่ ${i + 1}`;

              const ticket =
                w.ticket_number != null
                  ? String(w.ticket_number)
                  : "-";

              const prize =
                w.prize_amount != null
                  ? Number(w.prize_amount).toLocaleString("th-TH")
                  : "0";

              return `- ${tier}: เลขที่ออก ${ticket} (รางวัล ${prize} บาท)`;
            })
            .join("\n");

    const messageLines = [
      "ระบบ eLottery ได้ทำการออกรางวัลเรียบร้อยแล้ว",
      productName ? `ผลิตภัณฑ์: ${productName}` : null,
      drawCode || drawId
        ? `รหัสงวด: ${drawCode || drawId}`
        : null,
      "",
      "หมายเลขที่ถูกรางวัล:",
      winnersText,
      "",
      "คุณสามารถเข้าสู่ระบบ eLottery เพื่อตรวจสอบสลากของคุณได้ที่หน้า “ประวัติการออกรางวัล”",
      "",
      "ขอบคุณที่ใช้บริการ eLottery",
    ];

    const message = messageLines.filter(Boolean).join("\n");

    console.log("SNS SUBJECT:", subject);
    console.log("SNS MESSAGE:\n" + message);

    const cmd = new PublishCommand({
      TopicArn: TOPIC_ARN,
      Subject: subject,
      Message: message,
    });

    const res = await sns.send(cmd);
    console.log("SNS publish response:", res);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "SNS prize notification sent" }),
    };
  } catch (err) {
    console.error("Lambda prize notify error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};