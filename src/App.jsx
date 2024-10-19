import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  where,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { Route, Routes, useNavigate } from "react-router-dom";
import Dashboard from "./components/dashboard/Dashboard";
import Users from "./components/users/Users";
import Sidebar from "./components/common/Sidebar";
import Header from "./components/common/Header";
import Login from "./components/auth/Login";
import Profile from "./components/users/Profile";
import { firebaseConfig } from "./services/firebaseService";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UnauthorizedModal from "./components/common/UnauthorizedModal";
import ToastManager from "./utils/ToastManager";
import MallChains from "./components/mallManagement/MallChains";
import MallDetails from "./components/mallManagement/MallDetails";
import MallLocations from "./components/mallManagement/MallLocations";
import LocationDetails from "./components/mallManagement/LocationDetails";
import { db, auth } from "./services/firebaseService";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const googleProvider = new GoogleAuthProvider();

function App() {
  const [user, setUser] = useState(null);
  const [adminData, setAdminData] = useState([]);
  const [mallOwnerData, setMallOwnerData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isUnauthorizedModalOpen, setIsUnauthorizedModalOpen] = useState(false);
  const navigate = useNavigate();
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userRole === "admin") {
      document.title = "Admin Dashboard";
    } else if (userRole === "mallOwner") {
      document.title = "Mall Owner Dashboard";
    } else {
      document.title = "Dashboard";
    }
  }, [userRole]);

  const handleAuthStateChange = async (currentUser) => {
    if (currentUser) {
      try {
        const role = await determineUserRole(currentUser);
        if (role === "user" || role === null) {
          await signOut(auth);
          setUser(null);
          setUserRole(null);
          resetUserData();
          setAuthError("You are not authorized to access this dashboard.");
          setIsUnauthorizedModalOpen(true);
          toast.error("Unauthorized access. You have been signed out.", {
            toastId: "unauthorized-signout",
          });
        } else {
          setUser(currentUser);
          setUserRole(role);
          await fetchUserData(role, currentUser.email);
          toast.success(`Welcome, ${currentUser.email}!`, {
            toastId: "welcome-user",
          });
        }
      } catch (error) {
        toast.error(
          "An error occurred while accessing your account. Please try again later.",
          {
            toastId: "auth-state-change-error",
          }
        );
        await signOut(auth);
        setUser(null);
        setUserRole(null);
        resetUserData();
      }
    } else {
      resetUserData();
    }
    setLoading(false);
  };

  const resetUserData = () => {
    setAdminData([]);
    setMallOwnerData([]);
    setUserRole(null);
    setUserData([]);
  };

  const determineUserRole = async (currentUser) => {
    try {
      const adminRole = await checkUserRole(
        currentUser.email,
        "admin",
        "admin"
      );
      if (adminRole) return "admin";

      const mallOwnerRole = await checkUserRole(
        currentUser.email,
        "mallOwner",
        "mallOwner"
      );
      if (mallOwnerRole) return "mallOwner";

      return null;
    } catch (error) {
      throw error;
    }
  };

  const checkUserRole = async (email, role, subCollection) => {
    try {
      const q = query(
        collection(db, "platform_users", role, subCollection),
        where("email", "==", email)
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      throw error;
    }
  };

  const fetchUserData = async () => {
    try {
      const roles = ["admin", "mallOwner", "user"];
      let allUsers = [];

      for (const role of roles) {
        const usersCollection = collection(db, "platform_users", role, role);
        const querySnapshot = await getDocs(usersCollection);
        const users = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          role,
        }));
        allUsers = [...allUsers, ...users];
      }

      setAdminData(allUsers.filter((user) => user.role === "admin"));
      setMallOwnerData(allUsers.filter((user) => user.role === "mallOwner"));
      setUserData(allUsers.filter((user) => user.role === "user"));

      setIsUserDataLoaded(true);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to fetch user data. Please try again.");
    }
  };

  const fetchCollectionData = async (collectionName, setDataFunction) => {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDataFunction(data);
    } catch (error) {
      // Error handling remains
    }
  };

  const fetchMallOwnerData = async (userEmail) => {
    const q = query(
      collection(db, "mallOwners"),
      where("email", "==", userEmail)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const mallOwnerDoc = snapshot.docs[0];
      setMallOwnerData([{ id: mallOwnerDoc.id, ...mallOwnerDoc.data() }]);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Toast is not needed here as it will be shown in handleAuthStateChange
    } catch (error) {
      toast.error("Invalid email or password");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const role = await determineUserRole(user);
      if (role === "user" || role === null) {
        await signOut(auth);
        setAuthError("You are not authorized to access this dashboard.");
        setIsUnauthorizedModalOpen(true);
        toast.error("You are not authorized to access this dashboard.");
      } else {
        setUser(user);
        setUserRole(role);
        await fetchUserData(role, user.email);
        navigate("/");
        toast.success(`Welcome, ${user.email}!`);
      }
    } catch (error) {
      toast.error("An error occurred during Google Sign-In. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addNewUser = async (
    email,
    role,
    firstName,
    lastName,
    vehicleNumber
  ) => {
    try {
      const newUserData = { email, firstName, lastName, role };
      if (role === "user") newUserData.vehicleNumber = vehicleNumber;
      const collectionName =
        role === "admin"
          ? "admins"
          : role === "mallOwner"
          ? "mallOwners"
          : "users";

      const docRef = await addDoc(collection(db, collectionName), newUserData);
      alert(`New ${role} added successfully`);
      fetchUserData(userRole, user.email);
      return docRef.id;
    } catch (error) {
      alert(`Error adding new ${role}: ${error.message}`);
    }
  };

  const updateUser = async (id, oldRole, updatedData) => {
    try {
      const newRole = updatedData.role;

      // Delete the old document
      const oldDocRef = doc(db, "platform_users", oldRole, oldRole, id);
      await deleteDoc(oldDocRef);

      // Check if a user with the same email already exists in any role
      const roles = ["admin", "mallOwner", "user"];
      for (const role of roles) {
        if (role !== newRole) {
          const querySnapshot = await getDocs(
            query(
              collection(db, "platform_users", role, role),
              where("email", "==", updatedData.email)
            )
          );
          if (!querySnapshot.empty) {
            // If a document with the same email exists, delete it
            const existingDoc = querySnapshot.docs[0];
            await deleteDoc(
              doc(db, "platform_users", role, role, existingDoc.id)
            );
          }
        }
      }

      // Create a new document in the new role's collection
      const newDocRef = doc(db, "platform_users", newRole, newRole, id);
      await setDoc(newDocRef, { ...updatedData, id });

      // Fetch updated user data
      await fetchUserData();
    } catch (error) {
      throw error;
    }
  };

  const deleteUser = async (id, role) => {
    try {
      const collectionName =
        role === "admin"
          ? "admins"
          : role === "mallOwner"
          ? "mallOwners"
          : "users";
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      alert("User deleted successfully");
      fetchUserData(userRole, user.email);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const createNewUser = async (userData) => {
    if (userRole !== "admin") {
      return;
    }

    try {
      await addDoc(collection(db, "users"), userData);
      // Optionally, update your UI or state to reflect the new user
    } catch (error) {
      // Handle the error (e.g., show an error message to the user)
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const updateUserProfile = async (updatedData) => {
    try {
      let userDocRef;
      let collectionName;

      if (userRole === "admin") {
        collectionName = "platform_users";
        userDocRef = doc(
          db,
          collectionName,
          "admin",
          "admin",
          "TzHqb42NVOpDazYD1Igx"
        );
      } else if (userRole === "mallOwner") {
        collectionName = "platform_users";
        // First, query the collection to find the document with matching email
        const q = query(
          collection(db, collectionName, "mallOwner", "mallOwner"),
          where("email", "==", user.email)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error(`No ${userRole} found with email ${user.email}`);
        }

        // Use the first matching document's ID
        userDocRef = doc(
          db,
          collectionName,
          "mallOwner",
          "mallOwner",
          querySnapshot.docs[0].id
        );
      } else {
        throw new Error(`Invalid user role: ${userRole}`);
      }

      await updateDoc(userDocRef, updatedData);

      // Update local state
      if (userRole === "admin") {
        setAdminData([{ ...adminData[0], ...updatedData }]);
      } else if (userRole === "mallOwner") {
        setMallOwnerData([{ ...mallOwnerData[0], ...updatedData }]);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserRole(null);
      resetUserData();
      navigate("/");
      toast.info("You have been logged out.");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("An error occurred while signing out. Please try again.");
    }
  };

  const closeUnauthorizedModal = () => {
    setIsUnauthorizedModalOpen(false);
  };

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user || !allowedRoles.includes(userRole)) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {loading ? (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <LoadingSpinner />
        </div>
      ) : !user ? (
        <Login
          onLogin={handleLogin}
          onGoogleSignIn={handleGoogleSignIn}
          authError={authError}
        />
      ) : userRole === null ? (
        <div>
          Your account is not associated with any role. Please contact an
          administrator.
        </div>
      ) : (
        <div className="flex h-screen bg-gray-100">
          <Sidebar
            userRole={userRole}
            isOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
          />
          <div className="lg:ml-64 flex flex-col flex-1 overflow-hidden">
            <Header
              user={user}
              onLogout={handleLogout}
              userRole={userRole}
              toggleSidebar={toggleSidebar}
            />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "mallOwner"]}>
                      <Dashboard
                        adminData={adminData}
                        mallOwnerData={mallOwnerData}
                        userRole={userRole}
                        userData={userData}
                      />
                    </ProtectedRoute>
                  }
                />
                {userRole === "admin" && (
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <Users
                          userRole={userRole}
                          currentUserEmail={user.email}
                          updateUser={updateUser}
                        />
                      </ProtectedRoute>
                    }
                  />
                )}
                {userRole === "mallOwner" && (
                  <Route
                    path="/mall-statistics"
                    element={
                      <div>Mall Statistics Page (To be implemented)</div>
                    }
                  />
                )}
                <Route
                  path="/profile"
                  element={
                    isUserDataLoaded ? (
                      <Profile
                        userData={
                          userRole === "admin"
                            ? adminData[0]
                            : userRole === "mallOwner"
                            ? mallOwnerData[0]
                            : null
                        }
                        userRole={userRole}
                        updateUserProfile={updateUserProfile}
                      />
                    ) : (
                      <div>Loading user data...</div>
                    )
                  }
                />
                {(userRole === "admin" || userRole === "mallOwner") && (
                  <>
                    <Route
                      path="/mall-chains"
                      element={<MallChains userRole={userRole} />}
                    />
                    <Route
                      path="/mall/:mallChainId"
                      element={<MallDetails />}
                    />
                    <Route
                      path="/mall/:mallChainId/locations"
                      element={<MallLocations />}
                    />
                    <Route
                      path="/mall/:mallChainId/location/:locationId"
                      element={<LocationDetails />}
                    />
                  </>
                )}
              </Routes>
            </main>
          </div>
        </div>
      )}
      <UnauthorizedModal
        isOpen={isUnauthorizedModalOpen}
        onClose={closeUnauthorizedModal}
      />
    </>
  );
}

export default App;
