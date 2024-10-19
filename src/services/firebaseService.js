import { db, auth, storage, firebaseConfig } from "../config/firebaseConfig";
import { collection, addDoc, doc, deleteDoc, setDoc } from "firebase/firestore";

export { db, auth, storage, firebaseConfig };

export const addNewUser = async (userData, role) => {
  const usersRef = collection(db, "platform_users", role, role);
  const newDocRef = doc(usersRef);
  await setDoc(newDocRef, { ...userData, id: newDocRef.id });
  return newDocRef.id;
};

export const deleteUser = async (userId, userRole) => {
  try {
    if (!userId || !userRole) {
      throw new Error("Invalid userId or userRole provided");
    }

    const userDocRef = doc(db, "platform_users", userRole, userRole, userId);
    await deleteDoc(userDocRef);
  } catch (error) {
    throw error;
  }
};
