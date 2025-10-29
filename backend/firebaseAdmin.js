const admin = require('firebase-admin');
const fs = require('fs');

let initialized = false;

function init() {
  if (initialized) return;
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!keyPath) {
    console.warn('FIREBASE_SERVICE_ACCOUNT not set; Firebase admin will be disabled.');
    return;
  }

  if (!fs.existsSync(keyPath)) {
    console.warn('FIREBASE_SERVICE_ACCOUNT points to a missing file:', keyPath);
    return;
  }

  const serviceAccount = require(keyPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  initialized = true;
}

init();

module.exports = {
  isInitialized: () => initialized,
  auth: () => admin.auth(),
  firestore: () => admin.firestore(),
  admin
};
