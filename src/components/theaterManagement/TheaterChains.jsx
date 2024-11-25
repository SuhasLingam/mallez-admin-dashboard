import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../services/firebaseService";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const TheaterChains = ({ userRole }) => {
  const [theaterChains, setTheaterChains] = useState([]);
  const [newTheaterChain, setNewTheaterChain] = useState({
    title: "",
    description: "",
  });
  const [editingTheaterChain, setEditingTheaterChain] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTheaterChains();
  }, []);

  const fetchTheaterChains = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "theaterChains"));
      const theaterChainsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTheaterChains(theaterChainsData);
    } catch (error) {
      console.error("Error fetching theater chains:", error);
      toast.error("Failed to fetch theater chains");
      setTheaterChains([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingTheaterChain) {
      setEditingTheaterChain({ ...editingTheaterChain, [name]: value });
    } else {
      setNewTheaterChain({ ...newTheaterChain, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingTheaterChain) {
        await updateDoc(doc(db, "theaterChains", editingTheaterChain.id), {
          title: editingTheaterChain.title,
          description: editingTheaterChain.description,
        });
        toast.success("Theater chain updated successfully");
      } else {
        await addDoc(collection(db, "theaterChains"), newTheaterChain);
        toast.success("Theater chain added successfully");
      }
      fetchTheaterChains();
      setNewTheaterChain({ title: "", description: "" });
      setEditingTheaterChain(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving theater chain:", error);
      toast.error("Failed to save theater chain");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (theaterChain) => {
    setEditingTheaterChain(theaterChain);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this theater chain?")) {
      setIsLoading(true);
      try {
        await deleteDoc(doc(db, "theaterChains", id));
        toast.success("Theater chain deleted successfully");
        fetchTheaterChains();
      } catch (error) {
        console.error("Error deleting theater chain:", error);
        toast.error("Failed to delete theater chain");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredTheaterChains = theaterChains.filter((theaterChain) =>
    theaterChain.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          name="title"
          value={
            editingTheaterChain
              ? editingTheaterChain.title
              : newTheaterChain.title
          }
          onChange={handleInputChange}
          className="focus:ring-2 focus:ring-blue-500 block w-full px-4 py-2 mt-1 border border-gray-300 rounded-md"
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
            editingTheaterChain
              ? editingTheaterChain.description
              : newTheaterChain.description
          }
          onChange={handleInputChange}
          className="focus:ring-2 focus:ring-blue-500 block w-full px-4 py-2 mt-1 border border-gray-300 rounded-md"
          rows="3"
          required
        />
      </div>
      <div className="flex justify-end pt-4 space-x-2">
        <button
          type="button"
          onClick={() => setIsModalOpen(false)}
          className="hover:bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="hover:bg-blue-700 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md"
        >
          {editingTheaterChain ? "Update" : "Add"} Theater Chain
        </button>
      </div>
    </form>
  );

  const renderTheaterChainsList = () => (
    <div className="space-y-4">
      {filteredTheaterChains.map((theaterChain) => (
        <motion.div
          key={theaterChain.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          <div className="sm:flex-row sm:items-center bg-gray-50 flex flex-col justify-between p-4">
            <div className="sm:mb-0 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {theaterChain.title}
              </h3>
              <p className="text-sm text-gray-600">
                {theaterChain.description}
              </p>
            </div>
            <div className="flex space-x-2">
              <Link
                to={`/theater/${theaterChain.id}/locations`}
                className="hover:bg-blue-600 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded"
              >
                <FaMapMarkerAlt className="inline-block mr-2" />
                View Locations
              </Link>
              {userRole === "admin" && (
                <>
                  <button
                    onClick={() => handleEdit(theaterChain)}
                    className="hover:text-indigo-900 p-2 text-indigo-600"
                  >
                    <FaEdit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(theaterChain.id)}
                    className="hover:text-red-900 p-2 text-red-600"
                  >
                    <FaTrash className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="container px-4 py-8 mx-auto">
      {renderTheaterChainsList()}
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
                  {editingTheaterChain
                    ? "Edit Theater Chain"
                    : "Add New Theater Chain"}
                </h3>
                {renderForm()}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TheaterChains;
