import assert from 'node:assert';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Starting Contact Info & Social Links Update Test Suite...');

  // 1. Initial GET check
  const initRes = await fetch(`${BASE_URL}/api/settings`);
  assert.strictEqual(initRes.status, 200, 'GET /api/settings should return 200 OK');
  const initSettings = await initRes.json();
  console.log('  ✓ Verified GET /api/settings endpoint is responsive.');

  // 2. Test updating via Admin Settings API
  const testInstagram = 'https://www.instagram.com/sathosar';
  const testFacebook = 'https://www.facebook.com/people/Dot-And-Art/61570301135652/';
  const testAddress = 'Pune, Maharashtra, India';

  // Login as Admin to obtain session/token
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', pin: '2647' }),
  });
  assert.strictEqual(loginRes.status, 200, 'Admin login should succeed with valid PIN');
  const { token } = await loginRes.json();
  assert.ok(token, 'Admin token should be returned upon successful login');
  console.log('  ✓ Admin authentication verified successfully.');

  // 3. Update Settings via PUT /api/admin/settings
  const updateSettingsPayload = {
    ...initSettings,
    instagram_url: testInstagram,
    facebook_url: testFacebook,
    studio_address: testAddress,
  };

  const putSettingsRes = await fetch(`${BASE_URL}/api/admin/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updateSettingsPayload),
  });
  assert.strictEqual(putSettingsRes.status, 200, 'PUT /api/admin/settings should return 200 OK');
  const updatedSettings = await putSettingsRes.json();
  assert.strictEqual(updatedSettings.instagram_url, testInstagram, 'Instagram URL should be updated');
  assert.strictEqual(updatedSettings.facebook_url, testFacebook, 'Facebook URL should be updated');
  assert.strictEqual(updatedSettings.studio_address, testAddress, 'Studio address should be updated');
  console.log('  ✓ PUT /api/admin/settings correctly persisted updated social links.');

  // 4. Verify public GET /api/settings returns updated settings
  const publicRes = await fetch(`${BASE_URL}/api/settings`);
  const publicSettings = await publicRes.json();
  assert.strictEqual(publicSettings.instagram_url, testInstagram, 'Public GET /api/settings should reflect updated instagram_url');
  assert.strictEqual(publicSettings.facebook_url, testFacebook, 'Public GET /api/settings should reflect updated facebook_url');
  assert.strictEqual(publicSettings.studio_address, testAddress, 'Public GET /api/settings should reflect updated studio_address');
  console.log('  ✓ Public GET /api/settings confirmed live reflection.');

  // 5. Test updating Contact Page CMS via PUT /api/admin/pages/contact
  const contactPageRes = await fetch(`${BASE_URL}/api/pages/contact`);
  const contactPage = await contactPageRes.json();

  const brandSecIdx = (contactPage.sections || []).findIndex((s: any) => s.section_key === 'brand_identity' || s.section_type === 'brand_identity');
  const updatedSections = Array.isArray(contactPage.sections) ? [...contactPage.sections] : [];
  const brandPayload = {
    business_name: 'Dot And Art Studio',
    tagline: 'Handcrafted Authentic Mandalas & Lippan Mirror Art',
    whatsapp_number: '+918652162647',
    whatsapp_display: '+91 86521 62647',
    email: 'shitalthosar@yahoo.com',
    studio_address: testAddress,
    instagram_url: testInstagram,
    facebook_url: testFacebook,
    domain: 'dotandart.in',
  };

  if (brandSecIdx >= 0) {
    updatedSections[brandSecIdx].content_json = {
      ...(updatedSections[brandSecIdx].content_json || {}),
      ...brandPayload,
    };
  } else {
    updatedSections.push({
      id: 'sec-contact-brand',
      page_id: contactPage.id,
      section_type: 'brand_identity',
      section_key: 'brand_identity',
      content_json: brandPayload,
      display_order: updatedSections.length + 1,
      is_visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  const putPageRes = await fetch(`${BASE_URL}/api/admin/pages/contact`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: contactPage.title,
      seo_title: contactPage.seo_title,
      meta_description: contactPage.meta_description,
      status: 'published',
      sections: updatedSections,
      settings: updateSettingsPayload,
    }),
  });
  assert.strictEqual(putPageRes.status, 200, 'PUT /api/admin/pages/contact should return 200 OK');
  console.log('  ✓ Contact page CMS updated via PUT /api/admin/pages/contact.');

  // 6. Verify public GET /api/pages/contact returns updated brand identity section
  const verifyPageRes = await fetch(`${BASE_URL}/api/pages/contact`);
  const verifyPage = await verifyPageRes.json();
  const verifyBrandSec = (verifyPage.sections || []).find((s: any) => s.section_key === 'brand_identity' || s.section_type === 'brand_identity');
  assert.ok(verifyBrandSec, 'brand_identity section should exist in contact page');
  assert.strictEqual(verifyBrandSec.content_json.instagram_url, testInstagram, 'Contact page brand_identity section should match instagram_url');
  assert.strictEqual(verifyBrandSec.content_json.facebook_url, testFacebook, 'Contact page brand_identity section should match facebook_url');
  console.log('  ✓ Public GET /api/pages/contact verified live brand identity sections.');

  console.log('\n🎉 ALL CONTACT INFO & SOCIAL LINKS TEST ASSERTIONS PASSED! 🎉');
}

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
