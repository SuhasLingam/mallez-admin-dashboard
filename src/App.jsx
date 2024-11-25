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
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import components (unchanged)
import Dashboard from "./components/dashboard/Dashboard";
import Users from "./components/users/Users";
import Sidebar from "./components/common/Sidebar";
import Header from "./components/common/Header";
import Login from "./components/auth/Login";
import Profile from "./components/users/Profile";
import LoadingSpinner from "./components/common/LoadingSpinner";
import UnauthorizedModal from "./components/common/UnauthorizedModal";
import MallChains from "./components/mallManagement/MallChains";
import MallDetails from "./components/mallManagement/MallDetails";
import MallLocations from "./components/mallManagement/MallLocations";
import LocationDetails from "./components/mallManagement/LocationDetails";
import MallOwnerDashboard from "./components/mallOwner/MallOwnerDashboard";
import MallOwnerLocationDetails from "./components/mallOwner/MallOwnerLocationDetails";
import TheaterChains from "./components/theaterManagement/TheaterChains";
import TheaterLocations from "./components/theaterManagement/TheaterLocations";
import TheaterLocationDetails from "./components/theaterManagement/TheaterLocationDetails";

// Import services and utilities
import { firebaseConfig, db, auth } from "./services/firebaseService";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const googleProvider = new GoogleAuthProvider();

// Custom hook for authentication
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();

  const handleAuthStateChange = async (currentUser) => {
    if (currentUser) {
      try {
        const role = await determineUserRole(currentUser);
        if (role === "user" || role === null) {
          await handleUnauthorizedAccess();
        } else {
          await handleAuthorizedAccess(currentUser, role);
        }
      } catch (error) {
        await handleAuthError();
      }
    } else {
      resetUserData();
    }
    setLoading(false);
  };

  const handleUnauthorizedAccess = async () => {
    await signOut(auth);
    setUser(null);
    setUserRole(null);
    setAuthError("You are not authorized to access this dashboard.");
    toast.error("Unauthorized access. You have been signed out.", {
      toastId: "unauthorized-signout",
    });
  };

  const handleAuthorizedAccess = async (currentUser, role) => {
    setUser(currentUser);
    setUserRole(role);
    toast.success(`Welcome, ${currentUser.email}!`, {
      toastId: "welcome-user",
    });
  };

  const handleAuthError = async () => {
    toast.error(
      "An error occurred while accessing your account. Please try again later.",
      { toastId: "auth-state-change-error" }
    );
    await signOut(auth);
    setUser(null);
    setUserRole(null);
  };

  const resetUserData = () => {
    setUser(null);
    setUserRole(null);
  };

  const determineUserRole = async (currentUser) => {
    const adminRole = await checkUserRole(currentUser.email, "admin", "admin");
    if (adminRole) return "admin";

    const mallOwnerRole = await checkUserRole(
      currentUser.email,
      "mallOwner",
      "mallOwner"
    );
    if (mallOwnerRole) return "mallOwner";

    return null;
  };

  const checkUserRole = async (email, role, subCollection) => {
    const q = query(
      collection(db, "platform_users", role, subCollection),
      where("email", "==", email)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  };

  const handleLogin = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
        await handleUnauthorizedAccess();
      } else {
        await handleAuthorizedAccess(user, role);
        navigate("/");
      }
    } catch (error) {
      toast.error("An error occurred during Google Sign-In. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      resetUserData();
      navigate("/");
      toast.info("You have been logged out.");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("An error occurred while signing out. Please try again.");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
    return () => unsubscribe();
  }, []);

  return {
    user,
    userRole,
    loading,
    authError,
    handleLogin,
    handleGoogleSignIn,
    handleLogout,
  };
};

