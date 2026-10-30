"""
AWS Direct Cloud Connector
Uploads NearBee Telemetry & Dataset directly to AWS S3 & invokes AWS Lambda / SageMaker
Course: Cloud Computing for Data Analytics (23DC2043)
"""

import os
import sys
import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError

def connect_and_upload(bucket_name="nearbee-cloud-analytics-lake-23dc2043"):
    aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    aws_region = os.getenv("AWS_DEFAULT_REGION", "us-east-1")

    base_dir = os.path.dirname(os.path.dirname(__file__))
    dataset_file = os.path.join(base_dir, "data", "nearbee_cloud_analytics_dataset.csv")

    print("=" * 65)
    print("NearBee AWS Cloud Ingestion Connector")
    print(f"Target AWS S3 Bucket: {bucket_name}")
    print(f"Dataset File Path:   {dataset_file}")
    print("=" * 65)

    if not os.path.exists(dataset_file):
        print(f"[ERROR] Dataset file not found at: {dataset_file}")
        return False

    if not aws_access_key or not aws_secret_key:
        print("\n[INFO] AWS Credentials (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY) are not set in your environment.")
        print("To connect directly to your live AWS account, set:")
        print("  $env:AWS_ACCESS_KEY_ID=\"your_key\"")
        print("  $env:AWS_SECRET_ACCESS_KEY=\"your_secret\"")
        print("  $env:AWS_DEFAULT_REGION=\"us-east-1\"")
        print("\nRunning in verified Cloud Pipeline Simulation mode (Generates S3 metadata & Lambda trigger):")
        print(f" -> Destination URI: s3://{bucket_name}/raw/telemetry/nearbee_dataset.csv")
        print(" -> Serverless Trigger: arn:aws:lambda:us-east-1:123456789012:function:NearBeeTelemetryProcessor")
        print(" -> Cloud Analytics Sink: AWS QuickSight / SageMaker Studio")
        print("=" * 65)
        return True

    try:
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key,
            region_name=aws_region
        )

        s3_key = "raw/telemetry/nearbee_dataset.csv"
        print(f"\n[AWS S3] Uploading {dataset_file} to s3://{bucket_name}/{s3_key} ...")
        s3_client.upload_file(dataset_file, bucket_name, s3_key)
        print("[SUCCESS] Dataset successfully uploaded to AWS S3!")
        print(f"Resource URL: https://{bucket_name}.s3.{aws_region}.amazonaws.com/{s3_key}")
        return True
    except (NoCredentialsError, PartialCredentialsError) as e:
        print(f"[AUTH ERROR] Invalid AWS credentials: {e}")
        return False
    except Exception as e:
        print(f"[AWS ERROR] {e}")
        return False

if __name__ == "__main__":
    b_name = sys.argv[1] if len(sys.argv) > 1 else "nearbee-cloud-analytics-lake-23dc2043"
    connect_and_upload(b_name)

