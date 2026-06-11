"use client";

import { useCallback, useState } from "react";
import { Zap, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { triggerIngestion } from "@/lib/actions/admin";

export function PipelineTrigger() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleTrigger = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const result = await triggerIngestion();
      setMessage({
        text: result.message,
        type: result.ok ? "success" : "error",
      });
    } catch (err) {
      setMessage({
        text: (err as Error).message || "Failed to trigger pipeline",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Button
          onClick={handleTrigger}
          disabled={loading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Zap className="size-4" />
          )}
          {loading ? "Running pipeline..." : "Trigger Match Analysis"}
        </Button>
      </div>
      {message && (
        <div
          className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
            message.type === "success"
              ? "border border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400"
              : "border border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="mt-0.5 size-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 size-4 flex-shrink-0" />
          )}
          <span className="flex-1">{message.text}</span>
        </div>
      )}
    </div>
  );
}
