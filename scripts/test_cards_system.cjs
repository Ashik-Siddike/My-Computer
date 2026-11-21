const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== CARD MANAGEMENT SYSTEM INTEGRATION TESTS ===\n');

  // Step 1: Login as Admin to obtain JWT token
  console.log('1. Admin Authentication...');
  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { username: 'admin', password: 'mycomputer' });

  if (loginRes.status !== 200 || !loginRes.data.token) {
    throw new Error(`Admin login failed: ${JSON.stringify(loginRes.data)}`);
  }
  const token = loginRes.data.token;
  console.log('   ✓ Logged in as Admin. Token obtained.');

  // Step 2: GET /api/cards (Public Endpoint)
  console.log('\n2. Testing Public GET /api/cards...');
  const publicRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/cards',
    method: 'GET',
  });
  if (publicRes.status !== 200 || !publicRes.data.success) {
    throw new Error(`Public GET cards failed: ${JSON.stringify(publicRes.data)}`);
  }
  console.log(`   ✓ Retrieved ${publicRes.data.count} public visible cards.`);

  // Step 3: GET /api/cards/all (Admin Protected Endpoint)
  console.log('\n3. Testing Admin GET /api/cards/all...');
  const adminRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/cards/all',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (adminRes.status !== 200 || !adminRes.data.success) {
    throw new Error(`Admin GET all cards failed: ${JSON.stringify(adminRes.data)}`);
  }
  console.log(`   ✓ Admin retrieved ${adminRes.data.count} cards including all sections & drafts.`);

  // Step 4: POST /api/cards (Create New Card)
  console.log('\n4. Testing POST /api/cards (Create Test Card)...');
  const testCardId = `test-card-${Date.now()}`;
  const createRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/cards',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }, {
    id: testCardId,
    name: 'Automated Test Showcase Card',
    section: 'promo-banner',
    title: 'Supercharged Performance Tech',
    subtitle: 'Exclusive Flash Sale',
    description: 'High-end server components and high-speed Wi-Fi 6 hardware with official BD warranty.',
    badge: '30% OFF',
    tagline: 'Official 3-Year BD Warranty',
    price: 15000,
    discountPrice: 10500,
    currency: '৳',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=800&auto=format&fit=crop',
    icon: 'Zap',
    buttonText: 'Claim Discount',
    buttonLink: '/shop?category=networking',
    backgroundColor: '#0f172a',
    textColor: '#ffffff',
    accentColor: '#38bdf8',
    borderColor: '#1e293b',
    borderWidth: '2px',
    borderRadius: '24px',
    shadow: 'lg',
    padding: '32px',
    displayOrder: 99,
    isVisible: true,
    status: 'published',
  });

  if (createRes.status !== 201 || !createRes.data.success) {
    throw new Error(`Create card failed: ${JSON.stringify(createRes.data)}`);
  }
  const createdCard = createRes.data.data;
  console.log(`   ✓ Card created successfully with ID: ${createdCard.id}`);

  // Step 5: PUT /api/cards/:id (Edit Styling, Text, Colors)
  console.log('\n5. Testing PUT /api/cards/:id (Complete Card Editing)...');
  const updateRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/cards/${createdCard.id}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }, {
    title: 'UPDATED: Next-Gen Enterprise Tech',
    subtitle: '40% Special Promotion',
    backgroundColor: '#064e3b',
    accentColor: '#10b981',
    borderRadius: '32px',
    padding: '28px',
    isVisible: false, // test visibility toggle
  });

  if (updateRes.status !== 200 || !updateRes.data.success) {
    throw new Error(`Update card failed: ${JSON.stringify(updateRes.data)}`);
  }
  console.log('   ✓ Card styling, typography, and visibility updated successfully.');

  // Step 6: Verify Single Card Lookup
  console.log('\n6. Testing GET /api/cards/:id (Verify Updated Values)...');
  const getSingleRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/cards/${createdCard.id}`,
    method: 'GET',
  });
  if (getSingleRes.status !== 200 || !getSingleRes.data.success) {
    throw new Error(`Get single card failed: ${JSON.stringify(getSingleRes.data)}`);
  }
  const fetched = getSingleRes.data.data;
  if (fetched.title !== 'UPDATED: Next-Gen Enterprise Tech' || fetched.backgroundColor !== '#064e3b' || fetched.isVisible !== false) {
    throw new Error(`Card values did not match expected updates: ${JSON.stringify(fetched)}`);
  }
  console.log('   ✓ Verified: Title, BackgroundColor, and IsVisible updated accurately.');

  // Step 7: DELETE /api/cards/:id
  console.log('\n7. Testing DELETE /api/cards/:id (Clean up test card)...');
  const deleteRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/cards/${createdCard.id}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (deleteRes.status !== 200 || !deleteRes.data.success) {
    throw new Error(`Delete card failed: ${JSON.stringify(deleteRes.data)}`);
  }
  console.log('   ✓ Test card permanently cleaned up.');

  console.log('\n======================================================');
  console.log('✅ ALL CARD MANAGEMENT INTEGRATION TESTS PASSED 100%!');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('\n❌ Test Suite Failed:', err.message);
  process.exit(1);
});
