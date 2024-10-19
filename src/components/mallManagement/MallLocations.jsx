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
      setLocations(
        locationsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      // Fetch assigned mall owners for each location
      const assignedOwnersData = {};
      for (const location of locationsSnapshot.docs) {
        const locationData = location.data();
        if (locationData.mallOwnerId) {
          const ownerDoc = await getDoc(
            doc(
              db,
              `platform_users/mallOwner/mallOwner/${locationData.mallOwnerId}`
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

      const mallOwnerPath = `platform_users/mallOwner/mallOwner/${selectedMallOwner.id}`;
      console.log("Updating mall owner document at path:", mallOwnerPath);
      console.log("Selected Mall Owner ID:", selectedMallOwner.id);

      const mallOwnerRef = doc(db, mallOwnerPath);
      await updateDoc(mallOwnerRef, {
        assignedLocationId: selectedLocationId,
        assignedMallChainId: mallChainId,
        role: "mallOwner", // Ensure the role is set
      });

      console.log("Mall owner assigned successfully");
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

  const Breadcrumb = () => (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="md:space-x-3 inline-flex items-center space-x-1">
        <li className="inline-flex items-center">
          <Link to="/mall-chains" className="hover:text-blue-600 text-gray-700">
            Mall Chains
          </Link>
        </li>
        <FaChevronRight className="mx-2 text-gray-500" />
        <li className="inline-flex items-center">
          <span className="text-gray-500">{mallChain?.title}</span>
        </li>
      </ol>
    </nav>
  );

  if (isLoading) {
    return <div className="mt-8 text-center">Loading...</div>;
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <Breadcrumb />
      <h1 className="mb-6 text-3xl font-bold">
        {mallChain?.title} - Locations
      </h1>
      <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Add New Location</h2>
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            value={newLocation.name}
            onChange={(e) =>
              setNewLocation({ ...newLocation, name: e.target.value })
            }
            placeholder="Location name"
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 border rounded"
          />
          <input
            type="text"
            value={newLocation.imageUrl}
            onChange={(e) =>
              setNewLocation({ ...newLocation, imageUrl: e.target.value })
            }
            placeholder="Image URL"
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 border rounded"
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
              className="hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center px-4 py-2 text-white transition duration-300 ease-in-out bg-blue-500 rounded"
            >
              <FaUpload className="mr-2" /> Choose Image
            </button>
            {imageFile && (
              <span className="text-sm text-gray-600">{imageFile.name}</span>
            )}
          </div>
          <button
            onClick={handleAddLocation}
            className="hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center justify-center px-4 py-2 text-white transition duration-300 ease-in-out bg-green-500 rounded"
          >
            <FaPlus className="mr-2" /> Add Location
          </button>
        </div>
      </div>
      <div className="md:grid-cols-2 lg:grid-cols-3 grid grid-cols-1 gap-6">
        {locations.map((location) => (
          <div
            key={location.id}
            className="overflow-hidden bg-white rounded-lg shadow-md"
          >
            <div className="p-4">
              <h3 className="mb-2 text-lg font-semibold">{location.name}</h3>
              {location.imageUrl && (
                <img
                  src={location.imageUrl}
                  alt={location.name}
                  className="object-cover w-full h-48 mb-4 rounded"
                  onError={(e) => {
                    console.error("Image failed to load:", e);
                    e.target.src = "path/to/fallback/image.jpg";
                  }}
                />
              )}
              <div className="flex flex-col space-y-2">
                <Link
                  to={`/mall/${mallChainId}/location/${location.id}`}
                  className="hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center px-4 py-2 text-white transition duration-300 ease-in-out bg-blue-500 rounded"
                >
                  View Details
                </Link>
                {userRole === "admin" && (
                  <>
                    <div className="flex justify-between">
                      <button
                        onClick={() =>
                          handleUpdateLocation(location.id, {
                            ...location,
                            name: prompt("Enter new name", location.name),
                          })
                        }
                        className="hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center px-3 py-1 text-blue-500 transition duration-300 ease-in-out border border-blue-500 rounded"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(location.id)}
                        className="hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center px-3 py-1 text-red-500 transition duration-300 ease-in-out border border-red-500 rounded"
                      >
                        <FaTrash className="mr-1" /> Delete
                      </button>
                    </div>
                    <button
                      onClick={() => handleAssignMallOwner(location.id)}
                      className="hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center justify-center px-3 py-1 text-white transition duration-300 ease-in-out bg-green-500 rounded"
                    >
                      <FaUserPlus className="mr-1" /> Assign Mall Owner
                    </button>
                  </>
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
          </div>
        ))}
      </div>
      {showAssignModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
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
              <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={assignMallOwner}
                >
                  Assign
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowAssignModal(false)}
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
