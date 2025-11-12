// index.js
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const REGION = process.env.AWS_REGION || "us-east-1";
const TOPIC_ARN =
  process.env.SNS_PRIZE_TOPIC_ARN

const sns = new SNSClient({ region: REGION });

exports.handler = async (event) => {
  console.log("EVENT:", JSON.stringify(event));

  try {
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body || {};

    const { drawId, drawCode, productName, winners } = body;

    // สร้างข้อความให้อ่านง่ายหน่อย
    const subject = `แจ้งผลออกรางวัล eLottery งวด ${drawCode || drawId}`;

    const winnersText = (winners || [])
      .map((w, i) => {
        const tier = w.tier_name || `รางวัลที่ ${i + 1}`;
        return `- ${tier}: เลขที่ออก ${w.ticket_number} (รางวัล ${w.prize_amount} บาท)`;
      })
      .join("\n");

    const message = [
      `ระบบ eLottery ได้ทำการออกรางวัลเรียบร้อยแล้ว`,
      productName ? `ผลิตภัณฑ์: ${productName}` : null,
      drawCode ? `รหัสงวด: ${drawCode}` : `รหัสงวด: ${drawId}`,
      "",
      "หมายเลขที่ถูกรางวัล:",
      winnersText || "- ไม่มีข้อมูลรางวัล",
      "",
      "คุณสามารถเข้าสู่ระบบ eLottery เพื่อตรวจสอบสลากของคุณได้ที่หน้า “ประวัติการออกรางวัล”",
      "",
      "ขอบคุณที่ใช้บริการ eLottery",
    ]
      .filter(Boolean)
      .join("\n");

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