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
import { db, storage } from "../../services/firebaseService";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
      const mallChainDoc = await getDoc(doc(db, "mallChains", mallChainId));
      if (mallChainDoc.exists()) {
        setMallChain({ id: mallChainDoc.id, ...mallChainDoc.data() });
      } else {
        toast.error("Mall chain not found");
        return;
      }

      // Fetch floor layouts and mall offers from the first location (if any)
      const locationsSnapshot = await getDocs(
        collection(db, `mallChains/${mallChainId}/locations`)
      );
      if (!locationsSnapshot.empty) {
        const firstLocationId = locationsSnapshot.docs[0].id;

        const floorLayoutsSnapshot = await getDocs(
          collection(
            db,
            `mallChains/${mallChainId}/locations/${firstLocationId}/floorLayout`
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
            `mallChains/${mallChainId}/locations/${firstLocationId}/MallOffers`
          )
        );
        setMallOffers(
          mallOffersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      }
    } catch (error) {
      console.error("Error fetching mall details:", error);
      toast.error("Failed to fetch mall details");
    } finally {
      setIsLoading(false);
    }
  };

  // ... (rest of the component code remains the same)
};

export default MallDetails;
