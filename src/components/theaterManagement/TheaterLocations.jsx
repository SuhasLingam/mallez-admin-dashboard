import React, { useState, useEffect } from "react";
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
  writeBatch,
  arrayUnion,
  query,
  where,
} from "firebase/firestore";
import { db, storage, auth } from "../../services/firebaseService";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaUpload,
  FaFilm,
  FaChevronRight,
  FaUserPlus,
  FaUserMinus,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const TheaterLocations = ({ userRole }) => {
  const { theaterChainId } = useParams();
  const [theaterChain, setTheaterChain] = useState(null);
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState({
    name: "",
    address: "",
    imageUrl: "",
    features: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [editingLocation, setEditingLocation] = useState(null);
  const [error, setError] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [mallOwners, setMallOwners] = useState([]);
  const [selectedMallOwner, setSelectedMallOwner] = useState(null);
  const [assignedMallOwners, setAssignedMallOwners] = useState({});
  const [assignedMallOwnerDetails, setAssignedMallOwnerDetails] = useState({});

  useEffect(() => {
    fetchTheaterChainAndLocations();
  }, [theaterChainId]);

  useEffect(() => {
    if (userRole === "admin") {
      fetchMallOwners();
    }
  }, [userRole]);

  const fetchTheaterChainAndLocations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const theaterChainDoc = await getDoc(
        doc(db, "theaterChains", theaterChainId)
      );
      if (!theaterChainDoc.exists()) {
        setError("Theater chain not found");
        toast.error("Theater chain not found");
        return;
      }
      setTheaterChain({ id: theaterChainDoc.id, ...theaterChainDoc.data() });

      const locationsSnapshot = await getDocs(
        collection(db, `theaterChains/${theaterChainId}/locations`)
      );
      const locationsData = locationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const ownerDetailsPromises = locationsData
        .filter((location) => location.mallOwnerId)
        .map(async (location) => {
          const ownerDetails = await fetchMallOwnerDetails(
            location.mallOwnerId
          );
          return { locationId: location.id, ownerDetails };
        });

      const ownerDetails = await Promise.all(ownerDetailsPromises);
      const ownerDetailsMap = {};
      ownerDetails.forEach(({ locationId, ownerDetails }) => {
        if (ownerDetails) {
          ownerDetailsMap[locationId] = ownerDetails;
        }
      });

      setAssignedMallOwnerDetails(ownerDetailsMap);
      setLocations(locationsData);
    } catch (error) {
      console.error("Error fetching theater chain and locations:", error);
      setError("Failed to fetch theater chain and locations");
      toast.error("Failed to fetch theater chain and locations");
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

  const fetchMallOwnerDetails = async (mallOwnerId) => {
    try {
      const mallOwnerDoc = await getDoc(
        doc(db, "platform_users/mallOwner/mallOwner", mallOwnerId)
      );
      if (mallOwnerDoc.exists()) {
        return mallOwnerDoc.data();
      }
      return null;
    } catch (error) {
      console.error("Error fetching mall owner details:", error);
      return null;
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return null;

    try {
      // Check file size
      if (imageFile.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return null;
      }

      // Check file type
      if (!imageFile.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return null;
      }

      // Clean the filename to avoid path traversal
      const cleanFileName = imageFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const storageRef = ref(
        storage,
        `theater_images/${Date.now()}_${cleanFileName}`
      );

      // Upload the file
      const uploadTask = await uploadBytes(storageRef, imageFile, {
        contentType: imageFile.type,
        customMetadata: {
          uploadedBy: auth.currentUser.uid,
          uploadedAt: new Date().toISOString(),
        },
      });

      // Get the download URL
      const downloadURL = await getDownloadURL(uploadTask.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      if (error.code === "storage/unauthorized") {
        toast.error("Please log in to upload images");
      } else {
        toast.error("Failed to upload image: " + error.message);
      }
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      toast.error("You must be logged in to perform this action");
      return;
    }

    setIsLoading(true);
    try {
      let imageUrl = newLocation.imageUrl;
      if (imageFile) {
        imageUrl = await handleImageUpload();
        if (!imageUrl) {
          setIsLoading(false);
          return;
        }
      }

      const locationData = {
        ...newLocation,
        imageUrl,
        createdBy: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingLocation) {
        await updateDoc(
          doc(
            db,
            `theaterChains/${theaterChainId}/locations`,
            editingLocation.id
          ),
          {
            ...locationData,
            updatedBy: auth.currentUser.uid,
            updatedAt: new Date().toISOString(),
          }
        );
        toast.success("Location updated successfully");
      } else {
        const locationRef = await addDoc(
          collection(db, `theaterChains/${theaterChainId}/locations`),
          locationData
        );

        // Create placeholder collections
        const placeholderData = {
          createdAt: new Date().toISOString(),
          createdBy: auth.currentUser.uid,
        };

        const collections = ["screens", "currentMovies", "concessions"];
        await Promise.all(
          collections.map((collectionName) =>
            setDoc(
              doc(
                db,
                `theaterChains/${theaterChainId}/locations/${locationRef.id}/${collectionName}/placeholder`
              ),
              placeholderData
            )
          )
        );

        toast.success("Location added successfully");
      }

      handleCloseModal();
      fetchTheaterChainAndLocations();
    } catch (error) {
      console.error("Error saving location:", error);
      if (error.code === "permission-denied") {
        toast.error("You don't have permission to perform this action");
      } else {
        toast.error(`Failed to ${editingLocation ? "update" : "add"} location`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      setIsLoading(true);
      try {
        await deleteDoc(
          doc(db, `theaterChains/${theaterChainId}/locations`, id)
        );
        toast.success("Location deleted successfully");
        fetchTheaterChainAndLocations();
      } catch (error) {
        console.error("Error deleting location:", error);
        toast.error("Failed to delete location");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setNewLocation({
      name: location.name,
      address: location.address,
      imageUrl: location.imageUrl,
      features: location.features || [],
    });
    setIsModalOpen(true);
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
      console.log("Starting assignment process...");
      console.log("Selected location:", selectedLocationId);
      console.log("Selected mall owner:", selectedMallOwner);

      const batch = writeBatch(db);

      // Update the location with mall owner ID
      const locationRef = doc(
        db,
        `theaterChains/${theaterChainId}/locations`,
        selectedLocationId
      );

      // Get the location data first
      const locationDoc = await getDoc(locationRef);
      const locationData = locationDoc.data();

      batch.update(locationRef, {
        mallOwnerId: selectedMallOwner.id,
        name: locationData.name, // Include these to ensure we have complete data
        address: locationData.address,
        imageUrl: locationData.imageUrl,
      });

      // Update the mall owner's document
      const mallOwnerRef = doc(
        db,
        "platform_users/mallOwner/mallOwner",
        selectedMallOwner.id
      );

      // Get current assignments first
      const mallOwnerDoc = await getDoc(mallOwnerRef);
      const currentAssignments =
        mallOwnerDoc.data().assignedTheaterLocations || [];

      // Check if this location is already assigned
      const isAlreadyAssigned = currentAssignments.some(
        (loc) =>
          loc.locationId === selectedLocationId &&
          loc.theaterChainId === theaterChainId
      );

      if (!isAlreadyAssigned) {
        // Add the new assignment
        batch.update(mallOwnerRef, {
          assignedTheaterLocations: arrayUnion({
            theaterChainId,
            locationId: selectedLocationId,
            locationName: locationData.name,
            chainName: theaterChain.title,
          }),
        });
      }

      console.log("About to commit batch with assignments");
      await batch.commit();
      console.log("Batch committed successfully");

      console.log("Assignment completed. Verifying location data...");
      const verifyLocation = await getDoc(
        doc(db, `theaterChains/${theaterChainId}/locations`, selectedLocationId)
      );
      console.log("Updated location data:", verifyLocation.data());

      toast.success("Mall owner assigned successfully");
      setShowAssignModal(false);
      setSelectedLocationId(null);
      fetchTheaterChainAndLocations();
    } catch (error) {
      console.error("Error assigning mall owner:", error);
      toast.error("Failed to assign mall owner");
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
          `theaterChains/${theaterChainId}/locations`,
          locationId
        );
        const locationDoc = await getDoc(locationRef);

        if (locationDoc.exists()) {
          const locationData = locationDoc.data();
          const mallOwnerId = locationData.mallOwnerId;

          if (mallOwnerId) {
            const mallOwnerRef = doc(
              db,
              `platform_users/mallOwner/mallOwner/${mallOwnerId}`
            );
            const mallOwnerDoc = await getDoc(mallOwnerRef);

            if (mallOwnerDoc.exists()) {
              const mallOwnerData = mallOwnerDoc.data();
              const updatedAssignedLocations = (
                mallOwnerData.assignedTheaterLocations || []
              ).filter(
                (loc) =>
                  !(
                    loc.theaterChainId === theaterChainId &&
                    loc.locationId === locationId
                  )
              );

              await updateDoc(mallOwnerRef, {
                assignedTheaterLocations: updatedAssignedLocations,
              });
            }

            await updateDoc(locationRef, { mallOwnerId: null });
            toast.success("Mall owner unassigned successfully");
            fetchTheaterChainAndLocations();
          } else {
            toast.warn("This location doesn't have an assigned mall owner");
          }
        }
      } catch (error) {
        console.error("Error unassigning mall owner:", error);
        toast.error("Failed to unassign mall owner");
      }
    }
  };

  const filteredLocations = locations.filter(
    (location) =>
      location?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location?.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderLocationsList = () => (
    <div className="sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1 gap-6">
      {filteredLocations.map((location) => (
        <motion.div
          key={location.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
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
                <FaFilm className="text-4xl text-gray-400" />
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="mb-2 text-xl font-semibold">{location.name}</h3>
            <p className="mb-4 text-gray-600">{location.address}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {location.features?.map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-sm text-blue-800 bg-blue-100 rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>

            <Link
              to={`/theater/${theaterChainId}/location/${location.id}`}
              className="hover:bg-blue-600 block w-full px-4 py-2 mb-3 text-center text-white transition-colors bg-blue-500 rounded-md shadow-sm"
            >
              View Details
            </Link>

            {userRole === "admin" && (
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between mb-2">
                  <button
                    onClick={() => handleEdit(location)}
                    className="hover:bg-blue-50 flex items-center px-3 py-1.5 text-blue-600 transition-colors rounded-md"
                  >
                    <FaEdit className="mr-1.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(location.id)}
                    className="hover:bg-red-50 flex items-center px-3 py-1.5 text-red-600 transition-colors rounded-md"
                  >
                    <FaTrash className="mr-1.5" /> Delete
                  </button>
                </div>

                <div className="sm:flex-row sm:space-x-2 sm:space-y-0 flex flex-col space-y-2">
                  <button
                    onClick={() => handleAssignMallOwner(location.id)}
                    className="hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-1 flex items-center justify-center flex-1 px-4 py-2 text-sm font-medium text-white transition-colors bg-green-500 rounded-md shadow-sm"
                  >
                    <FaUserPlus className="mr-1.5" />
                    <span>Assign Mall Owner</span>
                  </button>
                  <button
                    onClick={() => handleUnassignMallOwner(location.id)}
                    className="hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-1 flex items-center justify-center flex-1 px-4 py-2 text-sm font-medium text-white transition-colors bg-red-500 rounded-md shadow-sm"
                  >
                    <FaUserMinus className="mr-1.5" />
                    <span>Unassign Owner</span>
                  </button>
                </div>

                {location.mallOwnerId && (
                  <div className="bg-gray-50 p-2 mt-2 rounded-md">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Assigned to:</span>{" "}
                      {assignedMallOwnerDetails[location.id] ? (
                        <>
                          {assignedMallOwnerDetails[location.id].firstName}{" "}
                          {assignedMallOwnerDetails[location.id].lastName}
                        </>
                      ) : (
                        "Loading..."
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLocation(null);
    setNewLocation({ name: "", address: "", imageUrl: "", features: [] });
    setImageFile(null);
  };

  const renderAddLocationModal = () => (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={handleCloseModal}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="inline-block w-full max-w-2xl p-6 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl"
            >
              <h3 className="mb-4 text-2xl font-bold">
                {editingLocation ? "Edit Location" : "Add New Location"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newLocation.name}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, name: e.target.value })
                    }
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={newLocation.address}
                    onChange={(e) =>
                      setNewLocation({
                        ...newLocation,
                        address: e.target.value,
                      })
                    }
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Features (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="features"
                    value={newLocation.features.join(", ")}
                    onChange={(e) =>
                      setNewLocation({
                        ...newLocation,
                        features: e.target.value
                          .split(",")
                          .map((feature) => feature.trim())
                          .filter(Boolean),
                      })
                    }
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    placeholder="e.g., Dolby Atmos, IMAX, 4K Screen"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Image (Max 5MB)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error("Image size should be less than 5MB");
                          e.target.value = "";
                          return;
                        }
                        if (!file.type.startsWith("image/")) {
                          toast.error("Please upload an image file");
                          e.target.value = "";
                          return;
                        }
                        setImageFile(file);
                      }
                    }}
                    accept="image/*"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md shadow-sm"
                  />
                  {imageFile && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(imageFile)}
                        alt="Preview"
                        className="object-cover h-32 rounded"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="hover:bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="hover:bg-blue-600 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md"
                  >
                    {editingLocation ? "Update Location" : "Add Location"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderAssignModal = () => (
    <AnimatePresence>
      {showAssignModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl"
            >
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
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={assignMallOwner}
                  className="hover:bg-blue-700 px-4 py-2 text-white bg-blue-600 rounded"
                >
                  Assign
                </button>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="hover:bg-gray-200 px-4 py-2 text-gray-700 bg-gray-100 rounded"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (error) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="p-4 text-red-700 bg-red-100 rounded-lg">
          <p>{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchTheaterChainAndLocations();
            }}
            className="hover:text-red-800 mt-2 text-sm text-red-600 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="md:space-x-3 inline-flex items-center space-x-1">
          <li className="inline-flex items-center">
            <Link
              to="/theater-chains"
              className="hover:text-blue-600 text-gray-700"
            >
              Theater Chains
            </Link>
          </li>
          <FaChevronRight className="mx-2 text-gray-500" />
          <li className="text-gray-500">{theaterChain?.title}</li>
        </ol>
      </nav>

      <div className="sm:flex-row sm:items-center flex flex-col justify-between mb-6">
        <h1 className="sm:text-3xl sm:mb-0 mb-4 text-2xl font-bold">
          {theaterChain?.title} - Locations
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="hover:bg-blue-700 flex items-center justify-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-md"
        >
          <FaPlus className="mr-2" />
          Add Location
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="focus:ring-2 focus:ring-blue-500 focus:outline-none w-full px-10 py-2 border rounded-lg"
          />
          <FaSearch className="left-3 top-1/2 absolute text-gray-400 transform -translate-y-1/2" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin border-t-transparent w-16 h-16 border-4 border-blue-500 rounded-full"></div>
        </div>
      ) : locations.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500">No locations found</p>
        </div>
      ) : (
        renderLocationsList()
      )}

      {renderAddLocationModal()}
      {renderAssignModal()}
    </div>
  );
};

export default TheaterLocations;
