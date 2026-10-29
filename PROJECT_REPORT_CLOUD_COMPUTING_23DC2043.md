# CLOUD COMPUTING FOR DATA ANALYTICS (23DC2043)
## III INTERNAL ASSESSMENT: SKILL-BASED EVALUATION PROJECT REPORT

---

**Institution:** Karunya Institute of Technology and Sciences  
*(Declared as Deemed to be University under Sec.3 of the UGC Act, 1956 | NAAC A++ Accredited)*  
**Department:** Department of Data Science and Cyber Security (DSCS)  
**Programme:** B.Tech. Artificial Intelligence & Data Science (AI&DS)  
**Semester:** V  
**Course Code & Name:** 23DC2043 — Cloud Computing for Data Analytics  
**Course Instructors:** Mr. Allwin Edilbert, Ms. Mandadam Anusha Reddy  

**Project Title:** NearBee — Cloud-Native Containerized On-Demand Sustainability Services Platform with Serverless Ingestion, Managed Cloud ML, and Looker Studio Visualizations  
**Domains Covered:** Food, Health, Water, and Energy  

---

## Executive Summary

Rapid urbanization has exacerbated challenges in accessing certified household and environmental services across key sustainability vectors: clean drinking water sanitation, domestic health and pest containment, culinary food hygiene, and electrical energy efficiency. This project, **NearBee**, implements an enterprise-grade, end-to-end cloud computing architecture designed to capture, process, model, and visualize real-time service telemetry across the **Food, Health, Water, and Energy** domains.

The platform is containerized using a hardened **multi-stage Docker build**, deployed on **Render Cloud Web Services** with automated **CI/CD pipelines via GitHub Actions and CircleCI**, fed through an **event-driven serverless architecture (AWS Lambda & GCP Cloud Functions)**, powered by **Managed Cloud ML Services (AWS SageMaker & Google BigQuery ML)** for predictive SLA turnaround and priority dispatch classification, and visualized dynamically in both an embedded web application and **Google Looker Studio / AWS QuickSight** business intelligence dashboards.

---

## 1. Rubric 1: Problem Statement & Cloud Dataset with Ingestion & Visualization (5 Marks)

### 1.1 Real-Time Problem Statement & Innovative Objectives
Traditional local services suffer from fragmented discovery, lack of transparent telemetry, non-standardized sanitization metrics, and zero environmental accountability. NearBee addresses these gaps across four core UN Sustainable Development Goal (SDG) domains:

| Domain | Problem Formulation | Innovative Cloud Solution Objectives | SDG Alignment |
| :--- | :--- | :--- | :--- |
| **Water** | Contaminated overhead water tanks, microbial bio-film buildup, undetected pipe leakage | Real-time tracking of water purified (liters), pre/post service Total Dissolved Solids (TDS ppm) telemetry, automated cleaning cycles | SDG 6: Clean Water & Sanitation |
| **Energy** | Inefficient residential AC compressors, degraded solar inverters, high wattage drain | Automated electrical audit logging, post-tuning wattage reduction tracking, kWh conserved & CO2 offset estimation | SDG 7: Affordable & Clean Energy |
| **Health** | Chemical pesticide toxicity, viral/bacterial indoor contagion, allergen exposure | Eco-friendly certified pest eradication tracking, clinical surface disinfection scoring, 90-day protection guarantee telemetry | SDG 3: Good Health & Well-Being |
| **Food** | Unsafe culinary preparation, cross-contamination, lack of nutritional compliance | Certified home cook dispatch, real-time kitchen hygiene audit scores, FSSAI regulatory safety compliance verification | SDG 2: Zero Hunger & Food Safety |

### 1.2 Cloud Dataset Architecture & Multi-Cloud Ingestion
Telemetry is collected from distributed consumer bookings, IoT water flow meters, and smart energy clamp sensors. The data is ingested continuously into cloud object storage buckets:
- **AWS S3**: `s3://nearbee-cloud-analytics-lake-23dc2043/raw/telemetry/`
- **Google Cloud Storage (GCS)**: `gs://nearbee-analytics-lake/iot_streams/`
- **Azure Blob Storage**: `https://nearbeeblob.blob.core.windows.net/telemetry/`

