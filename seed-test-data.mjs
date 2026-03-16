import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./service-account.json', 'utf8'));
const app = initializeApp({ credential: cert(serviceAccount) });
const auth = getAuth(app);
const db = getFirestore(app);

async function seed() {
  console.log('\n🌱 Seeding KupiAuto.ba with realistic test data...\n');

  // Create additional users
  const users = [
    { email: 'emir@kupiauto.ba', pass: 'Emir2026!', name: 'Emir Hadžić', city: 'Sarajevo', phone: '+387 61 234 567' },
    { email: 'ana@kupiauto.ba', pass: 'Ana2026!!', name: 'Ana Kovačević', city: 'Mostar', phone: '+387 63 876 543' },
    { email: 'marko@kupiauto.ba', pass: 'Marko2026!', name: 'Marko Petrović', city: 'Banja Luka', phone: '+387 65 111 222' },
  ];

  const userIds = {};

  for (const u of users) {
    try { const existing = await auth.getUserByEmail(u.email); await auth.deleteUser(existing.uid); } catch {}
    const created = await auth.createUser({ email: u.email, password: u.pass, displayName: u.name });
    userIds[u.email] = created.uid;
    await db.collection('users').doc(created.uid).set({
      uid: created.uid, email: u.email, displayName: u.name, phone: u.phone, city: u.city, isDealer: false, createdAt: new Date()
    });
    console.log(`  ✅ User: ${u.name} (${u.email})`);
  }

  // Create realistic listings from different users
  const listings = [
    {
      userId: userIds['emir@kupiauto.ba'],
      title: 'Volkswagen Golf 7 1.6 TDI BlueMotion',
      make: 'Volkswagen', model: 'Golf 7', year: 2016, mileage: 175000,
      fuel: 'dizel', transmission: 'manuelni', body: 'hatchback', color: 'Bijela',
      power: 81, engineSize: 1598, price: 17500, currency: 'KM',
      description: 'Golf 7 1.6 TDI BlueMotion, veoma ekonomičan. Troši 4.5l/100km u kombinovanoj vožnji. Redovno servisiran, veliki servis upravo urađen. Nove prednje kočnice, novi diskovi. Registrovan do 08/2026. Klima, tempomat, parking senzori, multimedija.',
      equipment: ['Klima', 'Tempomat', 'Parking senzori', 'Bluetooth', 'ABS', 'ESP', 'Start-Stop sistem', 'El. podizači stakala', 'Centralna brava'],
      photos: ['https://d4n0y8dshd77z.cloudfront.net/listings/74734653/lg/img-1772608741-5fba7dcadee5.jpeg'],
      city: 'Sarajevo', region: 'Sarajevski kanton', sellerName: 'Emir Hadžić', sellerPhone: '+387 61 234 567',
      negotiable: true, registrationUntil: '08/2026',
    },
    {
      userId: userIds['emir@kupiauto.ba'],
      title: 'Audi A4 2.0 TDI S-Line Quattro',
      make: 'Audi', model: 'A4', year: 2018, mileage: 145000,
      fuel: 'dizel', transmission: 'automatski', body: 'limuzina', color: 'Siva',
      power: 140, engineSize: 1968, price: 38000, currency: 'KM',
      description: 'Audi A4 B9 S-Line paket, Quattro pogon. Full LED Matrix svjetla, virtuelni kokpit, navigacija, kožna sjedišta, grijanje sjedišta, panorama krov. Redovno servisirano kod ovlaštenog Audi servisera.',
      equipment: ['LED Matrix svjetla', 'Virtuelni kokpit', 'Navigacija', 'Kožna sjedišta', 'Grijanje sjedišta', 'Panorama krov', 'Quattro', 'S-Line paket', 'Tempomat', 'Parking senzori', 'Kamera', 'Bluetooth', 'CarPlay'],
      photos: ['https://api.autobum.ba/storage/cache/1200x5000/articles/2026/03/15/1773584672_gqyfm1jiplcdvgutuccftjky48iq3ua8gtgm4zqm.jpg'],
      city: 'Sarajevo', region: 'Sarajevski kanton', sellerName: 'Emir Hadžić', sellerPhone: '+387 61 234 567',
      priceIncludesVAT: true,
    },
    {
      userId: userIds['ana@kupiauto.ba'],
      title: 'Mercedes-Benz GLA 200d AMG Line',
      make: 'Mercedes-Benz', model: 'GLA 200d', year: 2020, mileage: 67000,
      fuel: 'dizel', transmission: 'automatski', body: 'SUV', color: 'Crna',
      power: 110, engineSize: 1950, price: 52000, currency: 'KM',
      description: 'Mercedes GLA 200d AMG Line paket. Kupljen nov u BiH, prvi vlasnik. Kompletna servisna historija kod ovlaštenog servisera. AMG styling, LED High Performance svjetla, MBUX multimedija, ambijentalno osvjetljenje.',
      equipment: ['AMG Line', 'LED High Performance', 'MBUX', 'Navigacija', 'Ambijentalno osvjetljenje', 'Kožna sjedišta', 'Grijanje sjedišta', 'Panorama krov', 'Kamera 360', 'Parking senzori', 'Digitalna klima', 'Tempomat', 'Keyless Go'],
      photos: ['https://d4n0y8dshd77z.cloudfront.net/listings/74703947/lg/img-1772355279-fa05bd6423a7.jpeg'],
      city: 'Mostar', region: 'Hercegovačko-neretvanski kanton', sellerName: 'Ana Kovačević', sellerPhone: '+387 63 876 543',
      previousOwners: 1, registrationUntil: '11/2026',
    },
    {
      userId: userIds['ana@kupiauto.ba'],
      title: 'Renault Clio 1.5 dCi Intens',
      make: 'Renault', model: 'Clio V', year: 2021, mileage: 42000,
      fuel: 'dizel', transmission: 'manuelni', body: 'hatchback', color: 'Crvena',
      power: 74, engineSize: 1461, price: 16900, currency: 'KM',
      description: 'Novi Clio V, Intens oprema. Full LED svjetla, 9.3" multimedija sa navigacijom, digitalna klima, parking kamera. Veoma ekonomičan - troši 3.5l/100km. Garažiran, bez ogrebotina.',
      equipment: ['Full LED', 'Navigacija 9.3"', 'Digitalna klima', 'Parking kamera', 'Tempomat', 'Bluetooth', 'Apple CarPlay', 'ABS', 'ESP', 'Hill start assist'],
      photos: ['https://img-1.autoplac.ba/storage/autoplac/items/large/52009ea6-a24bb734-9fe86996-9c83c4bb.jpeg'],
      city: 'Mostar', region: 'Hercegovačko-neretvanski kanton', sellerName: 'Ana Kovačević', sellerPhone: '+387 63 876 543',
      negotiable: true, registrationUntil: '05/2027',
    },
    {
      userId: userIds['marko@kupiauto.ba'],
      title: 'BMW 320d xDrive M-Sport',
      make: 'BMW', model: '320d', year: 2019, mileage: 98000,
      fuel: 'dizel', transmission: 'automatski', body: 'limuzina', color: 'Crna',
      power: 140, engineSize: 1995, price: 48500, currency: 'KM',
      description: 'BMW 320d G20, M-Sport paket, xDrive pogon na sva 4 točka. Live Cockpit Professional, M kožni volan, M sportsko vješanje, 19" M alu felge. Servisiran u BMW Premium Selection.',
      equipment: ['M-Sport paket', 'xDrive', 'Live Cockpit Professional', 'M kožni volan', 'M sportsko vješanje', '19" M felge', 'LED svjetla', 'Navigacija', 'Kožna sjedišta', 'Grijanje sjedišta', 'Parking senzori', 'Kamera', 'Digitalna klima', 'Tempomat', 'Harman Kardon'],
      photos: ['https://api.autobum.ba/storage/cache/1200x5000/articles/2025/10/11/1760170717_79gvunehzpoa5x4icdnf3vziarvgdrjwdvc8mztc.jpg'],
      city: 'Banja Luka', region: 'Republika Srpska', sellerName: 'Marko Petrović', sellerPhone: '+387 65 111 222',
      registrationUntil: '03/2027',
    },
    {
      userId: userIds['marko@kupiauto.ba'],
      title: 'Škoda Octavia Combi 2.0 TDI DSG',
      make: 'Škoda', model: 'Octavia Combi', year: 2022, mileage: 55000,
      fuel: 'dizel', transmission: 'automatski', body: 'karavan', color: 'Zelena',
      power: 110, engineSize: 1968, price: 37500, currency: 'KM',
      description: 'Nova Octavia IV Combi, Style oprema, DSG automatik. Virtuelni kokpit, 10" navigacija, full LED, digitalna klima, grijanje sjedišta i volana. Idealan porodični auto sa ogromnim prtljažnikom.',
      equipment: ['Virtuelni kokpit', 'Navigacija 10"', 'Full LED', 'DSG', 'Digitalna klima', 'Grijanje sjedišta', 'Grijanje volana', 'Parking senzori', 'Kamera', 'Tempomat ACC', 'Lane assist', 'ABS', 'ESP', 'ISOFIX'],
      photos: ['https://img-1.autoplac.ba/storage/autoplac/items/large/bff99415-18f86031-d85c8451-33ed5abd.jpeg'],
      city: 'Banja Luka', region: 'Republika Srpska', sellerName: 'Marko Petrović', sellerPhone: '+387 65 111 222',
      previousOwners: 1, registrationUntil: '01/2027',
    },
  ];

  const listingIds = [];
  for (const l of listings) {
    const ref = await db.collection('listings').add({
      ...l, status: 'active', views: Math.floor(Math.random() * 800) + 50,
      favorites: Math.floor(Math.random() * 30) + 2,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });
    listingIds.push(ref.id);
    console.log(`  🚗 Listing: ${l.title} (${l.city}) → ${ref.id}`);
  }

  // Create conversations between users
  const convs = [
    {
      participants: [userIds['ana@kupiauto.ba'], userIds['emir@kupiauto.ba']],
      listingId: listingIds[1], // Audi A4
      listingTitle: 'Audi A4 2.0 TDI S-Line Quattro',
      messages: [
        { sender: 'ana@kupiauto.ba', text: 'Zdravo, zanima me ovaj A4. Može li test vožnja?' },
        { sender: 'emir@kupiauto.ba', text: 'Naravno! Možete doći bilo koji dan od 9-17h. Auto je u Vogošći.' },
        { sender: 'ana@kupiauto.ba', text: 'Može sutra oko 14h? Dolazim iz Mostara.' },
        { sender: 'emir@kupiauto.ba', text: 'Savršeno, vidimo se sutra u 14h! Pošaljem vam lokaciju na WhatsApp.' },
      ]
    },
    {
      participants: [userIds['marko@kupiauto.ba'], userIds['ana@kupiauto.ba']],
      listingId: listingIds[2], // Mercedes GLA
      listingTitle: 'Mercedes-Benz GLA 200d AMG Line',
      messages: [
        { sender: 'marko@kupiauto.ba', text: 'Pozdrav, da li je cijena fixna za GLA?' },
        { sender: 'ana@kupiauto.ba', text: 'Zdravo Marko! Cijena je malo fleksibilna za ozbiljnog kupca. Koliko nudite?' },
        { sender: 'marko@kupiauto.ba', text: 'Mogu ponuditi 49.000 KM, keš odmah.' },
        { sender: 'ana@kupiauto.ba', text: 'Hvala na ponudi. Najniže mogu ići je 50.500 KM. Auto je stvarno u top stanju.' },
        { sender: 'marko@kupiauto.ba', text: 'Dobro, 50.000 i imamo deal? 😊' },
      ]
    },
  ];

  for (const conv of convs) {
    const lastMsg = conv.messages[conv.messages.length - 1];
    const convRef = await db.collection('conversations').add({
      participants: conv.participants,
      listingId: conv.listingId,
      listingTitle: conv.listingTitle,
      listingPhoto: '',
      lastMessage: lastMsg.text,
      lastMessageAt: new Date(),
      unreadCount: { [conv.participants[0]]: 0, [conv.participants[1]]: 1 },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    });

    for (let i = 0; i < conv.messages.length; i++) {
      const msg = conv.messages[i];
      await db.collection('conversations').doc(convRef.id).collection('messages').add({
        senderId: userIds[msg.sender],
        text: msg.text,
        createdAt: new Date(Date.now() - (conv.messages.length - i) * 15 * 60 * 1000),
        read: i < conv.messages.length - 1,
      });
    }
    console.log(`  💬 Conversation: ${conv.listingTitle} (${conv.messages.length} messages)`);
  }

  // Add favorites
  await db.collection('users').doc(userIds['ana@kupiauto.ba']).collection('favorites').doc(listingIds[4]).set({ listingId: listingIds[4], createdAt: new Date() });
  await db.collection('users').doc(userIds['marko@kupiauto.ba']).collection('favorites').doc(listingIds[0]).set({ listingId: listingIds[0], createdAt: new Date() });
  await db.collection('users').doc(userIds['marko@kupiauto.ba']).collection('favorites').doc(listingIds[2]).set({ listingId: listingIds[2], createdAt: new Date() });
  console.log('  ❤️ Favorites added');

  // Summary
  const allListings = await db.collection('listings').where('status', '==', 'active').get();
  const allUsers = await db.collection('users').get();
  const allConvs = await db.collection('conversations').get();

  console.log('\n' + '='.repeat(50));
  console.log('🏁 SEED COMPLETE');
  console.log('='.repeat(50));
  console.log(`  Users: ${allUsers.size}`);
  console.log(`  Active listings: ${allListings.size}`);
  console.log(`  Conversations: ${allConvs.size}`);
  console.log('\n  New test accounts:');
  console.log('  🔑 emir@kupiauto.ba / Emir2026!');
  console.log('  🔑 ana@kupiauto.ba / Ana2026!!');
  console.log('  🔑 marko@kupiauto.ba / Marko2026!');
  console.log('');
}

seed().catch(console.error);
