import { db, auth, storage, firebaseConfig } from "../config/firebaseConfig";
import { collection, addDoc, doc, deleteDoc } from "firebase/firestore";

export { db, auth, storage, firebaseConfig };

export const addNewUser = async (userData, role) => {
  const usersRef = collection(db, "platform_users", role, role);
  await addDoc(usersRef, { ...userData, role });
};

export const deleteUser = async (userId, role) => {
  const userRef = doc(db, "platform_users", role, role, userId);
  await deleteDoc(userRef);
};
