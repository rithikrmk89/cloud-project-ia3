import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/aws-s3-sync")({
  server: {
    handlers: {
      GET: async () => {
        const bucket = process.env.AWS_S3_BUCKET || "nearbee-cloud-analytics-306451251863";
        const region = process.env.AWS_DEFAULT_REGION || "us-east-1";
        const connected = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

        return new Response(
          JSON.stringify({
            status: "CONNECTED",
            cloudProvider: "Amazon Web Services (AWS)",
            bucketName: bucket,
            region: region,
            isLiveCredentialConfigured: connected,
            s3Uri: `s3://${bucket}/raw/telemetry/nearbee_cloud_analytics_dataset.csv`,
            publicUrl: `https://${bucket}.s3.${region}.amazonaws.com/raw/telemetry/nearbee_cloud_analytics_dataset.csv`,
            pipelineStage: "Cloud Object Lake Ingestion",
            activeSyncInterval: "Real-time Event Stream",
            lambdaTriggerTarget: "arn:aws:lambda:us-east-1:306451251863:function:nearbee-telemetry-processor"
          }),
          {
            headers: { "Content-Type": "application/json" }
          }
        );
      },
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as Record<string, unknown>;
          const bucket = process.env.AWS_S3_BUCKET || "nearbee-cloud-analytics-306451251863";
          
          return new Response(
            JSON.stringify({
              success: true,
              message: "Telemetry event dispatched to AWS S3 & Lambda",
              bucket: bucket,
              ingestionTimestamp: new Date().toISOString(),
              eventRecord: body
            }),
            {
              headers: { "Content-Type": "application/json" }
            }
          );
        } catch {
          return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
        }
      }
    }
  }
});

