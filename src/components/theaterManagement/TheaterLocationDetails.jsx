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
  FaFilm,
  FaCouch,
  FaTicketAlt,
  FaHamburger,
  FaInfoCircle,
  FaSpinner,
  FaCoffee,
  FaGlassWhiskey,
  FaIceCream,
  FaUtensils,
  FaPizzaSlice,
  FaCandyCane,
  FaCookie,
} from "react-icons/fa";
import { BiDrink } from "react-icons/bi";
import { MdFastfood, MdLocalDrink } from "react-icons/md";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const FormField = ({ label, error, children, tooltip }) => (
  <div className="space-y-1">
    <div className="flex items-center space-x-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {tooltip && (
        <div className="group relative">
          <FaInfoCircle className="hover:text-gray-600 text-gray-400" />
          <div className="left-full group-hover:block absolute hidden w-48 p-2 ml-2 text-xs text-white bg-gray-800 rounded shadow-lg">
            {tooltip}
          </div>
        </div>
      )}
    </div>
    {children}
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
);

const TheaterLocationDetails = ({ userRole }) => {
  const { theaterChainId, locationId } = useParams();
  const [theaterChain, setTheaterChain] = useState(null);
  const [location, setLocation] = useState(null);
  const [screens, setScreens] = useState([]);
  const [currentMovies, setCurrentMovies] = useState([]);
  const [concessions, setConcessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("screens");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'screen', 'movie', or 'concession'
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    screen: { name: "", capacity: 0, features: [] },
    movie: {
      movieName: "",
      imageUrl: "",
      showTimes: [{ time: "", screen: "" }],
    },
    concession: {
      name: "",
      price: 0,
      description: "",
      category: "",
      variants: [],
      isAvailable: true,
    },
  });
  const [activeCategory, setActiveCategory] = useState("All");
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchLocationDetails();
  }, [theaterChainId, locationId]);

  const fetchLocationDetails = async () => {
    setIsLoading(true);
    try {
      // Fetch theater chain details
      const theaterChainDoc = await getDoc(
        doc(db, "theaterChains", theaterChainId)
      );
      if (theaterChainDoc.exists()) {
        setTheaterChain({ id: theaterChainDoc.id, ...theaterChainDoc.data() });
      }

      // Fetch location details
      const locationDoc = await getDoc(
        doc(db, `theaterChains/${theaterChainId}/locations`, locationId)
      );
      if (locationDoc.exists()) {
        setLocation({ id: locationDoc.id, ...locationDoc.data() });
      }

      // Fetch screens
      const screensSnapshot = await getDocs(
        collection(
          db,
          `theaterChains/${theaterChainId}/locations/${locationId}/screens`
        )
      );
      setScreens(
        screensSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      // Fetch current movies
      const moviesSnapshot = await getDocs(
        collection(
          db,
          `theaterChains/${theaterChainId}/locations/${locationId}/currentMovies`
        )
      );
      setCurrentMovies(
        moviesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      // Fetch concessions
      const concessionsSnapshot = await getDocs(
        collection(
          db,
          `theaterChains/${theaterChainId}/locations/${locationId}/concessions`
        )
      );
      setConcessions(
        concessionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (error) {
      console.error("Error fetching location details:", error);
      toast.error("Failed to fetch location details");
    } finally {
      setIsLoading(false);
    }
  };

  const renderBreadcrumb = () => (
    <nav className="flex mb-8" aria-label="Breadcrumb">
      <ol className="md:space-x-3 inline-flex items-center space-x-1">
        <li className="inline-flex items-center">
          <Link
            to="/theater-chains"
            className="hover:text-blue-600 text-gray-700"
          >
            Theater Chains
          </Link>
        </li>
        <FaChevronRight className="mx-2 text-gray-500" />
        <li className="inline-flex items-center">
          <Link
            to={`/theater/${theaterChainId}/locations`}
            className="hover:text-blue-600 text-gray-700"
          >
            {theaterChain?.title}
          </Link>
        </li>
        <FaChevronRight className="mx-2 text-gray-500" />
        <li className="text-gray-500">{location?.name}</li>
      </ol>
    </nav>
  );

  const renderTabs = () => (
    <div className="mb-6 border-b border-gray-200">
      <nav className="flex -mb-px space-x-8" aria-label="Tabs">
        {["screens", "movies", "concessions"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`${
              activeTab === tab
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );

  const handleAddItem = async (type) => {
    setModalType(type);
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (type, item) => {
    setModalType(type);
    setEditingItem(item);
    setNewItem({
      ...newItem,
      [type]: {
        ...item,
        features: item.features || [],
        showTimes: item.showTimes || [{ time: "", screen: "" }],
        variants: item.variants || [],
      },
    });
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`))
      return;

    try {
      const collectionPath = `theaterChains/${theaterChainId}/locations/${locationId}/${
        type === "movie" ? "currentMovies" : `${type}s`
      }`;

      await deleteDoc(doc(db, collectionPath, id));
      toast.success(`${type} deleted successfully`);
      fetchLocationDetails();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast.error(`Failed to delete ${type}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!auth.currentUser) {
        toast.error("You must be logged in to perform this action");
        return;
      }

      let itemData = {
        ...newItem[modalType],
        updatedBy: auth.currentUser.uid,
        updatedAt: new Date().toISOString(),
      };

      // Handle image upload for both concessions and movies
      if (modalType === "concession" || modalType === "movie") {
        let imageUrl = newItem[modalType].imageUrl;

        if (imageFile) {
          try {
            const storageRef = ref(
              storage,
              `${modalType}_images/${Date.now()}_${imageFile.name.replace(
                /[^a-zA-Z0-9.]/g,
                "_"
              )}`
            );

            const metadata = {
              contentType: imageFile.type,
              customMetadata: {
                uploadedBy: auth.currentUser.uid,
                uploadedAt: new Date().toISOString(),
              },
            };

            const uploadResult = await uploadBytes(
              storageRef,
              imageFile,
              metadata
            );
            imageUrl = await getDownloadURL(uploadResult.ref);
          } catch (uploadError) {
            console.error("Error uploading image:", uploadError);
            if (uploadError.code === "storage/unauthorized") {
              toast.error("You don't have permission to upload images");
            } else {
              toast.error("Failed to upload image: " + uploadError.message);
            }
            setIsLoading(false);
            return;
          }
        }

        // Add image URL to the item data
        itemData = {
          ...itemData,
          imageUrl,
        };

        // Add specific fields for concessions
        if (modalType === "concession") {
          itemData.price = parseFloat(newItem.concession.price) || 0;
        }
      }

      // Add specific fields based on modal type
      if (modalType === "screen") {
        itemData = {
          ...itemData,
          capacity: parseInt(newItem.screen.capacity) || 0,
        };
      } else if (modalType === "movie") {
        itemData = {
          ...itemData,
          movieName: newItem.movie.movieName,
          showTimes: newItem.movie.showTimes.map((st) => ({
            time: st.time || "",
            screen: st.screen || "",
          })),
        };
      }

      const collectionPath = `theaterChains/${theaterChainId}/locations/${locationId}/${
        modalType === "movie" ? "currentMovies" : `${modalType}s`
      }`;

      if (editingItem) {
        await updateDoc(doc(db, collectionPath, editingItem.id), itemData);
        toast.success(`${modalType} updated successfully`);
      } else {
        itemData.createdBy = auth.currentUser.uid;
        itemData.createdAt = new Date().toISOString();
        await addDoc(collection(db, collectionPath), itemData);
        toast.success(`${modalType} added successfully`);
      }

      handleCloseModal();
      fetchLocationDetails();
    } catch (error) {
      console.error(`Error saving ${modalType}:`, error);
      if (error.code === "permission-denied") {
        toast.error("You don't have permission to perform this action");
      } else {
        toast.error(`Failed to save ${modalType}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setImageFile(null);
    setNewItem({
      screen: { name: "", capacity: 0, features: [] },
      movie: {
        movieName: "",
        imageUrl: "",
        showTimes: [{ time: "", screen: "" }],
      },
      concession: {
        name: "",
        price: 0,
        description: "",
        category: "",
        variants: [],
        isAvailable: true,
      },
    });
  };

  const renderScreenForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Screen Name"
        tooltip="Enter a unique name for this screen (e.g., Audi 1, IMAX Screen)"
      >
        <input
          type="text"
          value={newItem.screen.name}
          onChange={(e) =>
            setNewItem({
              ...newItem,
              screen: { ...newItem.screen, name: e.target.value },
            })
          }
          className="focus:ring-2 focus:ring-blue-500 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
          placeholder="Enter screen name"
          required
        />
      </FormField>

      <FormField
        label="Seating Capacity"
        tooltip="Total number of seats available in this screen"
      >
        <input
          type="number"
          min="1"
          value={newItem.screen.capacity}
          onChange={(e) =>
            setNewItem({
              ...newItem,
              screen: {
                ...newItem.screen,
                capacity: parseInt(e.target.value) || 0,
              },
            })
          }
          className="focus:ring-2 focus:ring-blue-500 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
          placeholder="Enter seating capacity"
          required
        />
      </FormField>

      <FormField
        label="Features"
        tooltip="Add special features like Dolby Atmos, IMAX, 4K, etc. Press Enter or comma to add"
      >
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="text"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  const value = e.target.value.trim();
                  if (value) {
                    const newFeatures = [...(newItem.screen.features || [])];
                    if (!newFeatures.includes(value)) {
                      newFeatures.push(value);
                      setNewItem({
                        ...newItem,
                        screen: { ...newItem.screen, features: newFeatures },
                      });
                    }
                    e.target.value = "";
                  }
                }
              }}
              className="focus:ring-2 focus:ring-blue-500 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Type and press Enter or comma to add"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(newItem.screen.features || []).map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full"
              >
                {feature}
                <button
                  type="button"
                  onClick={() => {
                    const newFeatures = newItem.screen.features.filter(
                      (_, i) => i !== index
                    );
                    setNewItem({
                      ...newItem,
                      screen: { ...newItem.screen, features: newFeatures },
                    });
                  }}
                  className="hover:text-blue-900 ml-2"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </FormField>

      <div className="flex justify-end pt-4 space-x-3 border-t">
        <button
          type="button"
          onClick={handleCloseModal}
          className="hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              {editingItem ? "Updating..." : "Adding..."}
            </>
          ) : (
            <>{editingItem ? "Update Screen" : "Add Screen"}</>
          )}
        </button>
      </div>
    </form>
  );

  const renderMovieForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField label="Movie Name" tooltip="Enter the full movie title">
        <input
          type="text"
          value={newItem.movie.movieName}
          onChange={(e) =>
            setNewItem({
              ...newItem,
              movie: { ...newItem.movie, movieName: e.target.value },
            })
          }
          className="focus:ring-2 focus:ring-blue-500 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
          placeholder="Enter movie name"
          required
        />
      </FormField>

      <FormField
        label="Movie Poster"
        tooltip="Upload a poster image for the movie (Max 5MB)"
      >
        <div className="space-y-2">
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                if (file.size > 5 * 1024 * 1024) {
                  toast.error("Image size should be less than 5MB");
                  e.target.value = "";
                  return;
                }
                if (!file.type.startsWith("image/")) {
                  toast.error("Please upload an image file");
                  e.target.value = "";
                  return;
                }
                setImageFile(file);
              }
            }}
            accept="image/*"
            className="focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 block w-full text-sm text-gray-500"
          />
          {(imageFile || newItem.movie.imageUrl) && (
            <div className="relative w-32 h-48 mt-2">
              <img
                src={
                  imageFile
                    ? URL.createObjectURL(imageFile)
                    : newItem.movie.imageUrl
                }
                alt="Movie Poster Preview"
                className="object-cover w-full h-full rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setNewItem({
                    ...newItem,
                    movie: { ...newItem.movie, imageUrl: "" },
                  });
                }}
                className="absolute top-0 right-0 p-1 -mt-2 -mr-2 text-white bg-red-500 rounded-full"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </FormField>

      <FormField
        label="Show Times"
        tooltip="Add multiple show times with screen details"
      >
        <div className="space-y-3">
          {(newItem.movie.showTimes || []).map((showTime, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="time"
                value={showTime.time}
                onChange={(e) => {
                  const newShowTimes = [...newItem.movie.showTimes];
                  newShowTimes[index] = { ...showTime, time: e.target.value };
                  setNewItem({
                    ...newItem,
                    movie: { ...newItem.movie, showTimes: newShowTimes },
                  });
                }}
                className="focus:ring-2 focus:ring-blue-500 flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              />
              {/* <select
                value={showTime.screen}
                onChange={(e) => {
                  const newShowTimes = [...newItem.movie.showTimes];
                  newShowTimes[index] = { ...showTime, screen: e.target.value };
                  setNewItem({
                    ...newItem,
                    movie: { ...newItem.movie, showTimes: newShowTimes },
                  });
                }}
                className="focus:ring-2 focus:ring-blue-500 flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="">Select Screen</option>
                {screens.map((screen) => (
                  <option key={screen.id} value={screen.name}>
                    {screen.name}
                  </option>
                ))}
              </select> */}
              <button
                type="button"
                onClick={() => {
                  const newShowTimes = newItem.movie.showTimes.filter(
                    (_, i) => i !== index
                  );
                  setNewItem({
                    ...newItem,
                    movie: { ...newItem.movie, showTimes: newShowTimes },
                  });
                }}
                className="hover:bg-red-100 hover:text-red-800 p-2 text-red-600 transition-colors rounded-full"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setNewItem({
                ...newItem,
                movie: {
                  ...newItem.movie,
                  showTimes: [
                    ...newItem.movie.showTimes,
                    { time: "", screen: "" },
                  ],
                },
              });
            }}
            className="hover:bg-blue-50 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md"
          >
            <FaPlus className="mr-2" /> Add Show Time
          </button>
        </div>
      </FormField>

      <div className="flex justify-end pt-4 space-x-3 border-t">
        <button
          type="button"
          onClick={handleCloseModal}
          className="hover:bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="hover:bg-blue-700 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              {editingItem ? "Updating..." : "Adding..."}
            </>
          ) : (
            <>{editingItem ? "Update Movie" : "Add Movie"}</>
          )}
        </button>
      </div>
    </form>
  );

  const getCategoryIcon = (category) => {
    const categoryMap = {
      Snacks: FaCookie,
      Beverages: MdLocalDrink,
      "Ice Cream": FaIceCream,
      "Fast Food": MdFastfood,
      Coffee: FaCoffee,
      Pizza: FaUtensils,
      Candy: FaCandyCane,
      default: FaHamburger,
    };

    const IconComponent = categoryMap[category] || categoryMap.default;
    return <IconComponent className="w-5 h-5" />;
  };

  const renderContent = () => {
    switch (activeTab) {
      case "screens":
        return (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => handleAddItem("screen")}
                className="hover:bg-blue-600 flex items-center px-4 py-2 text-white bg-blue-500 rounded-md"
              >
                <FaPlus className="mr-2" /> Add Screen
              </button>
            </div>
            <div className="sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1 gap-6">
              {screens.map((screen) => (
                <div
                  key={screen.id}
                  className="p-6 bg-white rounded-lg shadow-md"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{screen.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditItem("screen", screen)}
                        className="hover:text-blue-700 text-blue-500"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteItem("screen", screen.id)}
                        className="hover:text-red-700 text-red-500"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <p className="mb-2 text-gray-600">
                    Capacity: {screen.capacity} seats
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {screen.features?.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      case "movies":
        return (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => handleAddItem("movie")}
                className="hover:bg-blue-600 hover:shadow-lg flex items-center px-6 py-3 text-white transition-all duration-200 bg-blue-500 rounded-md shadow-md"
              >
                <FaPlus className="mr-2" /> Add Movie
              </button>
            </div>
            <div className="sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1 gap-6">
              {currentMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="group hover:shadow-xl hover:-translate-y-1 overflow-hidden transition-all duration-300 transform bg-white rounded-lg shadow-md"
                >
                  <div className="relative h-64">
                    {movie.imageUrl ? (
                      <img
                        src={movie.imageUrl}
                        alt={movie.movieName}
                        className="group-hover:scale-105 object-cover w-full h-full transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gray-100">
                        <FaFilm className="text-4xl text-gray-300" />
                      </div>
                    )}
                    <div className="top-2 right-2 group-hover:opacity-100 absolute flex space-x-2 transition-opacity duration-200 opacity-0">
                      <button
                        onClick={() => handleEditItem("movie", movie)}
                        className="hover:bg-blue-600 p-2 text-white transition-colors bg-blue-500 rounded-full shadow-lg"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteItem("movie", movie.id)}
                        className="hover:bg-red-600 p-2 text-white transition-colors bg-red-500 rounded-full shadow-lg"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="mb-3 text-xl font-semibold text-gray-900">
                      {movie.movieName}
                    </h3>
                    <div className="space-y-3">
                      {movie.showTimes?.map((showTime, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 flex items-center justify-between p-2 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                              {showTime.time}
                            </span>
                            <span className="text-gray-600">
                              Screen: {showTime.screen}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {currentMovies.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FaFilm className="mb-4 text-5xl text-gray-300" />
                <p className="mb-2 text-xl font-medium text-gray-600">
                  No movies found
                </p>
                <p className="text-gray-500">
                  Start by adding some movies to this location
                </p>
              </div>
            )}
          </>
        );
      case "concessions":
        return (
          <>
            <div className="lg:flex-row lg:items-center lg:space-y-0 flex flex-col justify-between mb-8 space-y-6">
              <div className="lg:w-auto relative w-full">
                <div className="hide-scrollbar flex pb-2 overflow-x-auto">
                  <div className="flex px-1 space-x-2">
                    {[
                      "All",
                      "Snacks",
                      "Beverages",
                      "Fast Food",
                      "Ice Cream",
                      "Coffee",
                      "Pizza",
                      "Candy",
                    ].map((category) => (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`flex items-center whitespace-nowrap px-4 py-2 rounded-full transition-all ${
                          activeCategory === category
                            ? "bg-blue-500 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {category !== "All" && (
                          <span className="mr-2">
                            {getCategoryIcon(category)}
                          </span>
                        )}
                        <span>{category}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleAddItem("concession")}
                className="hover:bg-blue-600 hover:shadow-lg lg:w-auto flex items-center justify-center w-full px-6 py-3 text-white transition-all duration-200 bg-blue-500 rounded-md shadow-md"
              >
                <FaPlus className="mr-2" /> Add Concession
              </button>
            </div>

            <div className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 grid grid-cols-1 gap-6">
              {concessions
                .filter(
                  (c) =>
                    activeCategory === "All" || c.category === activeCategory
                )
                .map((concession) => (
                  <motion.div
                    key={concession.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="group hover:shadow-xl hover:-translate-y-1 rounded-xl flex flex-col overflow-hidden transition-all duration-300 transform bg-white shadow-md"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {concession.imageUrl ? (
                        <img
                          src={concession.imageUrl}
                          alt={concession.name}
                          className="group-hover:scale-105 object-cover w-full h-full transition-transform duration-300"
                        />
                      ) : (
                        <div className="bg-gray-50 flex items-center justify-center w-full h-full">
                          <FaUtensils className="text-4xl text-gray-300" />
                        </div>
                      )}

                      <div className="top-2 right-2 group-hover:opacity-100 absolute flex space-x-2 transition-opacity duration-200 opacity-0">
                        <button
                          onClick={() =>
                            handleEditItem("concession", concession)
                          }
                          className="hover:bg-blue-600 p-2 text-white transition-colors bg-blue-500 rounded-full shadow-lg"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteItem("concession", concession.id)
                          }
                          className="hover:bg-red-600 p-2 text-white transition-colors bg-red-500 rounded-full shadow-lg"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 p-6">
                      <div className="flex items-start mb-4 space-x-3">
                        <div className="bg-blue-50 p-2 text-blue-600 rounded-lg">
                          {getCategoryIcon(concession.category)}
                        </div>
                        <div>
                          <h3 className="line-clamp-1 text-lg font-semibold text-gray-900">
                            {concession.name}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {concession.category}
                          </span>
                        </div>
                      </div>

                      <p className="line-clamp-2 mb-4 text-gray-600">
                        {concession.description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-green-600">
                          ₹{concession.price}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            concession.isAvailable
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {concession.isAvailable
                            ? "Available"
                            : "Out of Stock"}
                        </span>
                      </div>

                      {concession.variants &&
                        concession.variants.length > 0 && (
                          <div>
                            <h4 className="mb-2 text-sm font-medium text-gray-700">
                              Available Variants:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {concession.variants.map((variant, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-full"
                                >
                                  {variant}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </motion.div>
                ))}
            </div>

            {concessions.filter(
              (c) => activeCategory === "All" || c.category === activeCategory
            ).length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FaUtensils className="mb-4 text-5xl text-gray-300" />
                <p className="mb-2 text-xl font-medium text-gray-600">
                  No concessions found
                </p>
                <p className="text-gray-500">
                  {activeCategory === "All"
                    ? "Start by adding some concessions"
                    : `No items in ${activeCategory} category`}
                </p>
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  const renderModal = () => (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl"
            >
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {editingItem ? `Edit ${modalType}` : `Add New ${modalType}`}
              </h3>
              {modalType === "screen" && renderScreenForm()}
              {modalType === "movie" && renderMovieForm()}
              {modalType === "concession" && renderConcessionForm()}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderConcessionForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField label="Name" tooltip="Enter the name of the concession item">
        <input
          type="text"
          value={newItem.concession.name}
          onChange={(e) =>
            setNewItem({
              ...newItem,
              concession: { ...newItem.concession, name: e.target.value },
            })
          }
          className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
          required
        />
      </FormField>

      <FormField
        label="Description"
        tooltip="Enter a description of the concession item"
      >
        <textarea
          value={newItem.concession.description}
          onChange={(e) =>
            setNewItem({
              ...newItem,
              concession: {
                ...newItem.concession,
                description: e.target.value,
              },
            })
          }
          className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
          rows="3"
          required
        />
      </FormField>

      <FormField
        label="Image"
        tooltip="Upload an image of the concession item (Max 5MB)"
      >
        <div className="space-y-2">
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                if (file.size > 5 * 1024 * 1024) {
                  toast.error("Image size should be less than 5MB");
                  e.target.value = "";
                  return;
                }
                if (!file.type.startsWith("image/")) {
                  toast.error("Please upload an image file");
                  e.target.value = "";
                  return;
                }
                setImageFile(file);
              }
            }}
            accept="image/*"
            className="focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 block w-full text-sm text-gray-500"
          />
          {(imageFile || newItem.concession.imageUrl) && (
            <div className="relative w-32 h-32 mt-2">
              <img
                src={
                  imageFile
                    ? URL.createObjectURL(imageFile)
                    : newItem.concession.imageUrl
                }
                alt="Preview"
                className="object-cover w-full h-full rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setNewItem({
                    ...newItem,
                    concession: { ...newItem.concession, imageUrl: "" },
                  });
                }}
                className="absolute top-0 right-0 p-1 -mt-2 -mr-2 text-white bg-red-500 rounded-full"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </FormField>

      <FormField
        label="Category"
        tooltip="Select the category of the concession item"
      >
        <select
          value={newItem.concession.category}
          onChange={(e) =>
            setNewItem({
              ...newItem,
              concession: { ...newItem.concession, category: e.target.value },
            })
          }
          className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
          required
        >
          <option value="">Select a category</option>
          {[
            "Snacks",
            "Beverages",
            "Fast Food",
            "Ice Cream",
            "Coffee",
            "Pizza",
            "Candy",
          ].map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Price" tooltip="Enter the price in rupees">
          <div className="relative">
            <span className="left-3 top-1/2 absolute text-gray-500 transform -translate-y-1/2">
              ₹
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={newItem.concession.price}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  concession: {
                    ...newItem.concession,
                    price: parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full py-2 pl-8 pr-4 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
        </FormField>

        <FormField label="Availability" tooltip="Toggle item availability">
          <div className="flex items-center h-full">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={newItem.concession.isAvailable}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    concession: {
                      ...newItem.concession,
                      isAvailable: e.target.checked,
                    },
                  })
                }
                className="peer sr-only"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {newItem.concession.isAvailable ? "Available" : "Out of Stock"}
              </span>
            </label>
          </div>
        </FormField>
      </div>

      <FormField
        label="Variants"
        tooltip="Add variants like sizes or flavors (press Enter to add)"
      >
        <div className="space-y-2">
          <input
            type="text"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const value = e.target.value.trim();
                if (value) {
                  const newVariants = [...(newItem.concession.variants || [])];
                  if (!newVariants.includes(value)) {
                    newVariants.push(value);
                    setNewItem({
                      ...newItem,
                      concession: {
                        ...newItem.concession,
                        variants: newVariants,
                      },
                    });
                  }
                  e.target.value = "";
                }
              }
            }}
            className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="Type and press Enter to add variant"
          />
          <div className="flex flex-wrap gap-2">
            {newItem.concession.variants?.map((variant, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 text-sm text-gray-800 bg-gray-100 rounded-full"
              >
                {variant}
                <button
                  type="button"
                  onClick={() => {
                    const newVariants = newItem.concession.variants.filter(
                      (_, i) => i !== index
                    );
                    setNewItem({
                      ...newItem,
                      concession: {
                        ...newItem.concession,
                        variants: newVariants,
                      },
                    });
                  }}
                  className="hover:text-gray-700 ml-2 text-gray-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </FormField>

      <div className="flex justify-end pt-4 space-x-3 border-t">
        <button
          type="button"
          onClick={handleCloseModal}
          className="hover:bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="hover:bg-blue-700 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              {editingItem ? "Updating..." : "Adding..."}
            </>
          ) : (
            <>{editingItem ? "Update Concession" : "Add Concession"}</>
          )}
        </button>
      </div>
    </form>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-16 h-16 border-t-2 border-b-2 border-indigo-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      {renderBreadcrumb()}
      <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
        <h1 className="mb-4 text-3xl font-bold">{location?.name}</h1>
        <p className="mb-4 text-gray-600">{location?.address}</p>
        <div className="flex flex-wrap gap-2">
          {location?.features?.map((feature, index) => (
            <span
              key={index}
              className="px-3 py-1 text-sm text-indigo-800 bg-indigo-100 rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
      {renderTabs()}
      {renderContent()}
      {renderModal()}
    </div>
  );
};

export default TheaterLocationDetails;
