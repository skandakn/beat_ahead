"use client";

import { Cpu, Radio } from "lucide-react";
import { Paywall } from "@/components/ui/Paywall";
import { useSubscription } from "@/lib/subscription/SubscriptionContext";
import { VerifiedModelInferencePanel } from "@/components/ml/VerifiedModelInferencePanel";

export default function ClinicianPage() {
  const { canAccessFeature } = useSubscription();
  const hasAccess = canAccessFeature("ADVANCED_ANALYTICS");

  const content = (
    <div className="mx-auto max-w-7xl space-y-6 p-4 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Clinician Dashboard</h1>
        <p className="mt-0.5 text-sm text-navy-500">Verified model inference for compatible telemetry inputs</p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-900 sm:flex-row sm:items-center sm:justify-between">
        <p>Clinical decision support research prototype. Results require a measured Matrix A feature vector and are not a diagnostic system.</p>
        <span className="flex shrink-0 items-center gap-2 font-mono text-[11px]">
          <Cpu className="h-3.5 w-3.5" />
          BeatAhead Phase 5 XGBoost (τ = 0.156742)
        </span>
      </div>

      <VerifiedModelInferencePanel title="Clinical telemetry inference" />

      <div className="flex items-start gap-3 rounded-xl border border-dashed border-navy-200 bg-navy-50/50 p-5">
        <Radio className="mt-0.5 h-5 w-5 shrink-0 text-navy-500" />
        <div>
          <h2 className="font-semibold text-navy-900">No simulated patient cohort</h2>
          <p className="mt-1 text-sm leading-relaxed text-navy-600">
            Patient rows, scores, trends, and timestamps remain empty until a compatible telemetry integration supplies verified source measurements.
          </p>
        </div>
      </div>
    </div>
  );

  if (!hasAccess) {
    return (
      <div className="mx-auto max-w-7xl p-4 lg:p-8">
        <Paywall featureName="Clinician Dashboard & Model Inference">{content}</Paywall>
      </div>
    );
  }

  return content;
}
