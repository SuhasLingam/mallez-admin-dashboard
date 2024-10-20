import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db, addNewUser, deleteUser } from "../services/firebaseService";

const useUserManagement = (userRole, currentUserEmail, updateUser) => {
  const [displayUsers, setDisplayUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "user",
    vehicleNumbers: [""],
  });
  const [editingUser, setEditingUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const refreshUserLists = async () => {
    setIsLoading(true);
    try {
      const roles = ["user", "admin", "mallOwner"];
      let allUsers = [];

      for (const role of roles) {
        const usersCollection = collection(db, "platform_users", role, role);
        const querySnapshot = await getDocs(usersCollection);
        const users = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            email: data.email,
            firstName: data.firstName || "Not provided",
            lastName: data.lastName || "Not provided",
            phoneNumber: data.phoneNumber || "Not provided",
            role: role,
            // Add any other fields you expect to have
          };
        });
        allUsers = [...allUsers, ...users];
      }

      console.log("Fetched users:", allUsers); // Add this line for debugging
      setDisplayUsers(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserWithRoleChange = async (updatedUser) => {
    const { id, role, ...userData } = updatedUser;
    const oldRole = editingUser.role;

    try {
      if (oldRole !== role) {
        // Check if the document exists in the old collection
        const oldDocRef = doc(db, "platform_users", oldRole, oldRole, id);
        const oldDocSnap = await getDoc(oldDocRef);

        if (oldDocSnap.exists()) {
          // Delete from old collection
          await deleteDoc(oldDocRef);
        } else {
          console.log(`User document not found in ${oldRole} collection`);
        }

        // Add to new collection with the same ID
        const newDocRef = doc(db, "platform_users", role, role, id);
        await setDoc(newDocRef, {
          id,
          ...userData,
          role,
        });

        console.log(`User moved from ${oldRole} to ${role}`);
      } else {
        // Check if the document exists before updating
        const docRef = doc(db, "platform_users", role, role, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // Update existing document
          await updateDoc(docRef, { ...userData, role });
          console.log(`User updated in ${role} collection`);
        } else {
          // Create new document if it doesn't exist
          await setDoc(docRef, { id, ...userData, role });
          console.log(`User created in ${role} collection`);
        }
      }

      await refreshUserLists();
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const handleSubmit = async (userData) => {
    setIsLoading(true);
    try {
      if (editingUser) {
        const oldRole = editingUser.role;
        const updatedUserData = {
          ...editingUser,
          ...userData,
          role: userData.role || editingUser.role,
        };
        await updateUser(editingUser.id, oldRole, updatedUserData);
        toast.success("User updated successfully");
      } else {
        // Check if a user with the same email already exists in any role
        const roles = ["admin", "mallOwner", "user"];
        for (const role of roles) {
          const querySnapshot = await getDocs(
            query(
              collection(db, "platform_users", role, role),
              where("email", "==", userData.email)
            )
          );
          if (!querySnapshot.empty) {
            throw new Error(
              `A user with this email already exists as a ${role}`
            );
          }
        }
        await addNewUser(userData, userData.role);
        toast.success("New user added successfully");
      }
      setIsModalOpen(false);
      setEditingUser(null);
      await refreshUserLists();
    } catch (error) {
      console.error("Error submitting user data:", error);
      toast.error(
        `Failed to ${editingUser ? "update" : "add"} user: ${error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingUser) {
      setEditingUser({ ...editingUser, [name]: value });
    } else {
      setNewUser({ ...newUser, [name]: value });
    }
  };

  const handleVehicleNumberChange = (index, value) => {
    const updatedVehicleNumbers = [
      ...(editingUser ? editingUser.vehicleNumbers : newUser.vehicleNumbers),
    ];
    updatedVehicleNumbers[index] = value;
    if (editingUser) {
      setEditingUser({ ...editingUser, vehicleNumbers: updatedVehicleNumbers });
    } else {
      setNewUser({ ...newUser, vehicleNumbers: updatedVehicleNumbers });
    }
  };

  const addVehicleNumberField = () => {
    if (editingUser) {
      setEditingUser({
        ...editingUser,
        vehicleNumbers: [...editingUser.vehicleNumbers, ""],
      });
    } else {
      setNewUser({
        ...newUser,
        vehicleNumbers: [...newUser.vehicleNumbers, ""],
      });
    }
  };

  const removeVehicleNumberField = (index) => {
    if (editingUser) {
      const updatedVehicleNumbers = editingUser.vehicleNumbers.filter(
        (_, i) => i !== index
      );
      setEditingUser({ ...editingUser, vehicleNumbers: updatedVehicleNumbers });
    } else {
      const updatedVehicleNumbers = newUser.vehicleNumbers.filter(
        (_, i) => i !== index
      );
      setNewUser({ ...newUser, vehicleNumbers: updatedVehicleNumbers });
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setNewUser({
      ...user,
      oldRole: user.role, // Add this line to store the old role
    });
    setIsModalOpen(true);
  };

  const handleDelete = (user) => {
    setEditingUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (editingUser && editingUser.id && editingUser.role) {
      setIsLoading(true);
      try {
        await deleteUser(editingUser.id, editingUser.role);
        toast.success("User deleted successfully");
        setIsDeleteModalOpen(false);
        setEditingUser(null);
        refreshUserLists();
      } catch (error) {
        toast.error(`Failed to delete user: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error("Cannot delete user: Incomplete user data");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setNewUser({ role: "users", vehicleNumbers: [""] });
  };

  const handleSearchAndFilter = (
    newSearchTerm,
    newFilterRole,
    newSortBy,
    newSortOrder
  ) => {
    setSearchTerm(newSearchTerm);
    setFilterRole(newFilterRole);
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  useEffect(() => {
    refreshUserLists();
  }, []);

  return {
    displayUsers,
    newUser,
    editingUser,
    isModalOpen,
    isLoading,
    isDeleteModalOpen,
    currentPage,
    usersPerPage,
    searchTerm,
    filterRole,
    sortBy,
    sortOrder,
    handleInputChange,
    handleVehicleNumberChange,
    addVehicleNumberField,
    removeVehicleNumberField,
    handleSubmit,
    handleEdit,
    closeModal,
    handleDelete,
    confirmDelete,
    setIsModalOpen,
    setCurrentPage,
    handleSearchAndFilter,
    refreshUserLists,
  };
};

export default useUserManagement;
