import React, { useContext } from "react";
import { NavIconButton } from "./NavIconButton";
import { useNavigate } from "react-router-dom";
import { useModal } from './modals/ModalContext';  // Importing modal context
// import { logout } from "../auth";  // Ensure your logout function is correctly imported
import { IsLoggedInContext } from '../app';  // Ensure IsLoggedInContext is correctly imported
import { useAnimatedNavigate } from "../animatedNavigate";


  
export const HeaderNav: React.FC = () => {
  const { openModal } = useModal(); // Accessing openModal from modal context
  const navigate = useNavigate();
  const animatedNavigate = useAnimatedNavigate();

  const isLoggedInContext = useContext(IsLoggedInContext)!;
  const { isLoggedIn, setIsLoggedIn, logout } = isLoggedInContext;
  
  const handleSettingsClick = () => {
    // Open the settings modal with the desired content
    openModal('settingsModal');
  };

  const handleProfileClick = () => {
    console.log("handle profile click!");
    if (isLoggedIn) {
      openModal("profileModal"); 
    } else {
      animatedNavigate("/login")
    }
  };
  
  return (
    <div className="flex gap-3 items-center">
      <NavIconButton id="nav-home-button" icon="home" onClick={() => animatedNavigate("/home")} />
      <NavIconButton id="nav-game-button" icon="play" onClick={() => animatedNavigate("/gameMenu")} />
      <NavIconButton id="nav-profile-button" icon="user" onClick={() => animatedNavigate(`/profile/${localStorage.getItem("userID")}`)} />
      <NavIconButton id="nav-chat-button" icon="chat" onClick={() => animatedNavigate("/chat")} />
      <NavIconButton
        id="nav-settings-button"
        icon="settings"
        onClick={handleSettingsClick} // Trigger settings modal
      />
      {isLoggedIn ? (
        <button onClick={() => {
          logout();
          setIsLoggedIn(false);
        }}>Log Out</button>
      ) : null}
    </div>
  );
};
