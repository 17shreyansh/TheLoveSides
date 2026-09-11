/**
 * Shiprocket API Connectivity Test
 * 
 * Run: npx tsx apps/api/src/integrations/shiprocket/test-connectivity.ts
 * 
 * Tests each Shiprocket API endpoint to verify credentials and connectivity.
 * This script uses the same client.ts for authentication, so it validates
 * that the .env credentials are working.
 */

import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SHIPROCKET_API_URL = process.env.SHIPROCKET_API_URL || 'https://apiv2.shiprocket.in/v1/external';
const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;

if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
  console.error('❌ SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD must be set in .env');
  process.exit(1);
}

let authToken = '';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration: number;
}

const results: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<string>): Promise<void> {
  const start = Date.now();
  try {
    const message = await fn();
    const duration = Date.now() - start;
    results.push({ name, status: 'PASS', message, duration });
    console.log(`  ✅ ${name} (${duration}ms) — ${message}`);
  } catch (error: any) {
    const duration = Date.now() - start;
    const message = error.message || 'Unknown error';
    results.push({ name, status: 'FAIL', message, duration });
    console.log(`  ❌ ${name} (${duration}ms) — ${message}`);
  }
}

async function authenticatedFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${SHIPROCKET_API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(data).slice(0, 200)}`);
  }
  return data;
}

// ============================================
// Tests
// ============================================

async function main() {
  console.log('\n🚀 Shiprocket API Connectivity Test');
  console.log('='.repeat(50));
  console.log(`   API URL: ${SHIPROCKET_API_URL}`);
  console.log(`   Email:   ${SHIPROCKET_EMAIL}`);
  console.log('='.repeat(50));
  console.log('');

  // 1. Authentication
  await runTest('1. Authentication API (Login)', async () => {
    const response = await fetch(`${SHIPROCKET_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: SHIPROCKET_EMAIL,
        password: SHIPROCKET_PASSWORD,
      }),
    });

    const data = await response.json() as any;
    if (!response.ok || !data.token) {
      throw new Error(`Auth failed: ${JSON.stringify(data).slice(0, 200)}`);
    }

    authToken = data.token;
    return `Token obtained (${data.token.slice(0, 20)}...)`;
  });

  if (!authToken) {
    console.log('\n⛔ Authentication failed. Cannot proceed with other tests.');
    printSummary();
    process.exit(1);
  }

  // 2. Pincode Serviceability
  await runTest('2. Pincode Serviceability API', async () => {
    const data = await authenticatedFetch(
      '/courier/serviceability/?pickup_postcode=110001&delivery_postcode=400001&weight=0.5&cod=0'
    );
    const couriers = data?.data?.available_courier_companies || [];
    return `${couriers.length} courier(s) available for 110001→400001`;
  });

  // 3. Courier List
  await runTest('3. Courier API (List Partners)', async () => {
    const data = await authenticatedFetch('/courier/courierListWithCounts');
    const count = data?.courier_data?.length || Object.keys(data?.courier_data || {}).length || 'unknown';
    return `${count} courier partner(s) found`;
  });

  // 4. Pickup Locations (Warehouses)
  await runTest('4. Warehouse API (Pickup Locations)', async () => {
    const data = await authenticatedFetch('/settings/company/pickup');
    const locations = data?.data?.shipping_address || [];
    const names = locations.map((l: any) => l.pickup_location).join(', ');
    return `${locations.length} location(s): ${names || 'none'}`;
  });

  // 5. Products
  await runTest('5. Product/SKU API', async () => {
    const data = await authenticatedFetch('/products');
    const count = data?.data?.length || 0;
    return `${count} product(s) in catalog`;
  });

  // 6. NDR
  await runTest('6. NDR API', async () => {
    const data = await authenticatedFetch('/ndr');
    return `NDR data retrieved successfully`;
  });

  // 7. COD Remittance
  await runTest('7. COD Remittance API', async () => {
    const data = await authenticatedFetch('/account/details/cod');
    return `COD remittance data retrieved`;
  });

  // 8. Shipping Rates
  await runTest('8. Shipping Rate API', async () => {
    const data = await authenticatedFetch(
      '/courier/serviceability/?pickup_postcode=110001&delivery_postcode=560001&weight=1&cod=0'
    );
    const couriers = data?.data?.available_courier_companies || [];
    if (couriers.length > 0) {
      const cheapest = couriers.reduce((a: any, b: any) => (a.rate < b.rate ? a : b));
      return `${couriers.length} rates, cheapest: ₹${cheapest.rate} via ${cheapest.courier_name}`;
    }
    return `${couriers.length} rate(s) found`;
  });

  printSummary();
}

function printSummary(): void {
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary');
  console.log('='.repeat(50));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;

  console.log(`   Passed:  ${passed}`);
  console.log(`   Failed:  ${failed}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total:   ${results.length}`);
  console.log('');

  if (failed > 0) {
    console.log('❌ Some tests failed. Check the output above for details.');
    console.log('');
    console.log('Common issues:');
    console.log('  - Invalid email/password in .env');
    console.log('  - Shiprocket account not activated');
    console.log('  - API rate limiting');
    console.log('  - Network connectivity issues');
  } else {
    console.log('✅ All Shiprocket APIs are working correctly!');
  }
  console.log('');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
