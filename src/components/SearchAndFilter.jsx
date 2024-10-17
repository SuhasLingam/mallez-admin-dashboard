import React from "react";
import { FaSearch, FaChevronDown } from "react-icons/fa";

const SearchAndFilter = ({
  searchTerm,
  filterRole,
  sortBy,
  sortOrder,
  onSearchAndFilter,
}) => {
  const handleChange = (type, value) => {
    onSearchAndFilter(
      type === "searchTerm" ? value : searchTerm,
      type === "filterRole" ? value : filterRole,
      type === "sortBy" ? value : sortBy,
      type === "sortOrder" ? value : sortOrder
    );
  };

  return (
    <div className="md:flex-row md:items-center md:justify-between md:space-y-0 flex flex-col mb-4 space-y-2">
      <div className="md:w-1/2 relative w-full">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => handleChange("searchTerm", e.target.value)}
          className="focus:border-blue-500 focus:outline-none focus:ring w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border rounded-lg"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <FaSearch className="text-gray-400" />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <select
          value={filterRole}
          onChange={(e) => handleChange("filterRole", e.target.value)}
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
            onChange={(e) => handleChange("sortBy", e.target.value)}
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
          onClick={() =>
            handleChange("sortOrder", sortOrder === "asc" ? "desc" : "asc")
          }
          className="focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 py-2 text-gray-700 bg-white border rounded-lg"
        >
          {sortOrder === "asc" ? "▲" : "▼"}
        </button>
      </div>
    </div>
  );
};

export default SearchAndFilter;
