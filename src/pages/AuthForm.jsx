import React, { useState } from 'react';
import './AuthForm.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { auth } from '../api/firebase.config';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState('form');

  const navigate = useNavigate();
  const { login, register, loginWithGoogle } = useAuth();

  const API_URL = `${import.meta.env.VITE_API_URL}/api/usuarios`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        await login(email, password);
        const res = await fetch(`${API_URL}/enviar-codigo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error enviando código');
        setSuccess('Código enviado al correo. Por favor verifica.');
        setStep('verify');
      } else {
        if (password !== confirmPass) throw new Error('Las contraseñas no coinciden');
        if (!/[A-Z]/.test(password)) throw new Error('Debe tener al menos una mayúscula');
        if (password.length < 6) throw new Error('Mínimo 6 caracteres');

        const userCred = await register(email, password);
        await updateProfile(auth.currentUser, { displayName: username });

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: auth.currentUser.uid,
            nombre: username,
            email: auth.currentUser.email,
            foto_perfil: '',
            proveedor: 'email',
            username: username,
            password: password
          })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error en el registro');
        if (data.username) setSuccess(`¡Registro exitoso! Tu usuario es @${data.username}`);
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_URL}/verificar-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo: verificationCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error verificando');
      setSuccess('¡Verificación exitosa!');
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const userCred = await loginWithGoogle();
      const user = userCred.user;
      const email = user.email || '';
      const usernameGenerated = email
        ? email.split('@')[0]
        : `googleUser${Math.floor(Math.random() * 10000)}`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          nombre: user.displayName || usernameGenerated,
          email: email || `${user.uid}@google.com`,
          foto_perfil: user.photoURL || '',
          proveedor: 'google',
          username: usernameGenerated,
          password: 'google_auth'
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error en Google Auth');
      if (data.username) setSuccess(`¡Bienvenido @${data.username}!`);
      navigate('/');
    } catch (err) {
      setError('Error al iniciar sesión con Google');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className={`auth-container ${isLogin ? '' : 'sign-up-mode'}`}>
        <div className="forms-container">
          <div className="signin-signup">
            <form onSubmit={step === 'verify' ? handleVerifyCode : handleSubmit} className="auth-form">
              {step === 'form' && (
                <>
                  <h2 className="title">{isLogin ? 'Iniciar Sesión' : 'Registrarme'}</h2>
                  {error && <p className="error">{error}</p>}
                  {success && <p className="success">{success}</p>}

                  {!isLogin && (
                    <input
                      type="text"
                      placeholder="Nombre de usuario"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  )}
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {!isLogin && (
                    <input
                      type="password"
                      placeholder="Repetir contraseña"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      required
                    />
                  )}

                  <button type="submit" className="auth-btn">
                    {isLogin ? 'Entrar' : 'Registrarme'}
                  </button>

                  {isLogin && (
                    <>
                      <div className="separator">o</div>
                      <button type="button" className="google-btn" onClick={handleGoogleLogin}>
                        Iniciar con Google
                      </button>
                    </>
                  )}
                </>
              )}

              {step === 'verify' && (
                <>
                  <h2 className="title">Verificar Código</h2>
                  {error && <p className="error">{error}</p>}
                  {success && <p className="success">{success}</p>}
                  <input
                    type="text"
                    placeholder="Introduce el código"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                  />
                  <button type="submit" className="auth-btn">
                    Verificar
                  </button>
                </>
              )}
            </form>
          </div>
        </div>

        <div className="panels-container">
          <div className="content">
            <h3>{isLogin ? '¿Nuevo aquí?' : '¡Hola de nuevo!'}</h3>
            <p>
              {isLogin
                ? 'Únete a Zoofamily y comienza a cuidar mejor a tus mascotas.'
                : '¿Ya tienes una cuenta? Inicia sesión aquí.'}
            </p>
            <button className="switch-btn" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Regístrate' : 'Iniciar sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
