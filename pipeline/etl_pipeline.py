"""
NearBee Cloud ETL Workflow Pipeline
Course: Cloud Computing for Data Analytics (23DC2043)
Extract -> Transform -> Load
"""

import os
import json
import csv
from datetime import datetime

def run_etl():
    base_dir = os.path.dirname(os.path.dirname(__file__))
    input_file = os.path.join(base_dir, "data", "nearbee_cloud_analytics_dataset.csv")
    kpi_output = os.path.join(base_dir, "data", "analytics_kpi_summary.json")
    looker_output = os.path.join(base_dir, "data", "clean_looker_studio_feed.csv")

    if not os.path.exists(input_file):
        raise FileNotFoundError(f"Input file not found at {input_file}")

    print(">>> [Phase 1: EXTRACT] Reading raw telemetry data from Cloud Ingestion Lake...")
    raw_records = []
    with open(input_file, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            raw_records.append(row)

    print(f"    Extracted {len(raw_records)} records.")

    print(">>> [Phase 2: TRANSFORM] Cleansing, aggregating domain impact & calculating KPIs...")
    total_records = len(raw_records)
    domain_counts = {"Water": 0, "Health": 0, "Food": 0, "Energy": 0}
    domain_revenue = {"Water": 0.0, "Health": 0.0, "Food": 0.0, "Energy": 0.0}
    city_aggregates = {}

    total_water_liters = 0.0
    total_water_tds_reduced = 0.0
    water_count = 0

    total_energy_kwh = 0.0
    total_co2_kg = 0.0
    energy_count = 0

    total_health_sanitation_gain = 0.0
    health_count = 0

    total_food_hygiene_gain = 0.0
    food_count = 0

    total_response_time = 0.0
    total_rating = 0.0
    urgency_count = 0

    transformed_rows = []

    for row in raw_records:
        domain = row["domain"]
        fee = float(row["service_fee_inr"])
        city = row["city"]
        resp_time = float(row["response_time_min"])
        rating = float(row["customer_rating"])
        urgency = int(row["high_urgency_flag"])

        domain_counts[domain] = domain_counts.get(domain, 0) + 1
        domain_revenue[domain] = domain_revenue.get(domain, 0.0) + fee

        if city not in city_aggregates:
            city_aggregates[city] = {"count": 0, "total_rev": 0.0, "avg_resp": 0.0}
        city_aggregates[city]["count"] += 1
        city_aggregates[city]["total_rev"] += fee
        city_aggregates[city]["avg_resp"] += resp_time

        total_response_time += resp_time
        total_rating += rating
        if urgency == 1:
            urgency_count += 1

        if domain == "Water":
            liters = float(row["water_purified_liters"])
            tds = float(row["water_tds_reduced_ppm"])
            total_water_liters += liters
            total_water_tds_reduced += tds
            water_count += 1
        elif domain == "Energy":
            kwh = float(row["energy_saved_kwh"])
            co2 = float(row["co2_avoided_kg"])
            total_energy_kwh += kwh
            total_co2_kg += co2
            energy_count += 1
        elif domain == "Health":
            san = float(row["sanitation_score_delta"])
            total_health_sanitation_gain += san
            health_count += 1
        elif domain == "Food":
            san = float(row["sanitation_score_delta"])
            total_food_hygiene_gain += san
            food_count += 1

        # Append clean normalized row for Looker Studio
        clean_row = {
            "RecordID": row["record_id"],
            "Domain": domain,
            "ServiceName": row["service_name"],
            "Timestamp": row["timestamp"],
            "Date": row["timestamp"][:10],
            "City": city,
            "ResponseTimeMinutes": resp_time,
            "ServiceDurationMinutes": row["service_duration_min"],
            "RevenueINR": fee,
            "CustomerRating": rating,
            "Urgent": "Yes" if urgency == 1 else "No",
            "EnergySavedKWh": row["energy_saved_kwh"],
            "WaterPurifiedLiters": row["water_purified_liters"],
            "CO2AvoidedKg": row["co2_avoided_kg"],
            "CloudSource": row["cloud_ingestion_source"]
        }
        transformed_rows.append(clean_row)

    for c in city_aggregates:
        city_aggregates[c]["avg_resp"] = round(city_aggregates[c]["avg_resp"] / city_aggregates[c]["count"], 1)
        city_aggregates[c]["total_rev"] = round(city_aggregates[c]["total_rev"], 2)

    kpis = {
        "metadata": {
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "total_records_processed": total_records,
            "pipeline_status": "SUCCESS",
            "target_cloud_warehouse": "AWS Redshift / GCP BigQuery / Azure Synapse"
        },
        "overview": {
            "total_services_dispatched": total_records,
            "average_response_time_min": round(total_response_time / total_records, 1),
            "average_customer_rating": round(total_rating / total_records, 2),
            "high_urgency_dispatch_ratio": round((urgency_count / total_records) * 100, 1),
            "total_revenue_inr": round(sum(domain_revenue.values()), 2)
        },
        "domains": {
            "Water": {
                "total_jobs": domain_counts["Water"],
                "revenue_inr": round(domain_revenue["Water"], 2),
                "total_water_liters_purified": round(total_water_liters, 1),
                "avg_tds_reduction_ppm": round(total_water_tds_reduced / max(1, water_count), 1),
                "environmental_impact": f"{round(total_water_liters):,} Liters of municipal & domestic water sanitized"
            },
            "Energy": {
                "total_jobs": domain_counts["Energy"],
                "revenue_inr": round(domain_revenue["Energy"], 2),
                "total_kwh_conserved": round(total_energy_kwh, 2),
                "total_co2_avoided_kg": round(total_co2_kg, 2),
                "environmental_impact": f"{round(total_energy_kwh, 1)} kWh saved, avoiding {round(total_co2_kg, 1)} kg CO2 emissions"
            },
            "Health": {
                "total_jobs": domain_counts["Health"],
                "revenue_inr": round(domain_revenue["Health"], 2),
                "avg_sanitation_score_boost_pct": round(total_health_sanitation_gain / max(1, health_count), 1),
                "impact": "Clinical sterilization and eco-pest barrier across domestic dwellings"
            },
            "Food": {
                "total_jobs": domain_counts["Food"],
                "revenue_inr": round(domain_revenue["Food"], 2),
                "avg_hygiene_score_boost_pct": round(total_food_hygiene_gain / max(1, food_count), 1),
                "impact": "FSSAI-aligned home meal preparation and culinary hygiene compliance"
            }
        },
        "city_breakdown": city_aggregates
    }

    print(">>> [Phase 3: LOAD] Loading curated analytics datasets into warehouse sinks...")
    with open(kpi_output, mode="w", encoding="utf-8") as f:
        json.dump(kpis, f, indent=2)
    print(f"    Loaded KPI summaries into {kpi_output}")

    if transformed_rows:
        fieldnames = list(transformed_rows[0].keys())
        with open(looker_output, mode="w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(transformed_rows)
        print(f"    Exported Looker Studio / QuickSight curated feed: {looker_output}")

    print(">>> ETL Pipeline completed successfully!")
    return kpis

if __name__ == "__main__":
    run_etl()

