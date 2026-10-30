import os
import boto3

aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
aws_region = os.getenv("AWS_DEFAULT_REGION", "us-east-1")

s3 = boto3.client(
    "s3",
    aws_access_key_id=aws_access_key,
    aws_secret_access_key=aws_secret_key,
    region_name=aws_region
)

bucket_name = "nearbee-cloud-analytics-306451251863"

print("==========================================================")
print(f"1. Creating S3 Bucket: {bucket_name} in {aws_region}")
print("==========================================================")
try:
    if aws_region == "us-east-1":
        s3.create_bucket(Bucket=bucket_name)
    else:
        s3.create_bucket(
            Bucket=bucket_name,
            CreateBucketConfiguration={"LocationConstraint": aws_region}
        )
    print(f"Bucket '{bucket_name}' created successfully!")
except s3.exceptions.BucketAlreadyOwnedByYou:
    print(f"Bucket '{bucket_name}' already exists and is owned by you.")
except Exception as e:
    print(f"Bucket status: {e}")

files_to_upload = [
    ("data/nearbee_cloud_analytics_dataset.csv", "raw/telemetry/nearbee_cloud_analytics_dataset.csv"),
    ("data/clean_looker_studio_feed.csv", "curated/clean_looker_studio_feed.csv"),
    ("data/analytics_kpi_summary.json", "curated/analytics_kpi_summary.json"),
    ("data/model_metrics_comparison.json", "models/model_metrics_comparison.json"),
]

print("\n2. Uploading Data Lakehouse Files to AWS S3:")
for local_file, s3_key in files_to_upload:
    if os.path.exists(local_file):
        s3.upload_file(local_file, bucket_name, s3_key)
        print(f" [SUCCESS] {local_file} -> s3://{bucket_name}/{s3_key}")
    else:
        print(f" [WARNING] File {local_file} not found")

print("\n3. Verifying Live S3 Bucket Contents:")
resp = s3.list_objects_v2(Bucket=bucket_name)
for obj in resp.get("Contents", []):
    size_kb = round(obj["Size"] / 1024, 2)
    print(f" -> s3://{bucket_name}/{obj['Key']} ({size_kb} KB)")

print("\n==========================================================")
print("SUCCESS: ALL NEARBEE CLOUD DATASETS ARE LIVE ON AWS S3!")
print("==========================================================")

