import { useState, useEffect } from "react";
import { toast } from "react-toastify";

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
        await updateUser(editingUser.id, editingUser.role, editingUser);
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
      toast.error("Failed to save user");
    } finally {
      setIsLoading(false);
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
  };
};

export default useUserManagement;