// User management utility
const userManagement = {
  addNewUser: async (email, role, firstName, lastName, vehicleNumber) => {
    try {
      const newUserData = { email, firstName, lastName, role };
      if (role === "user") newUserData.vehicleNumber = vehicleNumber;

      const collectionPath = `platform_users/${role}/${role}`;
      const docRef = await addDoc(collection(db, collectionPath), newUserData);
      console.log(
        `New ${role} added successfully at path: ${collectionPath}/${docRef.id}`
      );
      toast.success(`New ${role} added successfully`);
      return docRef.id;
    } catch (error) {
      console.error(`Error adding new ${role}:`, error);
      toast.error(`Error adding new ${role}: ${error.message}`);
    }
  },

  updateUser: async (id, oldRole, updatedData) => {
    try {
      const newRole = updatedData.role;
      await deleteDoc(doc(db, "platform_users", oldRole, oldRole, id));

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
            await deleteDoc(
              doc(db, "platform_users", role, role, querySnapshot.docs[0].id)
            );
          }
        }
      }

      await setDoc(doc(db, "platform_users", newRole, newRole, id), {
        ...updatedData,
        id,
      });
    } catch (error) {
      throw error;
    }
  },

  updateUserProfile: async (userRole, userEmail, updatedData) => {
    try {
      const collectionName = "platform_users";
      const q = query(
        collection(db, collectionName, userRole, userRole),
        where("email", "==", userEmail)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error(`No ${userRole} found with email ${userEmail}`);
      }

      const userDocRef = doc(
        db,
        collectionName,
        userRole,
        userRole,
        querySnapshot.docs[0].id
      );
      await updateDoc(userDocRef, updatedData);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  },
};

// Route definitions
const ROUTES = {
  admin: [
    { path: "/", element: Dashboard },
    { path: "/users", element: Users },
    { path: "/mall-chains", element: MallChains },
    { path: "/mall/:mallChainId", element: MallDetails },
    { path: "/mall/:mallChainId/locations", element: MallLocations },
    {
      path: "/mall/:mallChainId/location/:locationId",
      element: LocationDetails,
    },
    { path: "/theater-chains", element: TheaterChains },
    { path: "/theater/:theaterChainId/locations", element: TheaterLocations },
    {
      path: "/theater/:theaterChainId/location/:locationId",
      element: TheaterLocationDetails,
    },
  ],
  mallOwner: [
    { path: "/", element: Dashboard },
    {
      path: "/mall-statistics",
      element: () => <div>Mall Statistics Page (To be implemented)</div>,
    },
    { path: "/mall-chains", element: MallChains },
    { path: "/mall/:mallChainId", element: MallDetails },
    { path: "/mall/:mallChainId/locations", element: MallLocations },
    {
      path: "/mall/:mallChainId/location/:locationId",
      element: LocationDetails,
    },
    { path: "/mall-owner", element: MallOwnerDashboard },
    { path: "/location/:locationId", element: MallOwnerLocationDetails },
  ],
};

function App() {
  const {
    user,
    userRole,
    loading,
    authError,
    handleLogin,
    handleGoogleSignIn,
    handleLogout,
  } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUnauthorizedModalOpen, setIsUnauthorizedModalOpen] = useState(false);

  useEffect(() => {
    document.title =
      userRole === "admin"
        ? "Admin Dashboard"
        : userRole === "mallOwner"
        ? "Mall Owner Dashboard"
        : "Dashboard";
  }, [userRole]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeUnauthorizedModal = () => setIsUnauthorizedModalOpen(false);

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user || !allowedRoles.includes(userRole)) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <Login
        onLogin={handleLogin}
        onGoogleSignIn={handleGoogleSignIn}
        authError={authError}
      />
    );
  }

  if (userRole === null) {
    return (
      <div>
        Your account is not associated with any role. Please contact an
        administrator.
      </div>
    );
  }

  const renderRoutes = () => {
    const roleRoutes = ROUTES[userRole] || [];
    return roleRoutes.map(({ path, element: Element }) => (
      <Route
        key={path}
        path={path}
        element={
          <ProtectedRoute allowedRoles={[userRole]}>
            <Element
              userRole={userRole}
              currentUserEmail={user.email}
              updateUser={userManagement.updateUser}
            />
          </ProtectedRoute>
        }
      />
    ));
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
              {renderRoutes()}
              <Route
                path="/profile"
                element={
                  <Profile
                    userData={user}
                    userRole={userRole}
                    updateUserProfile={(updatedData) =>
                      userManagement.updateUserProfile(
                        userRole,
                        user.email,
                        updatedData
                      )
                    }
                  />
                }
              />
            </Routes>
          </main>
        </div>
      </div>
      <UnauthorizedModal
        isOpen={isUnauthorizedModalOpen}
        onClose={closeUnauthorizedModal}
      />
    </>
  );
}

export default App;
