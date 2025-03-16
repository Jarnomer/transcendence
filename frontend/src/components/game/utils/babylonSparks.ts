import {
  Color3,
  GlowLayer,
  Mesh,
  MeshBuilder,
  Path3D,
  Scene,
  StandardMaterial,
  Vector3,
} from 'babylonjs';

function getTargetsInRange(ballMesh: any, scene: Scene) {
  const targets: Array<{ mesh: any; point: Vector3 }> = [];

  const sectorCount = 8;
  const sectorAngle = (Math.PI * 2) / sectorCount;

  for (let sector = 0; sector < sectorCount; sector++) {
    if (Math.random() < 0.3) continue; // Skip some sectors randomly

    const baseAngle = sector * sectorAngle;
    const angle = baseAngle + (Math.random() - 0.5) * sectorAngle * 0.8;
    const distance = 0.5 + Math.random() * 0.8;

    // Calculate endpoint
    const endPoint = new Vector3(
      ballMesh.position.x + Math.cos(angle) * distance,
      ballMesh.position.y + Math.sin(angle) * distance,
      ballMesh.position.z
    );

    targets.push({
      mesh: null,
      point: endPoint,
    });
  }

  const potentialTargets = scene.meshes.filter(
    (mesh) => mesh !== ballMesh && mesh.name.includes('paddle')
  );

  for (const target of potentialTargets) {
    if (!target.getBoundingInfo) continue;

    const toTarget = target.position.subtract(ballMesh.position);
    const distance = toTarget.length();

    if (distance > 1.0 || Math.random() < 0.3) continue;

    // Get connection logic for paddles
    if (target.name.includes('paddle')) {
      const paddleDir = target.position.x > 0 ? 1 : -1;
      const connectionPoint = new Vector3(
        target.position.x - paddleDir * 0.25,
        target.position.y + (Math.random() - 0.5) * 1.5,
        target.position.z
      );

      targets.push({
        mesh: target,
        point: connectionPoint,
      });
    }
  }

  return targets;
}

function generateLightningPoints(start: Vector3, end: Vector3): Vector3[] {
  const distance = Vector3.Distance(start, end);
  const points: Vector3[] = [];

  const direction = end.subtract(start).normalize();
  const segmentCount = 4 + Math.floor(Math.random());
  const displacementAmount = distance * 0.4;

  // Create perpendicular vector for 2D displacement only
  const perpVector = new Vector3(-direction.y, direction.x, 0).normalize();

  points.push(start.clone()); // First point is always the start

  for (let i = 1; i < segmentCount; i++) {
    const ratio = i / segmentCount;

    // Get point along straight line
    const segmentRatio = ratio;
    const basePoint = new Vector3(
      start.x + (end.x - start.x) * segmentRatio,
      start.y + (end.y - start.y) * segmentRatio,
      start.z + (end.z - start.z) * segmentRatio
    );

    const displacement = (Math.random() - 0.5) * displacementAmount;

    const point = new Vector3(
      basePoint.x + perpVector.x * displacement,
      basePoint.y + perpVector.y * displacement,
      basePoint.z // Keep Z unchanged
    );

    points.push(point);
  }

  points.push(end.clone()); // Last point is always the end
  return points;
}

function createArcLine(
  startPoint: Vector3,
  endPoint: Vector3,
  baseColor: Color3,
  scene: Scene,
  sharedGlowLayer: GlowLayer
) {
  const arcPoints = generateLightningPoints(startPoint, endPoint);
  const path3d = new Path3D(arcPoints);
  const tubeMesh = MeshBuilder.CreateTube(
    'electricArcTube',
    {
      path: arcPoints,
      radius: 0.035,
      tessellation: 3,
      updatable: true,
    },
    scene
  );

  const tubeMaterial = new StandardMaterial('arcMaterial', scene);
  tubeMaterial.emissiveColor = new Color3(
    Math.min(baseColor.r * 2.0 + 0.3, 1),
    Math.min(baseColor.g * 2.0 + 0.3, 1),
    Math.min(baseColor.b * 2.0 + 0.3, 1)
  );
  tubeMaterial.disableLighting = true;
  tubeMaterial.alpha = 0.6;

  tubeMesh.material = tubeMaterial;

  sharedGlowLayer.addIncludedOnlyMesh(tubeMesh);

  return { arcMesh: tubeMesh, points: arcPoints, path3d };
}

function createNewArc(
  ballMesh: any,
  baseColor: Color3,
  scene: Scene,
  activeArcs: any[],
  sharedGlowLayer: GlowLayer
) {
  const targets = getTargetsInRange(ballMesh, scene);

  if (targets.length === 0) return null;

  const targetInfo = targets[Math.floor(Math.random() * targets.length)];
  const startPoint = ballMesh.position.clone();
  const endPoint = targetInfo.point;

  // Create the arc with glow
  const { arcMesh, points, path3d } = createArcLine(
    startPoint,
    endPoint,
    baseColor,
    scene,
    sharedGlowLayer
  );

  // Create a reference for the arc
  const arcReference = {
    arcMesh,
    target: targetInfo.mesh,
    life: 0,
    maxLife: 60 + Math.floor(Math.random() * 60),
    points,
    path3d,
    updateFunction: null as any,
  };

  const updateArcLine = () => {
    if (Math.random() < 0.2) return true;
    return false; // Keep this arc alive
  };

  arcReference.updateFunction = updateArcLine;

  activeArcs.push(arcReference); // Add to tracking array

  return arcReference;
}

function updateArcs(activeArcs: any[]) {
  for (let i = activeArcs.length - 1; i >= 0; i--) {
    const arc = activeArcs[i];
    arc.life++;

    const shouldRemove = arc.life > arc.maxLife || arc.updateFunction();

    if (shouldRemove) {
      arc.arcMesh.dispose();
      activeArcs.splice(i, 1);
    }
  }
}

export function ballSparkEffect(ballMesh: any, color: Color3, scene: Scene) {
  const disposables: any[] = []; // All effects for cleanup

  // Create shared glow layer with minimal settings
  const sparkGlow = new GlowLayer('sparkGlow', scene, {
    mainTextureFixedSize: 256,
    blurKernelSize: 8,
  });

  sparkGlow.intensity = 0.5;
  disposables.push(sparkGlow);

  // Track active electric arcs
  const activeArcs: {
    arcMesh: Mesh;
    target: any;
    life: number;
    maxLife: number;
    points: Vector3[];
    path3d?: Path3D;
    updateFunction: () => boolean;
  }[] = [];

  let frameCounter = 0;
  const observer = scene.onBeforeRenderObservable.add(() => {
    if (++frameCounter % 2 !== 0) return; // Skip every 2nd frame

    const minArcs = 4;
    const maxArcs = 10;

    // Random chance to create a new arc, higher when fewer arcs exist
    const creationProbability = 0.05 + (minArcs - Math.min(minArcs, activeArcs.length)) * 0.1;

    if (Math.random() < creationProbability && activeArcs.length < maxArcs) {
      const newArc = createNewArc(ballMesh, color, scene, activeArcs, sparkGlow);
      if (newArc) {
        disposables.push(newArc.arcMesh);
      }
    }

    updateArcs(activeArcs);
  });

  return () => {
    scene.onBeforeRenderObservable.remove(observer);

    // Dispose all arcs
    activeArcs.forEach((arc) => {
      arc.arcMesh.dispose();
    });

    // Dispose all created resources
    disposables.forEach((item) => {
      if (item && item.dispose) {
        item.dispose();
      }
    });
  };
}
