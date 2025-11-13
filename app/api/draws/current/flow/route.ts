// app/api/draw/current/flow/route.ts
import { NextRequest, NextResponse } from "next/server";

import { POST as lockPOST } from "../lock/route";
import { POST as runPOST } from "../run/route";
import { POST as publishPOST } from "../publish/route";

export const runtime = "nodejs";

async function unwrap(res: NextResponse) {
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data };
}

export async function POST(req: NextRequest) {
  try {
    // 1) LOCK งวด
    const lockRes = await lockPOST(req);
    const lock = await unwrap(lockRes);

    if (lock.status >= 400) {
      return NextResponse.json(
        { step: "lock", error: lock.data || "Lock failed" },
        { status: lock.status }
      );
    }

    // 2) RUN จับรางวัล
    const runRes = await runPOST(req);
    const run = await unwrap(runRes);

    if (run.status >= 400) {
      return NextResponse.json(
        { step: "run", error: run.data || "Run draw failed" },
        { status: run.status }
      );
    }

    // 3) PUBLISH (เปลี่ยนสถานะ / ส่งแจ้งเตือน ฯลฯ)
    const pubRes = await publishPOST(req);
    const publish = await unwrap(pubRes);

    if (publish.status >= 400) {
      return NextResponse.json(
        { step: "publish", error: publish.data || "Publish failed" },
        { status: publish.status }
      );
    }


    return NextResponse.json({
      message: "Draw flow completed",
      lock: lock.data,
      run: run.data,
      publish: publish.data,
    });
  } catch (err) {
    console.error("draw/current/flow error:", err);
    return NextResponse.json(
      { error: "Internal Server Error in flow" },
      { status: 500 }
    );
  }
}