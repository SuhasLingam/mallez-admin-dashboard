import React, { useEffect } from "react";
import { FaUserPlus, FaEdit, FaTrash, FaCar } from "react-icons/fa";
import UserTable from "./UserTable";
import UserForm from "./UserForm";
import SearchAndFilter from "../common/SearchAndFilter";
import Pagination from "../common/Pagination";
import ConfirmationModal from "../common/ConfirmationModal";
import useUserManagement from "../../hooks/useUserManagement";

const Users = ({ userRole, currentUserEmail, updateUser }) => {
  const {
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
  } = useUserManagement(userRole, currentUserEmail, updateUser);

  useEffect(() => {
    refreshUserLists();
  }, []);

  const filteredAndSortedUsers = getFilteredAndSortedUsers(
    displayUsers,
    filterRole,
    searchTerm,
    sortBy,
    sortOrder
  );
  const currentUsers = getCurrentPageUsers(
    filteredAndSortedUsers,
    currentPage,
    usersPerPage
  );

  return (
    <div className="container px-4 py-8 mx-auto">
      <h2 className="mb-6 text-3xl font-semibold text-gray-800">
        Users Management
      </h2>
      {renderAddUserButton(userRole, setIsModalOpen)}
      <SearchAndFilter
        searchTerm={searchTerm}
        filterRole={filterRole}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSearchAndFilter={handleSearchAndFilter}
      />
      <div className="overflow-hidden bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <h3 className="mb-4 text-xl font-semibold text-gray-800">
            User List
          </h3>
          {renderUserList(
            isLoading,
            currentUsers,
            userRole,
            currentUserEmail,
            handleEdit,
            handleDelete
          )}
          <Pagination
            currentPage={currentPage}
            totalUsers={filteredAndSortedUsers.length}
            usersPerPage={usersPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      {renderUserForm(
        isModalOpen,
        editingUser,
        newUser,
        handleSubmit,
        closeModal,
        handleInputChange,
        handleVehicleNumberChange,
        addVehicleNumberField,
        removeVehicleNumberField
      )}
      {renderConfirmationModal(isDeleteModalOpen, confirmDelete)}
    </div>
  );
};

const getFilteredAndSortedUsers = (
  users,
  filterRole,
  searchTerm,
  sortBy,
  sortOrder
) => {
  const filteredUsers = users.filter((user) => {
    if (filterRole !== "all" && user.role !== filterRole) return false;
    return (
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.vehicleNumbers &&
        user.vehicleNumbers.some((vn) =>
          vn.toLowerCase().includes(searchTerm.toLowerCase())
        ))
    );
  });

  return [...filteredUsers].sort((a, b) => {
    if (sortBy === "name") {
      return sortOrder === "asc"
        ? a.firstName.localeCompare(b.firstName)
        : b.firstName.localeCompare(a.firstName);
    } else if (sortBy === "email") {
      return sortOrder === "asc"
        ? a.email.localeCompare(b.email)
        : b.email.localeCompare(a.email);
    }
    return 0;
  });
};

const getCurrentPageUsers = (users, currentPage, usersPerPage) => {
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  return users.slice(indexOfFirstUser, indexOfLastUser);
};

const renderAddUserButton = (userRole, setIsModalOpen) => {
  if (userRole === "admin") {
    return (
      <button
        onClick={() => setIsModalOpen(true)}
        className="hover:bg-green-600 inline-flex items-center px-4 py-2 mb-4 font-bold text-white transition-colors bg-green-500 rounded"
      >
        <FaUserPlus className="mr-2" />
        Add New User
      </button>
    );
  }
  return null;
};

const renderUserList = (
  isLoading,
  users,
  userRole,
  currentUserEmail,
  onEdit,
  onDelete
) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      <div className="md:block hidden">
        <UserTable
          users={users}
          userRole={userRole}
          currentUserEmail={currentUserEmail}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
      <div className="md:hidden sm:grid-cols-2 grid grid-cols-1 gap-4">
        {users.map((user) =>
          renderUserCard(user, currentUserEmail, onEdit, onDelete)
        )}
      </div>
    </>
  );
};

const renderUserCard = (user, currentUserEmail, onEdit, onDelete) => (
  <div
    key={`${user.role}-${user.id}`}
    className="hover:shadow-lg p-4 mb-4 transition-shadow duration-300 bg-white rounded-lg shadow-md"
  >
    <div className="flex items-center justify-between mb-2">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">
          {`${user.firstName} ${user.lastName}`}
        </h3>
        <p className="text-sm text-gray-600">{user.email}</p>
        <p className="text-sm text-gray-600">Phone: {user.phoneNumber}</p>
      </div>
      <span
        className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${getRoleColor(
          user.role
        )}`}
      >
        {user.role}
      </span>
    </div>
    {renderVehicleNumbers(user)}
    <div className="flex justify-end mt-4">
      <button
        onClick={() => onEdit(user)}
        className="hover:text-blue-700 mr-2 text-blue-500 transition-colors duration-300"
      >
        <FaEdit />
      </button>
      {user.email !== currentUserEmail && (
        <button
          onClick={() => onDelete(user)}
          className="hover:text-red-700 text-red-500 transition-colors duration-300"
        >
          <FaTrash />
        </button>
      )}
    </div>
  </div>
);

const renderVehicleNumbers = (user) => {
  if (user.role === "user" && user.vehicleNumbers) {
    return (
      <div className="mt-2">
        <p className="text-sm font-semibold text-gray-700">Vehicle Numbers:</p>
        <ul className="list-disc list-inside">
          {user.vehicleNumbers.map((vn, index) => (
            <li key={index} className="flex items-center text-sm text-gray-600">
              <FaCar className="mr-2 text-blue-500" />
              {vn}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return null;
};

const getRoleColor = (role) => {
  switch (role) {
    case "admin":
      return "bg-purple-500";
    case "mallOwner":
      return "bg-blue-500";
    case "user":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

const renderUserForm = (
  isModalOpen,
  editingUser,
  newUser,
  onSubmit,
  onClose,
  onInputChange,
  onVehicleNumberChange,
  onAddVehicleNumber,
  onRemoveVehicleNumber
) => {
  if (isModalOpen) {
    return (
      <UserForm
        user={editingUser || newUser}
        onSubmit={onSubmit}
        onClose={onClose}
        onInputChange={onInputChange}
        onVehicleNumberChange={onVehicleNumberChange}
        onAddVehicleNumber={onAddVehicleNumber}
        onRemoveVehicleNumber={onRemoveVehicleNumber}
      />
    );
  }
  return null;
};

const renderConfirmationModal = (isDeleteModalOpen, confirmDelete) => (
  <ConfirmationModal
    isOpen={isDeleteModalOpen}
    onClose={() => setIsDeleteModalOpen(false)}
    onConfirm={confirmDelete}
    title="Confirm Delete"
    message="Are you sure you want to delete this user? This action cannot be undone."
  />
);

export default Users;
