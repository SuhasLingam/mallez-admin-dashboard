import React, { useState, useEffect, useCallback } from "react";
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

  const fetchLocationDetails = useCallback(async () => {
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
  }, [mallChainId, locationId]);

  useEffect(() => {
    fetchLocationDetails();
  }, [fetchLocationDetails]);

  const handleAddFloorLayout = useCallback(async () => {
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
  }, [mallChainId, locationId, newFloorLayout, fetchLocationDetails]);

  const handleUpdateFloorLayout = useCallback(async () => {
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
  }, [mallChainId, locationId, editingFloorLayout, fetchLocationDetails]);

  const handleDeleteFloorLayout = useCallback(
    async (id) => {
      if (
        window.confirm("Are you sure you want to delete this floor layout?")
      ) {
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
    },
    [mallChainId, locationId, fetchLocationDetails]
  );

  const handleImageUpload = useCallback(async () => {
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
  }, [imageFile, newMallOffer]);

  const handleAddMallOffer = useCallback(async () => {
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
  }, [
    mallChainId,
    locationId,
    newMallOffer,
    imageFile,
    uploadedImageUrl,
    handleImageUpload,
    fetchLocationDetails,
  ]);

  const handleDeleteMallOffer = useCallback(
    async (id) => {
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
    },
    [mallChainId, locationId, fetchLocationDetails]
  );

  const handleUpdateMallOffer = useCallback(
    async (updatedOffer) => {
      try {
        await updateDoc(
          doc(
            db,
            `mallChains/${mallChainId}/locations/${locationId}/MallOffers`,
            updatedOffer.id
          ),
          { imageUrl: updatedOffer.imageUrl }
        );
        toast.success("Mall offer updated successfully");
        setEditingMallOffer(null);
        fetchLocationDetails();
      } catch (error) {
        console.error("Error updating mall offer:", error);
        toast.error("Failed to update mall offer");
      }
    },
    [mallChainId, locationId, fetchLocationDetails]
  );

  const Breadcrumb = () => (
    <nav className="md:text-base flex mb-4 text-sm" aria-label="Breadcrumb">
      <ol className="md:space-x-3 inline-flex items-center space-x-1">
        <li className="inline-flex items-center">
          <Link to="/mall-chains" className="hover:text-blue-600 text-gray-700">
            Mall Chains
          </Link>
        </li>
        <FaChevronRight className="mx-2 text-gray-500" />
        <li className="inline-flex items-center">
          <Link
            to={`/mall/${mallChainId}/locations`}
            className="hover:text-blue-600 text-gray-700"
          >
            {mallChain?.title}
          </Link>
        </li>
        <FaChevronRight className="mx-2 text-gray-500" />
        <li className="inline-flex items-center">
          <span className="text-gray-500">{location?.name}</span>
        </li>
      </ol>
    </nav>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-32 h-32 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <Breadcrumb />
      <h1 className="md:text-3xl mb-6 text-2xl font-bold">
        {location?.name} Details
      </h1>

      <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
        <h2 className="md:text-2xl mb-4 text-xl font-semibold">
          Location Information
        </h2>
        <div className="md:flex-row md:items-start flex flex-col items-center">
          <img
            src={location?.imageUrl}
            alt={location?.name}
            className="md:w-1/2 md:mb-0 md:mr-6 w-full h-auto max-w-md mb-4 rounded-lg shadow-md"
          />
          <div>
            <p className="mb-2 text-lg">
              <span className="font-semibold">Name:</span> {location?.name}
            </p>
            {/* Add more location details here if available */}
          </div>
        </div>
      </div>

      <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
        <h2 className="md:text-2xl mb-4 text-xl font-semibold">
          Floor Layouts
        </h2>
        <ul className="mb-4 space-y-2">
          {floorLayouts.map((layout) => (
            <li
              key={layout.id}
              className="flex items-center justify-between p-3 bg-gray-100 rounded"
            >
              <span>{layout.name}</span>
              <div>
                <button
                  onClick={() => setEditingFloorLayout(layout)}
                  className="hover:text-blue-700 mr-2 text-blue-500"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteFloorLayout(layout.id)}
                  className="hover:text-red-700 text-red-500"
                >
                  <FaTrash />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="sm:flex-row sm:space-y-0 sm:space-x-2 flex flex-col space-y-2">
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
            className="hover:bg-green-600 p-2 text-white transition duration-300 bg-green-500 rounded"
          >
            <FaPlus className="inline-block mr-2" /> Add Floor Layout
          </button>
        </div>
      </div>

      <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
        <h2 className="md:text-2xl mb-4 text-xl font-semibold">Mall Offers</h2>
        <div className="sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1 gap-4 mb-4">
          {mallOffers.map((offer) => (
            <div
              key={offer.id}
              className="hover:shadow-md p-4 transition duration-300 border rounded-lg shadow-sm"
            >
              <img
                src={offer.imageUrl}
                alt="Mall Offer"
                className="object-cover w-full h-40 mb-2 rounded"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setEditingMallOffer(offer)}
                  className="hover:text-blue-700 text-blue-500 transition duration-300"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteMallOffer(offer.id)}
                  className="hover:text-red-700 text-red-500 transition duration-300"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="sm:flex-row sm:space-y-0 sm:space-x-2 flex flex-col space-y-2">
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
            onChange={(e) => setImageFile(e.target.files[0])}
            accept="image/*"
            className="hidden"
            id="mall-offer-image"
          />
          <label
            htmlFor="mall-offer-image"
            className="hover:bg-blue-600 p-2 text-white transition duration-300 bg-blue-500 rounded cursor-pointer"
          >
            <FaUpload className="inline-block mr-2" /> Choose Image
          </label>
          <button
            onClick={handleAddMallOffer}
            className="hover:bg-green-600 p-2 text-white transition duration-300 bg-green-500 rounded"
          >
            <FaPlus className="inline-block mr-2" /> Add Mall Offer
          </button>
        </div>
      </div>

      {uploadedImageUrl && (
        <div className="p-4 mt-4 text-green-700 bg-green-100 border border-green-400 rounded">
          <p>
            Image uploaded successfully! Click 'Add Mall Offer' to save the
            offer.
          </p>
          <img
            src={uploadedImageUrl}
            alt="Uploaded offer"
            className="w-full h-auto max-w-xs mt-2 rounded"
          />
        </div>
      )}

      {editingFloorLayout && (
        <div className="fixed inset-0 flex items-center justify-center w-full h-full overflow-y-auto bg-gray-600 bg-opacity-50">
          <div className="w-96 relative p-5 bg-white border rounded-md shadow-lg">
            <h3 className="mb-2 text-lg font-medium leading-6 text-gray-900">
              Edit Floor Layout
            </h3>
            <input
              type="text"
              value={editingFloorLayout.name}
              onChange={(e) =>
                setEditingFloorLayout({
                  ...editingFloorLayout,
                  name: e.target.value,
                })
              }
              className="w-full p-2 mb-2 border rounded"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleUpdateFloorLayout}
                className="hover:bg-blue-600 p-2 text-white transition duration-300 bg-blue-500 rounded"
              >
                Update
              </button>
              <button
                onClick={() => setEditingFloorLayout(null)}
                className="hover:bg-gray-400 p-2 text-gray-800 transition duration-300 bg-gray-300 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editingMallOffer && (
        <div className="fixed inset-0 flex items-center justify-center w-full h-full overflow-y-auto bg-gray-600 bg-opacity-50">
          <div className="w-96 relative p-5 bg-white border rounded-md shadow-lg">
            <h3 className="mb-2 text-lg font-medium leading-6 text-gray-900">
              Edit Mall Offer
            </h3>
            <img
              src={editingMallOffer.imageUrl}
              alt="Current Mall Offer"
              className="object-cover w-full h-40 mb-2 rounded"
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
              className="w-full p-2 mb-2 border rounded"
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
                onClick={() => handleUpdateMallOffer(editingMallOffer)}
                className="hover:bg-blue-600 p-2 text-white transition duration-300 bg-blue-500 rounded"
              >
                Update
              </button>
              <button
                onClick={() => setEditingMallOffer(null)}
                className="hover:bg-gray-400 p-2 text-gray-800 transition duration-300 bg-gray-300 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationDetails;
