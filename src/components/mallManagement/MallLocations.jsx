import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { db, storage, auth } from "../../services/firebaseService";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaChevronRight,
  FaUpload,
  FaUserPlus,
  FaImage,
  FaBuilding,
  FaMapMarkerAlt,
  FaChartBar,
  FaShoppingBag,
  FaUserMinus,
} from "react-icons/fa";
import { toast } from "react-toastify";

const MallLocations = ({ userRole }) => {
  const { mallChainId } = useParams();
  const [mallChain, setMallChain] = useState(null);
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState({ name: "", imageUrl: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [mallOwners, setMallOwners] = useState([]);
  const [selectedMallOwner, setSelectedMallOwner] = useState(null);
  const [assignedMallOwners, setAssignedMallOwners] = useState({});
  const [editImageLocationId, setEditImageLocationId] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [selectedLocations, setSelectedLocations] = useState([]);

  useEffect(() => {
    fetchMallChainAndLocations();
    if (userRole === "admin") {
      fetchMallOwners();
    }
  }, [mallChainId, userRole]);

  const fetchMallChainAndLocations = async () => {
    setIsLoading(true);
    try {
      const mallChainDoc = await getDoc(doc(db, "mallChains", mallChainId));
      if (mallChainDoc.exists()) {
        setMallChain({ id: mallChainDoc.id, ...mallChainDoc.data() });
      } else {
        toast.error("Mall chain not found");
        return;
      }

      const locationsSnapshot = await getDocs(
        collection(db, `mallChains/${mallChainId}/locations`)
      );

      const locationsWithCounts = await Promise.all(
        locationsSnapshot.docs.map(async (doc) => {
          const locationData = doc.data();
          const floorLayoutsSnapshot = await getDocs(
            collection(
              db,
              `mallChains/${mallChainId}/locations/${doc.id}/floorLayout`
            )
          );
          const mallOffersSnapshot = await getDocs(
            collection(
              db,
              `mallChains/${mallChainId}/locations/${doc.id}/MallOffers`
            )
          );
          return {
            id: doc.id,
            ...locationData,
            floorLayoutsCount: floorLayoutsSnapshot.size,
            activeOffersCount: mallOffersSnapshot.size,
          };
        })
      );

      setLocations(locationsWithCounts);

      // Fetch assigned mall owners for each location
      const assignedOwnersData = {};
      for (const location of locationsWithCounts) {
        if (location.mallOwnerId) {
          const ownerDoc = await getDoc(
            doc(
              db,
              `platform_users/mallOwner/mallOwner/${location.mallOwnerId}`
            )
          );
          if (ownerDoc.exists()) {
            assignedOwnersData[location.id] = ownerDoc.data();
          }
        }
      }
      setAssignedMallOwners(assignedOwnersData);
    } catch (error) {
      console.error("Error fetching mall chain and locations:", error);
      toast.error("Failed to fetch mall chain and locations");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMallOwners = async () => {
    try {
      const usersRef = collection(db, "platform_users/mallOwner/mallOwner");
      const q = query(usersRef, where("role", "==", "mallOwner"));
      const querySnapshot = await getDocs(q);
      const owners = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMallOwners(owners);
    } catch (error) {
      console.error("Error fetching mall owners:", error);
      toast.error("Failed to fetch mall owners");
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleImageUpload = async () => {
    if (!auth.currentUser) {
      toast.error("You must be logged in to upload images");
      return null;
    }

    if (imageFile) {
      const storageRef = ref(
        storage,
        `mall_images/${Date.now()}_${imageFile.name}`
      );
      try {
        await uploadBytes(storageRef, imageFile);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image: " + error.message);
        return null;
      }
    }
    return null;
  };

  const handleAddLocation = async () => {
    if (!auth.currentUser) {
      toast.error("You must be logged in to add a location");
      return;
    }

    try {
      let imageUrl = newLocation.imageUrl;
      if (imageFile) {
        imageUrl = await handleImageUpload();
        if (!imageUrl) return;
      }

      const locationData = {
        name: newLocation.name,
        imageUrl: imageUrl,
      };

      const docRef = await addDoc(
        collection(db, `mallChains/${mallChainId}/locations`),
        locationData
      );

      await setDoc(
        doc(
          db,
          `mallChains/${mallChainId}/locations/${docRef.id}/MallOffers/placeholder`
        ),
        {}
      );
      await setDoc(
        doc(
          db,
          `mallChains/${mallChainId}/locations/${docRef.id}/floorLayout/placeholder`
        ),
        {}
      );

      toast.success("Location added successfully");
      setNewLocation({ name: "", imageUrl: "" });
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      fetchMallChainAndLocations();
    } catch (error) {
      console.error("Error adding location:", error);
      toast.error("Failed to add location: " + error.message);
    }
  };

  const handleUpdateLocation = async (id, updatedLocation) => {
    try {
      await updateDoc(
        doc(db, `mallChains/${mallChainId}/locations`, id),
        updatedLocation
      );
      toast.success("Location updated successfully");
      setLocations(
        locations.map((loc) =>
          loc.id === id ? { ...loc, ...updatedLocation } : loc
        )
      );
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error("Failed to update location");
    }
  };

  const handleDeleteLocation = async (id) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      try {
        await deleteDoc(doc(db, `mallChains/${mallChainId}/locations`, id));
        toast.success("Location deleted successfully");
        setLocations(locations.filter((loc) => loc.id !== id));
      } catch (error) {
        console.error("Error deleting location:", error);
        toast.error("Failed to delete location");
      }
    }
  };

  const handleAssignMallOwner = (locationId) => {
    setSelectedLocationId(locationId);
    setShowAssignModal(true);
  };

  const assignMallOwner = async () => {
    if (!selectedMallOwner) {
      toast.error("Please select a mall owner");
      return;
    }

    try {
      const locationRef = doc(
        db,
        `mallChains/${mallChainId}/locations`,
        selectedLocationId
      );
      await updateDoc(locationRef, { mallOwnerId: selectedMallOwner.id });

      const mallOwnerRef = doc(
        db,
        `platform_users/mallOwner/mallOwner/${selectedMallOwner.id}`
      );
      const mallOwnerDoc = await getDoc(mallOwnerRef);
      const existingAssignedLocations =
        mallOwnerDoc.data().assignedLocations || [];

      const updatedAssignedLocations = [
        ...existingAssignedLocations,
        { locationId: selectedLocationId, mallChainId },
      ];

      await updateDoc(mallOwnerRef, {
        assignedLocations: updatedAssignedLocations,
        role: "mallOwner",
      });

      toast.success("Mall owner assigned successfully");
      setShowAssignModal(false);
      setSelectedLocationId(null);
      setSelectedMallOwner(null);
      fetchMallChainAndLocations();
    } catch (error) {
      console.error("Error assigning mall owner:", error);
      toast.error("Failed to assign mall owner");
    }
  };

  const handleEditImage = (locationId) => {
    setEditImageLocationId(locationId);
  };

  const handleEditImageChange = (e) => {
    if (e.target.files[0]) {
      setEditImageFile(e.target.files[0]);
    }
  };

  const handleUpdateLocationImage = async () => {
    if (!editImageFile) {
      toast.error("Please select an image to upload");
      return;
    }

    try {
      const storageRef = ref(
        storage,
        `mall_images/${Date.now()}_${editImageFile.name}`
      );
      await uploadBytes(storageRef, editImageFile);
      const imageUrl = await getDownloadURL(storageRef);

      const locationRef = doc(
        db,
        `mallChains/${mallChainId}/locations`,
        editImageLocationId
      );
      await updateDoc(locationRef, { imageUrl: imageUrl });

      toast.success("Location image updated successfully");
      setEditImageLocationId(null);
      setEditImageFile(null);
      fetchMallChainAndLocations();
    } catch (error) {
      console.error("Error updating location image:", error);
      toast.error("Failed to update location image");
    }
  };

  const handleUnassignMallOwner = async (locationId) => {
    if (
      window.confirm(
        "Are you sure you want to unassign the mall owner from this location?"
      )
    ) {
      try {
        const locationRef = doc(
          db,
          `mallChains/${mallChainId}/locations`,
          locationId
        );
        const locationDoc = await getDoc(locationRef);

        if (locationDoc.exists()) {
          const locationData = locationDoc.data();
          const mallOwnerId = locationData.mallOwnerId;

          if (mallOwnerId) {
            // Remove the location from the mall owner's assigned locations
            const mallOwnerRef = doc(
              db,
              `platform_users/mallOwner/mallOwner/${mallOwnerId}`
            );
            const mallOwnerDoc = await getDoc(mallOwnerRef);

            if (mallOwnerDoc.exists()) {
              const mallOwnerData = mallOwnerDoc.data();
              const updatedAssignedLocations = (
                mallOwnerData.assignedLocations || []
              ).filter((loc) => loc.locationId !== locationId);

              await updateDoc(mallOwnerRef, {
                assignedLocations: updatedAssignedLocations,
              });
            }

            // Remove the mallOwnerId from the location
            await updateDoc(locationRef, { mallOwnerId: null });

            toast.success("Mall owner unassigned successfully");
            fetchMallChainAndLocations();
          } else {
            toast.warn("This location doesn't have an assigned mall owner");
          }
        } else {
          toast.error("Location not found");
        }
      } catch (error) {
        console.error("Error unassigning mall owner:", error);
        toast.error("Failed to unassign mall owner");
      }
    }
  };

  const toggleLocationSelection = (locationId) => {
    setSelectedLocations((prev) =>
      prev.includes(locationId)
        ? prev.filter((id) => id !== locationId)
        : [...prev, locationId]
    );
  };

  if (isLoading) {
    return <div className="mt-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-7xl container px-4 py-8 mx-auto">
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="md:space-x-3 inline-flex items-center space-x-1">
          <li className="inline-flex items-center">
            <Link
              to="/mall-chains"
              className="hover:text-blue-600 font-medium text-gray-700"
            >
              Mall Chains
            </Link>
          </li>
          <FaChevronRight className="mx-2 text-gray-500" />
          <li className="inline-flex items-center">
            <span className="font-medium text-gray-500">
              {mallChain?.title}
            </span>
          </li>
        </ol>
      </nav>

      <h1 className="mb-8 text-3xl font-bold text-center text-gray-800">
        {mallChain?.title} - Locations
      </h1>

      {userRole === "admin" && (
        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-2xl font-semibold text-gray-700">
            Add New Location
          </h2>
          <div className="md:grid-cols-2 grid grid-cols-1 gap-4">
            <input
              type="text"
              value={newLocation.name}
              onChange={(e) =>
                setNewLocation({ ...newLocation, name: e.target.value })
              }
              placeholder="Location name"
              className="focus:ring-2 focus:ring-blue-500 focus:outline-none p-2 border rounded"
            />
            <input
              type="text"
              value={newLocation.imageUrl}
              onChange={(e) =>
                setNewLocation({ ...newLocation, imageUrl: e.target.value })
              }
              placeholder="Image URL"
              className="focus:ring-2 focus:ring-blue-500 focus:outline-none p-2 border rounded"
            />
            <div className="flex items-center space-x-2">
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="hover:bg-blue-600 flex items-center px-4 py-2 text-white transition duration-300 bg-blue-500 rounded"
              >
                <FaUpload className="mr-2" /> Choose Image
              </button>
              {imageFile && (
                <span className="text-sm text-gray-600">{imageFile.name}</span>
              )}
            </div>
            <button
              onClick={handleAddLocation}
              className="hover:bg-green-600 flex items-center justify-center px-4 py-2 text-white transition duration-300 bg-green-500 rounded"
            >
              <FaPlus className="mr-2" /> Add Location
            </button>
          </div>
        </div>
      )}

      <div className="md:grid-cols-2 lg:grid-cols-3 grid grid-cols-1 gap-6">
        {locations.map((location) => (
          <div
            key={location.id}
            className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
              selectedLocations.includes(location.id)
                ? "ring-2 ring-blue-500"
                : ""
            }`}
            onClick={() =>
              userRole === "admin" && toggleLocationSelection(location.id)
            }
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
                <h3 className="text-xl font-semibold text-white">
                  {location.name}
                </h3>
              </div>
            </div>
            <div className="p-4">
              <p className="flex items-center mb-2 text-gray-600">
                <FaMapMarkerAlt className="mr-2" />
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
              <Link
                to={`/mall/${mallChainId}/location/${location.id}`}
                className="hover:bg-blue-600 block w-full px-4 py-2 mb-2 text-center text-white transition duration-300 bg-blue-500 rounded"
              >
                View Details
              </Link>
              {userRole === "admin" && (
                <div className="flex flex-col mt-2 space-y-2">
                  <div className="flex justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateLocation(location.id, {
                          ...location,
                          name: prompt("Enter new name", location.name),
                        });
                      }}
                      className="hover:text-blue-700 text-blue-500 transition duration-300"
                    >
                      <FaEdit className="inline mr-1" /> Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditImage(location.id);
                      }}
                      className="hover:text-green-700 text-green-500 transition duration-300"
                    >
                      <FaImage className="inline mr-1" /> Edit Image
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLocation(location.id);
                      }}
                      className="hover:text-red-700 text-red-500 transition duration-300"
                    >
                      <FaTrash className="inline mr-1" /> Delete
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssignMallOwner(location.id);
                      }}
                      className="hover:bg-green-600 flex items-center justify-center px-3 py-1 text-white transition duration-300 bg-green-500 rounded"
                    >
                      <FaUserPlus className="mr-1" /> Assign
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnassignMallOwner(location.id);
                      }}
                      className="hover:bg-red-600 flex items-center justify-center px-3 py-1 text-white transition duration-300 bg-red-500 rounded"
                    >
                      <FaUserMinus className="mr-1" /> Unassign
                    </button>
                  </div>
                </div>
              )}
              {assignedMallOwners[location.id] && (
                <p className="mt-2 text-sm text-gray-600">
                  <strong>Assigned to:</strong>{" "}
                  {assignedMallOwners[location.id].firstName}{" "}
                  {assignedMallOwners[location.id].lastName}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {userRole === "admin" && selectedLocations.length > 0 && (
        <div className="bottom-8 left-1/2 fixed transform -translate-x-1/2">
          <button
            onClick={handleAssignMallOwner}
            className="hover:bg-blue-600 flex items-center justify-center px-6 py-3 text-white transition duration-300 bg-blue-500 rounded-full shadow-lg"
          >
            <FaUserPlus className="mr-2" />
            Assign {selectedLocations.length} Location
            {selectedLocations.length > 1 ? "s" : ""}
          </button>
        </div>
      )}

      {showAssignModal && (
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
                  Assign Mall Owner
                </h3>
                <div className="mt-2">
                  <select
                    className="w-full p-2 mt-1 border rounded-md"
                    value={selectedMallOwner ? selectedMallOwner.id : ""}
                    onChange={(e) =>
                      setSelectedMallOwner(
                        mallOwners.find((owner) => owner.id === e.target.value)
                      )
                    }
                  >
                    <option value="">Select a Mall Owner</option>
                    {mallOwners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.firstName} {owner.lastName} ({owner.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse px-4 py-3">
                <button
                  type="button"
                  className="hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm"
                  onClick={assignMallOwner}
                >
                  Assign
                </button>
                <button
                  type="button"
                  className="hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {editImageLocationId && (
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
                  Edit Location Image
                </h3>
                <div className="mt-2">
                  <input
                    type="file"
                    onChange={handleEditImageChange}
                    accept="image/*"
                    className="w-full p-2 mt-1 border rounded-md"
                  />
                </div>
              </div>
              <div className="bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse px-4 py-3">
                <button
                  type="button"
                  className="hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm"
                  onClick={handleUpdateLocationImage}
                >
                  Update Image
                </button>
                <button
                  type="button"
                  className="hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm"
                  onClick={() => setEditImageLocationId(null)}
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

export default MallLocations;
