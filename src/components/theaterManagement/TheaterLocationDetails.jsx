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
      showTimes: [{ time: "", screen: "", price: 0 }],
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
        showTimes: item.showTimes || [{ time: "", screen: "", price: 0 }],
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
      const collectionPath = `theaterChains/${theaterChainId}/locations/${locationId}/${
        modalType === "movie" ? "currentMovies" : `${modalType}s`
      }`;

      const collectionRef = collection(db, collectionPath);

      const itemData = {
        ...newItem[modalType],
        ...(modalType === "screen" && {
          capacity: parseInt(newItem.screen.capacity) || 0,
        }),
        ...(modalType === "movie" && {
          movieName: newItem.movie.movieName,
          imageUrl: newItem.movie.imageUrl,
          showTimes: newItem.movie.showTimes.map((st) => ({
            time: st.time || "",
            screen: st.screen || "",
            price: parseFloat(st.price) || 0,
          })),
        }),
        ...(modalType === "concession" && {
          price: parseFloat(newItem.concession.price) || 0,
        }),
      };

      if (editingItem) {
        await updateDoc(doc(db, collectionPath, editingItem.id), itemData);
        toast.success(`${modalType} updated successfully`);
      } else {
        await addDoc(collectionRef, itemData);
        toast.success(`${modalType} added successfully`);
      }

      handleCloseModal();
      fetchLocationDetails();
    } catch (error) {
      console.error(`Error saving ${modalType}:`, error);
      toast.error(`Failed to save ${modalType}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setModalType(null);
    setNewItem({
      screen: { name: "", capacity: 0, features: [] },
      movie: {
        movieName: "",
        imageUrl: "",
        showTimes: [{ time: "", screen: "", price: 0 }],
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
        label="Movie Poster URL"
        tooltip="Enter the URL of the movie poster image"
      >
        <input
          type="url"
          value={newItem.movie.imageUrl}
          onChange={(e) =>
            setNewItem({
              ...newItem,
              movie: { ...newItem.movie, imageUrl: e.target.value },
            })
          }
          className="focus:ring-2 focus:ring-blue-500 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
          placeholder="Enter poster URL"
          required
        />
        {newItem.movie.imageUrl && (
          <img
            src={newItem.movie.imageUrl}
            alt="Movie Poster Preview"
            className="object-cover h-32 mt-2 rounded"
          />
        )}
      </FormField>

      <FormField
        label="Show Times"
        tooltip="Add multiple show times with screen and price details"
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
              <select
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
              </select>
              <input
                type="number"
                min="0"
                step="0.01"
                value={showTime.price}
                onChange={(e) => {
                  const newShowTimes = [...newItem.movie.showTimes];
                  newShowTimes[index] = {
                    ...showTime,
                    price: parseFloat(e.target.value) || 0,
                  };
                  setNewItem({
                    ...newItem,
                    movie: { ...newItem.movie, showTimes: newShowTimes },
                  });
                }}
                className="focus:ring-2 focus:ring-blue-500 w-24 px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="Price"
              />
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
                className="hover:text-red-800 hover:bg-red-100 p-2 text-red-600 rounded-full"
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
                    { time: "", screen: "", price: 0 },
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
                className="hover:bg-blue-600 flex items-center px-4 py-2 text-white bg-blue-500 rounded-md"
              >
                <FaPlus className="mr-2" /> Add Movie
              </button>
            </div>
            <div className="sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1 gap-6">
              {currentMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="overflow-hidden bg-white rounded-lg shadow-md"
                >
                  <div className="relative h-48">
                    <img
                      src={movie.imageUrl}
                      alt={movie.movieName}
                      className="object-cover w-full h-full"
                    />
                    <div className="top-2 right-2 absolute flex space-x-2">
                      <button
                        onClick={() => handleEditItem("movie", movie)}
                        className="hover:bg-blue-700 p-2 text-white bg-blue-600 rounded-full"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteItem("movie", movie.id)}
                        className="hover:bg-red-700 p-2 text-white bg-red-600 rounded-full"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-2 text-lg font-semibold">
                      {movie.movieName}
                    </h3>
                    <div className="space-y-2">
                      {movie.showTimes?.map((showTime, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-gray-600">{showTime.time}</span>
                          <span className="text-gray-600">
                            Screen: {showTime.screen}
                          </span>
                          <span className="text-green-600">
                            ₹{showTime.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      case "concessions":
        return (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex space-x-4">
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
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                      activeCategory === category
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category !== "All" && getCategoryIcon(category)}
                    <span>{category}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleAddItem("concession")}
                className="hover:bg-blue-600 flex items-center px-4 py-2 text-white transition-colors bg-blue-500 rounded-md"
              >
                <FaPlus className="mr-2" /> Add Concession
              </button>
            </div>
            <div className="sm:grid-cols-2 lg:grid-cols-3 grid grid-cols-1 gap-6">
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
                    className="hover:shadow-lg overflow-hidden transition-shadow bg-white rounded-lg shadow-md"
                  >
                    <div className="relative p-6">
                      <div className="top-4 right-4 absolute flex space-x-2">
                        <button
                          onClick={() =>
                            handleEditItem("concession", concession)
                          }
                          className="hover:bg-blue-50 p-2 text-blue-500 transition-colors rounded-full"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteItem("concession", concession.id)
                          }
                          className="hover:bg-red-50 p-2 text-red-500 transition-colors rounded-full"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <div className="flex items-center mb-4 space-x-3">
                        <div className="p-3 text-blue-600 bg-blue-100 rounded-full">
                          {getCategoryIcon(concession.category)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {concession.name}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {concession.category}
                          </span>
                        </div>
                      </div>
                      <p className="mb-4 text-gray-600">
                        {concession.description}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-green-600">
                          ₹{concession.price}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
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
                                  className="px-3 py-1 text-sm text-gray-800 bg-gray-100 rounded-full"
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

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={handleCloseModal}
          className="hover:bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="hover:bg-blue-600 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md"
        >
          {editingItem ? "Update" : "Add"} Concession
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
