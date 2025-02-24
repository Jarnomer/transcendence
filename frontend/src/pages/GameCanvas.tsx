import React, { useRef, useEffect, useState } from 'react';
import { Engine, Scene, FreeCamera, HemisphericLight,
  MeshBuilder, StandardMaterial, Color3, Vector3 } from 'babylonjs';

const GameCanvas = () => {
  const canvasRef = useRef(null);
  const [socket, setSocket] = useState(null);

  // Game objects
  const player1 = useRef({ mesh: null, y: 0 });
  const player2 = useRef({ mesh: null, y: 0 });
  const ball = useRef({ mesh: null, x: 0, y: 0 });

  useEffect(() => {
    if (canvasRef.current) {
      // Get the canvas element
      const canvas = canvasRef.current;
      const token = localStorage.getItem("token");

      // Generate the engine and scene
      const engine = new Engine(canvas, true);
      const scene = new Scene(engine);

      // Setup camera
      const camera = new FreeCamera("camera", new Vector3(0, 5, -10), scene);
      camera.setTarget(Vector3.Zero());
      camera.attachControl(canvas, true);

      // Setup light
      const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
      light.intensity = 0.7;

      // Setup materials
      const paddleMaterial = new StandardMaterial("paddleMat", scene);
      paddleMaterial.diffuseColor = Color3.White();

      // Create ground
      const ground = MeshBuilder.CreateGround('ground', {
        width: 30, height: 20
      }, scene);

      // Create paddles
      player1.mesh = MeshBuilder.CreateBox("paddle1", {
        height: 2, width: 0.5, depth: 0.5
      }, scene);
      player2.mesh = MeshBuilder.CreateBox("paddle2", {
        height: 2, width: 0.5, depth: 0.5
      }, scene);

      // Create ball
      ball.mesh = MeshBuilder.CreateSphere("ball", {
        diameter: 0.5
      }, scene);

      // Position meshes
      player1.mesh.position.x = -10;
      player2.mesh.position.x = 10;

      // Apply materials
      player1.mesh.material = paddleMaterial;
      player2.mesh.material = paddleMaterial;
      ball.mesh.material = paddleMaterial;

      // WebSocket connection
      const wsUrl = `wss://${window.location.host}/ws/remote/game/?token=${token}&gameId=1`;
      const ws = new WebSocket(wsUrl);
      setSocket(ws);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // Update paddle and ball positions
        if (data.type === 'update') {
          player1.current.mesh.position.y = data.players.player1.y;
          player2.current.mesh.position.y = data.players.player2.y;
          ball.current.mesh.position.x += data.Ball.dx;
          ball.current.mesh.position.y += data.ball.dy;
        }
      };

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
        ws.close();
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
