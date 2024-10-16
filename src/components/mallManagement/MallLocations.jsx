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
} from "firebase/firestore";
import { db, storage, auth } from "../../services/firebaseService";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaStore,
  FaChevronRight,
  FaUpload,
} from "react-icons/fa";
import { toast } from "react-toastify";

const MallLocations = () => {
  const { mallChainId } = useParams();
  const [mallChain, setMallChain] = useState(null);
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState({ name: "", imageUrl: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMallChainAndLocations();
  }, [mallChainId]);

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
    } catch (error) {
      console.error("Error fetching mall chain and locations:", error);
      toast.error("Failed to fetch mall chain and locations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Locations updated:", locations);
  }, [locations]);

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

      // Create empty MallOffers and floorLayout collections for the new location
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
      // Update the location in the state
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
        // Remove the deleted location from the state
        setLocations(locations.filter((loc) => loc.id !== id));
      } catch (error) {
        console.error("Error deleting location:", error);
        toast.error("Failed to delete location");
      }
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
      <div className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">Add New Location</h2>
        <div className="flex flex-col space-y-2">
          <input
            type="text"
            value={newLocation.name}
            onChange={(e) =>
              setNewLocation({ ...newLocation, name: e.target.value })
            }
            placeholder="Location name"
            className="p-2 border rounded"
          />
          <input
            type="text"
            value={newLocation.imageUrl}
            onChange={(e) =>
              setNewLocation({ ...newLocation, imageUrl: e.target.value })
            }
            placeholder="Image URL"
            className="p-2 border rounded"
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
              className="hover:bg-blue-600 px-4 py-2 text-white bg-blue-500 rounded"
            >
              <FaUpload className="inline-block mr-2" /> Choose Image
            </button>
            {imageFile && (
              <span className="text-sm text-gray-600">{imageFile.name}</span>
            )}
          </div>
          <button
            onClick={handleAddLocation}
            className="hover:bg-green-600 p-2 text-white bg-green-500 rounded"
          >
            <FaPlus className="inline-block mr-2" /> Add Location
          </button>
        </div>
      </div>
      <div className="md:grid-cols-2 lg:grid-cols-3 grid grid-cols-1 gap-4">
        {locations.map((location) => (
          <div key={location.id} className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="mb-2 text-lg font-semibold">{location.name}</h3>
            {location.imageUrl && (
              <img
                src={location.imageUrl}
                alt={location.name}
                className="object-cover w-full h-40 mb-2 rounded"
                onError={(e) => {
                  console.error("Image failed to load:", e);
                  e.target.src = "path/to/fallback/image.jpg"; // Replace with a fallback image
                }}
              />
            )}
            <div className="flex items-center justify-between mt-4">
              <Link
                to={`/mall/${mallChainId}/location/${location.id}`}
                className="hover:bg-blue-600 px-4 py-2 text-white bg-blue-500 rounded"
              >
                View Details
              </Link>
              <div>
                <button
                  onClick={() =>
                    handleUpdateLocation(location.id, {
                      ...location,
                      name: prompt("Enter new name", location.name),
                    })
                  }
                  className="hover:text-blue-700 mr-2 text-blue-500"
                >
                  <FaEdit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteLocation(location.id)}
                  className="hover:text-red-700 text-red-500"
                >
                  <FaTrash className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MallLocations;
