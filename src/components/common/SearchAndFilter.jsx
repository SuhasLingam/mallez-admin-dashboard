import React from "react";

const SearchAndFilter = ({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
}) => {
  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="p-2 border rounded"
      />
      {/* Add filter controls here if needed */}
    </div>
  );
};

export default SearchAndFilter;
