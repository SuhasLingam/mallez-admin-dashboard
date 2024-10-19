import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { db, auth, storage } from "../../services/firebaseService";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaSpinner,
  FaEdit,
  FaUpload,
} from "react-icons/fa";

const MallOwnerDashboard = () => {
  const [assignedLocation, setAssignedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignedLocation();
  }, []);

  const fetchAssignedLocation = async () => {
    setIsLoading(true);
    try {
      if (!auth.currentUser) {
        toast.error("You must be logged in to access this page");
        navigate("/login");
        return;
      }

      const mallOwnersRef = collection(
        db,
        "platform_users/mallOwner/mallOwner"
      );
      const q = query(
        mallOwnersRef,
        where("email", "==", auth.currentUser.email)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("User data not found. Please contact an administrator.");
        navigate("/");
        return;
      }

      const userData = {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data(),
      };

      if (userData.role !== "mallOwner") {
        toast.error("You don't have mall owner permissions");
        navigate("/");
        return;
      }

      const { assignedLocationId, assignedMallChainId } = userData;
      if (!assignedLocationId || !assignedMallChainId) {
        setAssignedLocation(null);
        setIsLoading(false);
        return;
      }

      const locationDoc = await getDoc(
        doc(
          db,
          `mallChains/${assignedMallChainId}/locations`,
          assignedLocationId
        )
      );

      if (!locationDoc.exists()) {
        toast.error("Assigned location not found");
        setAssignedLocation(null);
      } else {
        const locationData = locationDoc.data();

        // Fetch floor layouts count
        const floorLayoutsSnapshot = await getDocs(
          collection(
            db,
            `mallChains/${assignedMallChainId}/locations/${assignedLocationId}/floorLayout`
          )
        );
        const floorLayoutsCount = floorLayoutsSnapshot.size;

        // Fetch active offers count
        const mallOffersSnapshot = await getDocs(
          collection(
            db,
            `mallChains/${assignedMallChainId}/locations/${assignedLocationId}/MallOffers`
          )
        );
        const activeOffersCount = mallOffersSnapshot.size;

        setAssignedLocation({
          id: locationDoc.id,
          ...locationData,
          mallChainId: assignedMallChainId,
          floorLayoutsCount,
          activeOffersCount,
        });
      }
    } catch (error) {
      console.error("Error in fetchAssignedLocation:", error);
      toast.error("An error occurred while fetching your data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLocation = () => {
    setEditName(assignedLocation.name);
    setShowEditModal(true);
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setEditImageFile(e.target.files[0]);
    }
  };

  const handleUpdateLocation = async () => {
    try {
      let imageUrl = assignedLocation.imageUrl;
      if (editImageFile) {
        const storageRef = ref(
          storage,
          `mall_images/${Date.now()}_${editImageFile.name}`
        );
        await uploadBytes(storageRef, editImageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const locationRef = doc(
        db,
        `mallChains/${assignedLocation.mallChainId}/locations`,
        assignedLocation.id
      );
      await updateDoc(locationRef, {
        name: editName,
        imageUrl: imageUrl,
      });

      toast.success("Location updated successfully");
      setShowEditModal(false);
      fetchAssignedLocation();
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error("Failed to update location");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl px-4 py-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold text-center text-gray-800">
        Mall Owner Dashboard
      </h1>
      {assignedLocation ? (
        <div className="overflow-hidden bg-white rounded-lg shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-700">
                Your Assigned Location
              </h2>
              <button
                onClick={handleEditLocation}
                className="hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 px-4 py-2 text-white bg-blue-500 rounded"
              >
                <FaEdit className="inline-block mr-2" />
                Edit Location
              </button>
            </div>
            <div className="md:flex-row md:items-center flex flex-col">
              <div className="md:mb-0 md:mr-6 flex-shrink-0 mb-4">
                {assignedLocation.imageUrl ? (
                  <img
                    src={assignedLocation.imageUrl}
                    alt={assignedLocation.name}
                    className="md:w-64 object-cover w-full h-48 rounded-lg"
                  />
                ) : (
                  <div className="md:w-64 flex items-center justify-center w-full h-48 bg-gray-200 rounded-lg">
                    <FaBuilding className="text-4xl text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <h3 className="mb-2 text-xl font-semibold text-gray-700">
                  {assignedLocation.name}
                </h3>
                <p className="mb-4 text-gray-600">
                  <FaMapMarkerAlt className="inline-block mr-2" />
                  {assignedLocation.address || "Address not available"}
                </p>
                <Link
                  to={`/location/${assignedLocation.id}`}
                  className="hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 inline-block px-6 py-3 text-white transition duration-300 bg-blue-500 rounded-lg"
                >
                  Manage Location Details
                </Link>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4">
            <h3 className="mb-2 text-lg font-semibold text-gray-700">
              Quick Stats
            </h3>
            <div className="sm:grid-cols-2 grid grid-cols-1 gap-4">
              <div className="p-3 bg-white rounded-lg shadow">
                <p className="text-sm text-gray-500">Floor Layouts</p>
                <p className="text-xl font-semibold">
                  {assignedLocation.floorLayoutsCount || 0}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg shadow">
                <p className="text-sm text-gray-500">Active Offers</p>
                <p className="text-xl font-semibold">
                  {assignedLocation.activeOffersCount || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center bg-white rounded-lg shadow-lg">
          <FaBuilding className="mx-auto mb-4 text-6xl text-gray-400" />
          <p className="text-xl text-gray-700">
            You have not been assigned to any location yet.
          </p>
          <p className="mt-2 text-gray-600">
            Please contact an administrator for assistance.
          </p>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="sm:block sm:p-0 flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="sm:inline-block sm:align-middle sm:h-screen hidden"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="sm:my-8 sm:align-middle sm:max-w-lg sm:w-full inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl">
              <div className="sm:p-6 sm:pb-4 px-4 pt-5 pb-4 bg-white">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Edit Location
                </h3>
                <div className="mt-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2 mt-1 border rounded-md"
                    placeholder="Location name"
                  />
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Location Image
                    </label>
                    <input
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse px-4 py-3">
                <button
                  type="button"
                  className="hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm"
                  onClick={handleUpdateLocation}
                >
                  Update
                </button>
                <button
                  type="button"
                  className="hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MallOwnerDashboard;
