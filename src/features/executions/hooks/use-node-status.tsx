"use client";

import { type ClientSubscriptionToken, useRealtime } from "inngest/react";
import { useEffect, useMemo, useState } from "react";
import type { NodeStatus } from "@/types/node";

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

export function useNodeStatus({
  channel,
  nodeId,
  refreshToken,
  topic,
}: UseNodeStatusOptions) {
  const [status, setStatus] = useState<NodeStatus>("initial");

  const topics = useMemo(() => [topic], [topic]);

  const { messages, connectionStatus, error } = useRealtime({
    channel,
    topics,
    token: refreshToken,
    enabled: true,
  });

  useEffect(() => {
    console.log(
      `[Status] node=${nodeId} connection=${connectionStatus}${error ? ` error=${error.message}` : ""}`,
    );
  }, [connectionStatus, error, nodeId]);

  useEffect(() => {
    if (!messages.all.length) return;

    const matchingMessages = (messages.all as NodeStatusMessage[])
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
      });

    if (matchingMessages.length > 0) {
      const latestMessage = matchingMessages[0];

      if (latestMessage?.data?.status) {
        setStatus(latestMessage.data.status);
      }
    }
  }, [messages.all, nodeId, channel, topic]);

  return status;
}