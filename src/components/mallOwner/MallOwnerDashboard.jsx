import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../../services/firebaseService";
import { FaBuilding, FaFilm, FaSpinner } from "react-icons/fa";
import TheaterChainsSection from "./TheaterChainsSection";
import { toast } from "react-toastify";

const MallOwnerDashboard = ({ activeTab: initialActiveTab }) => {
  const [activeTab, setActiveTab] = useState(initialActiveTab || "malls");
  const [assignedMalls, setAssignedMalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialActiveTab) {
      setActiveTab(initialActiveTab);
    }
  }, [initialActiveTab]);

  useEffect(() => {
    fetchAssignedLocations();
  }, []);

  const fetchAssignedLocations = async () => {
    setIsLoading(true);
    try {
      if (!auth.currentUser) {
        toast.error("You must be logged in to access this page");
        navigate("/login");
        return;
      }

      console.log("Current user email:", auth.currentUser.email);

      // Get mall owner document
      const mallOwnersRef = collection(
        db,
        "platform_users/mallOwner/mallOwner"
      );
      const q = query(
        mallOwnersRef,
        where("email", "==", auth.currentUser.email)
      );

      console.log("Fetching mall owner document...");
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error("No mall owner found for email:", auth.currentUser.email);
        toast.error("No mall owner account found");
        return;
      }

      const mallOwnerDoc = querySnapshot.docs[0];
      const userData = mallOwnerDoc.data();

      console.log("Mall owner data:", userData);
      console.log("Assigned locations:", userData.assignedLocations);

      if (
        !userData.assignedLocations ||
        userData.assignedLocations.length === 0
      ) {
        console.log("No assigned locations found");
        setAssignedMalls([]);
        return;
      }

      // Fetch mall details
      const mallsData = await Promise.all(
        userData.assignedLocations.map(async (assignment) => {
          try {
            console.log("Processing assignment:", assignment);
            const { mallChainId, locationId } = assignment;

            const mallChainRef = doc(db, "mallChains", mallChainId);
            const locationRef = doc(
              db,
              "mallChains",
              mallChainId,
              "locations",
              locationId
            );

            const [mallChainDoc, locationDoc] = await Promise.all([
              getDoc(mallChainRef),
              getDoc(locationRef),
            ]);

            if (!mallChainDoc.exists()) {
              console.error("Mall chain not found:", mallChainId);
              return null;
            }

            if (!locationDoc.exists()) {
              console.error("Location not found:", locationId);
              return null;
            }

            const mallChainData = mallChainDoc.data();
            const locationData = locationDoc.data();

            console.log("Found mall chain:", mallChainData);
            console.log("Found location:", locationData);

            return {
              mallChainId,
              locationId,
              mallChainName: mallChainData.title,
              locationName: locationData.name,
              locationAddress: locationData.address,
              imageUrl: locationData.imageUrl,
            };
          } catch (error) {
            console.error("Error processing location:", error);
            return null;
          }
        })
      );

      const validMalls = mallsData.filter((mall) => mall !== null);
      console.log("Valid malls found:", validMalls);

      setAssignedMalls(validMalls);

      if (validMalls.length === 0) {
        console.log("No valid malls found after processing");
      }
    } catch (error) {
      console.error("Error fetching assigned locations:", error);
      toast.error("Failed to fetch assigned locations: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMallLocations = () => {
    if (assignedMalls.length === 0) {
      return (
        <div className="p-6 text-center bg-white rounded-lg shadow-lg">
          <FaBuilding className="mx-auto mb-4 text-6xl text-gray-400" />
          <p className="text-xl text-gray-700">
            You have not been assigned to any mall locations yet.
          </p>
          <p className="mt-2 text-gray-600">
            Please contact an administrator for assistance.
          </p>
        </div>
      );
    }

    return (
      <div className="md:grid-cols-2 lg:grid-cols-3 grid gap-6">
        {assignedMalls.map((mall) => (
          <div
            key={`${mall.mallChainId}-${mall.locationId}`}
            className="hover:scale-105 hover:shadow-lg overflow-hidden transition-all duration-300 transform bg-white rounded-lg shadow-md"
          >
            <div className="relative h-48">
              {mall.imageUrl ? (
                <img
                  src={mall.imageUrl}
                  alt={mall.locationName}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-200">
                  <FaBuilding className="text-4xl text-gray-400" />
                </div>
              )}
              <div className="bg-gradient-to-b from-black to-transparent absolute top-0 left-0 right-0 p-4">
                <h3 className="text-xl font-semibold text-white">
                  {mall.locationName}
                </h3>
                <p className="text-sm text-gray-200">{mall.mallChainName}</p>
              </div>
            </div>
            <div className="p-4">
              <p className="mb-4 text-gray-600">{mall.locationAddress}</p>
              <button
                onClick={() => navigate(`/location/${mall.locationId}`)}
                className="hover:bg-blue-600 w-full px-4 py-2 text-white transition duration-300 bg-blue-500 rounded"
              >
                Manage Mall
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl px-4 py-8 mx-auto">
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            <button
              onClick={() => {
                setActiveTab("malls");
                navigate("/mall-owner/mall-locations");
              }}
              className={`${
                activeTab === "malls"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <FaBuilding className="mr-2" />
              Mall Locations
            </button>
            <button
              onClick={() => {
                setActiveTab("theaters");
                navigate("/mall-owner/theater-locations");
              }}
              className={`${
                activeTab === "theaters"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <FaFilm className="mr-2" />
              Theater Locations
            </button>
          </nav>
        </div>
      </div>

      {activeTab === "malls" ? renderMallLocations() : <TheaterChainsSection />}
    </div>
  );
};

export default MallOwnerDashboard;
