"use client";

import { type ClientSubscriptionToken, useRealtime } from "inngest/react";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import type { NodeStatus, NodeErrorData } from "@/types/node";

interface UseNodeErrorOptions {
  nodeId: string;
  channel: string;
  topic: string;
  refreshToken: () => Promise<ClientSubscriptionToken>;
}

interface NodeStatusMessage {
  kind: string;
  channel?: string;
  topic?: string;
  data?: {
    nodeId?: string;
    status?: NodeStatus;
    error?: {
      message: string;
      code?: string;
      field?: string;
    };
  };
  createdAt?: Date;
}

export interface NodeErrorState {
  error: NodeErrorData | null;
  status: NodeStatus;
  clearError: () => void;
  hasError: boolean;
}

export function useNodeError({
  channel,
  nodeId,
  refreshToken,
  topic,
}: UseNodeErrorOptions): NodeErrorState {
  const [errorData, setErrorData] = useState<NodeErrorData | null>(null);
  const [status, setStatus] = useState<NodeStatus>("initial");

  const latestMessageRef = useRef<NodeStatusMessage | null>(null);

  const topics = useMemo(() => [topic], [topic]);

  const enabled = !!channel && !!topic;

  const { messages, connectionStatus, error: connectionError } = useRealtime({
    channel,
    topics,
    token: refreshToken,
    enabled,
  });

  useEffect(() => {
    if (!messages.all.length) return;

    const latestMsg = messages.all[messages.all.length - 1] as NodeStatusMessage;

    if (latestMessageRef.current?.createdAt === latestMsg?.createdAt) {
      return;
    }

    if (
      latestMsg?.kind === "data" &&
      latestMsg.channel === channel &&
      latestMsg.topic === topic &&
      latestMsg.data?.nodeId === nodeId
    ) {
      latestMessageRef.current = latestMsg;

      const { status: newStatus, error: newError } = latestMsg.data;

      if (newStatus) {
        setStatus(newStatus);

        if (newStatus === "error" && newError) {
          setErrorData({
            nodeId,
            status: newStatus,
            error: newError,
            timestamp: latestMsg.createdAt?.getTime() || Date.now(),
          });
        } else if (newStatus === "success") {
          setErrorData(null);
        }
      }
    }
  }, [messages.all, nodeId, channel, topic]);

  useEffect(() => {
    return () => {
      latestMessageRef.current = null;
    };
  }, []);

  const clearError = useCallback(() => {
    setErrorData(null);
    setStatus("initial");
    latestMessageRef.current = null;
  }, []);

  return {
    error: errorData,
    status,
    clearError,
    hasError: errorData !== null,
  };
}
