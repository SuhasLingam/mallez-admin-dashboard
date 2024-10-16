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
import Dashboard from "./components/Dashboard";
import Users from "./components/Users";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Login from "./components/Login";
import Profile from "./components/Profile";
import { firebaseConfig } from "./config/firebaseConfig";
import LoadingSpinner from "./components/LoadingSpinner";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
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
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
    return () => unsubscribe();
  }, []);

  const handleAuthStateChange = async (currentUser) => {
    setUser(currentUser);
    if (currentUser) {
      try {
        const role = await determineUserRole(currentUser);
        setUserRole(role);
        await fetchUserData(role, currentUser.email);
      } catch (error) {
        alert(
          "An error occurred while accessing your account. Please try again later."
        );
        setUserRole(null);
        await signOut(auth);
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
      const adminRole = await checkUserRole(currentUser.email, "admins");
      if (adminRole) return "admin";

      const mallOwnerRole = await checkUserRole(
        currentUser.email,
        "mallOwners"
      );
      if (mallOwnerRole) return "mallOwner";

      const userRole = await checkUserRole(currentUser.email, "users");
      if (userRole) return "user";

      return null;
    } catch (error) {
      throw error;
    }
  };

  const checkUserRole = async (email, collectionName) => {
    try {
      const q = query(
        collection(db, collectionName),
        where("email", "==", email)
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      throw error;
    }
  };

  const fetchUserData = async (role, userEmail) => {
    try {
      if (role === "admin") {
        try {
          await fetchCollectionData("admins", setAdminData);
        } catch (error) {
          // Error handling remains
        }
        try {
          await fetchCollectionData("mallOwners", setMallOwnerData);
        } catch (error) {
          // Error handling remains
        }
        try {
          await fetchCollectionData("users", setUserData);
        } catch (error) {
          // Error handling remains
        }
      } else if (role === "mallOwner") {
        try {
          await fetchMallOwnerData(userEmail);
        } catch (error) {
          // Error handling remains
        }
        try {
          await fetchCollectionData("users", setUserData);
        } catch (error) {
          // Error handling remains
        }
      }
    } catch (error) {
      // Error handling remains
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
    } catch (error) {
      alert("Invalid email or password");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("User from Google Sign-In:", user);
      const role = await determineUserRole(user);
      console.log("Determined user role:", role);
      if (role === "user" || role === null) {
        console.log("Unauthorized role, signing out");
        await signOut(auth);
        setAuthError("You are not authorized to access this dashboard.");
      } else {
        console.log("Authorized role, setting user and fetching data");
        setUser(user);
        setUserRole(role);
        await fetchUserData(role, user.email);
        navigate("/");
      }
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
      setAuthError(
        "An error occurred during Google Sign-In. Please try again."
      );
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

  const updateUser = async (id, role, updatedData) => {
    try {
      const collectionName =
        role === "admin"
          ? "admins"
          : role === "mallOwner"
          ? "mallOwners"
          : "users";

      const docRef = doc(db, collectionName, id);

      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error(
          `Document with ID ${id} does not exist in ${collectionName}`
        );
      }

      await setDoc(docRef, updatedData, { merge: true });

      alert("User updated successfully");
      fetchUserData(userRole, user.email);
    } catch (error) {
      alert(`Error updating user: ${error.message}`);
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
      console.error("Only admins can create new users");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "users"), userData);
      console.log("New user added with ID: ", docRef.id);
      // Optionally, update your UI or state to reflect the new user
    } catch (error) {
      console.error("Error adding new user: ", error);
      // Handle the error (e.g., show an error message to the user)
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const updateUserProfile = async (updatedData) => {
    try {
      const userDocRef = doc(
        db,
        userRole === "admin"
          ? "admins"
          : userRole === "mallOwner"
          ? "mallOwners"
          : "users",
        user.uid
      );
      await updateDoc(userDocRef, updatedData);
      // Update local state
      if (userRole === "admin") {
        setAdminData(
          adminData.map((admin) =>
            admin.id === user.uid ? { ...admin, ...updatedData } : admin
          )
        );
      } else if (userRole === "mallOwner") {
        setMallOwnerData(
          mallOwnerData.map((owner) =>
            owner.id === user.uid ? { ...owner, ...updatedData } : owner
          )
        );
      } else {
        setUserData(
          userData.map((u) =>
            u.id === user.uid ? { ...u, ...updatedData } : u
          )
        );
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
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
    } catch (error) {
      console.error("Error signing out:", error);
      alert("An error occurred while signing out. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }
  if (!user)
    return (
      <Login
        onLogin={handleLogin}
        onGoogleSignIn={handleGoogleSignIn}
        authError={authError}
      />
    );
  if (userRole === null)
    return (
      <div>
        Your account is not associated with any role. Please contact an
        administrator.
      </div>
    );
  if (userRole === "user")
    return <div>You are not authorized to access this dashboard.</div>;

  return (
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
                <Dashboard
                  adminData={adminData}
                  mallOwnerData={mallOwnerData}
                  userRole={userRole}
                  userData={userData}
                />
              }
            />
            {userRole === "admin" && (
              <Route
                path="/users"
                element={
                  <Users
                    adminData={adminData}
                    mallOwnerData={mallOwnerData}
                    userData={userData}
                    userRole={userRole}
                    addNewUser={addNewUser}
                    updateUser={updateUser}
                    deleteUser={deleteUser}
                    currentUserEmail={user.email}
                  />
                }
              />
            )}
            {userRole === "mallOwner" && (
              <Route
                path="/mall-statistics"
                element={<div>Mall Statistics Page (To be implemented)</div>}
              />
            )}
            <Route
              path="/profile"
              element={
                <Profile
                  userData={
                    userRole === "admin"
                      ? adminData.find((admin) => admin.email === user.email)
                      : mallOwnerData.find(
                          (owner) => owner.email === user.email
                        )
                  }
                  userRole={userRole}
                  updateUserProfile={updateUserProfile}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
