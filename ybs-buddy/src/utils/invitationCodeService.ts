import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface InvitationCode {
  code: string;
  createdAt: Date;
  createdBy: string; // UID of the admin who created it
  usedBy?: string; // UID of the user who used it
  usedAt?: Date;
}

// Function to generate a simple unique code (you might want a more robust one)
const generateUniqueCode = (): string => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Function to check if the current user has an admin role
// This is a placeholder. You'll need to implement actual role checking,
// e.g., by reading custom claims from the user's ID token or a user document in Firestore.
const isAdmin = async (userId: string): Promise<boolean> => {
  // For demonstration, let's assume a user with UID 'admin_uid' is an admin.
  // In a real application, you would fetch the user's role from Firestore
  // or check custom claims on their ID token.
  // Example:
  // const userDocRef = doc(db, 'users', userId);
  // const userDoc = await getDoc(userDocRef);
  // return userDoc.exists() && userDoc.data()?.role === 'admin';
  console.warn('Admin role check is a placeholder. Implement actual role verification.');
  return true; // Temporarily return true for testing purposes
};

export const createInvitationCode = async (): Promise<{ success: boolean; code?: string; error?: string }> => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return { success: false, error: 'User not authenticated.' };
  }

  const userIsAdmin = await isAdmin(user.uid);
  if (!userIsAdmin) {
    return { success: false, error: 'Permission denied. Only admins can create invitation codes.' };
  }

  try {
    const newCode = generateUniqueCode();
    const invitationCode: InvitationCode = {
      code: newCode,
      createdAt: new Date(),
      createdBy: user.uid,
      usedBy: null, // Yeni eklenen satır
    };

    await addDoc(collection(db, 'invitationCodes'), invitationCode);
    return { success: true, code: newCode };
  } catch (e: any) {
    console.error('Error creating invitation code:', e);
    return { success: false, error: e.message };
  }
};

import { DocumentReference } from 'firebase/firestore';

export const validateInvitationCode = async (code: string): Promise<{ success: boolean; docRef?: DocumentReference; error?: string }> => {
  try {
    const q = query(collection(db, 'invitationCodes'), where('code', '==', code), where('usedBy', '==', null));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: 'Invalid or already used invitation code.' };
    }

    const docRef = querySnapshot.docs[0].ref;
    return { success: true, docRef };
  } catch (e: any) {
    console.error('Error validating invitation code:', e);
    return { success: false, error: e.message };
  }
};

export const markInvitationCodeAsUsed = async (docRef: DocumentReference, userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await updateDoc(docRef, { usedBy: userId, usedAt: new Date() });
    return { success: true };
  } catch (e: any) {
    console.error('Error marking invitation code as used:', e);
    return { success: false, error: e.message };
  }
};

export const deleteInvitationCode = async (code: string): Promise<{ success: boolean; error?: string }> => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return { success: false, error: 'User not authenticated.' };
  }

  const userIsAdmin = await isAdmin(user.uid);
  if (!userIsAdmin) {
    return { success: false, error: 'Permission denied. Only admins can delete invitation codes.' };
  }

  try {
    const q = query(collection(db, 'invitationCodes'), where('code', '==', code));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: 'Invitation code not found.' };
    }

    const docRef = querySnapshot.docs[0].ref;
    await deleteDoc(docRef);
    return { success: true };
  } catch (e: any) {
    console.error('Error deleting invitation code:', e);
    return { success: false, error: e.message };
  }
};
