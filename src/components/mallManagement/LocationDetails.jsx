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
import { db, storage, auth } from "../../services/firebaseService";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaChevronRight,
  FaUpload,
  FaTimes,
} from "react-icons/fa";
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
  const [editingFloorLayout, setEditingFloorLayout] = useState(null);
  const [editingMallOffer, setEditingMallOffer] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

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
        collection(
          db,
          `mallChains/${mallChainId}/locations/${locationId}/floorLayout`
        )
      );
      setFloorLayouts(
        floorLayoutsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      const mallOffersSnapshot = await getDocs(
        collection(
          db,
          `mallChains/${mallChainId}/locations/${locationId}/MallOffers`
        )
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

  const handleAddFloorLayout = async () => {
    try {
      await addDoc(
        collection(
          db,
          `mallChains/${mallChainId}/locations/${locationId}/floorLayout`
        ),
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

  const handleUpdateFloorLayout = async () => {
    if (!editingFloorLayout) return;
    try {
      await updateDoc(
        doc(
          db,
          `mallChains/${mallChainId}/locations/${locationId}/floorLayout`,
          editingFloorLayout.id
        ),
        { name: editingFloorLayout.name }
      );
      toast.success("Floor layout updated successfully");
      setEditingFloorLayout(null);
      fetchLocationDetails();
    } catch (error) {
      console.error("Error updating floor layout:", error);
      toast.error("Failed to update floor layout");
    }
  };

  const handleDeleteFloorLayout = async (id) => {
    if (window.confirm("Are you sure you want to delete this floor layout?")) {
      try {
        await deleteDoc(
          doc(
            db,
            `mallChains/${mallChainId}/locations/${locationId}/floorLayout`,
            id
          )
        );
        toast.success("Floor layout deleted successfully");
        fetchLocationDetails();
      } catch (error) {
        console.error("Error deleting floor layout:", error);
        toast.error("Failed to delete floor layout");
      }
    }
  };

  const handleImageUpload = async () => {
    if (!auth.currentUser) {
      toast.error("You must be logged in to upload images");
      return null;
    }

    if (!imageFile) return null;
    const storageRef = ref(
      storage,
      `mall_offers/${Date.now()}_${imageFile.name}`
    );
    try {
      await uploadBytes(storageRef, imageFile);
      const downloadURL = await getDownloadURL(storageRef);
      setUploadedImageUrl(downloadURL);
      setNewMallOffer({ ...newMallOffer, imageUrl: downloadURL });
      toast.success(
        "Image uploaded successfully. Click 'Add Mall Offer' to save."
      );
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image: " + error.message);
      return null;
    }
  };

  const handleAddMallOffer = async () => {
    try {
      let imageUrl = newMallOffer.imageUrl;
      if (imageFile && !uploadedImageUrl) {
        imageUrl = await handleImageUpload();
        if (!imageUrl) return;
      }
      await addDoc(
        collection(
          db,
          `mallChains/${mallChainId}/locations/${locationId}/MallOffers`
        ),
        { imageUrl }
      );
      toast.success("Mall offer added successfully");
      setNewMallOffer({ imageUrl: "" });
      setImageFile(null);
      setUploadedImageUrl(null);
      fetchLocationDetails();
    } catch (error) {
      console.error("Error adding mall offer:", error);
      toast.error("Failed to add mall offer");
    }
  };

  const handleUpdateMallOffer = async () => {
    if (!editingMallOffer) return;
    try {
      let imageUrl = editingMallOffer.imageUrl;
      if (imageFile) {
        imageUrl = await handleImageUpload();
        if (!imageUrl) return;
      }
      await updateDoc(
        doc(
          db,
          `mallChains/${mallChainId}/locations/${locationId}/MallOffers`,
          editingMallOffer.id
        ),
        { imageUrl }
      );
      toast.success("Mall offer updated successfully");
      setEditingMallOffer(null);
      setImageFile(null);
      fetchLocationDetails();
    } catch (error) {
      console.error("Error updating mall offer:", error);
      toast.error("Failed to update mall offer");
    }
  };

  const handleDeleteMallOffer = async (id) => {
    if (window.confirm("Are you sure you want to delete this mall offer?")) {
      try {
        await deleteDoc(
          doc(
            db,
            `mallChains/${mallChainId}/locations/${locationId}/MallOffers`,
            id
          )
        );
        toast.success("Mall offer deleted successfully");
        fetchLocationDetails();
      } catch (error) {
        console.error("Error deleting mall offer:", error);
        toast.error("Failed to delete mall offer");
      }
    }
  };

  const Breadcrumb = () => (
    <nav className="flex mb-4 text-sm md:text-base" aria-label="Breadcrumb">
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
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb />
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        {location?.name} Details
      </h1>

      <div className="mb-8 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">
          Location Information
        </h2>
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <img
            src={location?.imageUrl}
            alt={location?.name}
            className="w-full md:w-1/2 max-w-md h-auto mb-4 md:mb-0 md:mr-6 rounded-lg shadow-md"
          />
          <div>
            <p className="text-lg mb-2">
              <span className="font-semibold">Name:</span> {location?.name}
            </p>
            {/* Add more location details here if available */}
          </div>
        </div>
      </div>

      <div className="mb-8 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">
          Floor Layouts
        </h2>
        <ul className="space-y-2 mb-4">
          {floorLayouts.map((layout) => (
            <li
              key={layout.id}
              className="flex justify-between items-center bg-gray-100 p-3 rounded"
            >
              {editingFloorLayout && editingFloorLayout.id === layout.id ? (
                <input
                  type="text"
                  value={editingFloorLayout.name}
                  onChange={(e) =>
                    setEditingFloorLayout({
                      ...editingFloorLayout,
                      name: e.target.value,
                    })
                  }
                  className="flex-grow p-2 border rounded mr-2"
                />
              ) : (
                <span>{layout.name}</span>
              )}
              <div>
                {editingFloorLayout && editingFloorLayout.id === layout.id ? (
                  <>
                    <button
                      onClick={handleUpdateFloorLayout}
                      className="text-green-500 hover:text-green-700 mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingFloorLayout(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingFloorLayout(layout)}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteFloorLayout(layout.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            type="text"
            value={newFloorLayout.name}
            onChange={(e) =>
              setNewFloorLayout({ ...newFloorLayout, name: e.target.value })
            }
            placeholder="New floor layout name"
            className="flex-grow p-2 border rounded"
          />
          <button
            onClick={handleAddFloorLayout}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition duration-300"
          >
            <FaPlus className="inline-block mr-2" /> Add Floor Layout
          </button>
        </div>
      </div>

      <div className="mb-8 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Mall Offers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {mallOffers.map((offer) => (
            <div
              key={offer.id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition duration-300"
            >
              <img
                src={offer.imageUrl}
                alt="Mall Offer"
                className="w-full h-40 object-cover rounded mb-2"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setEditingMallOffer(offer)}
                  className="text-blue-500 hover:text-blue-700 transition duration-300"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteMallOffer(offer.id)}
                  className="text-red-500 hover:text-red-700 transition duration-300"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            type="text"
            value={newMallOffer.imageUrl}
            onChange={(e) =>
              setNewMallOffer({ ...newMallOffer, imageUrl: e.target.value })
            }
            placeholder="New mall offer image URL"
            className="flex-grow p-2 border rounded"
          />
          <input
            type="file"
            onChange={(e) => {
              setImageFile(e.target.files[0]);
              setUploadedImageUrl(null);
            }}
            accept="image/*"
            className="hidden"
            id="mall-offer-image"
          />
          <label
            htmlFor="mall-offer-image"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 cursor-pointer transition duration-300"
          >
            <FaUpload className="inline-block mr-2" /> Choose Image
          </label>
          <button
            onClick={handleImageUpload}
            className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition duration-300"
          >
            Upload Image
          </button>
          <button
            onClick={handleAddMallOffer}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition duration-300"
          >
            <FaPlus className="inline-block mr-2" /> Add Mall Offer
          </button>
        </div>
        {uploadedImageUrl && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <p>
              Image uploaded successfully! Click 'Add Mall Offer' to save the
              offer.
            </p>
            <img
              src={uploadedImageUrl}
              alt="Uploaded offer"
              className="mt-2 w-full max-w-xs h-auto rounded"
            />
          </div>
        )}
      </div>

      {editingMallOffer && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center"
          id="my-modal"
        >
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">
              Edit Mall Offer
            </h3>
            <img
              src={editingMallOffer.imageUrl}
              alt="Current Mall Offer"
              className="w-full h-40 object-cover rounded mb-2"
            />
            <input
              type="text"
              value={editingMallOffer.imageUrl}
              onChange={(e) =>
                setEditingMallOffer({
                  ...editingMallOffer,
                  imageUrl: e.target.value,
                })
              }
              className="w-full p-2 border rounded mb-2"
              placeholder="Image URL"
            />
            <input
              type="file"
              onChange={(e) => setImageFile(e.target.files[0])}
              accept="image/*"
              className="mb-2"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleUpdateMallOffer}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-300"
              >
                Update
              </button>
              <button
                onClick={() => setEditingMallOffer(null)}
                className="bg-gray-300 text-gray-800 p-2 rounded hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
            </div>
            <button
              onClick={() => setEditingMallOffer(null)}
              className="absolute top-0 right-0 mt-4 mr-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationDetails;
