import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
        toast.error("Failed to delete mall offer");
      }
    }
  };

  const handleUpdateLocation = async () => {
    try {
      let imageUrl = location.imageUrl;
      if (imageFile) {
        imageUrl = await handleImageUpload();
        if (!imageUrl) return;
      }

      const locationRef = doc(
        db,
        `mallChains/${location.mallChainId}/locations`,
        locationId
      );
      await updateDoc(locationRef, {
        name: location.name,
        address: location.address,
        description: location.description,
        imageUrl: imageUrl,
      });

      toast.success("Location updated successfully");
      setImageFile(null);
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
    <div className="container max-w-4xl px-4 py-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold text-center">
        {location?.name} Details
      </h1>

      <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-2xl font-semibold">Location Information</h2>
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 mb-4 md:mb-0 md:mr-4">
            <img
              src={location?.imageUrl}
              alt={location?.name}
              className="object-cover w-full h-64 rounded-lg shadow-md"
            />
          </div>
          <div className="w-full md:w-1/2">
            <input
              type="text"
              value={location?.name}
              onChange={(e) =>
                setLocation({ ...location, name: e.target.value })
              }
              className="w-full p-2 mb-2 border rounded"
            />
            <input
              type="text"
              value={location?.address}
              onChange={(e) =>
                setLocation({ ...location, address: e.target.value })
              }
              className="w-full p-2 mb-2 border rounded"
              placeholder="Address"
            />
            <textarea
              value={location?.description}
              onChange={(e) =>
                setLocation({ ...location, description: e.target.value })
              }
              className="w-full p-2 mb-2 border rounded"
              placeholder="Description"
              rows="3"
            ></textarea>
            <input
              type="file"
              onChange={(e) => setImageFile(e.target.files[0])}
              accept="image/*"
              className="w-full p-2 mb-2 border rounded"
            />
            <button
              onClick={handleUpdateLocation}
              className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Update Location
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-2xl font-semibold">Floor Layouts</h2>
        <ul className="mb-4 space-y-2">
          {floorLayouts.map((layout) => (
            <li
              key={layout.id}
              className="flex items-center justify-between p-3 bg-gray-100 rounded"
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
                  className="mr-2 text-blue-500 hover:text-blue-700"
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
            className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 transition duration-300 flex items-center"
          >
            <FaPlus className="mr-2" /> Add
          </button>
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-2xl font-semibold">Mall Offers</h2>
        <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-3">
          {mallOffers.map((offer) => (
            <div key={offer.id} className="p-4 border rounded-lg shadow-sm">
              <img
                src={offer.imageUrl}
                alt="Mall Offer"
                className="object-cover w-full h-40 mb-2 rounded"
              />
              <button
                onClick={() => handleDeleteMallOffer(offer.id)}
                className="flex items-center text-red-500 hover:text-red-700"
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
            className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 transition duration-300 flex items-center justify-center"
          >
            <FaPlus className="mr-2" /> Add Offer
          </button>
        </div>
      </div>
    </div>
  );
};

export default MallOwnerLocationDetails;
