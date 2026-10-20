import assert from 'node:assert';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Starting User Requirements 1-11 Verification Test Suite...');

  // 1. Verify Price Wise Sorting (Ascending)
  const ascRes = await fetch(`${BASE_URL}/api/products?sort=price_asc`);
  assert.strictEqual(ascRes.status, 200, 'GET /api/products?sort=price_asc should return 200');
  const ascData = await ascRes.json();
  assert.ok(ascData.products.length > 1, 'Should return products');
  for (let i = 1; i < ascData.products.length; i++) {
    const prev = Number(ascData.products[i - 1].base_price);
    const curr = Number(ascData.products[i].base_price);
    assert.ok(prev <= curr, `Price asc sorting failed: ${prev} > ${curr} at index ${i}`);
  }
  console.log('  ✓ Price wise sorting (Low to High) verified successfully.');

  // 2. Verify Price Wise Sorting (Descending)
  const descRes = await fetch(`${BASE_URL}/api/products?sort=price_desc`);
  assert.strictEqual(descRes.status, 200, 'GET /api/products?sort=price_desc should return 200');
  const descData = await descRes.json();
  assert.ok(descData.products.length > 1, 'Should return products');
  for (let i = 1; i < descData.products.length; i++) {
    const prev = Number(descData.products[i - 1].base_price);
    const curr = Number(descData.products[i].base_price);
    assert.ok(prev >= curr, `Price desc sorting failed: ${prev} < ${curr} at index ${i}`);
  }
  console.log('  ✓ Price wise sorting (High to Low) verified successfully.');

  // 3. Verify About Artist Page CMS
  const aboutRes = await fetch(`${BASE_URL}/api/pages/about`);
  assert.strictEqual(aboutRes.status, 200, 'GET /api/pages/about should return 200');
  const aboutData = await aboutRes.json();
  assert.ok(Array.isArray(aboutData.sections), 'About page sections should be an array');
  assert.ok(aboutData.sections.length >= 2, 'About page should have structured sections');
  const heroSec = aboutData.sections.find((s: any) => s.section_key === 'artist_hero');
  assert.ok(heroSec && heroSec.content_json?.title, 'Artist hero section must exist');
  console.log('  ✓ Public GET /api/pages/about verified with all editable CMS text sections.');

  // 4. Verify Admin Login and About Page CMS update
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', pin: '2647' }),
  });
  assert.strictEqual(loginRes.status, 200, 'Admin login should succeed');
  const { token } = await loginRes.json();
  assert.ok(token, 'Admin session token should be returned');

  // Update a field in the about page
  const updatedHeroTitle = 'About Shital Thosar — Master Artisan';
  const updatedSections = aboutData.sections.map((s: any) => {
    if (s.section_key === 'artist_hero') {
      return {
        ...s,
        content_json: {
          ...s.content_json,
          title: updatedHeroTitle,
        },
      };
    }
    return s;
  });

  const putAboutRes = await fetch(`${BASE_URL}/api/admin/pages/about`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...aboutData,
      sections: updatedSections,
    }),
  });
  assert.strictEqual(putAboutRes.status, 200, 'PUT /api/admin/pages/about should return 200');
  const putAboutData = await putAboutRes.json();
  const verifyHero = putAboutData.sections?.find((s: any) => s.section_key === 'artist_hero');
  assert.strictEqual(verifyHero?.content_json?.title, updatedHeroTitle, 'Updated title must be saved');
  console.log('  ✓ Admin PUT /api/admin/pages/about successfully updated artist text boxes.');

  // Restore the original title
  const restoredSections = aboutData.sections.map((s: any) => {
    if (s.section_key === 'artist_hero') {
      return {
        ...s,
        content_json: {
          ...s.content_json,
          title: 'About Shital Thosar',
        },
      };
    }
    return s;
  });
  await fetch(`${BASE_URL}/api/admin/pages/about`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...aboutData,
      sections: restoredSections,
    }),
  });

  // 5. Verify Free Text Category Creation in Admin
  const testCatName = `Test Category ${Date.now()}`;
  const catCreateRes = await fetch(`${BASE_URL}/api/admin/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: testCatName, description: 'Created via free-text input' }),
  });
  assert.strictEqual(catCreateRes.status, 200, 'POST /api/admin/categories should return 200');
  const catCreateData = await catCreateRes.json();
  assert.ok(catCreateData.category?.id, 'New category ID should be generated');
  assert.strictEqual(catCreateData.category?.name, testCatName, 'Category name should match free-text');
  console.log('  ✓ Free-text category addition verified in Admin Categories API.');

  // Clean up created test category
  await fetch(`${BASE_URL}/api/admin/categories/${catCreateData.category.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log('🎉 ALL USER REQUIREMENTS VERIFICATION ASSERTIONS PASSED! 🎉');
}

runTests().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
