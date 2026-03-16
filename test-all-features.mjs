import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./service-account.json', 'utf8'));
const app = initializeApp({ credential: cert(serviceAccount), storageBucket: 'kupiautoba-e7eb5.firebasestorage.app' });
const auth = getAuth(app);
const db = getFirestore(app);

const BASE = 'http://localhost:3002';
let passed = 0;
let failed = 0;
const issues = [];

function ok(name) { passed++; console.log(`  ✅ ${name}`); }
function fail(name, reason) { failed++; issues.push({ name, reason }); console.log(`  ❌ ${name}: ${reason}`); }

async function checkPage(path, expectedTexts = []) {
  try {
    const res = await fetch(`${BASE}${path}`);
    if (res.status !== 200) { fail(`GET ${path}`, `Status ${res.status}`); return null; }
    const html = await res.text();
    for (const text of expectedTexts) {
      if (!html.includes(text)) { fail(`GET ${path}`, `Missing text: "${text}"`); return html; }
    }
    ok(`GET ${path} (${res.status})`);
    return html;
  } catch (e) { fail(`GET ${path}`, e.message); return null; }
}

async function checkAPI(method, path, body, expectedField) {
  try {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BASE}${path}`, opts);
    const data = await res.json();
    if (expectedField && !data[expectedField]) { fail(`${method} ${path}`, `Missing field: ${expectedField}`); return data; }
    ok(`${method} ${path} (${res.status})`);
    return data;
  } catch (e) { fail(`${method} ${path}`, e.message); return null; }
}

async function run() {
  console.log('\n🧪 KUPIAUTO.BA — COMPREHENSIVE FEATURE TEST\n');
  console.log('='.repeat(60));

  // =============================================
  // SECTION 1: ALL PAGES LOAD
  // =============================================
  console.log('\n📄 SECTION 1: Page Loading Tests');
  console.log('-'.repeat(40));
  
  await checkPage('/', ['KupiAuto', 'Popularne marke', 'Istaknuti']);
  await checkPage('/oglasi', ['Pretraga', 'Filteri']);
  await checkPage('/objavi', ['Objavi oglas']);
  await checkPage('/prijava', ['Prijavite se', 'Email', 'Lozinka']);
  await checkPage('/registracija', ['Registrujte se', 'Ime', 'Email']);
  await checkPage('/faq', ['FAQ', 'Kako']);
  await checkPage('/kontakt', ['Kontakt', 'Email']);
  await checkPage('/o-nama', ['O nama', 'KupiAuto']);
  await checkPage('/saloni', ['Salon']);
  await checkPage('/postani-salon', ['salon', 'paket']);
  await checkPage('/uporedi', ['Uporedi']);
  await checkPage('/vin-provjera', ['VIN']);
  await checkPage('/politika-privatnosti', ['Privatnost']);
  await checkPage('/uslovi-koristenja', ['Uslovi']);
  await checkPage('/dashboard', []); // Redirects to login if not auth'd

  // Test dynamic pages
  const listings = await db.collection('listings').limit(1).get();
  if (!listings.empty) {
    const listingId = listings.docs[0].id;
    await checkPage(`/oglas/${listingId}`, []);
  }

  const dealers = await db.collection('dealers').limit(1).get();
  if (!dealers.empty) {
    const dealerId = dealers.docs[0].id;
    await checkPage(`/salon/${dealerId}`, []);
  }

  // 404 page
  const res404 = await fetch(`${BASE}/this-page-does-not-exist`);
  if (res404.status === 404) ok('404 page returns 404');
  else fail('404 page', `Expected 404, got ${res404.status}`);

  // =============================================
  // SECTION 2: API ENDPOINTS
  // =============================================
  console.log('\n🔌 SECTION 2: API Endpoint Tests');
  console.log('-'.repeat(40));

  // Import listing - AutoPlac
  const importResult = await checkAPI('POST', '/api/import-listing', 
    { url: 'https://autoplac.ba/automobil/volkswagen-passat-alltrack-73821/5135' }, 'success');
  if (importResult?.listing) {
    if (importResult.listing.make) ok('Import: make extracted');
    else fail('Import: make', 'Missing');
    if (importResult.listing.price) ok('Import: price extracted');
    else fail('Import: price', 'Missing');
    if (importResult.listing.year) ok('Import: year extracted');
    else fail('Import: year', 'Missing');
    if (importResult.listing.photos?.length > 0) ok('Import: photos extracted');
    else fail('Import: photos', 'Missing or empty');
  }

  // Import - invalid URL
  const badImport = await checkAPI('POST', '/api/import-listing', { url: 'https://google.com' }, 'success');
  if (badImport && !badImport.success) ok('Import: rejects unsupported domain');
  else fail('Import: unsupported domain', 'Should have been rejected');

  // Import - no URL
  const noUrl = await checkAPI('POST', '/api/import-listing', {}, 'error');

  // Search API
  await checkAPI('POST', '/api/search', { query: 'BMW do 50000' }, 'filters');

  // =============================================
  // SECTION 3: FIREBASE AUTH
  // =============================================
  console.log('\n🔐 SECTION 3: Firebase Auth Tests');
  console.log('-'.repeat(40));

  // Verify test accounts exist
  try {
    const seller = await auth.getUserByEmail('test@kupiauto.ba');
    ok(`Seller account exists: ${seller.uid}`);
  } catch { fail('Seller account', 'test@kupiauto.ba not found'); }

  try {
    const buyer = await auth.getUserByEmail('buyer@kupiauto.ba');
    ok(`Buyer account exists: ${buyer.uid}`);
  } catch { fail('Buyer account', 'buyer@kupiauto.ba not found'); }

  try {
    const dealer = await auth.getUserByEmail('salon@kupiauto.ba');
    ok(`Dealer account exists: ${dealer.uid}`);
  } catch { fail('Dealer account', 'salon@kupiauto.ba not found'); }

  // =============================================
  // SECTION 4: FIRESTORE DATA
  // =============================================
  console.log('\n🗄️ SECTION 4: Firestore Data Tests');
  console.log('-'.repeat(40));

  // Users collection
  const usersSnap = await db.collection('users').get();
  if (usersSnap.size >= 3) ok(`Users collection: ${usersSnap.size} users`);
  else fail('Users collection', `Only ${usersSnap.size} users, expected >= 3`);

  // Check user has correct fields
  const userDoc = usersSnap.docs[0];
  const userData = userDoc.data();
  const requiredUserFields = ['uid', 'email', 'displayName', 'isDealer', 'createdAt'];
  const missingUserFields = requiredUserFields.filter(f => userData[f] === undefined);
  if (missingUserFields.length === 0) ok('User document has all required fields');
  else fail('User document', `Missing fields: ${missingUserFields.join(', ')}`);

  // Listings collection
  const listingsSnap = await db.collection('listings').where('status', '==', 'active').get();
  if (listingsSnap.size >= 4) ok(`Listings collection: ${listingsSnap.size} active listings`);
  else fail('Listings collection', `Only ${listingsSnap.size} active listings, expected >= 4`);

  // Check listing has correct fields
  const listingDoc = listingsSnap.docs[0];
  const listingData = listingDoc.data();
  const requiredListingFields = ['userId', 'title', 'make', 'model', 'year', 'mileage', 'fuel', 'price', 'city', 'status', 'createdAt'];
  const missingListingFields = requiredListingFields.filter(f => listingData[f] === undefined);
  if (missingListingFields.length === 0) ok('Listing document has all required fields');
  else fail('Listing document', `Missing fields: ${missingListingFields.join(', ')}`);

  // Check imported listing specifically
  const importedListings = await db.collection('listings').where('importedFrom', '==', 'autoplac.ba').get();
  if (importedListings.size >= 1) ok(`Imported listing from AutoPlac exists`);
  else fail('Imported listing', 'No listing with importedFrom=autoplac.ba');

  // Dealers collection
  const dealersSnap = await db.collection('dealers').get();
  if (dealersSnap.size >= 1) ok(`Dealers collection: ${dealersSnap.size} dealers`);
  else fail('Dealers collection', `Only ${dealersSnap.size} dealers`);

  // Check dealer has correct fields
  if (dealersSnap.size > 0) {
    const dealerData = dealersSnap.docs[0].data();
    const requiredDealerFields = ['businessName', 'city', 'phone', 'package', 'verified'];
    const missingDealerFields = requiredDealerFields.filter(f => dealerData[f] === undefined);
    if (missingDealerFields.length === 0) ok('Dealer document has all required fields');
    else fail('Dealer document', `Missing fields: ${missingDealerFields.join(', ')}`);
  }

  // Conversations collection
  const convsSnap = await db.collection('conversations').get();
  if (convsSnap.size >= 1) ok(`Conversations: ${convsSnap.size} conversation(s)`);
  else fail('Conversations', 'No conversations found');

  // Check messages subcollection
  if (convsSnap.size > 0) {
    const msgsSnap = await db.collection('conversations').doc(convsSnap.docs[0].id).collection('messages').get();
    if (msgsSnap.size >= 3) ok(`Messages: ${msgsSnap.size} messages in conversation`);
    else fail('Messages', `Only ${msgsSnap.size} messages, expected >= 3`);
  }

  // Favorites
  const seller = await auth.getUserByEmail('buyer@kupiauto.ba');
  const favsSnap = await db.collection('users').doc(seller.uid).collection('favorites').get();
  if (favsSnap.size >= 1) ok(`Favorites: ${favsSnap.size} favorite(s) for buyer`);
  else fail('Favorites', 'No favorites found');

  // Saved searches
  const searchesSnap = await db.collection('users').doc(seller.uid).collection('savedSearches').get();
  if (searchesSnap.size >= 1) ok(`Saved searches: ${searchesSnap.size} saved search(es)`);
  else fail('Saved searches', 'No saved searches found');

  // =============================================
  // SECTION 5: SEARCH PARSER
  // =============================================
  console.log('\n🔍 SECTION 5: Search Parser Tests');
  console.log('-'.repeat(40));

  const searchTests = [
    { query: 'BMW X5 do 50000km', expected: { make: true, mileage: true } },
    { query: 'Golf 7 dizel cijena do 20000', expected: { make: true, fuel: true, price: true } },
    { query: 'Audi A4 2019 Sarajevo', expected: { make: true, year: true } },
    { query: 'mercedes do 30000 KM', expected: { make: true, price: true } },
  ];

  for (const test of searchTests) {
    const result = await checkAPI('POST', '/api/search', { query: test.query }, 'filters');
    if (result?.filters) {
      const filters = result.filters;
      if (test.expected.make && filters.make) ok(`Search "${test.query}": make detected`);
      else if (test.expected.make) fail(`Search "${test.query}"`, 'make not detected');
    }
  }

  // =============================================
  // SECTION 6: ACCOUNT SYSTEM VERIFICATION
  // =============================================
  console.log('\n👤 SECTION 6: Account System Verification');
  console.log('-'.repeat(40));

  // Verify SINGLE account type (no seller/buyer split)
  const allUsers = await db.collection('users').get();
  let hasWrongAccountType = false;
  for (const userDoc of allUsers.docs) {
    const data = userDoc.data();
    if (data.accountType && (data.accountType === 'seller' || data.accountType === 'buyer')) {
      hasWrongAccountType = true;
      break;
    }
  }
  if (!hasWrongAccountType) ok('No seller/buyer account split — single account type ✓');
  else fail('Account types', 'Found seller/buyer split — should be single account');

  // Verify isDealer flag exists
  let allHaveDealerFlag = true;
  for (const userDoc of allUsers.docs) {
    const data = userDoc.data();
    if (data.isDealer === undefined) { allHaveDealerFlag = false; break; }
  }
  if (allHaveDealerFlag) ok('All users have isDealer flag');
  else fail('isDealer flag', 'Some users missing isDealer field');

  // =============================================
  // SECTION 7: LISTING CRUD OPERATIONS
  // =============================================
  console.log('\n📝 SECTION 7: Listing CRUD Tests');
  console.log('-'.repeat(40));

  // Create a test listing
  const testSeller = await auth.getUserByEmail('test@kupiauto.ba');
  const newListing = {
    userId: testSeller.uid,
    title: 'TEST - Opel Astra 2015',
    make: 'Opel',
    model: 'Astra',
    year: 2015,
    mileage: 145000,
    fuel: 'dizel',
    transmission: 'manuelni',
    body: 'hatchback',
    color: 'Siva',
    power: 81,
    engineSize: 1598,
    price: 14500,
    currency: 'KM',
    description: 'Test listing za provjeru CRUD operacija',
    equipment: ['Klima', 'ABS'],
    photos: [],
    city: 'Tuzla',
    region: 'Tuzlanski kanton',
    status: 'active',
    views: 0,
    favorites: 0,
    sellerName: 'Test Korisnik',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const ref = await db.collection('listings').add(newListing);
    ok(`Create listing: ${ref.id}`);

    // Read it back
    const readBack = await db.collection('listings').doc(ref.id).get();
    if (readBack.exists && readBack.data().title === 'TEST - Opel Astra 2015') ok('Read listing back');
    else fail('Read listing', 'Data mismatch');

    // Update it
    await db.collection('listings').doc(ref.id).update({ price: 13500 });
    const updated = await db.collection('listings').doc(ref.id).get();
    if (updated.data().price === 13500) ok('Update listing price');
    else fail('Update listing', 'Price not updated');

    // Delete it (soft delete)
    await db.collection('listings').doc(ref.id).update({ status: 'deleted' });
    const deleted = await db.collection('listings').doc(ref.id).get();
    if (deleted.data().status === 'deleted') ok('Soft delete listing');
    else fail('Soft delete', 'Status not changed');

    // Clean up
    await db.collection('listings').doc(ref.id).delete();
    ok('Hard delete test listing (cleanup)');
  } catch (e) {
    fail('CRUD operations', e.message);
  }

  // =============================================
  // SECTION 8: MESSAGING SYSTEM
  // =============================================
  console.log('\n💬 SECTION 8: Messaging System Tests');
  console.log('-'.repeat(40));

  try {
    const sellerUid = (await auth.getUserByEmail('test@kupiauto.ba')).uid;
    const buyerUid = (await auth.getUserByEmail('buyer@kupiauto.ba')).uid;

    // Find existing conversation
    const existingConvs = await db.collection('conversations')
      .where('participants', 'array-contains', sellerUid).get();
    
    if (existingConvs.size > 0) {
      ok('Existing conversation found');
      
      const conv = existingConvs.docs[0];
      const convData = conv.data();
      
      // Check conversation structure
      if (convData.participants && convData.participants.length === 2) ok('Conversation has 2 participants');
      else fail('Conversation participants', 'Wrong participant count');

      if (convData.listingTitle) ok('Conversation has listing reference');
      else fail('Conversation listing', 'Missing listingTitle');

      if (convData.lastMessage) ok('Conversation has lastMessage');
      else fail('Conversation lastMessage', 'Missing');

      // Send a new test message
      await db.collection('conversations').doc(conv.id).collection('messages').add({
        senderId: sellerUid,
        text: 'Test poruka za provjeru sistema - ' + new Date().toISOString(),
        createdAt: new Date(),
        read: false,
      });
      await db.collection('conversations').doc(conv.id).update({
        lastMessage: 'Test poruka za provjeru sistema',
        lastMessageAt: new Date(),
      });
      ok('New message sent successfully');

      // Verify message count increased
      const msgs = await db.collection('conversations').doc(conv.id).collection('messages').get();
      if (msgs.size >= 4) ok(`Total messages: ${msgs.size}`);
      else fail('Message count', `Expected >= 4, got ${msgs.size}`);
    } else {
      fail('Messaging', 'No conversations found');
    }
  } catch (e) {
    fail('Messaging system', e.message);
  }

  // =============================================
  // SUMMARY
  // =============================================
  console.log('\n' + '='.repeat(60));
  console.log(`\n🏁 TEST RESULTS: ${passed} passed, ${failed} failed\n`);
  
  if (issues.length > 0) {
    console.log('❌ ISSUES TO FIX:');
    issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue.name}: ${issue.reason}`);
    });
  } else {
    console.log('🎉 ALL TESTS PASSED! Everything is working!');
  }
  console.log('');
}

run().catch(console.error);
