import React from "react";

const Dashboard = ({ adminData, mallOwnerData, userRole }) => {
  const renderUserTable = (data) => (
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
          <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-mainTextColor uppercase tracking-wider">
            Vehicle Number
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {item.email}
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {item.firstName}
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {item.lastName}
            </td>
            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {item.vehicleNumber}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4 text-mainTextColor">
        Dashboard
      </h2>
      {userRole === "admin" && (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-x-auto mb-8">
            <h3 className="text-xl font-semibold m-4 text-mainTextColor">
              Admins
            </h3>
            {renderUserTable(adminData)}
          </div>
          <div className="bg-white shadow-md rounded-lg overflow-x-auto mb-8">
            <h3 className="text-xl font-semibold m-4 text-mainTextColor">
              Mall Owners
            </h3>
            {renderUserTable(mallOwnerData)}
          </div>
        </>
      )}
      {userRole === "mallOwner" && (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto mb-8">
          <h3 className="text-xl font-semibold m-4 text-mainTextColor">
            Your Information
          </h3>
          {renderUserTable(mallOwnerData)}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
