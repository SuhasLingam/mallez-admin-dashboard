import React from "react";
import { FaUserPlus } from "react-icons/fa";
import UserTable from "./UserTable";
import UserForm from "./UserForm";
import SearchAndFilter from "../common/SearchAndFilter";
import Pagination from "../common/Pagination";
import ConfirmationModal from "../common/ConfirmationModal";
import useUserManagement from "../../hooks/useUserManagement";

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
  } = useUserManagement(
    adminData,
    mallOwnerData,
    userData,
    userRole,
    currentUserEmail,
    addNewUser,
    updateUser,
    deleteUser
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = displayUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="container px-4 py-8 mx-auto">
      <h2 className="mb-6 text-3xl font-semibold text-gray-800">
        Users Management
      </h2>
      {userRole === "admin" && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="hover:bg-green-700 inline-flex items-center px-4 py-2 mb-4 font-bold text-white transition-colors bg-green-500 rounded"
        >
          <FaUserPlus className="mr-2" />
          Add New User
        </button>
      )}
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
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-32 h-32 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
            </div>
          ) : (
            <UserTable
              users={currentUsers}
              userRole={userRole}
              currentUserEmail={currentUserEmail}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          <Pagination
            currentPage={currentPage}
            totalUsers={displayUsers.length}
            usersPerPage={usersPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      {isModalOpen && (
        <UserForm
          user={editingUser || newUser}
          onSubmit={handleSubmit}
          onClose={closeModal}
          onInputChange={handleInputChange}
          onVehicleNumberChange={handleVehicleNumberChange}
          onAddVehicleNumber={addVehicleNumberField}
          onRemoveVehicleNumber={removeVehicleNumberField}
        />
      )}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
};

export default Users;
