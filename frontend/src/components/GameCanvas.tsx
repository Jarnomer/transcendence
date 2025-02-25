import React, { useRef, useEffect, useState } from 'react';
import { Engine, Scene, FreeCamera, HemisphericLight,
  MeshBuilder, StandardMaterial, Color3, Vector3 } from 'babylonjs';

interface GameCanvasProps {
  websocket: WebSocket | null;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ websocket }) => {

  // Core objects
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);

  // Game objects
  const player1Ref = useRef({ mesh: null, y: 0 });
  const player2Ref = useRef({ mesh: null, y: 0 });
  const ballRef = useRef({ mesh: null, x: 0, y: 0 });

  useEffect(() => {
    
    if (!canvasRef.current || !websocket) return;

    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    engineRef.current = engine;
    sceneRef.current = scene;

    // Setup camera
    const camera = new FreeCamera("camera", new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);

    // Setup light
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Setup material
    const paddleMaterial = new StandardMaterial("paddleMat", scene);
    paddleMaterial.diffuseColor = Color3.White();

    // Create paddles
    player1Ref.current.mesh = MeshBuilder.CreateBox("paddle1", {
      height: 2, width: 0.5, depth: 0.5
    }, scene);
    player2Ref.current.mesh = MeshBuilder.CreateBox("paddle2", {
      height: 2, width: 0.5, depth: 0.5
    }, scene);

    // Create ball
    ballRef.current.mesh = MeshBuilder.CreateSphere("ball", {
      diameter: 0.5
    }, scene);

    // Position paddles
    player1Ref.current.mesh.position.x = -10;
    player2Ref.current.mesh.position.x = 10;

    // Apply materials
    player1Ref.current.mesh.material = paddleMaterial;
    player2Ref.current.mesh.material = paddleMaterial;
    ballRef.current.mesh.material = paddleMaterial;

    // Scene render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Handle window resize
    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      engine.dispose();
      scene.dispose();
    };
  }, [websocket]);

  // Handle position changes
  useEffect(() => {
    if (!websocket) return;
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      // Update paddle and ball positions

      console.log(data)
      if (data.type === 'update') {
        player1Ref.current.mesh.position.y = data.state.players.player1.y;
        player2Ref.current.mesh.position.y = data.state.players.player2.y;
        ballRef.current.mesh.position.x += data.state.ball.dx;
        ballRef.current.mesh.position.y += data.state.ball.dy;
      }
    };

    websocket.addEventListener('message', handleMessage);

    return () => {
      websocket.removeEventListener('message', handleMessage);
    };
  }, [websocket]);  // Only re-run if the websocket changes
  
  // Handle key presses
  useEffect(() => {
    if (!websocket) return;
    
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'w' || event.key === 'W') {
        websocket.send(JSON.stringify({ type: 'move', player: 'player1', move: 'up' }));
      } else if (event.key === 's' || event.key === 'S') {
        websocket.send(JSON.stringify({ type: 'move', player: 'player1', move: 'down' }));
      } else if (event.key === 'ArrowUp') {
        websocket.send(JSON.stringify({ type: 'move', player: 'player2', move: 'up' }));
      } else if (event.key === 'ArrowDown') {
        websocket.send(JSON.stringify({ type: 'move', player: 'player2', move: 'down' }));
      }
    };

    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [websocket]);  // Only re-run if the websocket changes

  return <canvas ref={canvasRef} className="game-canvas" style={{ width: '100%', height: '100%' }} />;
};

export default GameCanvas;

// if (data.type === 'update' && player1Ref.current.mesh && player2Ref.current.mesh && ballRef.current.mesh) {
// player1Ref.current.mesh.position.y = data.players.player1.y;
// player2Ref.current.mesh.position.y = data.players.player2.y;

// Updated to handle possible typo in the original code (Ball vs ball)
// if (data.ball) {
//   ballRef.current.mesh.position.x += data.ball.dx;
//   ballRef.current.mesh.position.y += data.ball.dy;
// } else if (data.Ball) {
//   ballRef.current.mesh.position.x += data.Ball.dx;
//   ballRef.current.mesh.position.y += data.Ball.dy;
// }
// }

//     if (canvasRef.current) {
//       const canvas = canvasRef.current;
//       const token = localStorage.getItem("token");
//       const engine = new Engine(canvas, true);
//       const scene = new Scene(engine);

//       // Setup camera
//       const camera = new FreeCamera("camera", new Vector3(0, 5, -10), scene);
//       camera.setTarget(Vector3.Zero());
//       camera.attachControl(canvas, true);

//       // Setup light
//       const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
//       light.intensity = 0.7;

//       // Setup materials
//       const paddleMaterial = new StandardMaterial("paddleMat", scene);
//       paddleMaterial.diffuseColor = Color3.White();

//       // Create paddles
//       player1.mesh = MeshBuilder.CreateBox("paddle1", {
//         height: 2, width: 0.5, depth: 0.5
//       }, scene);
//       player2.mesh = MeshBuilder.CreateBox("paddle2", {
//         height: 2, width: 0.5, depth: 0.5
//       }, scene);

//       // Create ball
//       ball.mesh = MeshBuilder.CreateSphere("ball", {
//         diameter: 0.5
//       }, scene);

//       // Position meshes
//       player1.mesh.position.x = -10;
//       player2.mesh.position.x = 10;

//       // Apply materials
//       player1.mesh.material = paddleMaterial;
//       player2.mesh.material = paddleMaterial;
//       ball.mesh.material = paddleMaterial;

//       // WebSocket connection
//       const wsUrl = `wss://${window.location.host}/ws/remote/game/?token=${token}&gameId=1`;
//       const ws = new WebSocket(wsUrl);
//       setSocket(ws);

//       ws.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         // Update paddle and ball positions
//         if (data.type === 'update') {
//           player1.current.mesh.position.y = data.players.player1.y;
//           player2.current.mesh.position.y = data.players.player2.y;
//           ball.current.mesh.position.x += data.Ball.dx;
//           ball.current.mesh.position.y += data.ball.dy;
//         }
//       };

//       // Render the scene
//       engine.runRenderLoop(() => {
//         scene.render();
//       });

//       // Handle window resize
//       window.addEventListener("resize", () => {
//         engine.resize();
//       });

//       // Cleanup
//       return () => {
//         engine?.dispose();
//         scene?.dispose();
//         ws.close();
//       };
//     }
//   }, []);

//   return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
// };

// export default GameCanvas;

// Create ground
// const ground = MeshBuilder.CreateGround('ground', {
//   width: 30, height: 20
// }, scene


// Handle key presses
// const handleKeydown = (event) => {
//   if (event.key === 'w' || event.key === 'W') {
//     ws.send(JSON.stringify({ type: 'move', player: 'player1', move: 'up' }));
//   } else if (event.key === 's' || event.key === 'S') {
//     ws.send(JSON.stringify({ type: 'move', player: 'player1', move: 'down' }));
//   } else if (event.key === 'ArrowUp') {
//     ws.send(JSON.stringify({ type: 'move', player: 'player2', move: 'up' }));
//   } else if (event.key === 'ArrowDown') {
//     ws.send(JSON.stringify({ type: 'move', player: 'player2', move: 'down' }));
//   }
// 
// window.addEventListener('keydown', handleKeydown

// window.removeEventListener('keydown', handleKeydown);


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
