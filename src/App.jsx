import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  addDoc,
  doc,
  getDoc,
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
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Users from "./components/Users";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Login from "./components/Login";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

function App() {
  const [user, setUser] = useState(null);
  const [adminData, setAdminData] = useState([]);
  const [mallOwnerData, setMallOwnerData] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed:", currentUser);
      setUser(currentUser);
      if (currentUser) {
        const role = await determineUserRole(currentUser);
        console.log("Determined user role:", role);
        await fetchUserData(role);
      } else {
        setAdminData([]);
        setMallOwnerData([]);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const determineUserRole = async (currentUser) => {
    console.log("Determining user role for:", currentUser.email);
    const adminQuery = query(
      collection(db, "admins"),
      where("email", "==", currentUser.email)
    );
    const adminSnapshot = await getDocs(adminQuery);

    if (!adminSnapshot.empty) {
      console.log("User is an admin");
      setUserRole("admin");
      return "admin";
    }

    const mallOwnerQuery = query(
      collection(db, "mallOwners"),
      where("email", "==", currentUser.email)
    );
    const mallOwnerSnapshot = await getDocs(mallOwnerQuery);

    if (!mallOwnerSnapshot.empty) {
      console.log("User is a mall owner");
      setUserRole("mallOwner");
      return "mallOwner";
    }

    console.log("User is not authorized");
    setUserRole("user");
    return "user";
  };

  const fetchUserData = async (role) => {
    console.log("Fetching user data for role:", role);
    if (role === "admin") {
      const adminSnapshot = await getDocs(collection(db, "admins"));
      const adminData = adminSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAdminData(adminData);

      const mallOwnerSnapshot = await getDocs(collection(db, "mallOwners"));
      const mallOwnerData = mallOwnerSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMallOwnerData(mallOwnerData);
    } else if (role === "mallOwner") {
      const mallOwnerQuery = query(
        collection(db, "mallOwners"),
        where("email", "==", user.email)
      );
      const mallOwnerSnapshot = await getDocs(mallOwnerQuery);
      if (!mallOwnerSnapshot.empty) {
        const mallOwnerDoc = mallOwnerSnapshot.docs[0];
        setMallOwnerData([{ id: mallOwnerDoc.id, ...mallOwnerDoc.data() }]);
      }
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

      if (role === "admin" || role === "mallOwner") {
        console.log("Signed in successfully as:", role);
      } else {
        console.log("User not authorized, signing out");
        await signOut(auth);
        alert("You are not authorized to access this dashboard.");
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
      const newUserData = {
        email,
        firstName,
        lastName,
      };

      if (role === "user") {
        newUserData.vehicleNumber = vehicleNumber;
      }

      let docRef;
      if (role === "admin") {
        docRef = await addDoc(collection(db, "admins"), newUserData);
      } else if (role === "mallOwner") {
        docRef = await addDoc(collection(db, "mallOwners"), newUserData);
      } else {
        docRef = await addDoc(collection(db, "users"), newUserData);
      }

      alert(`New ${role} added successfully`);
      fetchUserData();
      return docRef.id;
    } catch (error) {
      console.error("Error adding new user:", error);
    }
  };

  const updateUser = async (id, role, updatedData) => {
    try {
      const docRef = doc(
        db,
        role === "admin"
          ? "admins"
          : role === "mallOwner"
          ? "mallOwners"
          : "users",
        id
      );
      await setDoc(docRef, updatedData, { merge: true });
      alert("User updated successfully");
      fetchUserData();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const deleteUser = async (id, role) => {
    try {
      const docRef = doc(
        db,
        role === "admin"
          ? "admins"
          : role === "mallOwner"
          ? "mallOwners"
          : "users",
        id
      );
      await deleteDoc(docRef);
      alert("User deleted successfully");
      fetchUserData();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} onGoogleSignIn={handleGoogleSignIn} />;
  }

  if (userRole === "user") {
    return <div>You are not authorized to access this dashboard.</div>;
  }

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
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
