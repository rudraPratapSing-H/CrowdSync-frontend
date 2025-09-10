import React from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth,
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    GithubAuthProvider,
    signInWithPopup 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAqZnc4PInvjwu1znXjHPiRM3LA0lgs8j4",
  authDomain: "crowdmanagement-e36d0.firebaseapp.com",
  projectId: "crowdmanagement-e36d0",
  storageBucket: "crowdmanagement-e36d0.firebasestorage.app",
  messagingSenderId: "495969928255",
  appId: "1:495969928255:web:80d9b0589ccaa7e88e648a",
  databaseURL: "https://crowdmanagement-e36d0-default-rtdb.asia-southeast1.firebasedatabase.app"
};
// ---------------------------------------------------------------


const Login = ({ onLogin }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [auth, setAuth] = React.useState(null);


  React.useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      setAuth(getAuth(app));
    } catch (e) {
      if (e.code === 'duplicate-app') {
       
        setAuth(getAuth());
      } else {
        setError("Failed to initialize Firebase. Check your config.");
        console.error("Firebase initialization error:", e);
      }
    }
  }, []); 


  const handleAuthAction = async (provider) => {
    if (!auth) {
        setError("Authentication service is not ready. Please try again in a moment.");
        return;
    }
    setError('');
    try {
        await signInWithPopup(auth, provider);
        console.log(`Successfully logged in with ${provider.providerId}`);
        if (onLogin) onLogin();
    } catch (err) {
        setError(`Failed to sign in with ${provider.providerId}. Please try again.`);
        console.error(err);
    }
  };

  const handleGoogleSignIn = () => handleAuthAction(new GoogleAuthProvider());
  const handleGitHubSignIn = () => handleAuthAction(new GithubAuthProvider());
  
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!auth) {
        setError("Authentication service is not ready. Please try again in a moment.");
        return;
    }
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Successfully logged in with email and password");
      if (onLogin) onLogin();
    } catch (err) {
      setError("Failed to log in. Please check your credentials.");
      console.error(err);
    }
  };

  return (
    <>
      <style>
        {`
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #f0f2f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          }
          .container {
            max-width: 350px;
            background: #f8f9fd;
            background: linear-gradient(
              0deg,
              rgb(255, 255, 255) 0%,
              rgb(244, 247, 251) 100%
            );
            border-radius: 40px;
            padding: 25px 35px;
            border: 5px solid rgb(255, 255, 255);
            box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 30px 30px -20px;
            margin: 20px;
          }

          .heading {
            text-align: center;
            font-weight: 900;
            font-size: 30px;
            color: rgb(16, 137, 211);
          }

          .form {
            margin-top: 20px;
          }

          .form .input {
            width: 100%;
            background: white;
            border: none;
            padding: 15px 20px;
            border-radius: 20px;
            margin-top: 15px;
            box-shadow: #cff0ff 0px 10px 10px -5px;
            border-inline: 2px solid transparent;
          }

          .form .input::-moz-placeholder {
            color: rgb(170, 170, 170);
          }

          .form .input::placeholder {
            color: rgb(170, 170, 170);
          }

          .form .input:focus {
            outline: none;
            border-inline: 2px solid #12b1d1;
          }

          .form .forgot-password {
            display: block;
            margin-top: 10px;
            margin-left: 10px;
          }

          .form .forgot-password a {
            font-size: 11px;
            color: #0099ff;
            text-decoration: none;
          }

          .form .login-button {
            display: block;
            width: 100%;
            font-weight: bold;
            background: linear-gradient(
              45deg,
              rgb(16, 137, 211) 0%,
              rgb(18, 177, 209) 100%
            );
            color: white;
            padding-block: 15px;
            margin: 20px auto;
            border-radius: 20px;
            box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 20px 10px -15px;
            border: none;
            transition: all 0.2s ease-in-out;
          }

          .form .login-button:hover {
            transform: scale(1.03);
            box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 23px 10px -20px;
          }

          .form .login-button:active {
            transform: scale(0.95);
            box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 15px 10px -10px;
          }

          .social-account-container {
            margin-top: 25px;
          }

          .social-account-container .title {
            display: block;
            text-align: center;
            font-size: 10px;
            color: rgb(170, 170, 170);
          }

          .social-account-container .social-accounts {
            width: 100%;
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 5px;
          }

          .social-account-container .social-accounts .social-button {
            background: linear-gradient(45deg, rgb(0, 0, 0) 0%, rgb(112, 112, 112) 100%);
            border: 5px solid white;
            padding: 5px;
            border-radius: 50%;
            width: 40px;
            aspect-ratio: 1;
            display: grid;
            place-content: center;
            box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 12px 10px -8px;
            transition: all 0.2s ease-in-out;
          }

          .social-account-container .social-accounts .social-button .svg {
            fill: white;
            margin: auto;
          }

          .social-account-container .social-accounts .social-button:hover {
            transform: scale(1.2);
          }

          .social-account-container .social-accounts .social-button:active {
            transform: scale(0.9);
          }

          .agreement {
            display: block;
            text-align: center;
            margin-top: 15px;
          }

          .agreement a {
            text-decoration: none;
            color: #0099ff;
            font-size: 9px;
          }

          .error-message {
            color: #ff3b30;
            font-size: 12px;
            text-align: center;
            min-height: 1.2rem;
            margin-top: 15px;
            margin-bottom: -10px;
          }
        `}
      </style>
      <div className="container">
        <div className="heading">Organizer Login</div>
        <form className="form" onSubmit={handleEmailSubmit}>
          <input
            placeholder="E-mail"
            id="email"
            name="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            placeholder="Password"
            id="password"
            name="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span className="forgot-password"><a href="#">Forgot Password?</a></span>
           <div className="error-message">{error}</div>
          <button type="submit" className="login-button">Login</button>
        </form>
        <div className="social-account-container">
          <span className="title">Or Sign in with</span>
          <div className="social-accounts">
            <button className="social-button google" onClick={handleGoogleSignIn}>
              <svg viewBox="0 0 488 512" height="1em" xmlns="http://www.w3.org/2000/svg" className="svg">
                <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
            </button>
            <button className="social-button github" onClick={handleGitHubSignIn}>
              <svg viewBox="0 0 496 512" height="1em" xmlns="http://www.w3.org/2000/svg" className="svg">
                <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3.3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.3-6.2-10.1-27.8 2.3-57.4 0 0 21.9-7.8 72.9 20.5 20.9-6.2 43.3-9.4 66.1-9.4 22.6 0 45.2 3.1 66.1 9.4 51-28.3 72.9-20.5 72.9-20.5 12.4 29.6 4.6 51.2 2.3 57.4 16 17.6 23.6 31.4 23.6 58.9 0 96.5-58.7 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path>
              </svg>
            </button>
          </div>
        </div>
        <span className="agreement"><a href="#">Learn user license agreement</a></span>
      </div>
    </>
  );
};

export default Login;

// This is a test comment