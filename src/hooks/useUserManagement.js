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
import { db } from "../services/firebaseService"; // Make sure this import is correct

const useUserManagement = (
  adminData,
  mallOwnerData,
  userData,
  userRole,
  currentUserEmail,
  addNewUser,
  updateUser,
  deleteUser
) => {
  const [displayUsers, setDisplayUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    role: "user",
    vehicleNumbers: [""],
  });
  const [editingUser, setEditingUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10); // Set to 10 users per page
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const allUsers = [...adminData, ...mallOwnerData, ...userData];
    setDisplayUsers(allUsers);
  }, [adminData, mallOwnerData, userData]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingUser) {
        await updateUserWithRoleChange(editingUser);
        toast.success("User updated successfully");
      } else {
        await addNewUser(
          newUser.email,
          newUser.role,
          newUser.firstName,
          newUser.lastName,
          newUser.vehicleNumbers
        );
        toast.success("New user added successfully");
      }
      setIsModalOpen(false);
      setEditingUser(null);
      setNewUser({ role: "user", vehicleNumbers: [""] });
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error(`Failed to save user: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserWithRoleChange = async (updatedUser) => {
    const { id, role, ...userData } = updatedUser;
    const collections = ["users", "admins", "mallOwners"];
    let oldCollection = null;
    let userDoc = null;

    // Find the user in one of the collections
    for (const collectionName of collections) {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        oldCollection = collectionName;
        userDoc = docSnap;
        break;
      }
    }

    if (!userDoc) {
      throw new Error("User not found in any collection");
    }

    const newCollection =
      role === "admin"
        ? "admins"
        : role === "mallOwner"
        ? "mallOwners"
        : "users";

    if (oldCollection !== newCollection) {
      // Role has changed, move the user to the new collection
      await setDoc(doc(db, newCollection, id), { id, role, ...userData });
      await deleteDoc(doc(db, oldCollection, id));
    } else {
      // Role hasn't changed, update in the same collection
      await updateDoc(doc(db, oldCollection, id), { role, ...userData });
    }

    // Refresh the user lists
    await refreshUserLists();
  };

  const refreshUserLists = async () => {
    const fetchUsers = async (collectionName) => {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    };

    const newAdminData = await fetchUsers("admins");
    const newMallOwnerData = await fetchUsers("mallOwners");
    const newUserData = await fetchUsers("users");

    setDisplayUsers([...newAdminData, ...newMallOwnerData, ...newUserData]);
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
    setNewUser({ role: "user", vehicleNumbers: [""] });
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
