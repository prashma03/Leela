"use client";

import { useEffect } from "react";

function reportClientError(payload: Record<string, unknown>) {
  const body = JSON.stringify({
    ...payload,
    path: window.location.pathname,
    userAgent: navigator.userAgent.slice(0, 160),
    timestamp: new Date().toISOString(),
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/client-error", new Blob([body], { type: "application/json" }));
    return;
  }

  fetch("/api/client-error", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

export default function ClientErrorReporter() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      reportClientError({
        type: "error",
        message: event.message.slice(0, 500),
        source: event.filename?.slice(0, 180),
        line: event.lineno,
        column: event.colno,
        stack: event.error instanceof Error ? event.error.stack?.slice(0, 1200) : undefined,
      });
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      reportClientError({
        type: "unhandledrejection",
        message: reason instanceof Error ? reason.message.slice(0, 500) : String(reason).slice(0, 500),
        stack: reason instanceof Error ? reason.stack?.slice(0, 1200) : undefined,
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
