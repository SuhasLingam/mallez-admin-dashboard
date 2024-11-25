import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../../services/firebaseService";
import { FaFilm, FaMapMarkerAlt, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

const TheaterChainsSection = () => {
  const [assignedTheaters, setAssignedTheaters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAssignedTheaters();
  }, []);

  const fetchAssignedTheaters = async () => {
    console.log("Starting fetchAssignedTheaters");
    setIsLoading(true);
    try {
      if (!auth.currentUser) {
        console.log("No authenticated user");
        return;
      }

      // Get mall owner data
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
        console.log("No mall owner found");
        return;
      }

      const mallOwnerId = querySnapshot.docs[0].id;
      console.log("Mall owner ID:", mallOwnerId);

      // Get all theater chains
      const theaterChainsSnapshot = await getDocs(
        collection(db, "theaterChains")
      );
      const assignedLocations = [];

      // For each theater chain, get locations assigned to this mall owner
      await Promise.all(
        theaterChainsSnapshot.docs.map(async (chainDoc) => {
          console.log("Checking theater chain:", chainDoc.id);

          // Query locations where mallOwnerId matches
          const locationsRef = collection(
            db,
            `theaterChains/${chainDoc.id}/locations`
          );
          const locationsQuery = query(
            locationsRef,
            where("mallOwnerId", "==", mallOwnerId)
          );
          const locationsSnapshot = await getDocs(locationsQuery);

          console.log(
            `Found ${locationsSnapshot.size} locations in chain ${chainDoc.id}`
          );

          // Process each location
          const chainLocations = await Promise.all(
            locationsSnapshot.docs.map(async (locationDoc) => {
              const locationData = locationDoc.data();
              console.log("Location data:", locationData);

              // Get screens count
              const screensSnapshot = await getDocs(
                collection(
                  db,
                  `theaterChains/${chainDoc.id}/locations/${locationDoc.id}/screens`
                )
              );

              // Get current movies count
              const moviesSnapshot = await getDocs(
                collection(
                  db,
                  `theaterChains/${chainDoc.id}/locations/${locationDoc.id}/currentMovies`
                )
              );

              return {
                theaterChainId: chainDoc.id,
                locationId: locationDoc.id,
                theaterChainName: chainDoc.data().title,
                locationName: locationData.name,
                locationAddress: locationData.address,
                imageUrl: locationData.imageUrl,
                screensCount: screensSnapshot.size,
                moviesCount: moviesSnapshot.size,
              };
            })
          );

          assignedLocations.push(...chainLocations);
        })
      );

      console.log("Final assigned locations:", assignedLocations);
      setAssignedTheaters(assignedLocations);
    } catch (error) {
      console.error("Error in fetchAssignedTheaters:", error);
      toast.error("Failed to fetch assigned theaters");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl px-4 py-8 mx-auto">
      {assignedTheaters.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignedTheaters.map((theater) => (
            <div
              key={`${theater.theaterChainId}-${theater.locationId}`}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <div className="relative h-48">
                {theater.imageUrl ? (
                  <img
                    src={theater.imageUrl}
                    alt={theater.locationName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <FaFilm className="text-gray-400 text-4xl" />
                  </div>
                )}
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent p-4">
                  <h3 className="text-xl font-semibold text-white">
                    {theater.locationName}
                  </h3>
                  <p className="text-sm text-gray-200">
                    {theater.theaterChainName}
                  </p>
                </div>
              </div>
              <div className="p-4">
                <p className="mb-2 text-gray-600 flex items-center">
                  <FaMapMarkerAlt className="mr-2" />
                  {theater.locationAddress || "Address not available"}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {theater.screensCount}
                    </p>
                    <p className="text-sm text-blue-600">Screens</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {theater.moviesCount}
                    </p>
                    <p className="text-sm text-green-600">Movies</p>
                  </div>
                </div>
                <Link
                  to={`/theater/${theater.theaterChainId}/location/${theater.locationId}`}
                  className="block w-full px-4 py-2 text-center text-white bg-blue-500 rounded hover:bg-blue-600 transition duration-300"
                >
                  Manage Theater
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center bg-white rounded-lg shadow-lg">
          <FaFilm className="mx-auto mb-4 text-6xl text-gray-400" />
          <p className="text-xl text-gray-700">
            You have not been assigned to any theater locations yet.
          </p>
          <p className="mt-2 text-gray-600">
            Please contact an administrator for assistance.
          </p>
        </div>
      )}
    </div>
  );
};

export default TheaterChainsSection;
