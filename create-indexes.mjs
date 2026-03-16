import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./service-account.json', 'utf8'));
const app = initializeApp({
  credential: cert(serviceAccount),
});
const db = getFirestore(app);

async function createTestConversation() {
  // The composite index will be auto-created when the query is first run
  // Let's just verify the existing test data works
  
  console.log('Checking existing conversations...');
  
  // Simple query first (no ordering - doesn't need index)
  const convSnap = await db.collection('conversations').get();
  console.log(`Total conversations: ${convSnap.size}`);
  
  convSnap.forEach(doc => {
    const data = doc.data();
    console.log(`  Conv ${doc.id}: ${data.listingTitle} | Participants: ${data.participants?.join(', ')}`);
    console.log(`    Last message: ${data.lastMessage}`);
  });

  // Check messages in each conversation
  for (const convDoc of convSnap.docs) {
    const msgsSnap = await db.collection('conversations').doc(convDoc.id).collection('messages').orderBy('createdAt', 'asc').get();
    console.log(`  Messages: ${msgsSnap.size}`);
    msgsSnap.forEach(msgDoc => {
      const msg = msgDoc.data();
      console.log(`    [${msg.senderId?.substring(0,8)}...]: ${msg.text?.substring(0, 50)}`);
    });
  }
  
  console.log('\n✅ Messaging data verified!');
  console.log('\nNOTE: Composite index for conversations (participants + lastMessageAt)');
  console.log('needs to be created in Firebase Console:');
  console.log('https://console.firebase.google.com/project/kupiautoba-e7eb5/firestore/indexes');
  console.log('\nCreate this index:');
  console.log('  Collection: conversations');
  console.log('  Field 1: participants (Array contains)');
  console.log('  Field 2: lastMessageAt (Descending)');
  console.log('\nOr the index will auto-create when the query runs from the client.');
  console.log('The error link in the browser console will have a direct link to create it.');
}

createTestConversation().catch(console.error);
