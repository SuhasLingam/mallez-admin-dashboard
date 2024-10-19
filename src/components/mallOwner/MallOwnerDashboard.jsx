import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../../services/firebaseService";
import { toast } from "react-toastify";

const MallOwnerDashboard = () => {
  const [assignedLocation, setAssignedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignedLocation();
  }, []);

  const fetchAssignedLocation = async () => {
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
        console.log("User not found by email, trying to fetch by UID");
        const userDocRef = doc(
          db,
          `platform_users/mallOwner/mallOwner/${auth.currentUser.uid}`
        );
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          userData = { id: userDocSnap.id, ...userDocSnap.data() };
          console.log("User data found by UID:", userData);
        } else {
          console.error("User document not found");
          toast.error("User data not found. Please contact an administrator.");
          navigate("/");
          return;
        }
      }

      if (userData.role !== "mallOwner") {
        console.error("User is not a mall owner");
        toast.error("You don't have mall owner permissions");
        navigate("/");
        return;
      }

      const { assignedLocationId, assignedMallChainId } = userData;
      if (!assignedLocationId || !assignedMallChainId) {
        console.log("No assigned location found for this mall owner");
        setAssignedLocation(null);
        setIsLoading(false);
        return;
      }

      const locationDoc = await getDoc(
        doc(
          db,
          `mallChains/${assignedMallChainId}/locations`,
          assignedLocationId
        )
      );

      if (!locationDoc.exists()) {
        console.error("Assigned location document not found");
        toast.error("Assigned location not found");
        setAssignedLocation(null);
      } else {
        setAssignedLocation({
          id: locationDoc.id,
          ...locationDoc.data(),
          mallChainId: assignedMallChainId,
        });
      }
    } catch (error) {
      console.error("Error in fetchAssignedLocation:", error);
      toast.error("An error occurred while fetching your data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="mt-8 text-center">Loading...</div>;
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-6 text-3xl font-bold">Mall Owner Dashboard</h1>
      {assignedLocation ? (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Your Assigned Location</h2>
          <p className="mb-2">
            <strong>Name:</strong> {assignedLocation.name}
          </p>
          <Link
            to={`/location/${assignedLocation.id}`}
            className="hover:bg-blue-600 inline-block px-4 py-2 text-white bg-blue-500 rounded"
          >
            Manage Location Details
          </Link>
        </div>
      ) : (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <p>You have not been assigned to any location yet.</p>
        </div>
      )}
    </div>
  );
};

export default MallOwnerDashboard;
