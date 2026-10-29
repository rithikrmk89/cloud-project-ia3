"""
NearBee Cloud Data Ingestion Pipeline
Course: Cloud Computing for Data Analytics (23DC2043)
Platform: AWS S3 / Google Cloud Storage (GCP) / Azure Blob Storage
"""

import os
import sys
import json
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("NearBeeCloudIngest")

class NearBeeCloudIngestion:
    def __init__(self, target_provider="aws"):
        self.provider = target_provider.lower()
        self.dataset_path = os.path.join(os.path.dirname(__file__), "..", "data", "nearbee_cloud_analytics_dataset.csv")

    def ingest_to_aws_s3(self, bucket_name="nearbee-cloud-analytics-lake", s3_key=None):
        logger.info(f"Initiating AWS S3 ingestion to bucket: {bucket_name}")
        if not s3_key:
            timestamp = datetime.utcnow().strftime("%Y/%m/%d")
            s3_key = f"raw/telemetry/{timestamp}/nearbee_dataset.csv"
        
        try:
            import boto3
            s3 = boto3.client("s3")
            s3.upload_file(self.dataset_path, bucket_name, s3_key)
            logger.info(f"Successfully uploaded dataset to s3://{bucket_name}/{s3_key}")
            return f"s3://{bucket_name}/{s3_key}"
        except ImportError:
            logger.warning("boto3 not installed. Simulating S3 upload for sandbox environment...")
            logger.info(f"Simulated Ingestion Target: s3://{bucket_name}/{s3_key}")
            return f"s3://{bucket_name}/{s3_key}"
        except Exception as e:
            logger.error(f"S3 ingestion error: {e}")
            return None

    def ingest_to_gcp_storage(self, bucket_name="nearbee-gcp-data-lake", destination_blob=None):
        logger.info(f"Initiating Google Cloud Storage (GCP) ingestion to bucket: {bucket_name}")
        if not destination_blob:
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            destination_blob = f"iot_streams/{timestamp}/dataset.csv"

        try:
            from google.cloud import storage
            client = storage.Client()
            bucket = client.bucket(bucket_name)
            blob = bucket.blob(destination_blob)
            blob.upload_from_filename(self.dataset_path)
            logger.info(f"Successfully uploaded dataset to gs://{bucket_name}/{destination_blob}")
            return f"gs://{bucket_name}/{destination_blob}"
        except ImportError:
            logger.warning("google-cloud-storage not installed. Simulating GCP upload for sandbox...")
            logger.info(f"Simulated Ingestion Target: gs://{bucket_name}/{destination_blob}")
            return f"gs://{bucket_name}/{destination_blob}"
        except Exception as e:
            logger.error(f"GCP ingestion error: {e}")
            return None

    def ingest_to_azure_blob(self, container_name="nearbee-telemetry-container", blob_name=None):
        logger.info(f"Initiating Azure Blob Storage ingestion to container: {container_name}")
        if not blob_name:
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            blob_name = f"telemetry_{timestamp}.csv"

        try:
            from azure.storage.blob import BlobServiceClient
            conn_str = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
            if not conn_str:
                raise ValueError("AZURE_STORAGE_CONNECTION_STRING environment variable not set")
            client = BlobServiceClient.from_connection_string(conn_str)
            blob_client = client.get_blob_client(container=container_name, blob=blob_name)
            with open(self.dataset_path, "rb") as data:
                blob_client.upload_blob(data)
            logger.info(f"Successfully uploaded dataset to Azure Blob: {container_name}/{blob_name}")
            return f"https://nearbeeblob.blob.core.windows.net/{container_name}/{blob_name}"
        except (ImportError, Exception) as e:
            logger.warning(f"Azure client unavailable or unconfigured ({e}). Simulating Azure Blob upload...")
            mock_url = f"https://nearbeeblob.blob.core.windows.net/{container_name}/{blob_name}"
            logger.info(f"Simulated Ingestion Target: {mock_url}")
            return mock_url

    def run_all(self):
        print("="*60)
        print("NearBee Multi-Cloud Ingestion Pipeline (AWS / GCP / Azure)")
        print("="*60)
        aws_url = self.ingest_to_aws_s3()
        gcp_url = self.ingest_to_gcp_storage()
        azure_url = self.ingest_to_azure_blob()
        print("\nIngestion Summary:")
        print(f" -> AWS S3 Target:        {aws_url}")
        print(f" -> GCP Storage Target:   {gcp_url}")
        print(f" -> Azure Blob Target:    {azure_url}")
        print("="*60)

if __name__ == "__main__":
    provider = sys.argv[1] if len(sys.argv) > 1 else "all"
    ingestion = NearBeeCloudIngestion(provider)
    if provider == "aws":
        ingestion.ingest_to_aws_s3()
    elif provider == "gcp":
        ingestion.ingest_to_gcp_storage()
    elif provider == "azure":
        ingestion.ingest_to_azure_blob()
    else:
        ingestion.run_all()

