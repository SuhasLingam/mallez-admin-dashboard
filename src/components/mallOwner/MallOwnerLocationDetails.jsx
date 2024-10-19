import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db, auth, storage } from "../../services/firebaseService";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaUpload,
  FaChartBar,
  FaShoppingBag,
  FaMapMarkerAlt,
  FaChevronRight,
  FaBuilding,
} from "react-icons/fa";

const MallOwnerLocationDetails = () => {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [floorLayouts, setFloorLayouts] = useState([]);
  const [mallOffers, setMallOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newFloorLayout, setNewFloorLayout] = useState({ name: "" });
  const [newMallOffer, setNewMallOffer] = useState({ imageUrl: "" });
  const [imageFile, setImageFile] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editImageFile, setEditImageFile] = useState(null);

  useEffect(() => {
    fetchLocationDetails();
  }, [locationId]);

  const fetchLocationDetails = async () => {
    setIsLoading(true);
    try {
      if (!auth.currentUser) {
        toast.error("You must be logged in to access this page");
        navigate("/login");
        return;
      }

      const mallOwnersRef = collection(
        db,
        "platform_users/mallOwner/mallOwner"
      );
      const q = query(
        mallOwnersRef,
        where("email", "==", auth.currentUser.email)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("User data not found. Please contact an administrator.");
        navigate("/mall-owner");
        return;
      }

      const userData = {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data(),
      };

      if (userData.role !== "mallOwner") {
        toast.error("You don't have mall owner permissions");
        navigate("/");
        return;
      }

      const assignedLocation = userData.assignedLocations.find(
        (loc) => loc.locationId === locationId
      );
      if (!assignedLocation) {
        toast.error("You don't have access to this location");
        navigate("/mall-owner");
        return;
      }

      const { mallChainId } = assignedLocation;

      const locationDoc = await getDoc(
        doc(db, `mallChains/${mallChainId}/locations`, locationId)
      );
      if (locationDoc.exists()) {
        setLocation({
          id: locationDoc.id,
          ...locationDoc.data(),
          mallChainId: mallChainId,
        });
      } else {
        toast.error("Location not found");
        navigate("/mall-owner");
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
          `mallChains/${location.mallChainId}/locations/${locationId}/floorLayout`
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

  const handleUpdateFloorLayout = async (id, updatedName) => {
    try {
      await updateDoc(
        doc(
          db,
          `mallChains/${location.mallChainId}/locations/${locationId}/floorLayout`,
          id
        ),
        { name: updatedName }
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
        await deleteDoc(
          doc(
            db,
            `mallChains/${location.mallChainId}/locations/${locationId}/floorLayout`,
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
    if (!imageFile) return null;
    const storageRef = ref(
      storage,
      `mall_offers/${Date.now()}_${imageFile.name}`
    );
    try {
      await uploadBytes(storageRef, imageFile);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      return null;
    }
  };

  const handleAddMallOffer = async () => {
    try {
      let imageUrl = newMallOffer.imageUrl;
      if (imageFile) {
        imageUrl = await handleImageUpload();
        if (!imageUrl) return;
      }
      await addDoc(
        collection(
          db,
          `mallChains/${location.mallChainId}/locations/${locationId}/MallOffers`
        ),
        { imageUrl }
      );
      toast.success("Mall offer added successfully");
      setNewMallOffer({ imageUrl: "" });
      setImageFile(null);
      fetchLocationDetails();
    } catch (error) {
      console.error("Error adding mall offer:", error);
      toast.error("Failed to add mall offer");
    }
  };

  const handleDeleteMallOffer = async (id) => {
    if (window.confirm("Are you sure you want to delete this mall offer?")) {
      try {
        await deleteDoc(
          doc(
            db,
            `mallChains/${location.mallChainId}/locations/${locationId}/MallOffers`,
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

  const handleEditLocation = () => {
    setShowEditModal(true);
  };

  const handleUpdateLocation = async () => {
    try {
      let imageUrl = location.imageUrl;
      if (editImageFile) {
        const storageRef = ref(
          storage,
          `mall_images/${Date.now()}_${editImageFile.name}`
        );
        await uploadBytes(storageRef, editImageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const locationRef = doc(
        db,
        `mallChains/${location.mallChainId}/locations`,
        locationId
      );
      await updateDoc(locationRef, {
        name: location.name,
        imageUrl: imageUrl,
        address: location.address,
        description: location.description,
      });

      toast.success("Location updated successfully");
      setShowEditModal(false);
      setEditImageFile(null);
      fetchLocationDetails();
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error("Failed to update location");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl px-4 py-8 mx-auto">
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              to="/mall-owner"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Dashboard
            </Link>
          </li>
          <FaChevronRight className="mx-2 text-gray-500" />
          <li className="inline-flex items-center">
            <span className="text-gray-500 font-medium">{location?.name}</span>
          </li>
        </ol>
      </nav>

      <h1 className="mb-8 text-3xl font-bold text-center text-gray-800">
        {location?.name} Details
      </h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="relative h-64">
          {location?.imageUrl ? (
            <img
              src={location.imageUrl}
              alt={location.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <FaBuilding className="text-gray-400 text-4xl" />
            </div>
          )}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent p-4">
            <h2 className="text-2xl font-semibold text-white">
              {location?.name}
            </h2>
          </div>
        </div>
        <div className="p-4">
          <p className="mb-2 text-gray-600 flex items-center">
            <FaMapMarkerAlt className="mr-2" />
            {location?.address || "Address not available"}
          </p>
          <p className="mb-4 text-gray-600">{location?.description}</p>
          <div className="flex justify-between mb-4">
            <div className="text-center">
              <FaChartBar className="mx-auto text-2xl text-blue-500" />
              <p className="mt-1 text-sm font-semibold">
                {floorLayouts.length} Layouts
              </p>
            </div>
            <div className="text-center">
              <FaShoppingBag className="mx-auto text-2xl text-green-500" />
              <p className="mt-1 text-sm font-semibold">
                {mallOffers.length} Offers
              </p>
            </div>
          </div>
          <button
            onClick={handleEditLocation}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 w-full"
          >
            <FaEdit className="inline-block mr-2" /> Edit Location
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Floor Layouts</h2>
        <ul className="space-y-2 mb-4">
          {floorLayouts.map((layout) => (
            <li
              key={layout.id}
              className="flex items-center justify-between bg-gray-100 p-3 rounded"
            >
              <span>{layout.name}</span>
              <div>
                <button
                  onClick={() =>
                    handleUpdateFloorLayout(
                      layout.id,
                      prompt("Enter new name", layout.name)
                    )
                  }
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
              </div>
            </li>
          ))}
        </ul>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newFloorLayout.name}
            onChange={(e) =>
              setNewFloorLayout({ ...newFloorLayout, name: e.target.value })
            }
            placeholder="New floor layout name"
            className="flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddFloorLayout}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 flex items-center"
          >
            <FaPlus className="mr-2" /> Add
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Mall Offers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {mallOffers.map((offer) => (
            <div key={offer.id} className="border rounded-lg shadow-sm p-4">
              <img
                src={offer.imageUrl}
                alt="Mall Offer"
                className="w-full h-40 object-cover rounded mb-2"
              />
              <button
                onClick={() => handleDeleteMallOffer(offer.id)}
                className="text-red-500 hover:text-red-700 flex items-center"
              >
                <FaTrash className="mr-1" /> Delete
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <input
            type="text"
            value={newMallOffer.imageUrl}
            onChange={(e) =>
              setNewMallOffer({ ...newMallOffer, imageUrl: e.target.value })
            }
            placeholder="New mall offer image URL"
            className="flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="file"
            onChange={(e) => setImageFile(e.target.files[0])}
            accept="image/*"
            className="p-2 border rounded"
          />
          <button
            onClick={handleAddMallOffer}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 flex items-center justify-center"
          >
            <FaPlus className="mr-2" /> Add Offer
          </button>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-6 bg-white rounded-lg">
              <h2 className="mb-4 text-2xl font-bold">Edit Location</h2>
              <input
                type="text"
                value={location.name}
                onChange={(e) =>
                  setLocation({ ...location, name: e.target.value })
                }
                className="w-full p-2 mb-4 border rounded"
                placeholder="Location name"
              />
              <input
                type="text"
                value={location.address}
                onChange={(e) =>
                  setLocation({ ...location, address: e.target.value })
                }
                className="w-full p-2 mb-4 border rounded"
                placeholder="Address"
              />
              <textarea
                value={location.description}
                onChange={(e) =>
                  setLocation({ ...location, description: e.target.value })
                }
                className="w-full p-2 mb-4 border rounded"
                placeholder="Description"
                rows="3"
              ></textarea>
              <div className="mb-4">
                <label className="block mb-2 font-semibold">
                  Location Image
                </label>
                <input
                  type="file"
                  onChange={(e) => setEditImageFile(e.target.files[0])}
                  accept="image/*"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleUpdateLocation}
                  className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                  Update
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MallOwnerLocationDetails;