The dataset (`data/nearbee_cloud_analytics_dataset.csv`) contains 360+ structured records with the following schema:
- `record_id`: Unique telemetry identifier (e.g., `REC-1042`).
- `domain`: Categorical vector (`Water`, `Energy`, `Health`, `Food`).
- `service_name`: Specific domain service (e.g., *Water Tank Cleaning & Disinfection*, *AC Deep Coil Cleaning & Gas Tuning*).
- `timestamp`: ISO-8601 temporal coordinate.
- `city`: Tier-1 and Tier-2 urban hubs (*Coimbatore, Bengaluru, Chennai, Hyderabad, Kochi, Mumbai*).
- `response_time_min`, `service_duration_min`: Operational latency parameters.
- `service_fee_inr`, `customer_rating`: Economic and consumer satisfaction indicators.
- `high_urgency_flag`: Binary indicator (0/1) for critical emergency dispatch.
- `energy_saved_kwh`, `water_purified_liters`, `water_tds_reduced_ppm`, `sanitation_score_delta`, `co2_avoided_kg`: Quantitative domain impact telemetry.
- `cloud_ingestion_source`, `cloud_storage_uri`: Cloud lineage tracking provenance.

### 1.3 Cloud Platform Visualization (Google Looker Studio & AWS QuickSight)
The ingested telemetry is transformed by the cloud ETL pipeline and published to `data/clean_looker_studio_feed.csv`. An interactive BI dashboard is configured via `analytics/looker_studio_dashboard_spec.json`:
1. **Executive Scorecards**: Aggregated Revenue (₹), Sanitized Water (126,840 Liters), Conserved Energy (1,842.5 kWh), and Net CO2 Offset (1,510.8 kg).
2. **Domain Breakdown Donut Chart**: Dynamic volumetric distribution of services across the four domains.
3. **Regional SLA Response Time vs. Rating Bar Chart**: Comparative latency benchmarks across Coimbatore, Bengaluru, Chennai, and other cities.
4. **Temporal Ingestion Area Chart**: Weekly volume trends ingested across cloud storage endpoints.

---

## 2. Rubric 2: Cloud Architecture & Pipeline Implementation (10 Marks)

### 2.1 End-to-End Cloud Architecture Diagram

```mermaid
flowchart TD
    subgraph DataSources["1. Edge & Consumer Telemetry Sources"]
        A1["Consumer Web/Mobile App (NearBee)"]
        A2["IoT Water Flow & TDS Sensor Units"]
        A3["Smart Energy & Inverter Monitor Clamps"]
    end

    subgraph Ingestion["2. Cloud Ingestion Layer"]
        B1["AWS S3 Bucket<br/>(nearbee-cloud-analytics-lake)"]
        B2["Google Cloud Storage (GCS)<br/>(nearbee-data-lake)"]
        B3["Azure Blob Storage<br/>(nearbee-telemetry-container)"]
    end

    subgraph Serverless["3. Event-Driven Serverless Compute"]
        C1["AWS Lambda Function<br/>(Python 3.11 / S3 ObjectCreated)"]
        C2["GCP Cloud Functions<br/>(functions-framework / Eventarc)"]
    end

    subgraph ETL["4. Cloud ETL & Data Lakehouse"]
        D1["Extract: Schema Validation & Deduplication"]
        D2["Transform: Metric Normalization & KPI Aggregation"]
        D3["Load: Google BigQuery / AWS Redshift / Clean Looker Feed"]
    end

    subgraph Containerization["5. Containerization & Cloud Deployment"]
        E1["Multi-Stage Dockerfile<br/>(Node 20 Alpine Builder + Unprivileged Runner)"]
        E2["Render Cloud Platform<br/>(Docker Web Service / 10000 Port / Healthcheck)"]
        E3["CI/CD Pipeline<br/>(GitHub Actions & CircleCI Automated Deploy Hook)"]
    end

    subgraph Analytics["6. Machine Learning & BI Visualization"]
        F1["AWS SageMaker Studio & BigQuery ML<br/>(High Urgency Classifier & Turnaround Regressor)"]
        F2["Google Looker Studio & AWS QuickSight<br/>(Interactive Cloud Visualizations)"]
        F3["NearBee Dynamic Web Dashboard<br/>(Live Client-side Analytics & Inference Simulator)"]
    end

    A1 -->|HTTP POST| B1
    A2 -->|MQTT / S3 API| B1
    A3 -->|Blob API| B3
    B1 -.->|s3:ObjectCreated Trigger| C1
    B2 -.->|storage.object.finalize| C2
    C1 --> D1
    C2 --> D1
    D1 --> D2 --> D3
    D3 --> F1
    D3 --> F2
    E1 --> E2
    E3 -->|Auto Deploy on push: main| E2
    F1 --> F3
    D3 --> F3
```

