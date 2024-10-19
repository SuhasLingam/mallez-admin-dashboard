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
} from "firebase/firestore";
import { db, addNewUser, deleteUser } from "../services/firebaseService";

const useUserManagement = (userRole, currentUserEmail) => {
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
        const users = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          role,
        }));
        allUsers = [...allUsers, ...users];
        console.log(`Found ${users.length} users in ${role} collection`);
      }

      setDisplayUsers(allUsers);
      console.log("Total users:", allUsers.length);
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
      if (userData.id) {
        await updateUserWithRoleChange(userData);
        toast.success("User updated successfully");
      } else {
        await addNewUser(userData, userData.role);
        toast.success("New user added successfully");
      }
      setIsModalOpen(false);
      setEditingUser(null);
      setNewUser({ role: "user", vehicleNumbers: [""] });
      await refreshUserLists();
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error(`Failed to save user: ${error.message}`);
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
    setIsModalOpen(true);
  };

  const handleDelete = (user) => {
    setEditingUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (editingUser) {
      setIsLoading(true);
      try {
        await deleteUser(editingUser.id, editingUser.role);
        toast.success("User deleted successfully");
        setIsDeleteModalOpen(false);
        setEditingUser(null);
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      } finally {
        setIsLoading(false);
      }
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
