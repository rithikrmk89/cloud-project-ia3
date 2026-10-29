const fs = require('fs');
const path = require('path');

const domains = ['Water', 'Health', 'Food', 'Energy'];
const servicesByDomain = {
  Water: [
    { name: 'Water Tank Cleaning & Disinfection', price: 1200 },
    { name: 'Water Filter & RO Purifier Service', price: 850 },
    { name: 'Pipeline Leakage & Flow Optimization', price: 950 },
    { name: 'Rainwater Filter & Recharge Service', price: 1400 }
  ],
  Health: [
    { name: 'Eco Pest Control & Termite Defense', price: 800 },
    { name: 'Deep Clinical Sanitization', price: 1100 },
    { name: 'Bathroom Deep Chemical Scrubbing', price: 700 },
    { name: 'Indoor Allergen & Mold Remediation', price: 1300 }
  ],
  Food: [
    { name: 'Certified Nutritionist Cook Service', price: 400 },
    { name: 'Kitchen Hygiene & Food Prep Audit', price: 650 },
    { name: 'Organic Meal Prep & Batch Cooking', price: 750 },
    { name: 'Food Pantry Sanitation & Preservation', price: 600 }
  ],
  Energy: [
    { name: 'AC Deep Coil Cleaning & Gas Tuning', price: 900 },
    { name: 'Solar Inverter & Battery Maintenance', price: 1500 },
    { name: 'Home Electrical Audit & Wattage Check', price: 550 },
    { name: 'Smart Appliance Energy Optimization', price: 800 }
  ]
};

const cities = ['Coimbatore', 'Bengaluru', 'Chennai', 'Hyderabad', 'Kochi', 'Mumbai'];
const cloudSources = [
  { prefix: 'aws-s3', uri: 's3://nearbee-iot-lake-production' },
  { prefix: 'gcp-storage', uri: 'gs://nearbee-analytics-lake' },
  { prefix: 'azure-blob', uri: 'https://nearbeeblob.blob.core.windows.net/telemetry' }
];

const headers = [
  'record_id', 'domain', 'service_name', 'timestamp', 'city',
  'response_time_min', 'service_duration_min', 'service_fee_inr', 'customer_rating',
  'high_urgency_flag', 'energy_saved_kwh', 'water_purified_liters', 'water_tds_reduced_ppm',
  'sanitation_score_delta', 'co2_avoided_kg', 'cloud_ingestion_source', 'cloud_storage_uri'
];

const rows = [headers.join(',')];
const jsonRecords = [];

const startDate = new Date('2026-08-01T08:00:00Z');

for (let i = 1; i <= 360; i++) {
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const svcList = servicesByDomain[domain];
  const svc = svcList[Math.floor(Math.random() * svcList.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  
  const curDate = new Date(startDate.getTime() + i * 5.6 * 3600 * 1000);
  const ts = curDate.toISOString();
  
  const responseTime = Math.floor(15 + Math.random() * 45);
  const duration = Math.floor(40 + Math.random() * 90);
  const fee = svc.price + Math.floor(Math.random() * 30) * 10;
  const rating = +(4.0 + Math.random() * 1.0).toFixed(1);
  const urgency = Math.random() > 0.65 ? 1 : 0;
  
  let energySaved = 0;
  let waterLiters = 0;
  let waterTds = 0;
  let sanDelta = 0;
  let co2 = 0;
  
  if (domain === 'Energy') {
    energySaved = +(8 + Math.random() * 25).toFixed(2);
    co2 = +(energySaved * 0.82).toFixed(2);
  } else if (domain === 'Water') {
    waterLiters = Math.floor(500 + Math.random() * 2000);
    waterTds = Math.floor(120 + Math.random() * 320);
    energySaved = +(2 + Math.random() * 5).toFixed(2);
    co2 = +(energySaved * 0.82).toFixed(2);
  } else if (domain === 'Health') {
    sanDelta = +(25 + Math.random() * 45).toFixed(1);
  } else if (domain === 'Food') {
    sanDelta = +(30 + Math.random() * 50).toFixed(1);
  }
  
  const cloudSrc = cloudSources[i % cloudSources.length];
  const fileUri = `${cloudSrc.uri}/events/2026/${String(curDate.getMonth() + 1).padStart(2, '0')}/rec_${i}.json`;
  
  const record = {
    record_id: `REC-${1000 + i}`,
    domain,
    service_name: svc.name,
    timestamp: ts,
    city,
    response_time_min: responseTime,
    service_duration_min: duration,
    service_fee_inr: fee,
    customer_rating: rating,
    high_urgency_flag: urgency,
    energy_saved_kwh: energySaved,
    water_purified_liters: waterLiters,
    water_tds_reduced_ppm: waterTds,
    sanitation_score_delta: sanDelta,
    co2_avoided_kg: co2,
    cloud_ingestion_source: cloudSrc.prefix,
    cloud_storage_uri: fileUri
  };
  
  jsonRecords.push(record);
  
  rows.push([
    record.record_id,
    record.domain,
    `"${record.service_name}"`,
    record.timestamp,
    record.city,
    record.response_time_min,
    record.service_duration_min,
    record.service_fee_inr,
    record.customer_rating,
    record.high_urgency_flag,
    record.energy_saved_kwh,
    record.water_purified_liters,
    record.water_tds_reduced_ppm,
    record.sanitation_score_delta,
    record.co2_avoided_kg,
    record.cloud_ingestion_source,
    record.cloud_storage_uri
  ].join(','));
}

const dir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(path.join(dir, 'nearbee_cloud_analytics_dataset.csv'), rows.join('\n'));
fs.writeFileSync(path.join(dir, 'nearbee_cloud_analytics_dataset.json'), JSON.stringify(jsonRecords, null, 2));

console.log(`Generated ${rows.length - 1} records in CSV & JSON in /data directory.`);

