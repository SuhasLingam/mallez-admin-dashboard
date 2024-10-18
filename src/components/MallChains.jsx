import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaStore,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const MallChains = ({ userRole }) => {
  const [mallChains, setMallChains] = useState([]);
  const [newMallChain, setNewMallChain] = useState({
    title: "",
    description: "",
  });
  const [editingMallChain, setEditingMallChain] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedChain, setExpandedChain] = useState(null);
  const [newLocation, setNewLocation] = useState({ name: "", imageUrl: "" });
  const [editingLocation, setEditingLocation] = useState(null);

  useEffect(() => {
    fetchMallChains();
  }, []);

  const fetchMallChains = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "mallChains"));
      const mallChainsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const chainData = { id: doc.id, ...doc.data() };
          const locationsSnapshot = await getDocs(
            collection(db, `mallChains/${doc.id}/locations`)
          );
          chainData.locations = locationsSnapshot.docs.map((loc) => ({
            id: loc.id,
            name: loc.data().name,
            imageUrl: loc.data().imageUrl,
          }));
          return chainData;
        })
      );
      setMallChains(mallChainsData);
    } catch (error) {
      console.error("Error fetching mall chains:", error);
      toast.error("Failed to fetch mall chains");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingMallChain) {
      setEditingMallChain({ ...editingMallChain, [name]: value });
    } else {
      setNewMallChain({ ...newMallChain, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingMallChain) {
        await updateDoc(doc(db, "mallChains", editingMallChain.id), {
          title: editingMallChain.title,
          description: editingMallChain.description,
        });
        toast.success("Mall chain updated successfully");
      } else {
        const docRef = await addDoc(collection(db, "mallChains"), newMallChain);
        // Add an initial empty location for the new mall chain
        await addDoc(collection(db, `mallChains/${docRef.id}/locations`), {
          name: "New Location",
          imageUrl: "",
        });
        toast.success("Mall chain added successfully");
      }
      fetchMallChains();
      setNewMallChain({ title: "", description: "" });
      setEditingMallChain(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving mall chain:", error);
      toast.error("Failed to save mall chain");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (mallChain) => {
    setEditingMallChain(mallChain);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this mall chain?")) {
      setIsLoading(true);
      try {
        await deleteDoc(doc(db, "mallChains", id));
        toast.success("Mall chain deleted successfully");
        fetchMallChains();
      } catch (error) {
        console.error("Error deleting mall chain:", error);
        toast.error("Failed to delete mall chain");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddLocation = async (chainId) => {
    if (!newLocation.name.trim()) return;
    setIsLoading(true);
    try {
      await addDoc(collection(db, `mallChains/${chainId}/locations`), {
        name: newLocation.name,
        imageUrl: newLocation.imageUrl,
      });
      toast.success("Location added successfully");
      setNewLocation({ name: "", imageUrl: "" });
      fetchMallChains();
    } catch (error) {
      console.error("Error adding location:", error);
      toast.error("Failed to add location");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLocation = async (chainId, locationId, updatedLocation) => {
    setIsLoading(true);
    try {
      await updateDoc(doc(db, `mallChains/${chainId}/locations`, locationId), {
        name: updatedLocation.name,
        imageUrl: updatedLocation.imageUrl,
      });
      toast.success("Location updated successfully");
      setEditingLocation(null);
      fetchMallChains();
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error("Failed to update location");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLocation = async (chainId, locationId) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      setIsLoading(true);
      try {
        await deleteDoc(doc(db, `mallChains/${chainId}/locations`, locationId));
        toast.success("Location deleted successfully");
        fetchMallChains();
      } catch (error) {
        console.error("Error deleting location:", error);
        toast.error("Failed to delete location");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredMallChains = mallChains.filter((mallChain) =>
    mallChain.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          name="title"
          value={editingMallChain ? editingMallChain.title : newMallChain.title}
          onChange={handleInputChange}
          className="focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 block w-full mt-1 border-gray-300 rounded-md shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          value={
            editingMallChain
              ? editingMallChain.description
              : newMallChain.description
          }
          onChange={handleInputChange}
          className="focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 block w-full mt-1 border-gray-300 rounded-md shadow-sm"
          rows="3"
          required
        />
      </div>
      <div className="flex justify-end pt-4 space-x-2">
        <button
          type="button"
          onClick={() => setIsModalOpen(false)}
          className="hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 bg-gray-100 rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-indigo-600 rounded-md"
        >
          {editingMallChain ? "Update" : "Add"} Mall Chain
        </button>
      </div>
    </form>
  );

  const renderMallChainsList = () => (
    <div className="space-y-4">
      {filteredMallChains.map((mallChain) => (
        <motion.div
          key={mallChain.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          <div className="sm:flex-row sm:items-center bg-gray-50 flex flex-col justify-between p-4">
            <div className="sm:mb-0 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {mallChain.title}
              </h3>
              <p className="text-sm text-gray-600">{mallChain.description}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(mallChain)}
                className="hover:text-indigo-900 p-2 text-indigo-600 transition-colors duration-200"
              >
                <FaEdit className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(mallChain.id)}
                className="hover:text-red-900 p-2 text-red-600 transition-colors duration-200"
              >
                <FaTrash className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  setExpandedChain(
                    expandedChain === mallChain.id ? null : mallChain.id
                  )
                }
                className="hover:text-gray-900 p-2 text-gray-600 transition-colors duration-200"
              >
                {expandedChain === mallChain.id ? (
                  <FaChevronUp className="w-5 h-5" />
                ) : (
                  <FaChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          <AnimatePresence>
            {expandedChain === mallChain.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 border-t"
              >
                <h4 className="text-md flex items-center mb-2 font-semibold">
                  <FaStore className="mr-2" /> Locations:
                </h4>
                <ul className="mb-4 space-y-2">
                  {mallChain.locations.map((location) => (
                    <li
                      key={location.id}
                      className="sm:flex-row sm:items-center bg-gray-50 flex flex-col justify-between p-2 rounded"
                    >
                      {editingLocation === location.id ? (
                        <div className="w-full space-y-2">
                          <input
                            type="text"
                            value={location.name}
                            onChange={(e) => {
                              const updatedLocations = mallChain.locations.map(
                                (loc) =>
                                  loc.id === location.id
                                    ? { ...loc, name: e.target.value }
                                    : loc
                              );
                              setMallChains(
                                mallChains.map((chain) =>
                                  chain.id === mallChain.id
                                    ? { ...chain, locations: updatedLocations }
                                    : chain
                                )
                              );
                            }}
                            className="focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 block w-full mt-1 border-gray-300 rounded-md shadow-sm"
                            placeholder="Location name"
                          />
                          <input
                            type="text"
                            value={location.imageUrl}
                            onChange={(e) => {
                              const updatedLocations = mallChain.locations.map(
                                (loc) =>
                                  loc.id === location.id
                                    ? { ...loc, imageUrl: e.target.value }
                                    : loc
                              );
                              setMallChains(
                                mallChains.map((chain) =>
                                  chain.id === mallChain.id
                                    ? { ...chain, locations: updatedLocations }
                                    : chain
                                )
                              );
                            }}
                            className="focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 block w-full mt-1 border-gray-300 rounded-md shadow-sm"
                            placeholder="Image URL"
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() =>
                                handleEditLocation(mallChain.id, location.id, {
                                  name: location.name,
                                  imageUrl: location.imageUrl,
                                })
                              }
                              className="hover:bg-green-600 px-2 py-1 text-sm font-medium text-white transition-colors duration-200 bg-green-500 rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingLocation(null)}
                              className="hover:bg-gray-300 px-2 py-1 text-sm font-medium text-gray-700 transition-colors duration-200 bg-gray-200 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="sm:mb-0 mb-2">
                            <span className="font-semibold">
                              {location.name}
                            </span>
                            {location.imageUrl && (
                              <img
                                src={location.imageUrl}
                                alt={location.name}
                                className="object-cover w-16 h-16 mt-1 rounded"
                              />
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingLocation(location.id)}
                              className="hover:text-indigo-900 p-1 text-indigo-600 transition-colors duration-200"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteLocation(mallChain.id, location.id)
                              }
                              className="hover:text-red-900 p-1 text-red-600 transition-colors duration-200"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="sm:flex-row sm:space-y-0 sm:space-x-2 flex flex-col space-y-2">
                  <input
                    type="text"
                    value={newLocation.name}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, name: e.target.value })
                    }
                    placeholder="Add new location name"
                    className="focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 block w-full mt-1 border-gray-300 rounded-md shadow-sm"
                  />
                  <input
                    type="text"
                    value={newLocation.imageUrl}
                    onChange={(e) =>
                      setNewLocation({
                        ...newLocation,
                        imageUrl: e.target.value,
                      })
                    }
                    placeholder="Add location image URL"
                    className="focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 block w-full mt-1 border-gray-300 rounded-md shadow-sm"
                  />
                  <button
                    onClick={() => handleAddLocation(mallChain.id)}
                    className="hover:bg-green-600 px-4 py-2 font-bold text-white transition-colors duration-200 bg-green-500 rounded"
                  >
                    <FaPlus className="inline-block mr-2" /> Add
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="sm:px-6 lg:px-8 container px-4 py-8 mx-auto">
      <div className="sm:flex-row sm:items-center flex flex-col justify-between mb-6">
        <h2 className="sm:text-3xl sm:mb-0 mb-4 text-2xl font-bold text-gray-900">
          Mall Chains Management
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-indigo-600 rounded-md"
        >
          <FaPlus className="mr-2" />
          Add Mall Chain
        </button>
      </div>
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search mall chains..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="focus:border-blue-500 focus:outline-none focus:ring w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border rounded-lg"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <FaSearch className="text-gray-400" />
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-32 h-32 border-t-2 border-b-2 border-indigo-500 rounded-full"></div>
        </div>
      ) : (
        renderMallChainsList()
      )}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div className="sm:block sm:p-0 flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center">
              <div
                className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                aria-hidden="true"
              ></div>
              <span
                className="sm:inline-block sm:align-middle sm:h-screen hidden"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="sm:my-8 sm:align-middle sm:max-w-lg sm:w-full inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl"
              >
                <div className="sm:p-6 sm:pb-4 px-4 pt-5 pb-4 bg-white">
                  <h3
                    className="mb-4 text-lg font-medium leading-6 text-gray-900"
                    id="modal-title"
                  >
                    {editingMallChain
                      ? "Edit Mall Chain"
                      : "Add New Mall Chain"}
                  </h3>
                  {renderForm()}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MallChains;
