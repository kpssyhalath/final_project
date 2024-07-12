import { useState } from "react";
import TextField from "@mui/material/TextField";
import RootLayout from "@/layouts/RootLayout";
import axios from "../middleware/axios";
import Logo from "@/assets/Logo/cyberus-ver.png";
import { useNavigate, useLocation } from "react-router-dom";
import { Alert, CircularProgress } from "@mui/material";

export default function LoginPage() {
  // State variables for handling form data and UI states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false); // Alert visibility
  const [serverResponse, setServerResponse] = useState(""); // Server response message
  const [emailTouched, setEmailTouched] = useState(false); // Email field touched state
  const [passwordTouched, setPasswordTouched] = useState(false); // Password field touched state
  const [loading, setLoading] = useState(false); // Loading state

  // React Router hooks for navigation and location
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  // Email validation function  
  const validateEmail = (email) => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
  };

  // Form submission handler
  const handleSubmit = async (event) => {
    event.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);

    // Check for valid email and password
    if (!email || !password || !validateEmail(email)) {
      setServerResponse("Please enter a valid email and password.");
      setShow(true);
      return;
    }

    setLoading(true); // Start loading
    try {
      // Make a POST request to the login API
      const response = await axios.post(
        "auth/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
      
      if (response) {
        const { access_token, refresh_token } = response.data;

        // Store tokens in local storage
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        console.log(access_token);
        setServerResponse("");
        setShow(false);
        setLoading(false);

        // Navigate to the intended page or home
        navigate(from, { replace: true });
      }
    } catch (error) {
      // Show error message on login failure
      setServerResponse(error.response.data.message || "Login failed. Please try again.");
      setShow(true);
      setLoading(false);
    }
  };

  return (
    <RootLayout>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="login-card">
          <img src={Logo} alt="App Logo" className="app-logo" />

          {/* Show alert if there's an error */}
          {show && (
            <Alert severity="error" className="login-alert">
              {serverResponse}
            </Alert>
          )}

          <div>
            {/* Email input field */}
            <TextField
              className="login-textfield"
              label="Email"
              variant="outlined"
              size="small"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => setEmailTouched(true)}
              error={emailTouched && !validateEmail(email)}
              helperText={emailTouched && !validateEmail(email) ? "Invalid email address" : ""}
            />
            {/* Password input field */}
            <TextField
              className="login-textfield"
              label="Password"
              variant="outlined"
              size="small"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={() => setPasswordTouched(true)}
              error={passwordTouched && !password}
              helperText={passwordTouched && !password ? "Password is required" : ""}
            />
          </div>

          {/* Submit button */}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "SIGN IN"}
          </button>
        </div>
      </form>
    </RootLayout>
  );
}
