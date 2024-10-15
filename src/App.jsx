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
} from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Users from "./components/Users";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Login from "./components/Login";
import Profile from "./components/Profile";
import { firebaseConfig } from "./config/firebaseConfig";

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
    return () => unsubscribe();
  }, []);

  const handleAuthStateChange = async (currentUser) => {
    console.log("Auth state changed, current user:", currentUser);
    setUser(currentUser);
    if (currentUser) {
      try {
        const role = await determineUserRole(currentUser);
        console.log("Determined user role:", role);
        setUserRole(role);
        await fetchUserData(role, currentUser.email);
        console.log("User data fetched for role:", role);
      } catch (error) {
        console.error("Error determining user role or fetching data:", error);
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
    console.log("Determining user role for:", currentUser.email);
    try {
      const adminRole = await checkUserRole(currentUser.email, "admins");
      console.log("Admin role check result:", adminRole);
      if (adminRole) return "admin";

      const mallOwnerRole = await checkUserRole(
        currentUser.email,
        "mallOwners"
      );
      console.log("Mall owner role check result:", mallOwnerRole);
      if (mallOwnerRole) return "mallOwner";

      const userRole = await checkUserRole(currentUser.email, "users");
      console.log("User role check result:", userRole);
      if (userRole) return "user";

      console.log("No role found for user");
      return null;
    } catch (error) {
      console.error("Error checking user role:", error);
      throw error;
    }
  };

  const checkUserRole = async (email, collectionName) => {
    try {
      console.log(`Checking ${collectionName} role for email:`, email);
      const q = query(
        collection(db, collectionName),
        where("email", "==", email)
      );
      const snapshot = await getDocs(q);
      console.log(
        `${collectionName} query result:`,
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      console.log(`${collectionName} query empty:`, snapshot.empty);
      return !snapshot.empty;
    } catch (error) {
      console.error(`Error checking ${collectionName} role:`, error);
      throw error;
    }
  };

  const fetchUserData = async (role, userEmail) => {
    console.log("Fetching user data for role:", role);
    try {
      if (role === "admin") {
        try {
          await fetchCollectionData("admins", setAdminData);
        } catch (error) {
          console.error("Error fetching admin data:", error);
        }
        try {
          await fetchCollectionData("mallOwners", setMallOwnerData);
        } catch (error) {
          console.error("Error fetching mall owner data:", error);
        }
        try {
          await fetchCollectionData("users", setUserData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else if (role === "mallOwner") {
        try {
          await fetchMallOwnerData(userEmail);
        } catch (error) {
          console.error("Error fetching mall owner data:", error);
        }
        try {
          await fetchCollectionData("users", setUserData);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      console.log("Admin data:", adminData);
      console.log("Mall owner data:", mallOwnerData);
      console.log("User data:", userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchCollectionData = async (collectionName, setDataFunction) => {
    try {
      console.log(`Fetching ${collectionName} data...`);
      const snapshot = await getDocs(collection(db, collectionName));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDataFunction(data);
      console.log(`${collectionName} data fetched:`, data);
    } catch (error) {
      console.error(`Error fetching ${collectionName} data:`, error);
      console.error(`Error details:`, error.code, error.message);
      // You might want to set some error state here
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
      console.log("Mall owner data fetched:", mallOwnerData);
    } else {
      console.log("No mall owner data found for email:", userEmail);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User signed in:", userCredential.user.email);
    } catch (error) {
      console.error("Error signing in:", error);
      alert("Invalid email or password");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("Google sign-in successful for:", user.email);
      const role = await determineUserRole(user);
      if (role === "user") {
        console.log("User not authorized, signing out");
        await signOut(auth);
        alert("You are not authorized to access this dashboard.");
      } else {
        console.log("Signed in successfully as:", role);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
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
      console.log(`Attempting to add new ${role} with email: ${email}`);
      const newUserData = { email, firstName, lastName, role };
      if (role === "user") newUserData.vehicleNumber = vehicleNumber;
      const collectionName =
        role === "admin"
          ? "admins"
          : role === "mallOwner"
          ? "mallOwners"
          : "users";
      const docRef = await addDoc(collection(db, collectionName), newUserData);
      console.log(`New ${role} added successfully with ID:`, docRef.id);
      alert(`New ${role} added successfully`);
      fetchUserData(userRole, user.email);
      return docRef.id;
    } catch (error) {
      console.error("Error adding new user:", error);
      console.error("Error details:", error.code, error.message);
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
      await setDoc(docRef, updatedData, { merge: true });
      alert("User updated successfully");
      fetchUserData(userRole, user.email);
    } catch (error) {
      console.error("Error updating user:", error);
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

  if (loading) return <div>Loading...</div>;
  if (!user)
    return <Login onLogin={handleLogin} onGoogleSignIn={handleGoogleSignIn} />;
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
    <Router>
      <div className="flex h-screen bg-mainBackgroundColor font-primary">
        <Sidebar userRole={userRole} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header user={user} onLogout={handleLogout} userRole={userRole} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-mainBackgroundColor text-mainTextColor">
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
                      userRole={userRole}
                      addNewUser={addNewUser}
                      updateUser={updateUser}
                      deleteUser={deleteUser}
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
                  />
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
