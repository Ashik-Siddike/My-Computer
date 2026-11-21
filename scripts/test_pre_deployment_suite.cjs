const assert = require('assert');

async function runPreDeployChecks() {
  console.log('====================================================');
  console.log('  STARTING SENIOR PRE-DEPLOYMENT QA & AUDIT SUITE   ');
  console.log('====================================================\n');

  const BASE_URL = 'http://localhost:5000';

  // 1. Healthcheck endpoint
  console.log('[Check 1] Verifying /health and /api/health endpoints...');
  const healthRes1 = await fetch(`${BASE_URL}/health`);
  assert.strictEqual(healthRes1.status, 200, '/health should return HTTP 200');
  const healthData1 = await healthRes1.json();
  assert.strictEqual(healthData1.status, 'ok', 'Health status should be ok');
  console.log('  -> /health passed: 200 OK, DB Connected:', healthData1.databaseConnected);

  const healthRes2 = await fetch(`${BASE_URL}/api/health`);
  assert.strictEqual(healthRes2.status, 200, '/api/health should return HTTP 200');
  console.log('  -> /api/health passed: 200 OK');

  // 2. Admin Authentication
  console.log('\n[Check 2] Testing Admin Login & Auth Token Generation...');
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'mycomputer' }),
  });
  assert.strictEqual(loginRes.status, 200, 'Admin login should succeed');
  const loginData = await loginRes.json();
  assert(loginData.token, 'Token must be present in login response');
  const adminToken = loginData.token;
  console.log('  -> Admin login passed. Token acquired successfully.');

  // 3. Hero 3D Spatial Carousel Cards
  console.log('\n[Check 3] Verifying 10 Hero 3D PC Hardware Cards in Database...');
  const heroCardsRes = await fetch(`${BASE_URL}/api/cards?section=homepage-hero`);
  assert.strictEqual(heroCardsRes.status, 200, 'Public cards endpoint should return 200');
  const heroCardsData = await heroCardsRes.json();
  assert(Array.isArray(heroCardsData.data), 'heroCardsData.data must be array');
  assert.strictEqual(heroCardsData.data.length, 10, 'Must have exactly 10 Hero 3D cards');
  console.log(`  -> 10 Hero 3D cards verified in MongoDB collection: sitecards`);
  console.log(`     Sample: ${heroCardsData.data[0].id} - "${heroCardsData.data[0].title}"`);

  // 4. Products & Categories Public Catalog
  console.log('\n[Check 4] Testing Public Catalog Endpoints...');
  const productsRes = await fetch(`${BASE_URL}/api/products?limit=10`);
  assert.strictEqual(productsRes.status, 200, '/api/products should return 200');
  const productsData = await productsRes.json();
  const totalCount = productsData.pagination?.total || productsData.products?.length || 0;
  assert(totalCount >= 180, 'Total products should be >= 180');
  console.log(`  -> Products catalog passed: ${totalCount} products available`);

  const sampleProduct = productsData.products[0];

  // 5. Complete Customer Checkout Workflow (bKash with TrxID)
  console.log('\n[Check 5] Testing Customer Checkout Workflow (bKash Payment with TrxID)...');
  const testOrderPayload = {
    customer: {
      name: 'Ashik QA Tester',
      phone: '01812345678',
      email: 'tester@mycomputer.com.bd',
    },
    delivery: {
      address: 'House 12, Road 4, Sector 7, Uttara, Dhaka',
      district: 'Dhaka',
      note: 'Pre-deployment QA verification order',
    },
    items: [
      {
        productId: sampleProduct.id || sampleProduct.productId,
        name: sampleProduct.name,
        image: sampleProduct.image,
        quantity: 1,
        unitPrice: sampleProduct.price || sampleProduct.salePrice || 5000,
        subtotal: sampleProduct.price || sampleProduct.salePrice || 5000,
      },
    ],
    subtotal: sampleProduct.price || sampleProduct.salePrice || 5000,
    deliveryCharge: 70,
    discount: 0,
    grandTotal: (sampleProduct.price || sampleProduct.salePrice || 5000) + 70,
    paymentMethod: 'bKash',
    paymentNumber: '01873434639',
    senderNumber: '01812345678',
    trxId: 'TRX998877TEST',
    paymentStatus: 'Pending Verification',
  };

  const createOrderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testOrderPayload),
  });

  assert.strictEqual(createOrderRes.status, 201, 'Order creation should return 201 Created');
  const createOrderData = await createOrderRes.json();
  assert(createOrderData.success, 'Order response must indicate success');
  const placedOrder = createOrderData.order;
  const placedOrderId = placedOrder.orderId || placedOrder.id;
  console.log(`  -> Order created successfully! Order ID: ${placedOrderId}`);
  console.log(`     Customer: ${placedOrder.customer.name}, TrxID: ${placedOrder.trxId}, Method: ${placedOrder.paymentMethod}`);

  // 6. Order Tracking & Customer Verification
  console.log('\n[Check 6] Testing Order Tracking Endpoint by Phone or Order ID...');
  const trackRes = await fetch(`${BASE_URL}/api/orders/${encodeURIComponent(placedOrderId)}`);
  assert.strictEqual(trackRes.status, 200, 'Tracking endpoint should return 200');
  const trackData = await trackRes.json();
  assert.strictEqual(trackData.order.orderId, placedOrderId, 'Tracked orderId must match');
  console.log(`  -> Order tracking passed: Status is "${trackData.order.orderStatus}"`);

  // 7. Admin Order Confirmation & Status Management
  console.log('\n[Check 7] Testing Admin Order Confirmation (Pending -> Confirmed)...');
  const updateStatusRes = await fetch(`${BASE_URL}/api/orders/${placedOrderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'Confirmed' }),
  });

  assert.strictEqual(updateStatusRes.status, 200, 'Order status update should return 200');
  const updateStatusData = await updateStatusRes.json();
  assert.strictEqual(updateStatusData.order.orderStatus, 'Confirmed', 'Order status should now be Confirmed');
  console.log('  -> Admin status update passed! Order is now "Confirmed".');

  // Verify customer sees 'Confirmed' on live tracking
  const trackConfirmedRes = await fetch(`${BASE_URL}/api/orders/${encodeURIComponent(placedOrderId)}`);
  const trackConfirmedData = await trackConfirmedRes.json();
  assert.strictEqual(trackConfirmedData.order.orderStatus, 'Confirmed', 'Customer must see Confirmed');
  console.log('  -> Customer tracking reflection passed: User sees "Confirmed" immediately.');

  console.log('\n====================================================');
  console.log('   ALL PRE-DEPLOYMENT QA & INTEGRATION TESTS PASSED ');
  console.log('====================================================\n');
}

runPreDeployChecks().catch(err => {
  console.error('\n[FATAL ERROR IN PRE-DEPLOY SUITE]:', err);
  process.exit(1);
});
