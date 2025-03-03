import React, { useState, useEffect } from "react";
import GameMenuCard from "../components/wrappers/gameMenuCard"; // Import the GameMenuCard component
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing
import { useAnimatedNavigate } from "../animatedNavigate";
import { NavIconButton } from "../components/NavIconButton";

interface GameMenuOption {
  content: string;
  imageUrl: string;
  hoverInfo: string;
  onClick: () => void;
}

interface SelectedMode {
  mode: string;
  difficulty?: string;
}

export const GameMenu: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null); // Track the selected difficulty
  const navigate = useNavigate(); // Hook to navigate to different routes
  const animatedNavigate = useAnimatedNavigate();

  const modes = [
    { content: "SinglePlayer", imageUrl: "./src/assets/images/ai_3.png", hoverInfo: "Play against an AI opponent", onClick: () => handleModeClick("singleplayer") },
    { content: "1v1", imageUrl: "./src/assets/images/1v1.png", hoverInfo: "Play with another player", onClick: () => handleModeClick("1v1") },
    { content: "Tournament", imageUrl: "./src/assets/images/trophy_bw.png", hoverInfo: "Compete in a tournament", onClick: () => handleModeClick("tournament") },
  ];

  const subMenus: { [key: string]: GameMenuOption[] } = {
    singleplayer: [
      { content: "Easy", imageUrl: "./src/assets/images/ai_easy.png", hoverInfo: "Easy level", onClick: () => handleDifficultyClick("easy")},
      { content: "Normal", imageUrl: "./src/assets/images/ai.png", hoverInfo: "Normal level", onClick: () => handleDifficultyClick("normal") },
      { content: "Brutal", imageUrl: "./src/assets/images/ai_hard.png", hoverInfo: "Brutal level", onClick: () => handleDifficultyClick("brutal") },
    ],
    "1v1": [
      { content: "Local", imageUrl: "./src/assets/images/local_match_5.png", hoverInfo: "Play with a local player", onClick: () => handleDifficultyClick("local") },
      { content: "Online", imageUrl: "./src/assets/images/online_match_4.png", hoverInfo: "Play with an online player", onClick: () => handleDifficultyClick("online") },
    ],
    tournament: [
      { content: "Local", imageUrl: "./src/assets/images/local_match_5.png", hoverInfo: "local tournament", onClick: () => handleDifficultyClick("local") },
      { content: "Online", imageUrl: "./src/assets/images/online_match_4.png", hoverInfo: "online tournament", onClick: () => handleDifficultyClick("online") },
    ],
  };

  const animateCardChange = (
    newValue: string | null,
    setValue: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const appDiv = document.getElementById("home-container");
    if (!appDiv) return;
  
    appDiv.classList.add("closing");
  
    setTimeout(() => {
      appDiv.classList.remove("closing");
      appDiv.classList.add("opening");
  
      setValue(newValue); // Update the selected mode or difficulty
  
      setTimeout(() => {
        appDiv.classList.remove("opening");
      }, 250);
  
    }, 250);
  };
  
  const handleModeClick = (mode: string | null) => {
    animateCardChange(mode, setSelectedMode);
  };
  
  const handleDifficultyClick = (difficulty: string | null) => {
    animateCardChange(difficulty, setSelectedDifficulty);
  };
  
  
      
      // Effect to navigate once both mode and difficulty are selected
      useEffect(() => {
        if (selectedMode && selectedDifficulty) {
          navigate("/game", { state: { mode: selectedMode, difficulty: selectedDifficulty } });
        }
      }, [selectedMode, selectedDifficulty]); // Trigger navigation when both values are set
    

  const renderMenu = () => {
    if (selectedMode && !selectedDifficulty) {
      // Render the submenu for the selected mode
      return (
        <>
        <NavIconButton id="arrow-left" icon="arrowLeft" onClick={() => handleModeClick(null)} />
          {subMenus[selectedMode].map((option, index) => (

            <div
              key={index}
              style={{ flexBasis: "300px" }}
            >
            <GameMenuCard
              content={option.content}
              imageUrl={option.imageUrl}
              hoverInfo={option.hoverInfo}
              onClick={option.onClick}
            />
            </div>
          ))}
        </>
      );
    }

    return (
      <>
        {modes.map((mode, index) => (
          <div
          key={index}
          style={{ flexBasis: "300px" }}
        >
          <GameMenuCard
            content={mode.content}
            imageUrl={mode.imageUrl}
            hoverInfo={mode.hoverInfo}
            onClick={mode.onClick}
          />
        </div>
        ))}
      </>
    );
  };


  return (
    <div id="home-container" className="flex flex-wrap justify-center gap-4 px-3 items-center p-10">
      {renderMenu()}
    </div>
  );
};
