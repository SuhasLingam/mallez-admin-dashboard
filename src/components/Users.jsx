import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaUserPlus, FaPlus, FaMinus } from "react-icons/fa";

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
    vehicleNumbers: [""],
  });
  const [editingUser, setEditingUser] = useState(null);
  const [vehicleNumbers, setVehicleNumbers] = useState([""]);

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
  };

  const handleEdit = (user) => {
    setEditingUser(user);
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
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
    >
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="email"
        >
          Email
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="email"
          type="email"
          name="email"
          value={editingUser ? editingUser.email : newUser.email}
          onChange={handleInputChange}
          placeholder="Email"
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="firstName"
        >
          First Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="firstName"
          type="text"
          name="firstName"
          value={editingUser ? editingUser.firstName : newUser.firstName}
          onChange={handleInputChange}
          placeholder="First Name"
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="lastName"
        >
          Last Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="lastName"
          type="text"
          name="lastName"
          value={editingUser ? editingUser.lastName : newUser.lastName}
          onChange={handleInputChange}
          placeholder="Last Name"
          required
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="role"
        >
          Role
        </label>
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="vehicleNumbers"
          >
            Vehicle Numbers
          </label>
          {vehicleNumbers.map((vn, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
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
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  <FaPlus />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => removeVehicleNumberField(index)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  <FaMinus />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          {editingUser ? "Update User" : "Add User"}
        </button>
        {editingUser && (
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => setEditingUser(null)}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );

  const renderUserTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full leading-normal">
        <thead>
          <tr>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Email
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              First Name
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Last Name
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Role
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Vehicle Numbers
            </th>
            {userRole !== "mallOwner" && (
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {user.email}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {user.firstName}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {user.lastName}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {user.role}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {user.vehicleNumbers && user.vehicleNumbers.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {user.vehicleNumbers.map((vn, index) => (
                      <li key={index}>{vn}</li>
                    ))}
                  </ul>
                ) : (
                  "N/A"
                )}
              </td>
              {userRole !== "mallOwner" && (
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {canEdit(user) && (
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-500 hover:text-blue-700 mr-2"
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
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">
        Users Management
      </h2>
      {userRole === "admin" && !editingUser && (
        <button
          onClick={() => setEditingUser({})}
          className="mb-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
        >
          <FaUserPlus className="mr-2" />
          Add New User
        </button>
      )}
      {(userRole === "admin" || editingUser) && renderUserForm()}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            User List
          </h3>
          {renderUserTable()}
        </div>
      </div>
    </div>
  );
};

export default Users;
