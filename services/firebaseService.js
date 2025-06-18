import admin from 'firebase-admin';
import { config } from 'dotenv';
config();
// Fungsi untuk parsing & fix private_key jika perlu
function parseFirebaseCredential() {
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not defined in .env');
    const parsed = JSON.parse(raw);
    // Perbaiki \n jika belum terkonversi jadi newline (misal: masih berupa "\\n")
    if (parsed.private_key?.includes('\\n')) {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
    }
    console.log('✅ Firebase credential parsed successfully.');
    return parsed;
  } catch (err) {
    console.error('❌ Failed to parse Firebase credentials:', err.message);
    process.exit(1);
  }
}
const serviceAccount = parseFirebaseCredential();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const db = admin.firestore();
