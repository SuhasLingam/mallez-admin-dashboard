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
  const [users, setUsers] = useState([]);
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
  const [userToDelete, setUserToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [sortBy, setSortBy] = useState("email");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    let allUsers = [];
    if (userRole === "admin") {
      allUsers = [...adminData, ...mallOwnerData, ...userData];
    } else if (userRole === "mallOwner") {
      allUsers = userData;
    } else if (userRole === "user") {
      allUsers = userData.filter((user) => user.email === currentUserEmail);
    }
    setUsers(allUsers);
    setDisplayUsers(allUsers);
  }, [adminData, mallOwnerData, userData, userRole, currentUserEmail]);

  const validateVehicleNumber = (number) => {
    const pattern = /\b[A-Z]{2}[-.\s]?\d{2}[-.\s]?[A-Z]{1,2}[-.\s]?\d{4}\b/;
    return pattern.test(number);
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
    const upperCaseValue = value.toUpperCase();
    const updatedVehicleNumbers = editingUser
      ? [...editingUser.vehicleNumbers]
      : [...newUser.vehicleNumbers];
    updatedVehicleNumbers[index] = upperCaseValue;
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
      const userData = editingUser || newUser;

      const invalidVehicleNumbers = userData.vehicleNumbers.filter(
        (vn) => vn && !validateVehicleNumber(vn)
      );
      if (invalidVehicleNumbers.length > 0) {
        toast.error(
          "Invalid vehicle number format. Please check and try again."
        );
        setIsLoading(false);
        return;
      }

      if (editingUser) {
        await updateUser(editingUser.id, editingUser.role, editingUser);
        setEditingUser(null);
      } else {
        await addNewUser(
          newUser.email,
          newUser.role,
          newUser.firstName,
          newUser.lastName,
          newUser.vehicleNumbers
        );
        setNewUser({
          email: "",
          firstName: "",
          lastName: "",
          role: "user",
          vehicleNumbers: [""],
        });
      }
      toast.success(
        editingUser
          ? "User updated successfully"
          : "New user added successfully"
      );
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to update user: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (id, role) => {
    setUserToDelete({ id, role });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      await deleteUser(userToDelete.id, userToDelete.role);
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Failed to delete user: " + error.message);
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
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

    let filteredUsers = users.filter((user) => {
      const searchString = newSearchTerm.toLowerCase();
      return (
        user.email.toLowerCase().includes(searchString) ||
        (user.firstName &&
          user.firstName.toLowerCase().includes(searchString)) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchString)) ||
        (user.vehicleNumbers &&
          user.vehicleNumbers.some((vn) =>
            vn.toLowerCase().includes(searchString)
          ))
      );
    });

    if (newFilterRole !== "all") {
      filteredUsers = filteredUsers.filter(
        (user) => user.role === newFilterRole
      );
    }

    filteredUsers.sort((a, b) => {
      const aValue = (a[newSortBy] || "").toLowerCase();
      const bValue = (b[newSortBy] || "").toLowerCase();
      return newSortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    setDisplayUsers(filteredUsers);
    setCurrentPage(1);
  };

  return {
    users,
    displayUsers,
    newUser,
    editingUser,
    isModalOpen,
    isLoading,
    isDeleteModalOpen,
    userToDelete,
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
