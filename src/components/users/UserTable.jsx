import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

const UserTable = ({ users, userRole, currentUserEmail, onEdit, onDelete }) => {
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
          {users.map((user) => (
            <tr
              key={user.id || user.email}
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
                    {user.vehicleNumbers.map((vn, index) => (
                      <li key={index}>{vn}</li>
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
                        onClick={() => onEdit(user)}
                        className="hover:text-blue-700 text-blue-500 transition-colors"
                      >
                        <FaEdit />
                      </button>
                    )}
                    {canDelete(user) && (
                      <button
                        onClick={() => onDelete(user.id, user.role)}
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
};

export default UserTable;
