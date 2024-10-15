import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaUserPlus } from "react-icons/fa";

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
  const [newUser, setNewUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "user",
    vehicleNumber: "",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (userRole === "admin") {
      setUsers([...adminData, ...mallOwnerData, ...userData]);
    } else if (userRole === "mallOwner") {
      setUsers(userData);
    } else if (userRole === "user") {
      setUsers(userData.filter((user) => user.email === currentUserEmail));
    }
  }, [adminData, mallOwnerData, userData, userRole, currentUserEmail]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingUser) {
      setEditingUser({ ...editingUser, [name]: value });
    } else {
      setNewUser({ ...newUser, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingUser) {
      await updateUser(editingUser.id, editingUser.role, editingUser);
      setEditingUser(null);
    } else {
      await addNewUser(
        newUser.email,
        newUser.role,
        newUser.firstName,
        newUser.lastName,
        newUser.vehicleNumber
      );
      setNewUser({
        email: "",
        firstName: "",
        lastName: "",
        role: "user",
        vehicleNumber: "",
      });
    }
    setIsModalOpen(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, role) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteUser(id, role);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Users Management</h2>
        {userRole === "admin" && (
          <button
            onClick={() => {
              setEditingUser(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
          >
            <FaUserPlus className="mr-2" />
            Add New User
          </button>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                First Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Last Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Role
              </th>
              {userRole !== "mallOwner" && (
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {user.email}
                  </p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {user.firstName}
                  </p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">
                    {user.lastName}
                  </p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                  <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-green-200 opacity-50 rounded-full"
                    ></span>
                    <span className="relative">{user.role}</span>
                  </span>
                </td>
                {userRole !== "mallOwner" && (
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    {canEdit(user) && (
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-500 hover:text-blue-700 mr-3"
                      >
                        <FaEdit />
                      </button>
                    )}
                    {canDelete(user) && (
                      <button
                        onClick={() => handleDelete(user.id, user.role)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              {editingUser ? "Edit User" : "Add New User"}
            </h3>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                value={editingUser ? editingUser.email : newUser.email}
                onChange={handleInputChange}
                placeholder="Email"
                required
                className="mb-3 w-full px-3 py-2 border rounded-md"
              />
              <input
                type="text"
                name="firstName"
                value={editingUser ? editingUser.firstName : newUser.firstName}
                onChange={handleInputChange}
                placeholder="First Name"
                required
                className="mb-3 w-full px-3 py-2 border rounded-md"
              />
              <input
                type="text"
                name="lastName"
                value={editingUser ? editingUser.lastName : newUser.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
                required
                className="mb-3 w-full px-3 py-2 border rounded-md"
              />
              <select
                name="role"
                value={editingUser ? editingUser.role : newUser.role}
                onChange={handleInputChange}
                className="mb-3 w-full px-3 py-2 border rounded-md"
              >
                <option value="user">User</option>
                <option value="mallOwner">Mall Owner</option>
                <option value="admin">Admin</option>
              </select>
              {(editingUser?.role === "user" || newUser.role === "user") && (
                <input
                  type="text"
                  name="vehicleNumber"
                  value={
                    editingUser
                      ? editingUser.vehicleNumber || ""
                      : newUser.vehicleNumber || ""
                  }
                  onChange={handleInputChange}
                  placeholder="Vehicle Number"
                  className="mb-3 w-full px-3 py-2 border rounded-md"
                />
              )}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mr-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {editingUser ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
