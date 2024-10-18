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
import { db } from "../../services/firebaseService";
import { FaEdit, FaTrash, FaPlus, FaChevronRight } from "react-icons/fa";
import { toast } from "react-toastify";

const LocationDetails = () => {
  const { mallChainId, locationId } = useParams();
  const [mallChain, setMallChain] = useState(null);
  const [location, setLocation] = useState(null);
  const [floorLayouts, setFloorLayouts] = useState([]);
  const [mallOffers, setMallOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newFloorLayout, setNewFloorLayout] = useState({ name: "" });
  const [newMallOffer, setNewMallOffer] = useState({ imageUrl: "" });

  useEffect(() => {
    fetchLocationDetails();
  }, [mallChainId, locationId]);

  const fetchLocationDetails = async () => {
    setIsLoading(true);
    try {
      const mallChainDoc = await getDoc(doc(db, "mallChains", mallChainId));
      if (mallChainDoc.exists()) {
        setMallChain({ id: mallChainDoc.id, ...mallChainDoc.data() });
      } else {
        toast.error("Mall chain not found");
        return;
      }

      const locationDoc = await getDoc(
        doc(db, `mallChains/${mallChainId}/locations`, locationId)
      );
      if (locationDoc.exists()) {
        setLocation({ id: locationDoc.id, ...locationDoc.data() });
      } else {
        toast.error("Location not found");
        return;
      }

      const floorLayoutsSnapshot = await getDocs(
        collection(db, `mallChains/${mallChainId}/floorLayout`)
      );
      setFloorLayouts(
        floorLayoutsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      const mallOffersSnapshot = await getDocs(
        collection(db, `mallChains/${mallChainId}/MallOffers`)
      );
      setMallOffers(
        mallOffersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (error) {
      console.error("Error fetching location details:", error);
      toast.error("Failed to fetch location details");
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
      fetchLocationDetails();
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
      fetchLocationDetails();
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
        fetchLocationDetails();
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
      fetchLocationDetails();
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
      fetchLocationDetails();
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
        fetchLocationDetails();
      } catch (error) {
        console.error("Error deleting mall offer:", error);
        toast.error("Failed to delete mall offer");
      }
    }
  };

  const Breadcrumb = () => (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link to="/mall-chains" className="text-gray-700 hover:text-blue-600">
            Mall Chains
          </Link>
        </li>
        <FaChevronRight className="text-gray-500 mx-2" />
        <li className="inline-flex items-center">
          <Link
            to={`/mall/${mallChainId}/locations`}
            className="text-gray-700 hover:text-blue-600"
          >
            {mallChain?.title}
          </Link>
        </li>
        <FaChevronRight className="text-gray-500 mx-2" />
        <li className="inline-flex items-center">
          <span className="text-gray-500">{location?.name}</span>
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
      <h1 className="mb-6 text-3xl font-bold">{location?.name} Details</h1>

      {/* Floor Layouts Section */}
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Floor Layouts</h2>
        <ul className="space-y-4">
          {floorLayouts.map((layout) => (
            <li
              key={layout.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md"
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
                  className="hover:text-blue-700 text-blue-500"
                >
                  <FaEdit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteFloorLayout(layout.id)}
                  className="hover:text-red-700 text-red-500"
                >
                  <FaTrash className="w-5 h-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex mt-4 space-x-2">
          <input
            type="text"
            value={newFloorLayout.name}
            onChange={(e) => setNewFloorLayout({ name: e.target.value })}
            placeholder="Floor layout name"
            className="flex-grow p-2 border rounded"
          />
          <button
            onClick={handleAddFloorLayout}
            className="hover:bg-green-600 p-2 text-white bg-green-500 rounded"
          >
            <FaPlus className="inline-block mr-2" /> Add Floor Layout
          </button>
        </div>
      </section>

      {/* Mall Offers Section */}
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Mall Offers</h2>
        <div className="md:grid-cols-2 lg:grid-cols-3 grid grid-cols-1 gap-4">
          {mallOffers.map((offer) => (
            <div key={offer.id} className="p-4 bg-white rounded-lg shadow-md">
              <img
                src={offer.imageUrl}
                alt="Mall Offer"
                className="object-cover w-full h-40 mb-2 rounded"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() =>
                    handleUpdateMallOffer(offer.id, {
                      ...offer,
                      imageUrl: prompt("Enter new image URL", offer.imageUrl),
                    })
                  }
                  className="hover:text-blue-700 text-blue-500"
                >
                  <FaEdit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteMallOffer(offer.id)}
                  className="hover:text-red-700 text-red-500"
                >
                  <FaTrash className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex mt-4 space-x-2">
          <input
            type="text"
            value={newMallOffer.imageUrl}
            onChange={(e) => setNewMallOffer({ imageUrl: e.target.value })}
            placeholder="Offer image URL"
            className="flex-grow p-2 border rounded"
          />
          <button
            onClick={handleAddMallOffer}
            className="hover:bg-green-600 p-2 text-white bg-green-500 rounded"
          >
            <FaPlus className="inline-block mr-2" /> Add Mall Offer
          </button>
        </div>
      </section>
    </div>
  );
};

export default LocationDetails;
