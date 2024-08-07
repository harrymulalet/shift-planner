import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore'; 
import { db } from './firebase';

const USERS_COLLECTION = 'users';

export function addShift(uid, driverType, taxiId, date, shift) {
  return addDoc(collection(db, `${USERS_COLLECTION}/${uid}/shifts`), { uid, driverType, taxiId, date, shift });
}

export async function getShifts(uid, setShifts, setIsLoadingShifts) {
  const shiftsQuery = query(collection(db, `${USERS_COLLECTION}/${uid}/shifts`), orderBy("date", "asc"));

  const unsubscribe = onSnapshot(shiftsQuery, async (snapshot) => {
    let allShifts = [];
    for (const documentSnapshot of snapshot.docs) {
      const shift = documentSnapshot.data();
      allShifts.push({
        ...shift, 
        date: shift['date'].toDate(), 
        id: documentSnapshot.id,
      });
    }
    setShifts(allShifts);
    setIsLoadingShifts(false);
  });
  return unsubscribe;
}

export function updateShift(uid, docId, driverType, taxiId, date, shift) {
  return setDoc(doc(db, `${USERS_COLLECTION}/${uid}/shifts`, docId), { uid, driverType, taxiId, date, shift });
}

export function deleteShift(uid, id) {
  return deleteDoc(doc(db, `${USERS_COLLECTION}/${uid}/shifts`, id));
}