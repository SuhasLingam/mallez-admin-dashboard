import React, { useState } from "react";

const Users = ({
  adminData,
  mallOwnerData,
  userRole,
  addNewUser,
  updateUser,
  deleteUser,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [newUserData, setNewUserData] = useState({
    email: "",
    role: "user",
    firstName: "",
    lastName: "",
    vehicleNumber: "",
  });

  const handleEdit = (user) => {
    setEditingId(user.id);
    setEditedData({ ...user });
  };

  const handleSave = async () => {
    await updateUser(editingId, editedData.role, editedData);
    setEditingId(null);
  };

  const handleDelete = async (id, role) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteUser(id, role);
    }
  };

  const handleChange = (e, field) => {
    setEditedData({ ...editedData, [field]: e.target.value });
  };

  const handleNewUserChange = (e) => {
    setNewUserData({ ...newUserData, [e.target.name]: e.target.value });
  };

  const handleAddNewUser = async (e) => {
    e.preventDefault();
    await addNewUser(
      newUserData.email,
      newUserData.role,
      newUserData.firstName,
      newUserData.lastName,
      newUserData.role === "user" ? newUserData.vehicleNumber : null
    );
    setNewUserData({
      email: "",
      role: "user",
      firstName: "",
      lastName: "",
      vehicleNumber: "",
    });
  };

  const renderUserTable = (data, role) => (
    <table className="min-w-full leading-normal">
      <thead>
        <tr>
          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-mainTextColor uppercase tracking-wider">
            Email
          </th>
          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-mainTextColor uppercase tracking-wider">
            First Name
          </th>
          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-mainTextColor uppercase tracking-wider">
            Last Name
          </th>
          {role === "user" && (
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-mainTextColor uppercase tracking-wider">
              Vehicle Number
            </th>
          )}
          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-mainTextColor uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((user) => (
          <tr key={user.id}>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {editingId === user.id ? (
                <input
                  type="email"
                  value={editedData.email || ""}
                  onChange={(e) => handleChange(e, "email")}
                  className="border rounded px-2 py-1"
                />
              ) : (
                user.email
              )}
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {editingId === user.id ? (
                <input
                  type="text"
                  value={editedData.firstName || ""}
                  onChange={(e) => handleChange(e, "firstName")}
                  className="border rounded px-2 py-1"
                />
              ) : (
                user.firstName
              )}
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {editingId === user.id ? (
                <input
                  type="text"
                  value={editedData.lastName || ""}
                  onChange={(e) => handleChange(e, "lastName")}
                  className="border rounded px-2 py-1"
                />
              ) : (
                user.lastName
              )}
            </td>
            {role === "user" && (
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {editingId === user.id ? (
                  <input
                    type="text"
                    value={editedData.vehicleNumber || ""}
                    onChange={(e) => handleChange(e, "vehicleNumber")}
                    className="border rounded px-2 py-1"
                  />
                ) : (
                  user.vehicleNumber
                )}
              </td>
            )}
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {editingId === user.id ? (
                <button
                  onClick={handleSave}
                  className="text-green-600 hover:text-green-900 mr-2"
                >
                  Save
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-blue-600 hover:text-blue-900 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.id, role)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4 text-mainTextColor">Users</h2>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2 text-mainTextColor">
          Add New User
        </h3>
        <form onSubmit={handleAddNewUser} className="space-y-4">
          <input
            type="email"
            name="email"
            value={newUserData.email}
            onChange={handleNewUserChange}
            placeholder="Email"
            className="border rounded px-2 py-1 w-full"
            required
          />
          <input
            type="text"
            name="firstName"
            value={newUserData.firstName}
            onChange={handleNewUserChange}
            placeholder="First Name"
            className="border rounded px-2 py-1 w-full"
            required
          />
          <input
            type="text"
            name="lastName"
            value={newUserData.lastName}
            onChange={handleNewUserChange}
            placeholder="Last Name"
            className="border rounded px-2 py-1 w-full"
            required
          />
          {newUserData.role === "user" && (
            <input
              type="text"
              name="vehicleNumber"
              value={newUserData.vehicleNumber}
              onChange={handleNewUserChange}
              placeholder="Vehicle Number"
              className="border rounded px-2 py-1 w-full"
            />
          )}
          <select
            name="role"
            value={newUserData.role}
            onChange={handleNewUserChange}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="mallOwner">Mall Owner</option>
          </select>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
          >
            Add User
          </button>
        </form>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto mb-8">
        <h3 className="text-xl font-semibold m-4 text-mainTextColor">Admins</h3>
        {renderUserTable(adminData, "admin")}
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto mb-8">
        <h3 className="text-xl font-semibold m-4 text-mainTextColor">
          Mall Owners
        </h3>
        {renderUserTable(mallOwnerData, "mallOwner")}
      </div>
    </div>
  );
};

export default Users;
