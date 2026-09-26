import { NextResponse } from "next/server";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL;

export async function GET() {
  const timestamp = new Date().toISOString();

  let upstreamStatus = "unreachable";
  let upstreamDetails: Record<string, unknown> | null = null;

  if (!ML_SERVICE_URL) {
    return NextResponse.json({
      status: "degraded",
      timestamp,
      service: "BeatAhead ML Gateway",
      upstream_service: {
        status: "not_configured",
        configured_url: false,
        details: null,
      },
    }, { status: 503 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const headers: Record<string, string> = { Accept: "application/json" };
    if (process.env.ML_SERVICE_AUTH_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.ML_SERVICE_AUTH_TOKEN}`;
    }

    const res = await fetch(`${ML_SERVICE_URL}/health`, {
      method: "GET",
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      upstreamStatus = "connected";
      const data = await res.json();
      upstreamDetails = {
        model_loaded: data.model_loaded ?? true,
        feature_count: data.feature_count ?? 26,
      };
    }
  } catch {
    upstreamStatus = "unreachable";
  }

  return NextResponse.json({
    status: upstreamStatus === "connected" ? "healthy" : "degraded",
    timestamp,
    service: "BeatAhead ML Gateway",
    model_version: "1.0.0-phase5-frozen",
    schema_version: "1.0.0",
    decision_threshold: 0.156742,
    selection_metric: "f1_score",
    upstream_service: {
      status: upstreamStatus,
      configured_url: Boolean(process.env.ML_SERVICE_URL),
      details: upstreamDetails,
    },
  });
}
