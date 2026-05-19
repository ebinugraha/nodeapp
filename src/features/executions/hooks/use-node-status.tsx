"use client";

import { type ClientSubscriptionToken, useRealtime } from "inngest/react";
import { useEffect, useMemo, useState } from "react";
import type { NodeStatus } from "@/components/react-flow/node-status-indicator";

interface UseNodeStatusOptions {
  nodeId: string;
  channel: string;
  topic: string;
  refreshToken: () => Promise<ClientSubscriptionToken>;
}

interface NodeStatusMessage {
  kind: string;
  channel?: string;
  topic?: string;
  data?: { nodeId?: string; status?: NodeStatus };
  createdAt?: Date;
}

const DEBUG = process.env.NODE_ENV !== "production";

export function useNodeStatus({
  channel,
  nodeId,
  refreshToken,
  topic,
}: UseNodeStatusOptions) {
  const [status, setStatus] = useState<NodeStatus>("initial");

  // `topics` must be a stable array reference so useRealtime's effect deps
  // don't tear down the subscription on every render.
  const topics = useMemo(() => [topic], [topic]);

  const { messages, connectionStatus, error } = useRealtime({
    channel,
    topics,
    token: refreshToken,
    enabled: true,
  });

  useEffect(() => {
    if (DEBUG) {
      console.log(
        `[useNodeStatus] node=${nodeId} channel=${channel} topic=${topic} connection=${connectionStatus}${error ? ` error=${error.message}` : ""}`,
      );
    }
  }, [connectionStatus, error, nodeId, channel, topic]);

  useEffect(() => {
    if (!messages.all.length) return;

    if (DEBUG) {
      console.log(
        `[useNodeStatus] node=${nodeId} received ${messages.all.length} message(s):`,
        messages.all,
      );
    }

    const latestMessage = (messages.all as NodeStatusMessage[])
      .filter(
        (msg) =>
          msg.kind === "data" &&
          msg.channel === channel &&
          msg.topic === topic &&
          msg.data?.nodeId === nodeId,
      )
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      })[0];

    if (latestMessage?.kind === "data" && latestMessage.data?.status) {
      if (DEBUG) {
        console.log(
          `[useNodeStatus] node=${nodeId} matched message → status=${latestMessage.data.status}`,
        );
      }
      setStatus(latestMessage.data.status);
    } else if (DEBUG) {
      console.log(
        `[useNodeStatus] node=${nodeId} no matching message (channel=${channel} topic=${topic})`,
      );
    }
  }, [messages.all, nodeId, channel, topic]);

  return status;
}