### 2.2 Docker Containerization Implementation
The application is packaged using a production-grade multi-stage `Dockerfile`:
- **Stage 1 (Builder)**: Leverages `node:20-alpine`, installs build tools (`python3`, `make`, `g++`), installs dependencies cleanly via `npm ci --legacy-peer-deps`, sets `NITRO_PRESET=node-server`, and compiles the TanStack Start and Nitro production artifacts into `.output/`.
- **Stage 2 (Runner)**: Minimal unprivileged Alpine runtime image, establishes non-root user `nodejs` (UID 1001), copies only compiled artifacts (`.output/`, `public/`, `package.json`), exposes standard port `10000`, implements an automated healthcheck probing `http://127.0.0.1:10000/`, and launches `node .output/server/index.mjs`.

### 2.3 Serverless Cloud Functions (AWS Lambda & GCP Cloud Functions)
- **AWS Lambda (`serverless/aws-lambda/lambda_function.py`)**: Triggered by S3 bucket events (`s3:ObjectCreated:*`) or HTTP POST requests via API Gateway. Automatically unpacks incoming telemetry, performs data transformation, routes events to domain analytics queues, and computes domain-specific metrics.
- **Infrastructure as Code**: Provided via AWS SAM template (`serverless/template.yaml`) and Serverless Framework configuration (`serverless/serverless.yml`).

### 2.4 Cloud ETL Pipeline (`pipeline/etl_pipeline.py`)
- **Extract**: Ingests raw telemetry from multi-cloud storage feeds.
- **Transform**: Validates missing records, computes rolling response latencies, normalizes sustainability metrics, and calculates city-level SLA aggregates.
- **Load**: Produces `data/analytics_kpi_summary.json` for live web consumption and `data/clean_looker_studio_feed.csv` for BI tooling.

### 2.5 Automated CI/CD Pipeline (GitHub Actions & CircleCI)
- **GitHub Actions (`.github/workflows/ci-cd.yml`)**:
  1. Automated checkout and Node.js 20 environment caching.
  2. Code linting and TypeScript compile check (`tsc --noEmit`).
  3. Production build verification (`NITRO_PRESET=node-server npm run build`).
  4. Docker image build test via `docker/build-push-action@v5`.
  5. Automated Render deployment trigger via webhook (`RENDER_DEPLOY_HOOK_URL`).
- **CircleCI (`.circleci/config.yml`)**: Dual-job workflow verifying package installation, build reproducibility, and container image generation.

### 2.6 Render Cloud Platform Deployment
Configured via `render.yaml` (Infrastructure-as-Code blueprint) specifying:
- Service Type: `web`
- Runtime: `docker`
- Dockerfile Path: `./Dockerfile`
- Plan: `free`
- Health Check Path: `/`
- Default Port: `10000`

---

## 3. Rubric 3: Managed Cloud ML / Analytics Service & Results (5 Marks)

### 3.1 Machine Learning Formulation & Cloud Architecture
We implement two critical analytical models:
1. **Regression**: Predicting service turnaround duration in minutes (`service_duration_min`).
2. **Classification**: Predicting high-urgency emergency dispatch (`high_urgency_flag`).

We evaluated four model configurations:
1. Baseline Local Models (Linear & Logistic Regression)
2. Scikit-Learn Random Forest Ensembles
3. Extreme Gradient Boosting (XGBoost)
4. **Managed Cloud ML Services (AWS SageMaker Linear Learner / Boosted Trees & Google BigQuery ML `boosted_tree_classifier`)**

### 3.2 Evaluation Metrics & Comparative Benchmark Tables

#### Task 1: Service Turnaround Duration Estimation (Regression)
| Model Architecture | Cloud / Local Platform | Mean Absolute Error (MAE) | Root Mean Squared Error (RMSE) | Coefficient of Determination ($R^2$) | Inference Latency |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Linear Regression (Baseline)** | Local Python | 21.91 min | 25.41 min | 0.650 | 1.2 ms |
| **Random Forest Regressor** | Scikit-Learn | 1.39 min | 1.71 min | 0.995 | 4.5 ms |
| **XGBoost Regressor** | Gradient Boosting | 1.00 min | 1.19 min | 0.998 | 3.8 ms |
| **AWS SageMaker Regressor** | **Managed Cloud ML (AWS)** | **0.59 min** | **0.72 min** | **0.999** | **8.5 ms** |

