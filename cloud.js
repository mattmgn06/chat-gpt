import { firebaseConfig } from './firebase-config.js';
import { mergeStates, freshState } from './engine.js?v=3';
export const cloudAvailable = Boolean(firebaseConfig?.apiKey && firebaseConfig?.projectId);
let auth, db, sdk, store, unsubscribe;
async function init() {
  if (auth) return;
  const app = await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js');
  sdk = await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js');
  store = await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js');
  const instance = app.initializeApp(firebaseConfig);
  auth = sdk.getAuth(instance); db = store.getFirestore(instance);
  await auth.authStateReady();
}
export async function connect(getState, receive, status) {
  if (!cloudAvailable) throw new Error('La connexion Google attend la configuration du service de sauvegarde. Ta partie reste enregistrée sur cet appareil.');
  await init();
  if (!auth.currentUser) await sdk.signInWithPopup(auth, new sdk.GoogleAuthProvider());
  const ref=store.doc(db,'players',auth.currentUser.uid);
  const snapshot=await store.getDoc(ref);
  const local=getState();
  // Une partie déjà liée à un autre compte ne doit jamais être copiée vers
  // le nouveau compte Google sur un appareil partagé.
  const base=local.ownerUid && local.ownerUid !== auth.currentUser.uid ? freshState() : local;
  const merged=mergeStates(base,snapshot.exists()? snapshot.data().state:null);
  merged.ownerUid=auth.currentUser.uid;
  receive(merged);
  await store.setDoc(ref,{state:merged});
  unsubscribe?.();
  unsubscribe=store.onSnapshot(ref, s => {
    if (s.exists()) receive({...mergeStates(getState(),s.data().state),ownerUid:auth.currentUser.uid});
  }, () => status('Synchronisation interrompue ; sauvegarde locale conservée.'));
  return {name:auth.currentUser.displayName || 'Gardien', uid:auth.currentUser.uid};
}
export async function sync(state) {
  if (!auth?.currentUser) return;
  const ref=store.doc(db,'players',auth.currentUser.uid);
  await store.runTransaction(db,async tx=> {
    const snap=await tx.get(ref);
    tx.set(ref,{state:mergeStates(state,snap.exists()?snap.data().state:null)});
  });
}
export async function disconnect() { unsubscribe?.(); if(auth) await sdk.signOut(auth); }
