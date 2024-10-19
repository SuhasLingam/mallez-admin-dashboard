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
  FaChartBar,
  FaShoppingBag,
} from "react-icons/fa";

const MallOwnerDashboard = () => {
  const [assignedLocations, setAssignedLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const navigate = useNavigate();

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

      const { assignedLocations } = userData;
      if (!assignedLocations || assignedLocations.length === 0) {
        setAssignedLocations([]);
        setIsLoading(false);
        return;
      }

      const locationsData = await Promise.all(
        assignedLocations.map(async ({ locationId, mallChainId }) => {
          const locationDoc = await getDoc(
            doc(db, `mallChains/${mallChainId}/locations`, locationId)
          );
          if (locationDoc.exists()) {
            return { id: locationDoc.id, ...locationDoc.data(), mallChainId };
          }
          return null;
        })
      );

      setAssignedLocations(
        locationsData.filter((location) => location !== null)
      );
    } catch (error) {
      console.error("Error in fetchAssignedLocations:", error);
      toast.error("An error occurred while fetching your data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLocation = (location) => {
    setEditingLocation({ ...location });
    setShowEditModal(true);
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setEditImageFile(e.target.files[0]);
    }
  };

  const handleUpdateLocation = async () => {
    try {
      let imageUrl = editingLocation.imageUrl;
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
        `mallChains/${editingLocation.mallChainId}/locations`,
        editingLocation.id
      );
      await updateDoc(locationRef, {
        name: editingLocation.name,
        imageUrl: imageUrl,
        address: editingLocation.address,
        description: editingLocation.description,
      });

      toast.success("Location updated successfully");
      setShowEditModal(false);
      setEditingLocation(null);
      setEditImageFile(null);
      fetchAssignedLocations();
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
    <div className="container max-w-6xl px-4 py-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold text-center text-gray-800">
        Mall Owner Dashboard
      </h1>
      {assignedLocations.length > 0 ? (
        <div className="md:grid-cols-2 lg:grid-cols-3 grid gap-6">
          {assignedLocations.map((location) => (
            <div
              key={location.id}
              className="overflow-hidden bg-white rounded-lg shadow-lg"
            >
              <div className="relative h-48">
                {location.imageUrl ? (
                  <img
                    src={location.imageUrl}
                    alt={location.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-200">
                    <FaBuilding className="text-4xl text-gray-400" />
                  </div>
                )}
                <div className="bg-gradient-to-b from-black to-transparent absolute top-0 left-0 right-0 p-4">
                  <h2 className="text-xl font-semibold text-white">
                    {location.name}
                  </h2>
                </div>
              </div>
              <div className="p-4">
                <p className="mb-2 text-gray-600">
                  <FaMapMarkerAlt className="inline-block mr-2" />
                  {location.address || "Address not available"}
                </p>
                <div className="flex justify-between mb-4">
                  <div className="text-center">
                    <FaChartBar className="mx-auto text-2xl text-blue-500" />
                    <p className="mt-1 text-sm font-semibold">
                      {location.floorLayoutsCount || 0} Layouts
                    </p>
                  </div>
                  <div className="text-center">
                    <FaShoppingBag className="mx-auto text-2xl text-green-500" />
                    <p className="mt-1 text-sm font-semibold">
                      {location.activeOffersCount || 0} Offers
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/location/${location.id}`}
                    className="hover:bg-blue-600 flex-1 px-4 py-2 text-center text-white bg-blue-500 rounded"
                  >
                    Manage
                  </Link>
                  <button
                    onClick={() => handleEditLocation(location)}
                    className="hover:bg-blue-200 px-4 py-2 text-blue-500 bg-blue-100 rounded"
                  >
                    <FaEdit />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center bg-white rounded-lg shadow-lg">
          <FaBuilding className="mx-auto mb-4 text-6xl text-gray-400" />
          <p className="text-xl text-gray-700">
            You have not been assigned to any locations yet.
          </p>
          <p className="mt-2 text-gray-600">
            Please contact an administrator for assistance.
          </p>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-6 bg-white rounded-lg">
              <h2 className="mb-4 text-2xl font-bold">Edit Location</h2>
              <input
                type="text"
                value={editingLocation.name}
                onChange={(e) =>
                  setEditingLocation({
                    ...editingLocation,
                    name: e.target.value,
                  })
                }
                className="w-full p-2 mb-4 border rounded"
                placeholder="Location name"
              />
              <input
                type="text"
                value={editingLocation.address}
                onChange={(e) =>
                  setEditingLocation({
                    ...editingLocation,
                    address: e.target.value,
                  })
                }
                className="w-full p-2 mb-4 border rounded"
                placeholder="Address"
              />
              <textarea
                value={editingLocation.description}
                onChange={(e) =>
                  setEditingLocation({
                    ...editingLocation,
                    description: e.target.value,
                  })
                }
                className="w-full p-2 mb-4 border rounded"
                placeholder="Description"
                rows="3"
              ></textarea>
              <div className="mb-4">
                <label className="block mb-2 font-semibold">
                  Location Image
                </label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleUpdateLocation}
                  className="hover:bg-blue-600 px-4 py-2 text-white bg-blue-500 rounded"
                >
                  Update
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="hover:bg-gray-300 px-4 py-2 text-gray-700 bg-gray-200 rounded"
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
