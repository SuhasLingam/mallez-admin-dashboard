import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaPlus,
  FaMinus,
  FaSearch,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import {
  getFirestore,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../config/firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Users = ({
  adminData,
  mallOwnerData,
  userData,
  userRole,
  addNewUser,
  updateUser,
  deleteUser,
  currentUserEmail,
}) => {
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
  const [vehicleNumbers, setVehicleNumbers] = useState([""]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [sortBy, setSortBy] = useState("email");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  useEffect(() => {
    let allUsers = [];
    if (userRole === "admin") {
      allUsers = [...adminData, ...mallOwnerData, ...userData];
    } else if (userRole === "mallOwner") {
      allUsers = userData;
    } else if (userRole === "user") {
      allUsers = userData.filter((user) => user.email === currentUserEmail);
    }

    // Merge users with the same email
    const mergedUsers = mergeUsersByEmail(allUsers);
    setUsers(mergedUsers);
  }, [adminData, mallOwnerData, userData, userRole, currentUserEmail]);

  const mergeUsersByEmail = (users) => {
    const userMap = new Map();

    users.forEach((user) => {
      if (userMap.has(user.email)) {
        const existingUser = userMap.get(user.email);
        userMap.set(user.email, mergeUserData(existingUser, user));
      } else {
        userMap.set(user.email, { ...user });
      }
    });

    return Array.from(userMap.values());
  };

  const mergeUserData = (user1, user2) => {
    return {
      ...user1,
      ...user2,
      id: user1.id || user2.id,
      firstName: user1.firstName || user2.firstName,
      lastName: user1.lastName || user2.lastName,
      role: [user1.role, user2.role].includes("admin")
        ? "admin"
        : [user1.role, user2.role].includes("mallOwner")
        ? "mallOwner"
        : "user",
      vehicleNumbers: [
        ...(user1.vehicleNumbers || []),
        ...(user2.vehicleNumbers || []),
      ].filter((v, i, a) => a.indexOf(v) === i), // Remove duplicates
    };
  };

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole, sortBy, sortOrder]);

  const filterUsers = () => {
    let filteredUsers = users.filter((user) => {
      const searchString = searchTerm.toLowerCase();
      return (
        user.email.toLowerCase().includes(searchString) ||
        user.firstName.toLowerCase().includes(searchString) ||
        user.lastName.toLowerCase().includes(searchString) ||
        (user.vehicleNumbers &&
          user.vehicleNumbers.some((vn) =>
            vn.toLowerCase().includes(searchString)
          ))
      );
    });

    if (filterRole !== "all") {
      filteredUsers = filteredUsers.filter((user) => user.role === filterRole);
    }

    filteredUsers.sort((a, b) => {
      const aValue = a[sortBy].toLowerCase();
      const bValue = b[sortBy].toLowerCase();
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    setDisplayUsers(filteredUsers);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const renderSearchAndFilter = () => (
    <div className="md:flex-row md:items-center md:justify-between md:space-y-0 flex flex-col mb-4 space-y-2">
      <div className="md:w-1/2 relative w-full">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="focus:border-blue-500 focus:outline-none focus:ring w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border rounded-lg"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <FaSearch className="text-gray-400" />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="focus:border-blue-500 focus:outline-none focus:ring px-4 py-2 text-gray-700 bg-white border rounded-lg"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="mallOwner">Mall Owner</option>
          <option value="user">User</option>
        </select>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="focus:border-blue-500 focus:outline-none focus:ring px-4 py-2 pr-8 text-gray-700 bg-white border rounded-lg appearance-none"
          >
            <option value="email">Sort by Email</option>
            <option value="firstName">Sort by First Name</option>
            <option value="lastName">Sort by Last Name</option>
            <option value="role">Sort by Role</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <FaChevronDown className="text-gray-400" />
          </div>
        </div>
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 py-2 text-gray-700 bg-white border rounded-lg"
        >
          {sortOrder === "asc" ? "▲" : "▼"}
        </button>
      </div>
    </div>
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingUser) {
      setEditingUser({ ...editingUser, [name]: value });
    } else {
      setNewUser({ ...newUser, [name]: value });
    }
  };

  const handleRoleChange = async (userId, newRole, oldRole) => {
    setIsLoading(true);
    try {
      const userToUpdate = users.find((u) => u.id === userId);
      if (!userToUpdate) {
        throw new Error("User not found");
      }

      // Update the user's role in the users collection
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });

      // Remove the user from the old role's collection (if applicable)
      if (oldRole === "admin" || oldRole === "mallOwner") {
        await deleteDoc(doc(db, `${oldRole}s`, userId));
      }

      // Add the user to the new role's collection (if applicable)
      if (newRole === "admin" || newRole === "mallOwner") {
        await setDoc(
          doc(db, `${newRole}s`, userId),
          {
            email: userToUpdate.email,
            firstName: userToUpdate.firstName,
            lastName: userToUpdate.lastName,
          },
          { merge: true }
        );
      }

      // Update the local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      toast.success("User role updated successfully");
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingUser) {
        const oldUser = users.find((u) => u.id === editingUser.id);
        if (editingUser.role !== oldUser.role) {
          await handleRoleChange(
            editingUser.id,
            editingUser.role,
            oldUser.role
          );
        }
        await updateUser(editingUser.id, editingUser.role, editingUser);
        setEditingUser(null);
      } else {
        const newUserId = await addNewUser(
          newUser.email,
          newUser.role,
          newUser.firstName,
          newUser.lastName,
          newUser.vehicleNumbers
        );
        if (newUser.role === "admin" || newUser.role === "mallOwner") {
          await setDoc(
            doc(db, `${newUser.role}s`, newUserId),
            {
              email: newUser.email,
              firstName: newUser.firstName,
              lastName: newUser.lastName,
            },
            { merge: true }
          );
        }
        setNewUser({
          email: "",
          firstName: "",
          lastName: "",
          role: "user",
          vehicleNumbers: [""],
        });
      }
      toast.success("User updated successfully");
      closeModal();
    } catch (error) {
      console.error("Error updating user:", error);
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
      if (userToDelete.role === "admin" || userToDelete.role === "mallOwner") {
        await deleteDoc(doc(db, `${userToDelete.role}s`, userToDelete.id));
      }
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user: " + error.message);
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const canEdit = (user) => {
    return (
      userRole === "admin" ||
      (userRole === "user" && user.email === currentUserEmail)
    );
  };

  const canDelete = (user) => {
    return (
      userRole === "admin" ||
      (userRole === "user" && user.email === currentUserEmail)
    );
  };

  const handleVehicleNumberChange = (index, value) => {
    const updatedVehicleNumbers = [...vehicleNumbers];
    updatedVehicleNumbers[index] = value;
    setVehicleNumbers(updatedVehicleNumbers);
    if (editingUser) {
      setEditingUser({ ...editingUser, vehicleNumbers: updatedVehicleNumbers });
    } else {
      setNewUser({ ...newUser, vehicleNumbers: updatedVehicleNumbers });
    }
  };

  const addVehicleNumberField = () => {
    setVehicleNumbers([...vehicleNumbers, ""]);
  };

  const removeVehicleNumberField = (index) => {
    const updatedVehicleNumbers = vehicleNumbers.filter((_, i) => i !== index);
    setVehicleNumbers(updatedVehicleNumbers);
    if (editingUser) {
      setEditingUser({ ...editingUser, vehicleNumbers: updatedVehicleNumbers });
    } else {
      setNewUser({ ...newUser, vehicleNumbers: updatedVehicleNumbers });
    }
  };

  const renderUserForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          className="block mb-1 text-sm font-medium text-gray-700"
          htmlFor="email"
        >
          Email
        </label>
        <input
          className="focus:border-blue-500 focus:outline-none focus:ring w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border rounded-lg"
          id="email"
          type="email"
          name="email"
          value={editingUser ? editingUser.email : newUser.email}
          onChange={handleInputChange}
          placeholder="Email"
          required
        />
      </div>
      <div>
        <label
          className="block mb-1 text-sm font-medium text-gray-700"
          htmlFor="firstName"
        >
          First Name
        </label>
        <input
          className="focus:outline-none focus:ring-2 focus:ring-blue-500 w-full px-3 py-2 text-gray-700 border rounded-md"
          id="firstName"
          type="text"
          name="firstName"
          value={editingUser ? editingUser.firstName : newUser.firstName}
          onChange={handleInputChange}
          placeholder="First Name"
          required
        />
      </div>
      <div>
        <label
          className="block mb-1 text-sm font-medium text-gray-700"
          htmlFor="lastName"
        >
          Last Name
        </label>
        <input
          className="focus:outline-none focus:ring-2 focus:ring-blue-500 w-full px-3 py-2 text-gray-700 border rounded-md"
          id="lastName"
          type="text"
          name="lastName"
          value={editingUser ? editingUser.lastName : newUser.lastName}
          onChange={handleInputChange}
          placeholder="Last Name"
          required
        />
      </div>
      <div>
        <label
          className="block mb-1 text-sm font-medium text-gray-700"
          htmlFor="role"
        >
          Role
        </label>
        <select
          className="focus:outline-none focus:ring-2 focus:ring-blue-500 w-full px-3 py-2 text-gray-700 border rounded-md"
          id="role"
          name="role"
          value={editingUser ? editingUser.role : newUser.role}
          onChange={handleInputChange}
        >
          <option value="user">User</option>
          <option value="mallOwner">Mall Owner</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {(editingUser?.role === "user" || newUser.role === "user") && (
        <div className="mb-4">
          <label
            className="block mb-2 text-sm font-bold text-gray-700"
            htmlFor="vehicleNumbers"
          >
            Vehicle Numbers
          </label>
          {vehicleNumbers.map((vn, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                className="focus:outline-none focus:shadow-outline w-full px-3 py-2 mr-2 leading-tight text-gray-700 border rounded shadow appearance-none"
                type="text"
                value={vn}
                onChange={(e) =>
                  handleVehicleNumberChange(index, e.target.value)
                }
                placeholder={`Vehicle Number ${index + 1}`}
              />
              {index === vehicleNumbers.length - 1 ? (
                <button
                  type="button"
                  onClick={addVehicleNumberField}
                  className="hover:bg-green-700 px-4 py-2 font-bold text-white bg-green-500 rounded"
                >
                  <FaPlus />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => removeVehicleNumberField(index)}
                  className="hover:bg-red-700 px-4 py-2 font-bold text-white bg-red-500 rounded"
                >
                  <FaMinus />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-end pt-4 space-x-2">
        <button
          type="button"
          onClick={closeModal}
          className="hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md"
        >
          {editingUser ? "Update User" : "Add User"}
        </button>
      </div>
    </form>
  );

  const renderModal = () => (
    <AnimatePresence>
      {isModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="backdrop-blur-sm fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={closeModal}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="focus:outline-none fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none"
          >
            <div className="relative w-full max-w-lg mx-auto my-6">
              <motion.div
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="focus:outline-none relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none"
              >
                <div className="border-blueGray-200 flex items-start justify-between p-5 border-b border-solid rounded-t">
                  <h3 className="text-2xl font-semibold text-gray-800">
                    {editingUser ? "Edit User" : "Add New User"}
                  </h3>
                  <button
                    className="focus:outline-none float-right p-1 ml-auto text-3xl font-semibold leading-none text-gray-400 bg-transparent border-0 outline-none"
                    onClick={closeModal}
                  >
                    <span className="hover:text-gray-600 block w-6 h-6 text-2xl text-gray-400 transition-colors duration-200">
                      ×
                    </span>
                  </button>
                </div>
                <div className="relative flex-auto p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                  {renderUserForm()}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = displayUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(displayUsers.length / usersPerPage); i++) {
      pageNumbers.push(i);
    }

    return (
      <nav className="flex justify-center mt-4">
        <ul className="flex">
          {pageNumbers.map((number) => (
            <li key={number} className="mx-1">
              <button
                onClick={() => paginate(number)}
                className={`px-3 py-1 rounded ${
                  currentPage === number
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {number}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  };

  const renderUserTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full leading-normal">
        <thead className="md:table-header-group hidden">
          <tr>
            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
              User
            </th>
            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
              Role
            </th>
            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
              Vehicle Numbers
            </th>
            {userRole !== "mallOwner" && (
              <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user, index) => (
            <tr
              key={`${user.id || user.email}-${index}`}
              className="hover:bg-gray-50 md:table-row flex flex-col mb-4 transition-colors border rounded-lg shadow-sm"
            >
              <td className="md:border-b-0 px-5 py-5 text-sm bg-white border-b border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10">
                    <img
                      className="w-full h-full rounded-full"
                      src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`}
                      alt=""
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-gray-600 whitespace-no-wrap">
                      {user.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="md:border-b-0 px-5 py-5 text-sm bg-white border-b border-gray-200">
                <span
                  className={`px-2 py-1 text-xs font-semibold leading-tight rounded-full ${
                    user.role === "admin"
                      ? "text-red-700 bg-red-100"
                      : user.role === "mallOwner"
                      ? "text-yellow-700 bg-yellow-100"
                      : "text-green-700 bg-green-100"
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="md:border-b-0 px-5 py-5 text-sm bg-white border-b border-gray-200">
                {user.vehicleNumbers && user.vehicleNumbers.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {user.vehicleNumbers.map((vn, vnIndex) => (
                      <li key={`${user.id || user.email}-${index}-${vnIndex}`}>
                        {vn}
                      </li>
                    ))}
                  </ul>
                ) : (
                  "N/A"
                )}
              </td>
              {userRole !== "mallOwner" && (
                <td className="px-5 py-5 text-sm bg-white">
                  <div className="flex space-x-2">
                    {canEdit(user) && (
                      <button
                        onClick={() => handleEdit(user)}
                        className="hover:text-blue-700 text-blue-500 transition-colors"
                      >
                        <FaEdit />
                      </button>
                    )}
                    {canDelete(user) && (
                      <button
                        onClick={() => handleDelete(user.id, user.role)}
                        className="hover:text-red-700 text-red-500 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderDeleteConfirmationModal = () => (
    <AnimatePresence>
      {isDeleteModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="backdrop-blur-sm fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="focus:outline-none fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none"
          >
            <div className="relative w-full max-w-md mx-auto my-6">
              <div className="focus:outline-none relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none">
                <div className="border-blueGray-200 flex items-start justify-between p-5 border-b border-solid rounded-t">
                  <h3 className="text-2xl font-semibold text-gray-800">
                    Confirm Delete
                  </h3>
                  <button
                    className="focus:outline-none float-right p-1 ml-auto text-3xl font-semibold leading-none text-gray-400 bg-transparent border-0 outline-none"
                    onClick={() => setIsDeleteModalOpen(false)}
                  >
                    <span className="hover:text-gray-600 block w-6 h-6 text-2xl text-gray-400 transition-colors duration-200">
                      ×
                    </span>
                  </button>
                </div>
                <div className="relative flex-auto p-6">
                  <p className="text-gray-700">
                    Are you sure you want to delete this user? This action
                    cannot be undone.
                  </p>
                </div>
                <div className="border-blueGray-200 flex items-center justify-end p-6 border-t border-solid rounded-b">
                  <button
                    className="hover:bg-gray-100 focus:outline-none px-4 py-2 mr-2 text-sm font-bold text-gray-500 uppercase transition-colors duration-150 ease-linear bg-white rounded shadow outline-none"
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="hover:bg-red-600 focus:outline-none px-4 py-2 text-sm font-bold text-white uppercase transition-colors duration-150 ease-linear bg-red-500 rounded shadow outline-none"
                    type="button"
                    onClick={confirmDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div className="container px-4 py-8 mx-auto">
      <h2 className="mb-6 text-3xl font-semibold text-gray-800">
        Users Management
      </h2>
      {userRole === "admin" && (
        <button
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
          className="hover:bg-green-700 inline-flex items-center px-4 py-2 mb-4 font-bold text-white transition-colors bg-green-500 rounded"
        >
          <FaUserPlus className="mr-2" />
          Add New User
        </button>
      )}
      {renderSearchAndFilter()}
      <div className="overflow-hidden bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <h3 className="mb-4 text-xl font-semibold text-gray-800">
            User List
          </h3>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-32 h-32 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
            </div>
          ) : (
            renderUserTable()
          )}
          {renderPagination()}
        </div>
      </div>
      {renderModal()}
      {renderDeleteConfirmationModal()}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default Users;
