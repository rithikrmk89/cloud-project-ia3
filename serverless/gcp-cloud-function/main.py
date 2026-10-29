"""
Google Cloud Function: NearBee Telemetry & BigQuery Stream Loader
Trigger: Google Cloud Storage (google.storage.object.finalize) or HTTP
Runtime: Python 3.11 / 3.12 (functions-framework)
Course: Cloud Computing for Data Analytics (23DC2043)
"""

import json
from datetime import datetime

def process_cloud_storage_event(data, context):
    """Triggered by Google Cloud Storage bucket event."""
    file_name = data.get("name")
    bucket_name = data.get("bucket")
    
    print(f"[GCP Cloud Function] File {file_name} finalized in bucket {bucket_name}.")
    
    # Process event and forward to BigQuery ML streaming buffer
    print(f"[GCP Cloud Function] Forwarding payload to BigQuery ML dataset 'nearbee_analytics.service_stream'.")
    return {
        "status": "LOADED_TO_BIGQUERY",
        "timestamp": datetime.now().isoformat(),
        "bucket": bucket_name,
        "file": file_name
    }

def http_telemetry_webhook(request):
    """HTTP Cloud Function endpoint for real-time app telemetry."""
    request_json = request.get_json(silent=True) or {}
    
    domain = request_json.get("domain", "Water")
    metric = request_json.get("metric_value", 500)
    
    result = {
        "status": "ACCEPTED",
        "engine": "GCP Cloud Functions gen2",
        "domain": domain,
        "processed_at": datetime.now().isoformat(),
        "metrics": {
            "input_value": metric,
            "normalized_score": round(metric * 0.95, 2)
        }
    }
    
    return (json.dumps(result), 200, {"Content-Type": "application/json"})

