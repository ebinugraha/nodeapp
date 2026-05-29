import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";
import { ExecutionStatus } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: executionId } = await params;

    const execution = await prisma.execution.findUnique({
      where: { id: executionId },
    });

    if (!execution) {
      return NextResponse.json(
        { error: "Execution not found" },
        { status: 404 }
      );
    }

    if (execution.status !== ExecutionStatus.RUNNING) {
      return NextResponse.json(
        { error: "Execution is not running" },
        { status: 400 }
      );
    }

    // Send cancellation event to Inngest
    await inngest.send({
      name: "workflows/cancel.execution",
      data: { executionId },
    });

    // Update DB status
    await prisma.execution.update({
      where: { id: executionId },
      data: {
        status: ExecutionStatus.FAILED,
        error: "Execution stopped by user",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[EXECUTION_STOP]", error);
    return NextResponse.json(
      { error: "Failed to stop execution" },
      { status: 500 }
    );
  }
}
