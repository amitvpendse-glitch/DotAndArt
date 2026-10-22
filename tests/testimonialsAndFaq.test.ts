import assert from 'node:assert';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Starting FAQs and Testimonials Verification Test Suite...');

  // -------------------------------------------------------------
  // 1. Verify FAQ Page has at least 10 FAQs
  // -------------------------------------------------------------
  const faqRes = await fetch(`${BASE_URL}/api/faqs`);
  assert.strictEqual(faqRes.status, 200, 'GET /api/faqs should return 200');
  const faqs = await faqRes.json();
  assert.ok(Array.isArray(faqs), 'FAQs response must be an array');
  assert.ok(
    faqs.length >= 10,
    `Expected at least 10 FAQs on FAQ page, received ${faqs.length}`
  );

  // Check each FAQ structure
  for (const f of faqs) {
    assert.ok(f.question && f.question.trim().length > 5, 'FAQ must have non-empty question');
    assert.ok(f.answer && f.answer.trim().length > 10, 'FAQ must have detailed answer');
    assert.ok(f.category, 'FAQ must have category');
    assert.strictEqual(f.is_published, true, 'Returned FAQs should be published');
  }
  console.log(`  ✓ 10 FAQs verified on the FAQ endpoint (Total returned: ${faqs.length}).`);

  // -------------------------------------------------------------
  // 2. Verify Initial Dummy Testimonials on Testimonials Page
  // -------------------------------------------------------------
  const testRes = await fetch(`${BASE_URL}/api/testimonials`);
  assert.strictEqual(testRes.status, 200, 'GET /api/testimonials should return 200');
  const initialTestimonials = await testRes.json();
  assert.ok(Array.isArray(initialTestimonials), 'Testimonials must be an array');
  assert.ok(
    initialTestimonials.length >= 3,
    `Expected dummy testimonials to be populated, found ${initialTestimonials.length}`
  );
  console.log(`  ✓ Dummy testimonials verified on Testimonials endpoint (${initialTestimonials.length} testimonials present).`);

  // -------------------------------------------------------------
  // 3. Allow ANY public user to submit a new real testimonial
  // -------------------------------------------------------------
  const uniqueName = `Art Enthusiast ${Date.now()}`;
  const publicReviewContent = 'The dot art mandala arrived in perfect condition. The symmetry and vibrant colors are magnificent!';

  const submitRes = await fetch(`${BASE_URL}/api/testimonials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: uniqueName,
      content: publicReviewContent,
      rating: 5,
      location: 'Pune, Maharashtra',
      artwork_purchased: '24-Inch Sacred Lotus Mandala',
    }),
  });

  assert.strictEqual(submitRes.status, 201, 'Public POST /api/testimonials should return 201 Created');
  const submitData = await submitRes.json();
  assert.strictEqual(submitData.success, true, 'Public submission should be successful');
  assert.ok(submitData.testimonial?.id, 'New testimonial must have an ID');
  assert.strictEqual(submitData.testimonial?.customer_name, uniqueName);
  const createdTestimonialId = submitData.testimonial.id;
  console.log('  ✓ Public user successfully submitted a new real testimonial without admin login.');

  // Verify the new testimonial now appears in public GET /api/testimonials
  const afterSubmitRes = await fetch(`${BASE_URL}/api/testimonials`);
  const afterSubmitData = await afterSubmitRes.json();
  const foundNew = afterSubmitData.find((t: any) => t.id === createdTestimonialId);
  assert.ok(foundNew, 'Newly created public testimonial must appear in public testimonials feed');
  assert.strictEqual(foundNew.customer_name, uniqueName);
  console.log('  ✓ Newly submitted testimonial is immediately visible in public testimonials feed.');

  // -------------------------------------------------------------
  // 4. Unauthorized User Cannot Edit or Delete Testimonials
  // -------------------------------------------------------------
  const unauthEditRes = await fetch(`${BASE_URL}/api/testimonials/${createdTestimonialId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer_name: 'Hacked Name' }),
  });
  assert.strictEqual(unauthEditRes.status, 401, 'Public PUT /api/testimonials/:id must return 401 Unauthorized');

  const unauthDelRes = await fetch(`${BASE_URL}/api/testimonials/${createdTestimonialId}`, {
    method: 'DELETE',
  });
  assert.strictEqual(unauthDelRes.status, 401, 'Public DELETE /api/testimonials/:id must return 401 Unauthorized');
  console.log('  ✓ Non-admin editing and deleting correctly blocked (401 Unauthorized).');

  // -------------------------------------------------------------
  // 5. Admin Authentication & Management: Edit Testimonial
  // -------------------------------------------------------------
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', pin: '2647' }),
  });
  assert.strictEqual(loginRes.status, 200, 'Admin login should succeed');
  const { token } = await loginRes.json();
  assert.ok(token, 'Admin token required');

  const editedName = `Verified Collector ${Date.now()}`;
  const adminEditRes = await fetch(`${BASE_URL}/api/admin/testimonials/${createdTestimonialId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      customer_name: editedName,
      content: 'Updated content verified by studio admin.',
      rating: 5,
    }),
  });
  assert.strictEqual(adminEditRes.status, 200, 'Admin PUT /api/admin/testimonials/:id should return 200');
  const editedData = await adminEditRes.json();
  assert.strictEqual(editedData.customer_name, editedName);
  console.log('  ✓ Admin successfully edited testimonial.');

  // -------------------------------------------------------------
  // 6. Admin Authentication & Management: Delete Testimonial
  // -------------------------------------------------------------
  const adminDelRes = await fetch(`${BASE_URL}/api/admin/testimonials/${createdTestimonialId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  assert.strictEqual(adminDelRes.status, 200, 'Admin DELETE /api/admin/testimonials/:id should return 200');

  // Verify deletion
  const verifyDelRes = await fetch(`${BASE_URL}/api/testimonials`);
  const verifyDelData = await verifyDelRes.json();
  const deletedStillExists = verifyDelData.some((t: any) => t.id === createdTestimonialId);
  assert.strictEqual(deletedStillExists, false, 'Deleted testimonial must no longer exist');
  console.log('  ✓ Admin successfully deleted testimonial.');

  // -------------------------------------------------------------
  // 7. Admin can also directly create testimonials
  // -------------------------------------------------------------
  const adminDirectName = `VIP Client ${Date.now()}`;
  const adminAddRes = await fetch(`${BASE_URL}/api/admin/testimonials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      customer_name: adminDirectName,
      content: 'Bespoke corporate installation for our headquarters lobby.',
      rating: 5,
      location: 'Dubai, UAE',
      artwork_purchased: '36-Inch Custom Lippan & Mirror Installation',
      is_published: true,
    }),
  });
  assert.strictEqual(adminAddRes.status, 200, 'Admin POST /api/admin/testimonials should return 200');
  const adminAddData = await adminAddRes.json();
  assert.ok(adminAddData.id, 'Admin created testimonial must have an ID');
  console.log('  ✓ Admin successfully added official testimonial.');

  // Clean up the created test item
  await fetch(`${BASE_URL}/api/admin/testimonials/${adminAddData.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log('🎉 ALL 10 FAQS AND TESTIMONIAL PERMISSION TESTS PASSED! 🎉');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
