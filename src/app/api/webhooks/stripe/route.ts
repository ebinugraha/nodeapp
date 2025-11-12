import { sendWorkflowExecution } from "@/lib/send-workflow-execution";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);

    const workflowId = url.searchParams.get("workflowId");

    if (!workflowId) {
      return NextResponse.json(
        { success: false, error: "No workflow ID provided" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const stripeData = {
      eventId: body.id,
      eventType: body.type,
      timestamp: body.created,
      livemode: body.livemode,
      raw: body.data?.object,
    };

    // trigger a inggest
    await sendWorkflowExecution({
      workflowId,
      initialData: {
        stripe: stripeData,
      },
    });
  } catch (error) {
    console.error("Error handling Stripe webhook:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failid to process Stripe Event",
      },
      {
        status: 500,
      }
    );
  }
}
