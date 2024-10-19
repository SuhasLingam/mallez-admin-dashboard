import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebaseService";
import { FaUsers, FaUserTie, FaUserShield, FaSearch } from "react-icons/fa";

const Dashboard = ({ userRole }) => {
  const [selectedUserType, setSelectedUserType] = useState("user");
  const [displayData, setDisplayData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userCounts, setUserCounts] = useState({
    user: 0,
    admin: 0,
    mallOwner: 0,
  });
  const [allUsers, setAllUsers] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setDisplayData(allUsers[selectedUserType] || []);
  }, [selectedUserType, allUsers]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const roles = ["user", "admin", "mallOwner"];
      let fetchedUsers = {};
      let counts = { user: 0, admin: 0, mallOwner: 0 };

      for (const role of roles) {
        const usersCollection = collection(db, "platform_users", role, role);
        const querySnapshot = await getDocs(usersCollection);
        const users = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          role,
        }));
        fetchedUsers[role] = users;
        counts[role] = users.length;
      }

      setUserCounts(counts);
      setAllUsers(fetchedUsers);
      setDisplayData(fetchedUsers[selectedUserType] || []);
      console.log("User counts:", counts);
      console.log("Display data:", fetchedUsers[selectedUserType]);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = displayData.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.vehicleNumbers &&
        user.vehicleNumbers.some((vn) =>
          vn.toLowerCase().includes(searchTerm.toLowerCase())
        ))
  );

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

  const renderUserTable = (data) => (
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
            {selectedUserType === "user" && (
              <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
                Vehicle Numbers
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                {item.email}
              </td>
              <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                {item.firstName}
              </td>
              <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                {item.lastName}
              </td>
              {selectedUserType === "user" && (
                <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                  {item.vehicleNumbers && item.vehicleNumbers.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {item.vehicleNumbers.map((vn, index) => (
                        <li key={index}>{vn}</li>
                      ))}
                    </ul>
                  ) : (
                    "N/A"
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderUserTypeSelector = () => (
    <div className="mb-6">
      <label
        htmlFor="userType"
        className="block mb-2 text-sm font-medium text-gray-700"
      >
        Select User Type:
      </label>
      <div className="flex space-x-4">
        {["user", "admin", "mallOwner"].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedUserType(type)}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              selectedUserType === type
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {type === "user" && <FaUsers className="mr-2" />}
            {type === "admin" && <FaUserShield className="mr-2" />}
            {type === "mallOwner" && <FaUserTie className="mr-2" />}
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );

  const renderUserCounts = () => (
    <div className="md:grid-cols-3 grid grid-cols-1 gap-4 mb-6">
      <div className="flex items-center p-4 bg-white rounded-lg shadow-md">
        <FaUserShield className="mr-4 text-3xl text-purple-500" />
        <div>
          <h4 className="text-lg font-semibold">Admins</h4>
          <p className="text-2xl font-bold">{userCounts.admin}</p>
        </div>
      </div>
      <div className="flex items-center p-4 bg-white rounded-lg shadow-md">
        <FaUserTie className="mr-4 text-3xl text-green-500" />
        <div>
          <h4 className="text-lg font-semibold">Mall Owners</h4>
          <p className="text-2xl font-bold">{userCounts.mallOwner}</p>
        </div>
      </div>
      <div className="flex items-center p-4 bg-white rounded-lg shadow-md">
        <FaUsers className="mr-4 text-3xl text-blue-500" />
        <div>
          <h4 className="text-lg font-semibold">Users</h4>
          <p className="text-2xl font-bold">{userCounts.user}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container px-4 py-8 mx-auto">
      <h2 className="mb-6 text-3xl font-semibold text-gray-800">Dashboard</h2>
      {userRole === "admin" && renderUserCounts()}
      {userRole === "admin" && renderUserTypeSelector()}
      {renderSearchBar()}
      <div className="overflow-hidden bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <h3 className="mb-4 text-xl font-semibold text-gray-800">
            {selectedUserType.charAt(0).toUpperCase() +
              selectedUserType.slice(1)}
            s
          </h3>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-12 h-12 border-b-2 border-gray-900 rounded-full"></div>
            </div>
          ) : (
            renderUserTable(filteredUsers)
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
