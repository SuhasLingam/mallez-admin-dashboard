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
import { FaEdit, FaTrash, FaPlus, FaMapMarkerAlt } from "react-icons/fa";
import { toast } from "react-toastify";

const MallDetails = () => {
  const { mallChainId } = useParams();
  const [mallChain, setMallChain] = useState(null);
  const [floorLayouts, setFloorLayouts] = useState([]);
  const [mallOffers, setMallOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newFloorLayout, setNewFloorLayout] = useState({ name: "" });
  const [newMallOffer, setNewMallOffer] = useState({ imageUrl: "" });

  useEffect(() => {
    fetchMallDetails();
  }, [mallChainId]);

  const fetchMallDetails = async () => {
    setIsLoading(true);
    try {
      const mallChainDocRef = doc(db, "mallChains", mallChainId);
      const mallChainSnapshot = await getDoc(mallChainDocRef);

      if (mallChainSnapshot.exists()) {
        setMallChain({ id: mallChainSnapshot.id, ...mallChainSnapshot.data() });
      } else {
        toast.error("Mall chain not found");
        return;
      }

      // Fetch Floor Layouts
      const floorLayoutsSnapshot = await getDocs(
        collection(db, `mallChains/${mallChainId}/floorLayout`)
      );
      setFloorLayouts(
        floorLayoutsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      // Fetch Mall Offers
      const mallOffersSnapshot = await getDocs(
        collection(db, `mallChains/${mallChainId}/MallOffers`)
      );
      setMallOffers(
        mallOffersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (error) {
      console.error("Error fetching mall details:", error);
      toast.error("Failed to fetch mall details");
    } finally {
      setIsLoading(false);
    }
  };

  // CRUD operations for Floor Layouts
  const handleAddFloorLayout = async () => {
    try {
      await addDoc(
        collection(db, `mallChains/${mallChainId}/floorLayout`),
        newFloorLayout
      );
      toast.success("Floor layout added successfully");
      setNewFloorLayout({ name: "" });
      fetchMallDetails();
    } catch (error) {
      console.error("Error adding floor layout:", error);
      toast.error("Failed to add floor layout");
    }
  };

  const handleUpdateFloorLayout = async (id, updatedFloorLayout) => {
    try {
      await updateDoc(
        doc(db, `mallChains/${mallChainId}/floorLayout`, id),
        updatedFloorLayout
      );
      toast.success("Floor layout updated successfully");
      fetchMallDetails();
    } catch (error) {
      console.error("Error updating floor layout:", error);
      toast.error("Failed to update floor layout");
    }
  };

  const handleDeleteFloorLayout = async (id) => {
    if (window.confirm("Are you sure you want to delete this floor layout?")) {
      try {
        await deleteDoc(doc(db, `mallChains/${mallChainId}/floorLayout`, id));
        toast.success("Floor layout deleted successfully");
        fetchMallDetails();
      } catch (error) {
        console.error("Error deleting floor layout:", error);
        toast.error("Failed to delete floor layout");
      }
    }
  };

  // CRUD operations for Mall Offers
  const handleAddMallOffer = async () => {
    try {
      await addDoc(
        collection(db, `mallChains/${mallChainId}/MallOffers`),
        newMallOffer
      );
      toast.success("Mall offer added successfully");
      setNewMallOffer({ imageUrl: "" });
      fetchMallDetails();
    } catch (error) {
      console.error("Error adding mall offer:", error);
      toast.error("Failed to add mall offer");
    }
  };

  const handleUpdateMallOffer = async (id, updatedMallOffer) => {
    try {
      await updateDoc(
        doc(db, `mallChains/${mallChainId}/MallOffers`, id),
        updatedMallOffer
      );
      toast.success("Mall offer updated successfully");
      fetchMallDetails();
    } catch (error) {
      console.error("Error updating mall offer:", error);
      toast.error("Failed to update mall offer");
    }
  };

  const handleDeleteMallOffer = async (id) => {
    if (window.confirm("Are you sure you want to delete this mall offer?")) {
      try {
        await deleteDoc(doc(db, `mallChains/${mallChainId}/MallOffers`, id));
        toast.success("Mall offer deleted successfully");
        fetchMallDetails();
      } catch (error) {
        console.error("Error deleting mall offer:", error);
        toast.error("Failed to delete mall offer");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        {mallChain?.title} Details
      </h1>

      <Link
        to={`/mall/${mallChainId}/locations`}
        className="mb-6 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        <FaMapMarkerAlt className="inline-block mr-2" />
        View Locations
      </Link>

      {/* Floor Layouts Section */}
      <section className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">
          Floor Layouts
        </h2>
        {floorLayouts.length > 0 ? (
          <ul className="space-y-4 mb-4">
            {floorLayouts.map((layout) => (
              <li
                key={layout.id}
                className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
              >
                <p className="font-semibold">{layout.name}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      handleUpdateFloorLayout(layout.id, {
                        ...layout,
                        name: prompt("Enter new name", layout.name),
                      })
                    }
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaEdit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteFloorLayout(layout.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 mb-4">No floor layouts available.</p>
        )}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            type="text"
            value={newFloorLayout.name}
            onChange={(e) => setNewFloorLayout({ name: e.target.value })}
            placeholder="Floor layout name"
            className="flex-grow p-2 border rounded"
          />
          <button
            onClick={handleAddFloorLayout}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors duration-200"
          >
            <FaPlus className="inline-block mr-2" /> Add Floor Layout
          </button>
        </div>
      </section>

      {/* Mall Offers Section */}
      <section className="mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Mall Offers</h2>
        {mallOffers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {mallOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center"
              >
                <img
                  src={offer.imageUrl}
                  alt="Mall Offer"
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() =>
                      handleUpdateMallOffer(offer.id, {
                        ...offer,
                        imageUrl: prompt("Enter new image URL", offer.imageUrl),
                      })
                    }
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaEdit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteMallOffer(offer.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mb-4">No mall offers available.</p>
        )}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            type="text"
            value={newMallOffer.imageUrl}
            onChange={(e) => setNewMallOffer({ imageUrl: e.target.value })}
            placeholder="Offer image URL"
            className="flex-grow p-2 border rounded"
          />
          <button
            onClick={handleAddMallOffer}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors duration-200"
          >
            <FaPlus className="inline-block mr-2" /> Add Mall Offer
          </button>
        </div>
      </section>
    </div>
  );
};

export default MallDetails;
