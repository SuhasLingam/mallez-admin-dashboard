import { db, auth, storage, firebaseConfig } from "../config/firebaseConfig";
import { collection, addDoc, doc, deleteDoc } from "firebase/firestore";

export { db, auth, storage, firebaseConfig };

export const addNewUser = async (userData, role) => {
  const usersRef = collection(db, "platform_users", role, role);
  await addDoc(usersRef, { ...userData, role });
};

export const deleteUser = async (userId, userRole) => {
  try {
    console.log(`Attempting to delete user: ID=${userId}, Role=${userRole}`);

    if (!userId || !userRole) {
      throw new Error("Invalid userId or userRole provided");
    }

    const userDocRef = doc(db, "platform_users", userRole, userRole, userId);
    console.log("Document reference path:", userDocRef.path);

    await deleteDoc(userDocRef);
    console.log(`User with ID ${userId} deleted from ${userRole} collection`);
  } catch (error) {
    console.error("Error in deleteUser function:", error);
    throw error;
  }
};
