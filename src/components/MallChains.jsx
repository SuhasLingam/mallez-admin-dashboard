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
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const MallChains = ({ userRole }) => {
  const [mallChains, setMallChains] = useState([]);
  const [newMallChain, setNewMallChain] = useState({
    title: "",
    description: "",
    redirectDirectory: "",
  });
  const [editingMallChain, setEditingMallChain] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMallChains();
  }, []);

  const fetchMallChains = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "mallChains"));
      const mallChainsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
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
          redirectDirectory: editingMallChain.redirectDirectory,
        });
        toast.success("Mall chain updated successfully");
      } else {
        await addDoc(collection(db, "mallChains"), newMallChain);
        toast.success("Mall chain added successfully");
      }
      fetchMallChains();
      setNewMallChain({
        title: "",
        description: "",
        redirectDirectory: "",
      });
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

  const filteredMallChains = mallChains.filter(
    (mallChain) =>
      mallChain.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mallChain.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mallChain.redirectDirectory
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
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
          required
          rows="3"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Redirect Directory
        </label>
        <input
          type="text"
          name="redirectDirectory"
          value={
            editingMallChain
              ? editingMallChain.redirectDirectory
              : newMallChain.redirectDirectory
          }
          onChange={handleInputChange}
          className="focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 block w-full mt-1 border-gray-300 rounded-md shadow-sm"
          required
        />
      </div>
      <div className="flex justify-end pt-4 space-x-2">
        <button
          type="button"
          onClick={() => setIsModalOpen(false)}
          className="hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md"
        >
          {editingMallChain ? "Update" : "Add"} Mall Chain
        </button>
      </div>
    </form>
  );

  const renderMallChainsList = () => (
    <div className="sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1 gap-6">
      {filteredMallChains.map((mallChain) => (
        <div
          key={mallChain.id}
          className="flex flex-col h-full bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          <div className="flex-grow p-6">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {mallChain.title}
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              {mallChain.description}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Redirect Directory:</span>{" "}
              {mallChain.redirectDirectory}
            </p>
          </div>
          <div className="bg-gray-50 px-6 py-4 mt-auto">
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleEdit(mallChain)}
                className="hover:text-indigo-900 text-indigo-600 transition-colors duration-200"
              >
                <FaEdit className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(mallChain.id)}
                className="hover:text-red-900 text-red-600 transition-colors duration-200"
              >
                <FaTrash className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">
          Mall Chains Management
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md"
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
