import React, { useRef, useEffect } from 'react';
import { Engine, Scene, FreeCamera, HemisphericLight, Vector3 } from 'babylonjs';

const GameCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Get the canvas element
      const canvas = canvasRef.current;

      // Generate the engine and scene
      const engine = new Engine(canvas, true);
      const scene = new Scene(engine);

      // Camera setup
      const camera = new FreeCamera("camera", new Vector3(0, 5, -10), scene);
      camera.setTarget(Vector3.Zero());
      camera.attachControl(canvas, true);

      // Light setup
      const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
      light.intensity = 0.7;

      // Render the scene
      engine.runRenderLoop(() => {
        scene.render();
      });

      // Handle window resize
      window.addEventListener("resize", () => {
        engine.resize();
      });

      // Cleanup
      return () => {
        engine?.dispose();
        scene?.dispose();
      };
    }
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default GameCanvas;

// import React, { useEffect, useRef } from 'react';
// import { PlayerScoreBoard } from '../components/PlayerScoreBoard';
// import { gameConnect } from "../api";
// import { BabylonGame } from '../game';

// export const Game: React.FC = () => {
//   const gameInstance = useRef<BabylonGame | null>(null);

//   useEffect(() => {
//     const token = localStorage.getItem("token");

//     // should this redirect?
//     if (!token) return;

//     // Create game instance
//     gameInstance.current = new BabylonGame();

//     // Setup WebSocket
//     const wsUrl = `wss://${window.location.host}/ws/remote/game/?token=${token}&gameId=1`;
//     const websocket = new WebSocket(wsUrl);

//     // Initialize canvas and game
//     const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
//     if (canvas && gameInstance.current) {
//       gameInstance.current.initialize(canvas, websocket);
//     }

//     // Handle WebSocket messages
//     websocket.addEventListener('message', (event) => {
//       const message = JSON.parse(event.data);

//       if (message.type === 'SCORE_UPDATE' && gameInstance.current) {
//         gameInstance.current.updateScores(
//           message.player1Score,
//           message.player2Score
//         );
//       }
//     });

//     // Setup game connection
//     gameConnect(websocket, {
//       onGameStart: () => {
//         console.log('Game started');
//       },
//       onGameEnd: () => {
//         console.log('Game ended');
//       },
//     });

//     // Cleanup
//     return () => {
//       websocket.close();
//       if (gameInstance.current) {
//         gameInstance.current.dispose();
//       }
//     };
//   }, []);

//   return (
//     <div id="game-page" className="p-10">
//       <canvas
//         id="gameCanvas"
//         className="mt-2 glass-box"
//         width="800"
//         height="400"
//       />
//     </div>
//   );
// };
