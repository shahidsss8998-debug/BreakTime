/**
 * Menu Service
 * Handles CRUD operations for menu items in Firestore.
 * Read operations are public, write operations are admin-only.
 */
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

const menuRef = collection(db, 'menu');

/**
 * Fetch all available menu items from Firestore
 * @returns {Array|null} Array of menu items or null for fallback
 */
export async function fetchMenuItems() {
  try {
    const q = query(menuRef, where('available', '==', true));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null; // Fallback to hardcoded
    }

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return null;
  }
}

/**
 * Fetch menu items filtered by category
 * @param {string} category
 * @returns {Array} Array of menu item objects
 */
export async function fetchMenuByCategory(category) {
  try {
    const q = query(
      menuRef,
      where('available', '==', true),
      where('category', '==', category)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching menu by category:', error);
    return [];
  }
}

/**
 * Listen to ALL menu items in real-time (for admin menu manager)
 * @param {Function} callback - Called with array of menu items
 * @returns {Function} Unsubscribe function
 */
export function listenToMenuItems(callback) {
  const q = query(menuRef, orderBy('category', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(items);
  }, (error) => {
    console.error('Error listening to menu items:', error);
    callback([]);
  });
}

/**
 * Add a new menu item (admin only)
 * @param {Object} itemData - { name, price, category, description, imageUrl }
 * @returns {string} The new document ID
 */
export async function addMenuItem(itemData) {
  const menuItem = {
    name: itemData.name,
    price: Number(itemData.price),
    category: itemData.category || 'Uncategorized',
    description: itemData.description || '',
    img: itemData.imageUrl || itemData.img || '',
    available: true,
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(menuRef, menuItem);
  return docRef.id;
}

/**
 * Update an existing menu item (admin only)
 * @param {string} itemId
 * @param {Object} updates - Fields to update
 */
export async function updateMenuItem(itemId, updates) {
  const cleanUpdates = { ...updates };
  if (cleanUpdates.price) cleanUpdates.price = Number(cleanUpdates.price);
  cleanUpdates.updatedAt = serverTimestamp();

  await updateDoc(doc(db, 'menu', itemId), cleanUpdates);
}

/**
 * Toggle the availability of a menu item (admin only)
 * @param {string} itemId
 * @param {boolean} available
 */
export async function toggleMenuItemAvailability(itemId, available) {
  await updateDoc(doc(db, 'menu', itemId), {
    available,
    updatedAt: serverTimestamp()
  });
}

/**
 * Delete a menu item (admin only)
 * @param {string} itemId
 */
export async function deleteMenuItem(itemId) {
  await deleteDoc(doc(db, 'menu', itemId));
}
