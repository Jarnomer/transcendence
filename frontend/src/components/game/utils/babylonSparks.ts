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

function getTargetsInRange(ballMesh: any, scene: Scene, maxRange: number = 5) {
  const targets: Array<{ mesh: any; point: Vector3 }> = [];

  const sectorCount = 4;
  const skipChange = 0.4;
  const sectorAngle = (Math.PI * 2) / sectorCount;

  const potentialTargets = scene.meshes.filter(
    (mesh) => mesh !== ballMesh && mesh.name.includes('paddle')
  );

  for (let sector = 0; sector < sectorCount; sector++) {
    if (Math.random() < skipChange) continue;

    const baseAngle = sector * sectorAngle;

    for (const target of potentialTargets) {
      if (!target.getBoundingInfo) continue;

      const toTarget = target.position.subtract(ballMesh.position);
      const distance = toTarget.length();

      if (distance > maxRange) continue;

      if (Math.random() < skipChange) continue;

      const angleToTarget = Math.atan2(toTarget.y, toTarget.x);

      // Check if target is within this sector
      const angleDiff = Math.abs(
        ((angleToTarget - baseAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI
      );

      if (angleDiff > sectorAngle / 2) continue;

      const connectionProbability = skipChange - (distance / maxRange) * skipChange;

      if (Math.random() > connectionProbability) continue;

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

    const distanceMultiplier = 1.5;
    const distance = 0.5 + Math.random() * distanceMultiplier;
    const angle = baseAngle + (Math.random() - 0.5) * sectorAngle;

    const endPoint = new Vector3(
      ballMesh.position.x + Math.cos(angle) * distance,
      ballMesh.position.y + Math.sin(angle) * distance,
      ballMesh.position.z
    );

    targets.push({
      mesh: null, // No mesh
      point: endPoint,
    });
  }

  return targets;
}

function generateLightningPoints(start: Vector3, end: Vector3): Vector3[] {
  const distance = Vector3.Distance(start, end);
  const points: Vector3[] = [];

  const direction = end.subtract(start).normalize();
  const segmentCount = Math.max(6, Math.floor(distance * 3));
  const displacementAmount = distance * 0.3;

  // Create perpendicular vector for 2D displacement only
  const perpVector = new Vector3(-direction.y, direction.x, 0).normalize();

  points.push(start.clone()); // First point is always the start

  for (let i = 1; i < segmentCount; i++) {
    const ratio = i / segmentCount;

    // Get point along straight line
    const segmentRatio = ratio * (0.8 + Math.random() * 0.4); // Less variation
    const basePoint = new Vector3(
      start.x + (end.x - start.x) * segmentRatio,
      start.y + (end.y - start.y) * segmentRatio,
      start.z + (end.z - start.z) * segmentRatio
    );

    // Add and apply random displacement in 2D
    const midPointFactor = 1 - Math.abs((ratio - 0.5) * 2);
    const displacement = (Math.random() - 0.5) * displacementAmount * midPointFactor;

    const point = new Vector3(
      basePoint.x + perpVector.x * displacement,
      basePoint.y + perpVector.y * displacement,
      basePoint.z // Keep Z unchanged
    );

    points.push(point);

    // Branching - 10% change - middle section - 2-4 branches
    if (ratio > 0.4 && ratio < 0.6 && Math.random() < 0.1) {
      const branchLength = distance * 0.15 * Math.random();
      const branchDir = new Vector3(
        direction.x + (Math.random() - 0.5) * 1.5,
        direction.y + (Math.random() - 0.5) * 1.5,
        0
      ).normalize();

      const branchPoints = 1 + Math.floor(Math.random() * 3);
      let branchPrev = point.clone();

      for (let j = 1; j <= branchPoints; j++) {
        const branchDisplacement = (Math.random() - 0.5) * branchLength * 0.4;
        const branchPoint = new Vector3(
          branchPrev.x +
            branchDir.x * (branchLength / branchPoints) +
            perpVector.x * branchDisplacement,
          branchPrev.y +
            branchDir.y * (branchLength / branchPoints) +
            perpVector.y * branchDisplacement,
          branchPrev.z
        );

        points.push(branchPoint);
        branchPrev = branchPoint;
      }

      points.push(point.clone()); // Return to original point
    }
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
      radius: 0.05,
      tessellation: 4,
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
    targetPoint: targetInfo.point,
    life: 0,
    // Lifetime: 1-2 seconds at 60 fps
    maxLife: 60 + Math.floor(Math.random() * 60),
    points,
    path3d,
    updateFunction: null as any,
  };

  // Create update function for this arc
  const updateArcLine = () => {
    // Get current ball position as the new starting point
    const currentStartPoint = ballMesh.position.clone();

    // Always update first point to match ball position
    arcReference.points[0] = currentStartPoint;

    // Regenerate less frequently - only 5% chance per frame
    const shouldRegenerate =
      Math.random() < 0.05 || Vector3.Distance(currentStartPoint, startPoint) > 0.3;

    if (shouldRegenerate) {
      try {
        const newPoints = generateLightningPoints(currentStartPoint, endPoint);

        MeshBuilder.CreateTube(
          'electricArcTube',
          {
            path: newPoints,
            radius: 0.05,
            tessellation: 4,
            instance: arcReference.arcMesh,
          },
          scene
        );

        arcReference.points = newPoints;
      } catch (err) {
        console.error('Error updating arc tube:', err);
        return true; // Signal to remove this arc due to error
      }
    } else {
      // For frames where we don't regenerate, just update the first point
      try {
        const vertices = arcReference.arcMesh.getVerticesData('position');
        if (vertices && vertices.length >= 3) {
          vertices[0] = currentStartPoint.x;
          vertices[1] = currentStartPoint.y;
          vertices[2] = currentStartPoint.z;
          arcReference.arcMesh.updateVerticesData('position', vertices);
        }
      } catch (err) {
        // Ignore minor update errors
      }
    }

    const disappearChance = arcReference.target ? 0.05 : 0.1;

    if (Math.random() < disappearChance) return true;

    return false; // Keep this arc alive
  };

  arcReference.updateFunction = updateArcLine;

  activeArcs.push(arcReference); // Add to tracking array

  return arcReference;
}

function updateArcs(activeArcs: any[], ballMesh: any) {
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
    targetPoint: Vector3;
    life: number;
    maxLife: number;
    points: Vector3[];
    path3d?: Path3D;
    updateFunction: () => boolean;
  }[] = [];

  let frameCounter = 0;
  const observer = scene.onBeforeRenderObservable.add(() => {
    if (++frameCounter % 2 !== 0) return; // Skip every 2nd frame

    const minArcs = 2;
    const maxArcs = 4;

    // Random chance to create a new arc, higher when fewer arcs exist
    const creationProbability = 0.05 + (minArcs - Math.min(minArcs, activeArcs.length)) * 0.1;

    if (Math.random() < creationProbability && activeArcs.length < maxArcs) {
      const newArc = createNewArc(ballMesh, color, scene, activeArcs, sparkGlow);
      if (newArc) {
        disposables.push(newArc.arcMesh);
      }
    }

    updateArcs(activeArcs, ballMesh);
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
