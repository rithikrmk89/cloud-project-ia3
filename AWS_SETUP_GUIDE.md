# Connecting NearBee to Amazon Web Services (AWS)
### Course: Cloud Computing for Data Analytics (23DC2043)

This guide documents how to connect your project to AWS for:
1. **AWS S3** (Cloud Data Ingestion & Storage)
2. **AWS Lambda** (Serverless Event-Driven Processing)
3. **AWS SageMaker & QuickSight** (Cloud ML & BI Dashboards)

---

## 1. Prerequisites (Your AWS Account)
To connect live to your AWS account, you need your AWS IAM Access Keys:
1. Log into your [AWS Management Console](https://aws.amazon.com/console/).
2. Go to **IAM (Identity and Access Management)** -> **Users** -> Select your user.
3. Click the **Security credentials** tab.
4. Under **Access keys**, click **Create access key** (choose *Command Line Interface (CLI)*).
5. Copy your:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

---

## 2. Connect Your Project to AWS in 2 Steps

### Step A: Set Environment Variables (in PowerShell)
Open your PowerShell terminal and run:
```powershell
$env:AWS_ACCESS_KEY_ID = "YOUR_ACTUAL_AWS_ACCESS_KEY"
$env:AWS_SECRET_ACCESS_KEY = "YOUR_ACTUAL_AWS_SECRET_KEY"
$env:AWS_DEFAULT_REGION = "us-east-1"
```

### Step B: Run the S3 Ingestion Script
Execute the included AWS ingestion connector script:
```powershell
C:\msys64\ucrt64\bin\python.exe scripts/aws_connect_s3.py
```
This script uses the official **AWS Python SDK (`boto3`)** to stream `data/nearbee_cloud_analytics_dataset.csv` directly into your AWS S3 bucket: `s3://nearbee-cloud-analytics-lake-23dc2043/raw/telemetry/`.

---

## 3. Deploying Serverless Functions to AWS (AWS Lambda)

We have already authored the complete AWS SAM / Serverless framework templates inside [`serverless/`](file:///c:/Users/RITHIK%20MANIKANDAN/Downloads/near-bee-main/serverless):

* **Lambda Function Code**: [`serverless/aws-lambda/lambda_function.py`](file:///c:/Users/RITHIK%20MANIKANDAN/Downloads/near-bee-main/serverless/aws-lambda/lambda_function.py)
* **CloudFormation / SAM Template**: [`serverless/template.yaml`](file:///c:/Users/RITHIK%20MANIKANDAN/Downloads/near-bee-main/serverless/template.yaml)
* **Serverless Framework Spec**: [`serverless/serverless.yml`](file:///c:/Users/RITHIK%20MANIKANDAN/Downloads/near-bee-main/serverless/serverless.yml)

### Deploying the Lambda via AWS SAM:
```bash
cd serverless
sam build
sam deploy --guided
```
This automatically sets up:
* S3 Bucket Trigger (`s3:ObjectCreated:*`)
* API Gateway HTTP POST endpoint for live telemetry.

---

## 4. Connecting AWS QuickSight / Looker Studio

1. In AWS Console, open **Amazon QuickSight**.
2. Click **New Dataset** -> Choose **S3**.
3. Point to the S3 bucket ARN or upload `data/clean_looker_studio_feed.csv`.
4. Configure the visualizations using the exact specifications provided in:
   [`analytics/looker_studio_dashboard_spec.json`](file:///c:/Users/RITHIK%20MANIKANDAN/Downloads/near-bee-main/analytics/looker_studio_dashboard_spec.json).

---

## 5. Connecting AWS in Render

When you deploy on **Render**, you can also add your AWS keys as Environment Variables in your Render Dashboard:
* `AWS_ACCESS_KEY_ID`
* `AWS_SECRET_ACCESS_KEY`
* `AWS_DEFAULT_REGION`

This allows your Render Docker container to automatically stream live user bookings directly into your AWS S3 Data Lake!

