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
      const userDoc = await getDoc(
        doc(db, `platform_users/mallOwner/mallOwner/${auth.currentUser.uid}`)
      );
      if (userDoc.exists() && userDoc.data().role === "mallOwner") {
        const { assignedLocationId, assignedMallChainId } = userDoc.data();
        if (assignedLocationId !== locationId) {
          toast.error("You don't have access to this location");
          navigate("/mall-owner");
          return;
        }

        const locationDoc = await getDoc(
          doc(db, `mallChains/${assignedMallChainId}/locations`, locationId)
        );
        if (locationDoc.exists()) {
          setLocation({ id: locationDoc.id, ...locationDoc.data() });
        } else {
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
          floorLayoutsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
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
      } else {
        toast.error("You don't have permission to view this page");
        navigate("/");
      }
    } catch (error) {
      console.error("Error fetching location details:", error);
      toast.error("Failed to fetch location details");
    } finally {
      setIsLoading(false);
    }
  };

  // Implement handleAddFloorLayout, handleUpdateFloorLayout, handleDeleteFloorLayout
  // Implement handleAddMallOffer, handleUpdateMallOffer, handleDeleteMallOffer
  // These functions will be similar to the ones in LocationDetails.jsx, but with proper access checks

  if (isLoading) {
    return <div className="mt-8 text-center">Loading...</div>;
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-6 text-3xl font-bold">{location?.name} Details</h1>

      {/* Floor Layouts Section */}
      <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-2xl font-semibold">Floor Layouts</h2>
        {/* Render floor layouts list and add new floor layout form */}
      </div>

      {/* Mall Offers Section */}
      <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-2xl font-semibold">Mall Offers</h2>
        {/* Render mall offers list and add new mall offer form */}
      </div>
    </div>
  );
};

export default MallOwnerLocationDetails;
