import { app } from '../server/app.ts';
import { connectDB, isDbConnected } from '../server/config/db.ts';
import { generateToken } from '../server/middleware/auth.ts';
import { Product } from '../server/models/Product.ts';
import http from 'http';

async function runTestSuite() {
  console.log('--- Starting My Computer Upload & Product Test Suite ---');
  
  // 1. Connect to Database
  await connectDB();
  console.log('[Test Setup] MongoDB Atlas Connected:', isDbConnected());

  // 2. Start HTTP Server on port 5999
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(5999, resolve));
  const baseUrl = 'http://localhost:5999';
  console.log(`[Test Setup] Test server listening on ${baseUrl}`);

  // 3. Generate Valid Admin Token
  const token = generateToken({
    userId: 'test-admin-uid-1',
    email: 'admin@mycomputer.com.bd',
    role: 'admin',
  });

  let allPassed = true;
  const testResults: Record<string, boolean> = {};

  try {
    // ── TEST 1: Upload single image via multipart/form-data ──
    console.log('\n[TEST 1] Single image upload via multipart/form-data...');
    const fakePng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    const formData1 = new FormData();
    formData1.append('image', new Blob([fakePng], { type: 'image/png' }), 'test-sample.png');

    const res1 = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData1,
    });
    const text1 = await res1.text();
    let data1: any = null;
    try {
      data1 = JSON.parse(text1);
    } catch {
      console.error('[TEST 1 FAILED]: Server did not return valid JSON:', text1);
    }

    if (res1.status === 201 && data1?.success && data1?.url && data1?.fileUrl) {
      console.log('✓ TEST 1 PASSED: Uploaded image successfully ->', data1.fileUrl);
      testResults['Test 1: Single Multipart Upload'] = true;
    } else {
      console.error('✗ TEST 1 FAILED:', res1.status, data1);
      allPassed = false;
      testResults['Test 1: Single Multipart Upload'] = false;
    }

    const uploadedImageUrl = data1?.fileUrl || '/uploads/test.png';

    // ── TEST 2: Upload multiple images via multipart/form-data ──
    console.log('\n[TEST 2] Multiple images upload via multipart/form-data...');
    const formData2 = new FormData();
    formData2.append('image', new Blob([fakePng], { type: 'image/png' }), 'multi-1.png');
    formData2.append('image', new Blob([fakePng], { type: 'image/png' }), 'multi-2.png');

    const res2 = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData2,
    });
    const data2 = await res2.json();

    if (res2.status === 201 && data2?.success && Array.isArray(data2?.files) && data2.files.length === 2) {
      console.log('✓ TEST 2 PASSED: Uploaded multiple images successfully -> count:', data2.files.length);
      testResults['Test 2: Multiple Images Upload'] = true;
    } else {
      console.error('✗ TEST 2 FAILED:', res2.status, data2);
      allPassed = false;
      testResults['Test 2: Multiple Images Upload'] = false;
    }

    // ── TEST 3: Base64 JSON image upload ──
    console.log('\n[TEST 3] Base64 image upload as JSON payload...');
    const res3 = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        base64Data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      }),
    });
    const data3 = await res3.json();

    if (res3.status === 201 && data3?.success && data3?.fileUrl) {
      console.log('✓ TEST 3 PASSED: Base64 upload successful ->', data3.fileUrl);
      testResults['Test 3: Base64 JSON Upload'] = true;
    } else {
      console.error('✗ TEST 3 FAILED:', res3.status, data3);
      allPassed = false;
      testResults['Test 3: Base64 JSON Upload'] = false;
    }

    // ── TEST 4: Upload without auth token (Expected 401 Valid JSON) ──
    console.log('\n[TEST 4] Upload without authentication token (Expect 401 Valid JSON)...');
    const formData4 = new FormData();
    formData4.append('image', new Blob([fakePng], { type: 'image/png' }), 'no-auth.png');

    const res4 = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      body: formData4,
    });
    const text4 = await res4.text();
    let data4: any = null;
    try {
      data4 = JSON.parse(text4);
    } catch {
      console.error('[TEST 4 FAILED]: Non-JSON response received on 401');
    }

    if (res4.status === 401 && data4?.success === false && data4?.error) {
      console.log('✓ TEST 4 PASSED: Rejected unauthenticated upload with valid JSON error ->', data4.error);
      testResults['Test 4: Auth Protection (Valid 401 JSON)'] = true;
    } else {
      console.error('✗ TEST 4 FAILED:', res4.status, data4);
      allPassed = false;
      testResults['Test 4: Auth Protection (Valid 401 JSON)'] = false;
    }

    // ── TEST 5: Upload invalid file type (Expect 400 Valid JSON) ──
    console.log('\n[TEST 5] Upload invalid file type text/plain (Expect 400 Valid JSON)...');
    const formData5 = new FormData();
    formData5.append('image', new Blob(['Hello World text file'], { type: 'text/plain' }), 'malicious.txt');

    const res5 = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData5,
    });
    const data5 = await res5.json();

    if (res5.status === 400 && data5?.success === false && data5?.error) {
      console.log('✓ TEST 5 PASSED: Rejected invalid file type with valid JSON error ->', data5.error);
      testResults['Test 5: File Type Validation (Valid 400 JSON)'] = true;
    } else {
      console.error('✗ TEST 5 FAILED:', res5.status, data5);
      allPassed = false;
      testResults['Test 5: File Type Validation (Valid 400 JSON)'] = false;
    }

    // ── TEST 6: Unknown API route (Catch-all 404 Valid JSON) ──
    console.log('\n[TEST 6] Non-existent route /api/random_route_xyz (Expect 404 Valid JSON)...');
    const res6 = await fetch(`${baseUrl}/api/random_route_xyz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 123 }),
    });
    const text6 = await res6.text();
    let data6: any = null;
    try {
      data6 = JSON.parse(text6);
    } catch {
      console.error('[TEST 6 FAILED]: Catch-all did not return JSON:', text6);
    }

    if (res6.status === 404 && data6?.success === false && data6?.error) {
      console.log('✓ TEST 6 PASSED: Catch-all 404 returned valid JSON error ->', data6.error);
      testResults['Test 6: Catch-all 404 Valid JSON'] = true;
    } else {
      console.error('✗ TEST 6 FAILED:', res6.status, data6);
      allPassed = false;
      testResults['Test 6: Catch-all 404 Valid JSON'] = false;
    }

    // ── TEST 7: Create Product via POST /api/products with uploaded image ──
    console.log('\n[TEST 7] Create new product via POST /api/products...');
    const testProductId = `prod-audit-${Date.now()}`;
    const newProductPayload = {
      productId: testProductId,
      id: testProductId,
      name: 'Audit Pro Gaming Mouse 16000 DPI',
      slug: `audit-pro-gaming-mouse-${Date.now()}`,
      category: 'accessories',
      categoryName: 'Accessories',
      subcategory: 'Gaming Mouse',
      brand: 'Razer',
      price: 4500,
      regularPrice: 4500,
      salePrice: 4500,
      discountPrice: 4500,
      stock: 25,
      stockCount: 25,
      availability: 'In Stock',
      image: uploadedImageUrl,
      images: [uploadedImageUrl],
      shortSpecs: ['16000 DPI Optical Sensor', 'RGB Chroma', '6 Programmable Buttons'],
      description: 'High performance gaming mouse verified during upload system audit.',
    };

    const res7 = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newProductPayload),
    });
    const data7 = await res7.json();

    if (res7.status === 201 && data7?.success && data7?.product?.productId === testProductId) {
      console.log('✓ TEST 7 PASSED: Product created successfully in DB ->', data7.product.name);
      testResults['Test 7: Product Creation API'] = true;
    } else {
      console.error('✗ TEST 7 FAILED:', res7.status, data7);
      allPassed = false;
      testResults['Test 7: Product Creation API'] = false;
    }

    // ── TEST 8: Update Product Image & Stock via PUT /api/admin/products/:id (THE PREVIOUSLY FAILING ROUTE) ──
    console.log('\n[TEST 8] Update product image and stock via PUT /api/admin/products/:id...');
    const newImageUrl = data3?.fileUrl || '/uploads/replaced-image.png';
    const res8 = await fetch(`${baseUrl}/api/admin/products/${testProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        image: newImageUrl,
        images: [newImageUrl, uploadedImageUrl],
        stock: 35,
        price: 4200,
        regularPrice: 4200,
      }),
    });
    const text8 = await res8.text();
    let data8: any = null;
    try {
      data8 = JSON.parse(text8);
    } catch {
      console.error('[TEST 8 FAILED]: Server did not return JSON (Unexpected end of JSON input would occur here!):', text8);
    }

    if (res8.status === 200 && data8?.success && (data8?.product?.image === newImageUrl || data8?.product?.price === 4200)) {
      console.log('✓ TEST 8 PASSED: /api/admin/products/:id PUT succeeded with valid JSON ->', data8.message);
      testResults['Test 8: Admin Product Update Route'] = true;
    } else {
      console.error('✗ TEST 8 FAILED:', res8.status, data8);
      allPassed = false;
      testResults['Test 8: Admin Product Update Route'] = false;
    }

    // ── TEST 9: Fetch Product to Verify DB Synchronization ──
    console.log('\n[TEST 9] Verify updated product in database...');
    const res9 = await fetch(`${baseUrl}/api/products/${testProductId}`);
    const data9 = await res9.json();

    if (res9.status === 200 && data9?.success && data9?.product?.image === newImageUrl && data9?.product?.price === 4200) {
      console.log('✓ TEST 9 PASSED: Database synchronization verified. Image and price properly updated.');
      testResults['Test 9: Database Synchronization'] = true;
    } else {
      console.error('✗ TEST 9 FAILED:', res9.status, data9);
      allPassed = false;
      testResults['Test 9: Database Synchronization'] = false;
    }

    // ── TEST 10: Delete Test Product via DELETE /api/admin/products/:id ──
    console.log('\n[TEST 10] Clean up test product via DELETE /api/admin/products/:id...');
    const res10 = await fetch(`${baseUrl}/api/admin/products/${testProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data10 = await res10.json();

    if (res10.status === 200 && data10?.success) {
      console.log('✓ TEST 10 PASSED: Test product cleanly removed from database.');
      testResults['Test 10: Clean Removal'] = true;
    } else {
      console.error('✗ TEST 10 FAILED:', res10.status, data10);
      allPassed = false;
      testResults['Test 10: Clean Removal'] = false;
    }

  } catch (err: any) {
    console.error('[Suite Exception]:', err);
    allPassed = false;
  } finally {
    server.close();
    console.log('\n================ TEST SUMMARY ================');
    for (const [testName, passed] of Object.entries(testResults)) {
      console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${testName}`);
    }
    console.log('==============================================');
    console.log(allPassed ? '>>> ALL 10 TESTS PASSED PERFECTLY <<<' : '>>> SOME TESTS FAILED <<<');
    process.exit(allPassed ? 0 : 1);
  }
}

runTestSuite();
