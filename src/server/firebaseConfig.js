// En login.js o cualquier componente donde necesites autenticación
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Ejemplo de función de inicio de sesión
const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Usuario conectado:", user);
    return user;
  } catch (error) {
    console.error("Error en inicio de sesión:", error.code, error.message);
    throw error;
  }
};