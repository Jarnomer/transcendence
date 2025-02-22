import React, { useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";
import { login, register } from "../api";
import { ClippedButton } from "../components/wrappers/clippedButton.tsx";
import { SVGModal } from "../components/wrappers/svgModal";
import { IsLoggedInContext } from '../app.tsx';
import { useContext } from "react";


export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, setIsLoggedIn } = useContext(IsLoggedInContext);

  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        await register(username, password);
        await login(username, password);
        setIsLoggedIn(true);
        navigate("/gameMenu");
      } else {
        await login(username, password);
        setIsLoggedIn(true);
        navigate("/gameMenu");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
	<div className="w-full h-full flex justify-center items-center">

      <SVGModal>
		<div className="text-center">
      <h1 className="text-3xl mb-2 font-heading font-bold">
        {isRegistering ? "Register" : "Login"}
      </h1>
      {error && <p className="text-red-500">{error}</p>}
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          className="border p-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <ClippedButton label={isRegistering ? "Register" : "Login"} type="submit" />
      </form>
      <div className="text-center flex flex-col gap-2 mt-4">
        <p>{isRegistering ? "Already have an account?" : "Don't have an account?"}</p>
        <ClippedButton label={isRegistering ? "Go to Login" : "Register"} onClick={() => setIsRegistering(!isRegistering)} />
        {!isRegistering && <ClippedButton label="Play as a guest" />}
      </div>
    </div>
	  </SVGModal>
	</div>
  )
};
