import React, { useState, useEffect } from "react";
import GameMenuCard from "../components/wrappers/gameMenuCard"; // Import the GameMenuCard component
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing

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
  const [selectedMode, setSelectedMode] = useState<SelectedMode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null); // Track the selected difficulty
  const navigate = useNavigate(); // Hook to navigate to different routes

  const modes = [
    { content: "SinglePlayer", imageUrl: "./src/assets/images/ai_3.png", hoverInfo: "Play against an AI opponent", onClick: () => setSelectedMode({ mode: "singleplayer" }) },
    { content: "1v1", imageUrl: "./src/assets/images/1v1.png", hoverInfo: "Play with another player", onClick: () => setSelectedMode({ mode: "1v1" }) },
    { content: "Tournament", imageUrl: "./src/assets/images/trophy_bw.png", hoverInfo: "Compete in a tournament", onClick: () => setSelectedMode({ mode: "tournament" }) },
  ];

  const subMenus: { [key: string]: GameMenuOption[] } = {
    singleplayer: [
      { content: "Easy", imageUrl: "./src/assets/images/ai_easy.png", hoverInfo: "Easy level", onClick: () => setSelectedDifficulty("easy") },
      { content: "Normal", imageUrl: "./src/assets/images/ai.png", hoverInfo: "Normal level", onClick: () => setSelectedDifficulty("normal") },
      { content: "Brutal", imageUrl: "./src/assets/images/ai_hard.png", hoverInfo: "Brutal level", onClick: () => setSelectedDifficulty("brutal") },
    ],
    "1v1": [
      { content: "Local", imageUrl: "./src/assets/images/local_match_5.png", hoverInfo: "Play with a local player", onClick: () => setSelectedDifficulty("local") },
      { content: "Online", imageUrl: "./src/assets/images/online_match_4.png", hoverInfo: "Play with an online player", onClick: () => setSelectedDifficulty("online") },
    ],
    tournament: [
      { content: "Round 1", imageUrl: "./src/assets/images/round1.png", hoverInfo: "Tournament round 1", onClick: () => setSelectedDifficulty("round1") },
      { content: "Round 2", imageUrl: "./src/assets/images/round2.png", hoverInfo: "Tournament round 2", onClick: () => setSelectedDifficulty("round2") },
    ],
  };

  // Effect to navigate once both mode and difficulty are selected
  useEffect(() => {
    if (selectedMode && selectedDifficulty) {
      console.log("Navigating with:", selectedMode, selectedDifficulty);
      navigate("/game", { state: { mode: selectedMode.mode, difficulty: selectedDifficulty } });
    }
  }, [selectedMode, selectedDifficulty, navigate]); // Trigger navigation when both values are set

  const renderMenu = () => {
    if (selectedMode && !selectedDifficulty) {
      // Render the submenu for the selected mode
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-3 pt-1">
          {subMenus[selectedMode.mode].map((option, index) => (
            <GameMenuCard
              key={index}
              content={option.content}
              imageUrl={option.imageUrl}
              hoverInfo={option.hoverInfo}
              onClick={option.onClick}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-3 pt-1">
        {modes.map((mode, index) => (
          <GameMenuCard
            key={index}
            content={mode.content}
            imageUrl={mode.imageUrl}
            hoverInfo={mode.hoverInfo}
            onClick={mode.onClick}
          />
        ))}
      </div>
    );
  };

  return (
    <div id="home-container" className="flex items-center justify-center p-10">
      {renderMenu()}
    </div>
  );
};
