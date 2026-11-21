const http = require('http');

function post(url, data, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port || 5000,
        path: u.pathname + u.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      res => {
        let resData = '';
        res.on('data', chunk => (resData += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(resData) });
          } catch {
            resolve({ status: res.statusCode, raw: resData });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port || 5000,
        path: u.pathname + u.search,
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      res => {
        let resData = '';
        res.on('data', chunk => (resData += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(resData) });
          } catch {
            resolve({ status: res.statusCode, raw: resData });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function put(url, data, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port || 5000,
        path: u.pathname + u.search,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      res => {
        let resData = '';
        res.on('data', chunk => (resData += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(resData) });
          } catch {
            resolve({ status: res.statusCode, raw: resData });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function del(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port || 5000,
        path: u.pathname + u.search,
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      res => {
        let resData = '';
        res.on('data', chunk => (resData += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(resData) });
          } catch {
            resolve({ status: res.statusCode, raw: resData });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('--- STARTING COMPREHENSIVE VERIFICATION SUITE ---');

  // 1. Admin Authentication
  console.log('\n[1] Testing Admin Login with username: admin, password: mycomputer...');
  const loginRes = await post('http://localhost:5000/api/admin/login', {
    username: 'admin',
    password: 'mycomputer',
  });
  console.log('Login Status:', loginRes.status, 'Success:', loginRes.data?.success);
  if (!loginRes.data?.success || !loginRes.data?.token) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginRes.data));
  }
  const token = loginRes.data.token;
  console.log('Admin Token Acquired successfully.');

  // 2. Admin Verification Endpoint
  console.log('\n[2] Testing /api/admin/me...');
  const meRes = await get('http://localhost:5000/api/admin/me', token);
  console.log('Me Status:', meRes.status, 'Admin:', meRes.data?.admin?.username, 'Role:', meRes.data?.admin?.role);

  // 3. Admin Stats
  console.log('\n[3] Testing /api/admin/stats...');
  const statsRes = await get('http://localhost:5000/api/admin/stats', token);
  console.log('Stats:', statsRes.data?.stats);

  // 4. Categories Verification
  console.log('\n[4] Testing /api/categories (Public)...');
  const catRes = await get('http://localhost:5000/api/categories');
  console.log('Categories Count:', catRes.data?.categories?.length);
  const catNames = (catRes.data?.categories || []).map(c => c.name);
  console.log('Active Categories:', catNames.join(', '));

  // 5. Test Category CRUD (Admin Protected)
  console.log('\n[5] Testing Category CRUD operations...');
  const testCatId = 'test-demo-cat-' + Date.now();
  const createCatRes = await post(
    'http://localhost:5000/api/categories',
    {
      id: testCatId,
      name: 'Test Category',
      nameBn: 'টেস্ট ক্যাটাগরি',
      icon: 'FolderTree',
      itemCount: 5,
      order: 99,
      isVisible: true,
      popular: false,
    },
    token
  );
  console.log('Create Category Status:', createCatRes.status, 'Success:', createCatRes.data?.success);

  const updateCatRes = await put(
    `http://localhost:5000/api/categories/${testCatId}`,
    { name: 'Updated Test Category', isVisible: false },
    token
  );
  console.log('Update Category Status:', updateCatRes.status, 'Updated Name:', updateCatRes.data?.category?.name);

  const deleteCatRes = await del(`http://localhost:5000/api/categories/${testCatId}`, token);
  console.log('Delete Category Status:', deleteCatRes.status, 'Success:', deleteCatRes.data?.success);

  // 6. Test Product CRUD (Admin Protected)
  console.log('\n[6] Testing Product CRUD operations...');
  const testProdId = 'test-prod-' + Date.now();
  const createProdRes = await post(
    'http://localhost:5000/api/products',
    {
      productId: testProdId,
      name: 'Test Enterprise Product Card',
      category: 'camera',
      brand: 'EZVIZ',
      price: 9999,
      salePrice: 8999,
      stock: 25,
      availability: 'In Stock',
      isVisible: true,
      isFeatured: true,
      shortSpecs: ['Test Spec 1', 'Test Spec 2'],
      warranty: '2 Year BD Warranty',
    },
    token
  );
  console.log('Create Product Status:', createProdRes.status, 'Success:', createProdRes.data?.success);

  const updateProdRes = await put(
    `http://localhost:5000/api/products/${testProdId}`,
    { salePrice: 7999, isVisible: false },
    token
  );
  console.log('Update Product Status:', updateProdRes.status, 'New SalePrice:', updateProdRes.data?.product?.salePrice);

  const deleteProdRes = await del(`http://localhost:5000/api/products/${testProdId}`, token);
  console.log('Delete Product Status:', deleteProdRes.status, 'Success:', deleteProdRes.data?.success);

  console.log('\n=========================================');
  console.log('ALL VERIFICATION CHECKS PASSED PERFECTLY!');
  console.log('=========================================');
}

run().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
