"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Cpu, Radio, Send, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type HealthResponse = {
  status: "healthy" | "degraded";
  upstream_service?: { status?: string; configured_url?: boolean };
};

type InferenceResponse = {
  probability: number;
  prediction: number;
  threshold: number;
  horizon_seconds: number;
  metadata: {
    model_version: string;
    schema_version: string;
    artifact_id: string;
  };
};

export function VerifiedModelInferencePanel({ title = "Trained model inference" }: { title?: string }) {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [payload, setPayload] = useState("");
  const [result, setResult] = useState<InferenceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    fetch("/api/ml/health", { cache: "no-store" })
      .then(async (response) => setHealth(await response.json()))
      .catch(() => setHealth({ status: "degraded" }));
  }, []);

  async function runInference(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    let parsedPayload: unknown;
    try {
      parsedPayload = JSON.parse(payload);
    } catch {
      setError("Enter valid JSON containing the verified Matrix A feature vector.");
      return;
    }

    setIsRunning(true);
    try {
      const response = await fetch("/api/ml/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedPayload),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "The trained-model service could not process this feature vector.");
        return;
      }
      setResult(data as InferenceResponse);
      setHealth({ status: "healthy", upstream_service: { status: "connected", configured_url: true } });
    } catch {
      setError("The trained-model service could not be reached.");
    } finally {
      setIsRunning(false);
    }
  }

  const isConnected = health?.status === "healthy" && health.upstream_service?.status === "connected";
  const probability = result ? `${(result.probability * 100).toFixed(2)}%` : "—";

  return (
    <Card className="border-navy-200 shadow-card">
      <CardHeader className="border-b border-navy-100 bg-navy-50/50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base text-navy-900">
              <Cpu className="h-4 w-4" />
              {title}
            </CardTitle>
            <p className="mt-1 text-xs leading-relaxed text-navy-500">
              Runs the frozen BeatAhead Phase 5 XGBoost artifact only. The page does not generate substitute patient measurements or predictions.
            </p>
          </div>
          <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${isConnected ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
            {isConnected ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Radio className="h-3.5 w-3.5" />}
            {isConnected ? "Model service connected" : "Model service not connected"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs leading-relaxed text-blue-900">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Submit a verified 26-feature Matrix A payload from a compatible ECG, PPG, SpO₂, and ST-segment acquisition pipeline. The model requires measured features; it cannot infer them from fitness activity, profile data, or a simulated scenario.
          </p>
        </div>

        <form className="space-y-3" onSubmit={runInference}>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-navy-700">Verified Matrix A feature payload</span>
            <textarea
              value={payload}
              onChange={(event) => setPayload(event.target.value)}
              rows={10}
              spellCheck={false}
              placeholder={'{\n  "features": {\n    "ecg_hr_mean": 72.4,\n    "...": "all 26 measured Matrix A features"\n  }\n}'}
              className="mt-1.5 w-full rounded-lg border border-navy-200 bg-white p-3 font-mono text-xs text-navy-900 outline-none transition focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10"
              aria-label="Verified Matrix A feature payload"
            />
          </label>
          <Button type="submit" disabled={isRunning || payload.trim().length === 0} className="gap-2">
            <Send className="h-4 w-4" />
            {isRunning ? "Running frozen model…" : "Run trained model"}
          </Button>
        </form>

        {error && (
          <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {result ? (
          <div className="space-y-4 rounded-xl border border-navy-200 bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <ResultMetric label="Model probability" value={probability} />
              <ResultMetric label="Decision threshold" value={`${(result.threshold * 100).toFixed(2)}%`} />
              <ResultMetric label="Model state" value={result.prediction === 1 ? "Early-warning threshold reached" : "Below early-warning threshold"} />
            </div>
            <div className="grid gap-2 text-xs text-navy-600 sm:grid-cols-2">
              <p><span className="font-semibold text-navy-800">Artifact:</span> {result.metadata.artifact_id}</p>
              <p><span className="font-semibold text-navy-800">Model version:</span> {result.metadata.model_version}</p>
              <p><span className="font-semibold text-navy-800">Feature schema:</span> {result.metadata.schema_version}</p>
              <p><span className="font-semibold text-navy-800">Prediction horizon:</span> {result.horizon_seconds / 60} minutes</p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-navy-200 bg-navy-50/50 p-5 text-center text-sm text-navy-500">
            No verified telemetry feature vector has been submitted.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-navy-100 bg-navy-50/50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-navy-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-navy-900">{value}</p>
    </div>
  );
}