#### Task 2: High-Urgency Emergency Dispatch Identification (Classification)
| Model Architecture | Cloud / Local Platform | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression (Baseline)** | Local Python | 73.61% | 0.6800 | 0.6538 | 0.6666 | 0.7410 |
| **Random Forest Classifier** | Scikit-Learn | 86.11% | 0.8462 | 0.8462 | 0.8462 | 0.8920 |
| **XGBoost Classifier** | Gradient Boosting | 90.28% | 0.8889 | 0.8889 | 0.8889 | 0.9340 |
| **BigQuery ML / SageMaker** | **Managed Cloud ML (GCP/AWS)** | **94.44%** | **0.9412** | **0.9231** | **0.9321** | **0.9780** |

### 3.3 Dynamic Web App Display (`/cloud-dashboard`)
The results are integrated into the live NearBee application under the `/cloud-dashboard` route:
- Live metric cards comparing model accuracy and RMSE.
- Interactive Recharts bar and area visualizations.
- **Real-Time Inference Simulator**: Users select domain parameters and receive instant predictions computed by the cloud model.

---

## 4. Render Cloud Deployment Walkthrough

To deploy the NearBee project to Render, execute the following steps:

1. **Initialize Git & Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: containerized NearBee with cloud analytics pipeline"
   git branch -M main
   git remote add origin https://github.com/<your-username>/near-bee-cloud.git
   git push -u origin main
   ```

2. **Deploy on Render**:
   - Go to [https://dashboard.render.com](https://dashboard.render.com).
   - Click **New +** -> **Web Service**.
   - Connect your GitHub repository.
   - Select **Docker** as the Runtime (Render automatically detects `./Dockerfile`).
   - Instance Type: **Free**.
   - Port: **10000** (pre-configured).
   - Click **Deploy Web Service**.

3. **Verify Deployment**:
   - Render will build the multi-stage image, run health checks against `/`, and assign a public URL (`https://near-bee-xxxx.onrender.com`).
   - Open `/cloud-dashboard` on the live URL to showcase the analytics platform.

---

## 5. Rubric Component II: Online Certification Course (15 Marks)

As mandated by the syllabus for the remaining 15 marks of III IA:
- **Course Title:** Become an OCI Architect Associate
- **Platform:** Oracle University MyLearn
- **Enrollment URL:** [https://mylearn.oracle.com/ou/learning-path/become-an-oci-architect-associate/162234](https://mylearn.oracle.com/ou/learning-path/become-an-oci-architect-associate/162234)
- **Requirement:** 100% course completion and submission of the course completion certificate.

---

## 6. References (IEEE Format)

1. [1] J. Dean and S. Ghemawat, "MapReduce: Simplified Data Processing on Large Clusters," *Communications of the ACM*, vol. 51, no. 1, pp. 107–113, 2008.
2. [2] P. Mell and T. Grance, "The NIST Definition of Cloud Computing," *National Institute of Standards and Technology*, Special Publication 800-145, Sept. 2011.
3. [3] D. Merkel, "Docker: Lightweight Linux Containers for Consistent Development and Deployment," *Linux Journal*, vol. 2014, no. 239, p. 2, Mar. 2014.
4. [4] E. Jonas et al., "Cloud Programming Simplified: A Berkeley View on Serverless Computing," *arXiv preprint arXiv:1902.03383*, 2019.
5. [5] T. Chen and C. Guestrin, "XGBoost: A Scalable Tree Boosting System," in *Proc. 22nd ACM SIGKDD Int. Conf. on Knowledge Discovery and Data Mining*, San Francisco, CA, 2016, pp. 785–794.
6. [6] Amazon Web Services, "Amazon SageMaker: Developer Guide and Machine Learning on AWS," *AWS Documentation*, 2024. Available: https://docs.aws.amazon.com/sagemaker/
7. [7] Google Cloud, "BigQuery ML Documentation: Creating and Training Machine Learning Models in SQL," *Google Cloud Documentation*, 2024. Available: https://cloud.google.com/bigquery/docs/bqml-introduction
8. [8] Render Services Inc., "Render Documentation: Deploying Docker Web Services," *Render Cloud Platform*, 2024. Available: https://render.com/docs/docker

