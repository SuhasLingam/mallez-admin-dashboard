import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaPlus,
  FaMinus,
  FaSearch,
} from "react-icons/fa";

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

  useEffect(() => {
    if (userRole === "admin") {
      setUsers([...adminData, ...mallOwnerData, ...userData]);
    } else if (userRole === "mallOwner") {
      setUsers(userData);
    } else if (userRole === "user") {
      setUsers(userData.filter((user) => user.email === currentUserEmail));
    }
  }, [adminData, mallOwnerData, userData, userRole, currentUserEmail]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const filterUsers = () => {
    const filteredUsers = users.filter((user) => {
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
    setDisplayUsers(filteredUsers);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const renderSearchBar = () => (
    <div className="mb-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search by name, email, or vehicle number"
          value={searchTerm}
          onChange={handleSearchChange}
          className="focus:border-blue-500 focus:outline-none focus:ring w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border rounded-lg"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <FaSearch className="text-gray-400" />
        </div>
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
      className="px-8 pt-6 pb-8 mb-4 bg-white rounded shadow-md"
    >
      <div className="mb-4">
        <label
          className="block mb-2 text-sm font-bold text-gray-700"
          htmlFor="email"
        >
          Email
        </label>
        <input
          className="focus:outline-none focus:shadow-outline w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none"
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
          className="block mb-2 text-sm font-bold text-gray-700"
          htmlFor="firstName"
        >
          First Name
        </label>
        <input
          className="focus:outline-none focus:shadow-outline w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none"
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
          className="block mb-2 text-sm font-bold text-gray-700"
          htmlFor="lastName"
        >
          Last Name
        </label>
        <input
          className="focus:outline-none focus:shadow-outline w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none"
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
          className="block mb-2 text-sm font-bold text-gray-700"
          htmlFor="role"
        >
          Role
        </label>
        <select
          className="focus:outline-none focus:shadow-outline w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow appearance-none"
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
      <div className="flex items-center justify-between">
        <button
          className="hover:bg-blue-700 focus:outline-none focus:shadow-outline px-4 py-2 font-bold text-white bg-blue-500 rounded"
          type="submit"
        >
          {editingUser ? "Update User" : "Add User"}
        </button>
        {editingUser && (
          <button
            className="hover:bg-gray-700 focus:outline-none focus:shadow-outline px-4 py-2 font-bold text-white bg-gray-500 rounded"
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
            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
              Email
            </th>
            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
              First Name
            </th>
            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
              Last Name
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
          {displayUsers.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                {user.email}
              </td>
              <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                {user.firstName}
              </td>
              <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                {user.lastName}
              </td>
              <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                {user.role}
              </td>
              <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
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
                <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                  {canEdit(user) && (
                    <button
                      onClick={() => handleEdit(user)}
                      className="hover:text-blue-700 mr-2 text-blue-500"
                    >
                      <FaEdit />
                    </button>
                  )}
                  {canDelete(user) && (
                    <button
                      onClick={() => handleDelete(user.id, user.role)}
                      className="hover:text-red-700 text-red-500"
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
    <div className="container px-4 py-8 mx-auto">
      <h2 className="mb-6 text-3xl font-semibold text-gray-800">
        Users Management
      </h2>
      {userRole === "admin" && !editingUser && (
        <button
          onClick={() => setEditingUser({})}
          className="hover:bg-green-700 inline-flex items-center px-4 py-2 mb-4 font-bold text-white bg-green-500 rounded"
        >
          <FaUserPlus className="mr-2" />
          Add New User
        </button>
      )}
      {(userRole === "admin" || editingUser) && renderUserForm()}
      {renderSearchBar()}
      <div className="overflow-hidden bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <h3 className="mb-4 text-xl font-semibold text-gray-800">
            User List
          </h3>
          {renderUserTable()}
        </div>
      </div>
    </div>
  );
};

export default Users;
