// index.js
const { SNSClient, SubscribeCommand } = require("@aws-sdk/client-sns");

const REGION = "us-east-1";
const TOPIC_ARN =
  process.env.SNS_PRIZE_TOPIC_ARN

const sns = new SNSClient({ region: REGION });

exports.handler = async (event) => {
  console.log("EVENT:", JSON.stringify(event));

  try {
    // HTTP API (payload v2) จะส่ง body เป็น string มา
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body || {};

    const email = body.email;
    console.log("EMAIL from body:", email);

    if (!email) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "email is required" }),
      };
    }

    const cmd = new SubscribeCommand({
      TopicArn: TOPIC_ARN,
      Protocol: "email",
      Endpoint: email,
      ReturnSubscriptionArn: false,
    });

    const res = await sns.send(cmd);
    console.log("SNS subscribe response:", res);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message:
          "Subscription requested. Please check your email to confirm.",
      }),
    };
  } catch (err) {
    console.error("Lambda requireSNS error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};