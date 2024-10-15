import React, { useState, useEffect } from "react";

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Users Management</h2>

      {userRole === "admin" && (
        <form onSubmit={handleSubmit} className="mb-8">
          <input
            type="email"
            name="email"
            value={editingUser ? editingUser.email : newUser.email}
            onChange={handleInputChange}
            placeholder="Email"
            required
            className="mr-2 p-2 border rounded"
          />
          <input
            type="text"
            name="firstName"
            value={editingUser ? editingUser.firstName : newUser.firstName}
            onChange={handleInputChange}
            placeholder="First Name"
            required
            className="mr-2 p-2 border rounded"
          />
          <input
            type="text"
            name="lastName"
            value={editingUser ? editingUser.lastName : newUser.lastName}
            onChange={handleInputChange}
            placeholder="Last Name"
            required
            className="mr-2 p-2 border rounded"
          />
          <select
            name="role"
            value={editingUser ? editingUser.role : newUser.role}
            onChange={handleInputChange}
            className="mr-2 p-2 border rounded"
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
              className="mr-2 p-2 border rounded"
            />
          )}
          <button type="submit" className="p-2 bg-blue-500 text-white rounded">
            {editingUser ? "Update User" : "Add User"}
          </button>
        </form>
      )}

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
            {userRole !== "mallOwner" && (
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
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
              {userRole !== "mallOwner" && (
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {canEdit(user) && (
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      Edit
                    </button>
                  )}
                  {canDelete(user) && (
                    <button
                      onClick={() => handleDelete(user.id, user.role)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
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
};

export default Users;
