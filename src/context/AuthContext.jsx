import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../api/firebase.config";
import axios from "axios";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";

// Crear contexto
export const AuthContext = createContext();

// Hook para usar el contexto
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null); // Usuario de Firebase
  const [userData, setUserData] = useState(null);       // Usuario de MySQL
  const [loading, setLoading] = useState(true);

  //const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const API_URL = `${import.meta.env.VITE_API_URL}/api/usuarios`;
  // Login normal
  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error("Debes ingresar un correo y una contraseña");
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      switch (error.code) {
        case "auth/user-not-found":
          throw new Error("El usuario no está registrado");
        case "auth/wrong-password":
          throw new Error("Contraseña incorrecta");
        case "auth/invalid-email":
          throw new Error("Correo inválido");
        default:
          throw new Error("Error al iniciar sesión: " + error.message);
      }
    }
  };

  // Registro con correo
  const register = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Login con Google
  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  // Logout
  const logout = async () => {
    setUserData(null);
    await signOut(auth);
  };

  // Obtener datos del usuario desde MySQL por UID de Firebase
  const fetchUserData = async (uid) => {
    try {
      //const response = await axios.get(`${API_URL}/api/usuarios/uid/${uid}`);
      const response = await axios.get(`${API_URL}/uid/${uid}`);
      setUserData(response.data); // ← contiene el id de MySQL
    } catch (error) {
      console.error("Error al obtener datos del usuario desde MySQL:", error);
    }
  };

  // Detectar cambios de sesión
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserData(user.uid); // ← obtener datos de MySQL por UID
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Valores disponibles para toda la app
  const value = {
    currentUser,  // Usuario Firebase
    userData,     // Usuario MySQL (con ID)
    setUserData,
    login,
    register,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
