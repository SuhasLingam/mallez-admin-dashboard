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
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { FaEdit, FaTrash, FaPlus, FaStore } from "react-icons/fa";
import { toast } from "react-toastify";

const MallLocations = () => {
  const { mallChainId } = useParams();
  const [mallChain, setMallChain] = useState(null);
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState({ name: "", imageUrl: "" });
  const [isLoading, setIsLoading] = useState(true);

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

  const handleAddLocation = async () => {
    try {
      await addDoc(
        collection(db, `mallChains/${mallChainId}/locations`),
        newLocation
      );
      toast.success("Location added successfully");
      setNewLocation({ name: "", imageUrl: "" });
      fetchMallChainAndLocations();
    } catch (error) {
      console.error("Error adding location:", error);
      toast.error("Failed to add location");
    }
  };

  const handleUpdateLocation = async (id, updatedLocation) => {
    try {
      await updateDoc(
        doc(db, `mallChains/${mallChainId}/locations`, id),
        updatedLocation
      );
      toast.success("Location updated successfully");
      fetchMallChainAndLocations();
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
        fetchMallChainAndLocations();
      } catch (error) {
        console.error("Error deleting location:", error);
        toast.error("Failed to delete location");
      }
    }
  };

  if (isLoading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {mallChain?.title} - Locations
      </h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Add New Location</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newLocation.name}
            onChange={(e) =>
              setNewLocation({ ...newLocation, name: e.target.value })
            }
            placeholder="Location name"
            className="flex-grow p-2 border rounded"
          />
          <input
            type="text"
            value={newLocation.imageUrl}
            onChange={(e) =>
              setNewLocation({ ...newLocation, imageUrl: e.target.value })
            }
            placeholder="Image URL"
            className="flex-grow p-2 border rounded"
          />
          <button
            onClick={handleAddLocation}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            <FaPlus className="inline-block mr-2" /> Add Location
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((location) => (
          <div key={location.id} className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">{location.name}</h3>
            {location.imageUrl && (
              <img
                src={location.imageUrl}
                alt={location.name}
                className="w-full h-40 object-cover rounded mb-2"
              />
            )}
            <div className="flex justify-between items-center mt-4">
              <Link
                to={`/mall/${mallChainId}/location/${location.id}`}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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
                  className="text-blue-500 hover:text-blue-700 mr-2"
                >
                  <FaEdit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteLocation(location.id)}
                  className="text-red-500 hover:text-red-700"
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
