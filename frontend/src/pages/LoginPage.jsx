import { useState } from "react";

import RootLayout from "@/layouts/RootLayout";
import TextField from "@mui/material/TextField";
import Logo from "../assets/Logo/CEIT_ver.png";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log({ username, password });
    navigate("/dashboard");
  };

  return (
    <RootLayout>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="login-card">
          <img src={Logo} alt="App Logo" className="app-logo" />

          <div>
            <TextField
              className="login-textfield"
              label="Username"
              variant="outlined"
              size="small"
              onChange={(event) => setUsername(event.target.value)}
            />
            <TextField
              className="login-textfield"
              label="Password"
              variant="outlined"
              size="small"
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <button type="submit" className="login-button">
            SIGN IN
          </button>
        </div>
      </form>
    </RootLayout>
  );
}
