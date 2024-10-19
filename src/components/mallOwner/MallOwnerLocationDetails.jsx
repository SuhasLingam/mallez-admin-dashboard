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
import { FaEdit, FaTrash, FaPlus, FaUpload } from "react-icons/fa";

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
        console.error("No authenticated user found");
        toast.error("You must be logged in to access this page");
        navigate("/login");
        return;
      }

      console.log("Current user ID:", auth.currentUser.uid);

      // Try to fetch the mall owner document by email
      const mallOwnersRef = collection(
        db,
        "platform_users/mallOwner/mallOwner"
      );
      const q = query(
        mallOwnersRef,
        where("email", "==", auth.currentUser.email)
      );
      const querySnapshot = await getDocs(q);

      let userData;
      if (!querySnapshot.empty) {
        userData = {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data(),
        };
        console.log("User data found by email:", userData);
      } else {
        console.error("User document not found");
        toast.error("User data not found. Please contact an administrator.");
        navigate("/mall-owner");
        return;
      }

      if (userData.role !== "mallOwner") {
        console.error("User is not a mall owner");
        toast.error("You don't have mall owner permissions");
        navigate("/");
        return;
      }

      const { assignedLocationId, assignedMallChainId } = userData;
      if (assignedLocationId !== locationId) {
        console.error("User does not have access to this location");
        toast.error("You don't have access to this location");
        navigate("/mall-owner");
        return;
      }

      const locationDoc = await getDoc(
        doc(db, `mallChains/${assignedMallChainId}/locations`, locationId)
      );
      if (locationDoc.exists()) {
        setLocation({
          id: locationDoc.id,
          ...locationDoc.data(),
          mallChainId: assignedMallChainId,
        });
      } else {
        console.error("Location not found");
        toast.error("Location not found");
        navigate("/mall-owner");
        return;
      }

      const floorLayoutsSnapshot = await getDocs(
        collection(
          db,
          `mallChains/${assignedMallChainId}/locations/${locationId}/floorLayout`
        )
      );
      setFloorLayouts(
        floorLayoutsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      const mallOffersSnapshot = await getDocs(
        collection(
          db,
          `mallChains/${assignedMallChainId}/locations/${locationId}/MallOffers`
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

  if (isLoading) {
    return <div className="mt-8 text-center">Loading...</div>;
  }

  if (!location) {
    return <div className="mt-8 text-center">Location not found</div>;
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-6 text-3xl font-bold">{location?.name} Details</h1>

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
        <div className="flex space-x-2">
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
            className="hover:bg-green-600 p-2 text-white bg-green-500 rounded"
          >
            <FaPlus /> Add Floor Layout
          </button>
        </div>
      </div>

      <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-2xl font-semibold">Mall Offers</h2>
        <div className="sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1 gap-4">
          {mallOffers.map((offer) => (
            <div key={offer.id} className="p-4 border rounded-lg shadow-sm">
              <img
                src={offer.imageUrl}
                alt="Mall Offer"
                className="object-cover w-full h-40 mb-2 rounded"
              />
              <button
                onClick={() => handleDeleteMallOffer(offer.id)}
                className="hover:text-red-700 text-red-500"
              >
                <FaTrash /> Delete
              </button>
            </div>
          ))}
        </div>
        <div className="flex mt-4 space-x-2">
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
            className="p-2 border rounded"
          />
          <button
            onClick={handleAddMallOffer}
            className="hover:bg-green-600 p-2 text-white bg-green-500 rounded"
          >
            <FaPlus /> Add Mall Offer
          </button>
        </div>
      </div>
    </div>
  );
};

export default MallOwnerLocationDetails;
