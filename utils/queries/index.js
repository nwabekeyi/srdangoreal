// functions/queries/index.js
import { db, doc, setDoc, getDoc, collection, getDocs, deleteDoc, query, limit, startAfter } from '../../configs/firebase.js';
import { showLoader, removeLoader } from '../loader/index.js';

// Helper function to handle errors
const handleError = (operation, error) => {
  console.error(`Error during ${operation}:`, error);
  throw error; // Rethrow to allow calling code to handle
};

// Get all documents from a collection
export const getAllDocs = async (collectionName) => {
  showLoader();
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    const result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return result;
  } catch (error) {
    handleError(`getAllDocs from ${collectionName}`, error);
  } finally {
    removeLoader();
  }
};

// Get a single document by ID
export const getSingleDoc = async (collectionName, docId) => {
  showLoader();
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error(`Document with ID ${docId} not found in ${collectionName}`);
    }
  } catch (error) {
    handleError(`getSingleDoc from ${collectionName}/${docId}`, error);
  } finally {
    removeLoader();
  }
};

// Get paginated documents from a collection
export const getPaginatedDocs = async (collectionName, pageSize, lastDoc = null) => {
  showLoader();
  try {
    const collectionRef = collection(db, collectionName);
    let q;
    if (lastDoc) {
      q = query(collectionRef, limit(pageSize), startAfter(lastDoc));
    } else {
      q = query(collectionRef, limit(pageSize));
    }
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    const hasMore = snapshot.docs.length === pageSize;
    return { docs, lastVisible, hasMore };
  } catch (error) {
    handleError(`getPaginatedDocs from ${collectionName}`, error);
  } finally {
    removeLoader();
  }
};

// Create a new document (POST)
export const createDoc = async (collectionName, data, docId = null) => {
  showLoader();
  try {
    const collectionRef = collection(db, collectionName);
    if (docId) {
      const docRef = doc(db, collectionName, docId);
      await setDoc(docRef, data);
      return { id: docId, ...data };
    } else {
      const docRef = doc(collectionRef);
      await setDoc(docRef, data);
      return { id: docRef.id, ...data };
    }
  } catch (error) {
    handleError(`createDoc in ${collectionName}`, error);
  } finally {
    removeLoader();
  }
};

// Update an existing document
export const updateDoc = async (collectionName, docId, data) => {
  showLoader();
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data, { merge: true });
    return { id: docId, ...data };
  } catch (error) {
    handleError(`updateDoc in ${collectionName}/${docId}`, error);
  } finally {
    removeLoader();
  }
};

// Delete a document
export const deleteDocById = async (collectionName, docId) => {
  showLoader();
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return { success: true, id: docId };
  } catch (error) {
    handleError(`deleteDocById in ${collectionName}/${docId}`, error);
  } finally {
    removeLoader();
  }
};