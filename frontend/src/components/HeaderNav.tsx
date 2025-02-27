import React, { useContext } from "react";
import { NavIconButton } from "./NavIconButton";
import { useNavigate } from "react-router-dom";
import { useModal } from './modals/ModalContext';  // Importing modal context
import { logout } from "../auth";  // Ensure your logout function is correctly imported
import { IsLoggedInContext } from '../app';  // Ensure IsLoggedInContext is correctly imported

export const HeaderNav: React.FC = () => {
  const { openModal } = useModal(); // Accessing openModal from modal context
  const navigate = useNavigate();

  const { isLoggedIn, setIsLoggedIn } = useContext(IsLoggedInContext);
  
  const handleSettingsClick = () => {
    // Open the settings modal with the desired content
    openModal('settingsModal');
  };

  const handleProfileClick = () => {
    console.log("handle profile click!");
    if (isLoggedIn) {
      openModal("profileModal"); 
    } else {
      navigate("/login")
    }
  };
  
  return (
    <div className="flex gap-3 pb-2 items-center ml-auto text-primary">
      <NavIconButton id="nav-home-button" icon="home" onClick={() => navigate("/gameMenu")} />
      <NavIconButton id="nav-profile-button" icon="user" onClick={handleProfileClick} />
      <NavIconButton id="nav-chat-button" icon="chat" onClick={() => navigate("/chat")} />
      <NavIconButton
        id="nav-settings-button"
        icon="settings"
        onClick={handleSettingsClick} // Trigger settings modal
      />
      {isLoggedIn ? (
        <button onClick={() => {
          logout();
          setIsLoggedIn(false);
          navigate("/");  // Redirect to home page after logout
        }}>Log Out</button>
      ) : null}
    </div>
  );
};
