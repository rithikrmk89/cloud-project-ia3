"""
AWS Lambda Function: NearBee Real-Time Telemetry & Booking Processor
Trigger: AWS S3 ObjectCreated (s3:ObjectCreated:*) or API Gateway HTTP POST
Runtime: Python 3.12 / 3.11
Course: Cloud Computing for Data Analytics (23DC2043)
"""

import json
import os
import urllib.parse
from datetime import datetime

def lambda_handler(event, context):
    print("Received event: " + json.dumps(event, indent=2))
    
    # 1. Check if invoked via S3 Event Trigger
    if "Records" in event and event["Records"][0].get("eventSource") == "aws:s3":
        record = event["Records"][0]
        bucket = record["s3"]["bucket"]["name"]
        key = urllib.parse.unquote_plus(record["s3"]["object"]["key"], encoding="utf-8")
        size = record["s3"]["object"].get("size", 0)
        
        print(f"ETL Trigger: Processing S3 ingestion from bucket={bucket}, key={key}, size={size} bytes")
        
        # Serverless data transformation logic
        transformed_payload = {
            "source_bucket": bucket,
            "source_key": key,
            "ingestion_status": "PROCESSED",
            "pipeline_stage": "STAGE_2_TRANSFORMED",
            "processed_at": datetime.now().isoformat(),
            "notification_target": "AWS SNS / BigQuery ML Ingestion Queue"
        }
        
        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "S3 Telemetry ingested and routed to analytics sink successfully",
                "details": transformed_payload
            })
        }

    # 2. Check if invoked via API Gateway (HTTP Request)
    body = event.get("body")
    if body and isinstance(body, str):
        try:
            body = json.loads(body)
        except Exception:
            body = {}
    elif not body:
        body = event

    # Extract domain telemetry parameters
    domain = body.get("domain", "Water")
    service_name = body.get("service_name", "Water Tank Cleaning")
    city = body.get("city", "Coimbatore")
    metric_value = body.get("metric_value", 1000)

    # Serverless domain-specific processing
    metrics_computed = {}
    if domain == "Water":
        metrics_computed = {
            "water_purified_liters": metric_value,
            "tds_reduction_ppm": round(metric_value * 0.18, 1),
            "potable_score": "EXCELLENT"
        }
    elif domain == "Energy":
        metrics_computed = {
            "energy_saved_kwh": metric_value,
            "co2_avoided_kg": round(metric_value * 0.82, 2),
            "efficiency_rating": "5-STAR"
        }
    elif domain == "Health":
        metrics_computed = {
            "sanitization_score_delta": metric_value,
            "pest_protection_guarantee_days": 90
        }
    elif domain == "Food":
        metrics_computed = {
            "hygiene_compliance_pct": min(100, metric_value),
            "fssai_alignment": "COMPLIANT"
        }

    response = {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps({
            "status": "SUCCESS",
            "service": "NearBee Serverless Event Processor",
            "timestamp": datetime.now().isoformat(),
            "domain": domain,
            "service_name": service_name,
            "city": city,
            "computed_analytics": metrics_computed
        })
    }
    
    return response

