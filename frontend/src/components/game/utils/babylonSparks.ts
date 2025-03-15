import {
  Color3,
  GlowLayer,
  Mesh,
  MeshBuilder,
  Path3D,
  PointLight,
  Scene,
  StandardMaterial,
  Vector3,
} from 'babylonjs';

/**
 * Creates invisible boundary planes for edge attachment
 * OPTIMIZATION: Create only when needed and with simpler geometry
 */
function createCanvasBoundaries(scene: Scene): Mesh[] {
  // Define canvas boundaries with generous size
  const width = 50;
  const height = 30;
  const depth = 0.1;

  // Create invisible material
  const invisibleMat = new StandardMaterial('boundaryMat', scene);
  invisibleMat.alpha = 0;

  // Create simplified boundary planes (only the ones we'll use)
  const topWall = MeshBuilder.CreateBox(
    'topBoundary',
    { width: width, height: depth, depth: 1 },
    scene
  );
  topWall.position.y = height / 2;
  topWall.material = invisibleMat;
  topWall.isVisible = false;

  const bottomWall = MeshBuilder.CreateBox(
    'bottomBoundary',
    { width: width, height: depth, depth: 1 },
    scene
  );
  bottomWall.position.y = -height / 2;
  bottomWall.material = invisibleMat;
  bottomWall.isVisible = false;

  return [topWall, bottomWall];
}

/**
 * Creates ball visual effects (glow and inner sphere)
 * OPTIMIZATION: Simpler effects with better performance
 */
function setupBallVisualEffects(ballMesh: any, baseColor: Color3, scene: Scene) {
  // Collection of disposable items
  const disposables: any[] = [];

  // Save original material properties
  const originalEmissiveColor = ballMesh.material.emissiveColor.clone();
  const originalEmissiveIntensity = ballMesh.material.emissiveIntensity;

  // Enhanced ball glow - SHARED glow layer for better performance
  const ballGlow = new GlowLayer('ballElectricGlow', scene, {
    mainTextureFixedSize: 512, // Lower resolution for better performance
    blurKernelSize: 16, // Reduced blur kernel size
  });

  ballGlow.intensity = 0.8; // Reduced intensity
  ballGlow.addIncludedOnlyMesh(ballMesh);
  disposables.push(ballGlow);

  // Don't modify the ball's material - keep its original appearance
  // Just use the original values instead of enhancing them

  // Create an inner ball glow effect that's much more subtle
  const glowSphere = MeshBuilder.CreateSphere(
    'ballGlow',
    { diameter: ballMesh.getBoundingInfo().boundingSphere.radius * 1.2, segments: 12 }, // Reduced size
    scene
  );
  glowSphere.position = ballMesh.position.clone();
  glowSphere.parent = ballMesh; // Make it follow the ball

  const glowMaterial = new StandardMaterial('glowMaterial', scene);
  glowMaterial.emissiveColor = new Color3(baseColor.r * 0.6, baseColor.g * 0.4, baseColor.b * 0.4); // Reduced intensity
  glowMaterial.alpha = 0.3; // More transparent
  glowMaterial.disableLighting = true;
  glowSphere.material = glowMaterial;
  disposables.push(glowSphere);

  // Additional point light that flickers with electricity
  const electricLight = new PointLight('electricLight', ballMesh.position.clone(), scene);
  electricLight.diffuse = new Color3(baseColor.r * 1.2, baseColor.g * 1.2, baseColor.b * 1.2);
  electricLight.intensity = 0.4; // Reduced intensity
  electricLight.range = 6; // Reduced range for better performance
  disposables.push(electricLight);

  return {
    disposables,
    glowSphere,
    glowMaterial,
    electricLight,
    originalEmissiveColor,
    originalEmissiveIntensity,
    sharedGlowLayer: ballGlow, // Make glow layer accessible
  };
}

/**
 * OPTIMIZATION: Simplified target selection with fewer options
 * Finds potential targets for electric arcs within range and distributed in 360°
 */
function getTargetsInRange(ballMesh: any, scene: Scene, maxRange: number = 7) {
  // Reduced range
  const targets: Array<{ mesh: any; point: Vector3 }> = [];

  // OPTIMIZATION: Reduced number of sectors
  const sectorCount = 6; // Reduced from 8
  const sectorAngle = (Math.PI * 2) / sectorCount;

  // Get only essential target meshes - OPTIMIZATION: Filter more aggressively
  const potentialTargets = scene.meshes.filter(
    (mesh) =>
      mesh !== ballMesh &&
      !mesh.name.includes('Glow') &&
      !mesh.name.includes('arc') &&
      !mesh.name.includes('line') &&
      (mesh.name.includes('paddle') ||
        mesh.name.includes('floor') ||
        mesh.name.includes('Boundary'))
  );

  // For each sector, try to find targets (with lower probabilities)
  for (let sector = 0; sector < sectorCount; sector++) {
    // Skip some sectors randomly for performance
    if (Math.random() < 0.4) continue;

    // Base angle for this sector
    const baseAngle = sector * sectorAngle;

    // First, try to find game objects in this direction
    let foundObjectInSector = false;

    // Check for game objects in this sector (with more restrictive conditions)
    for (const target of potentialTargets) {
      // Skip very small objects
      if (!target.getBoundingInfo) continue;

      // Get vector from ball to target
      const toTarget = target.position.subtract(ballMesh.position);
      const distance = toTarget.length();

      // Skip if too far
      if (distance > maxRange) continue;

      // OPTIMIZATION: More strict filtering - higher probability to skip
      if (Math.random() < 0.7) continue;

      // Calculate angle to target
      const angleToTarget = Math.atan2(toTarget.y, toTarget.x);

      // Check if target is within this sector
      const angleDiff = Math.abs(
        ((angleToTarget - baseAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI
      );
      if (angleDiff > sectorAngle / 2) continue;

      // Now the target is in our sector and in range
      foundObjectInSector = true;

      // OPTIMIZATION: Stricter connection probability to reduce number of arcs
      const connectionProbability = 0.4 - (distance / maxRange) * 0.3;
      if (Math.random() > connectionProbability) continue;

      // Calculate a simplified connection point
      let connectionPoint;

      // Simplified connection logic based on target type
      if (target.name === 'floor') {
        connectionPoint = new Vector3(
          ballMesh.position.x + toTarget.x * 0.7,
          ballMesh.position.y + toTarget.y * 0.7,
          target.position.z + 0.1
        );
      } else if (target.name.includes('paddle')) {
        const paddleDir = target.position.x > 0 ? 1 : -1;
        connectionPoint = new Vector3(
          target.position.x - paddleDir * 0.25,
          target.position.y + (Math.random() - 0.5) * 1.5, // Simplified calculation
          target.position.z
        );
      } else if (target.name.includes('Boundary')) {
        // Simplified boundary connection
        if (target.name.includes('top') || target.name.includes('bottom')) {
          connectionPoint = new Vector3(ballMesh.position.x, target.position.y, target.position.z);
        } else {
          connectionPoint = new Vector3(target.position.x, ballMesh.position.y, target.position.z);
        }
      } else {
        // Default simple connection point
        connectionPoint = target.position.clone();
      }

      targets.push({
        mesh: target,
        point: connectionPoint,
      });
    }

    // If no object found in this sector, add a free-air target with low probability
    if (!foundObjectInSector && Math.random() < 0.3) {
      // Reduced probability
      // Random distance between 2-3 units (shorter)
      const distance = 2 + Math.random() * 1;

      // Random angle within this sector
      const angle = baseAngle + (Math.random() - 0.5) * sectorAngle;

      // Calculate endpoint
      const endPoint = new Vector3(
        ballMesh.position.x + Math.cos(angle) * distance,
        ballMesh.position.y + Math.sin(angle) * distance,
        ballMesh.position.z
      );

      targets.push({
        mesh: null, // No specific mesh
        point: endPoint,
      });
    }
  }

  return targets;
}

/**
 * Generates a zigzag lightning pattern between two points
 * Simpler 2D version with moderate chaos for top-down view
 */
function generateLightningPoints(start: Vector3, end: Vector3): Vector3[] {
  const points: Vector3[] = [];
  const distance = Vector3.Distance(start, end);

  // More segments for more chaotic pattern
  const segmentCount = Math.max(8, Math.floor(distance * 3));

  // Moderate displacement amount (30% of distance)
  const displacementAmount = distance * 0.3;

  // Vector from start to end
  const direction = end.subtract(start).normalize();

  // Create perpendicular vector for 2D displacement only
  const perpVector = new Vector3(-direction.y, direction.x, 0).normalize();

  // First point is always the start
  points.push(start.clone());

  // Main branch
  let prevPoint = start.clone();
  for (let i = 1; i < segmentCount; i++) {
    const ratio = i / segmentCount;

    // Get point along straight line, but with some variation in progress
    // This creates uneven segment lengths
    const segmentRatio = ratio * (0.8 + Math.random() * 0.4);
    const basePoint = new Vector3(
      start.x + (end.x - start.x) * segmentRatio,
      start.y + (end.y - start.y) * segmentRatio,
      start.z + (end.z - start.z) * segmentRatio
    );

    // Add random displacement in 2D only
    // More displacement in the middle, less at endpoints
    const midPointFactor = 1 - Math.abs((ratio - 0.5) * 2);

    // 2D displacement perpendicular to main direction
    const displacement = (Math.random() - 0.5) * displacementAmount * midPointFactor;

    // Apply displacement in 2D only
    const point = new Vector3(
      basePoint.x + perpVector.x * displacement,
      basePoint.y + perpVector.y * displacement,
      basePoint.z // Keep Z unchanged
    );

    points.push(point);
    prevPoint = point;

    // Randomly add a small branch (20% chance except near start/end)
    if (ratio > 0.3 && ratio < 0.7 && Math.random() < 0.2) {
      // Create branch direction (random angle off main path)
      const branchLength = distance * 0.15 * Math.random();
      const branchDir = new Vector3(
        direction.x + (Math.random() - 0.5) * 2,
        direction.y + (Math.random() - 0.5) * 2,
        0 // Keep Z unchanged for 2D effect
      ).normalize();

      // Add 2-3 points for the branch
      const branchPoints = 2 + Math.floor(Math.random() * 2);
      let branchPrev = point.clone();

      for (let j = 1; j <= branchPoints; j++) {
        const branchRatio = j / branchPoints;
        const branchDisplacement = (Math.random() - 0.5) * branchLength * 0.5;

        const branchPoint = new Vector3(
          branchPrev.x +
            branchDir.x * (branchLength / branchPoints) +
            perpVector.x * branchDisplacement,
          branchPrev.y +
            branchDir.y * (branchLength / branchPoints) +
            perpVector.y * branchDisplacement,
          branchPrev.z // Keep Z unchanged
        );

        points.push(branchPoint);
        branchPrev = branchPoint;
      }

      // Return to original point to continue the main path
      points.push(point.clone());
    }
  }

  // Last point is always the end
  points.push(end.clone());

  return points;
}

/**
 * Creates an electric arc from ball to a target point
 * OPTIMIZATION: Thicker arcs using tubes instead of lines
 */
function createArcLine(
  startPoint: Vector3,
  endPoint: Vector3,
  baseColor: Color3,
  scene: Scene,
  sharedGlowLayer: GlowLayer
) {
  // Calculate points for the zigzag pattern
  const arcPoints = generateLightningPoints(startPoint, endPoint);

  // ENHANCEMENT: Use tube for thicker lightning instead of lines
  const path3d = new Path3D(arcPoints);

  // Create tube mesh for the arc with consistent thickness
  const tubeMesh = MeshBuilder.CreateTube(
    'electricArcTube',
    {
      path: arcPoints,
      radius: 0.045, // 50% thicker than previous 0.03
      tessellation: 5, // Low tessellation for performance
      updatable: true,
    },
    scene
  );

  // Set tube appearance with more variation
  const tubeMaterial = new StandardMaterial('arcMaterial', scene);
  tubeMaterial.emissiveColor = new Color3(
    Math.min(baseColor.r * 1.7 + 0.3, 1),
    Math.min(baseColor.g * 1.7 + 0.3, 1),
    Math.min(baseColor.b * 1.7 + 0.3, 1)
  );
  tubeMaterial.disableLighting = true; // Better for glow effect
  tubeMaterial.alpha = 0.7; // Slightly transparent for better glow effect

  tubeMesh.material = tubeMaterial;

  // Add to shared glow layer
  sharedGlowLayer.addIncludedOnlyMesh(tubeMesh);

  return { arcMesh: tubeMesh, points: arcPoints, path3d };
}

/**
 * Creates a new electric arc connecting the ball to a target
 * OPTIMIZATION: Uses shared resources and simplified calculations
 */
function createNewArc(
  ballMesh: any,
  baseColor: Color3,
  scene: Scene,
  activeArcs: any[],
  sharedGlowLayer: GlowLayer
) {
  // Find potential connection points
  const targets = getTargetsInRange(ballMesh, scene);

  if (targets.length === 0) {
    return null;
  }

  // Choose a random target
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

  // Create a reference for the arc that will be stored in activeArcs
  const arcReference = {
    arcMesh,
    target: targetInfo.mesh,
    targetPoint: targetInfo.point,
    life: 0,
    maxLife: 60 + Math.floor(Math.random() * 60), // Longer lifetime: 1-2 seconds at 60fps
    points,
    path3d,
    updateFunction: null as any, // Will be set below
  };

  // Create update function for this arc
  const updateArcLine = () => {
    // Get current ball position as the new starting point
    const currentStartPoint = ballMesh.position.clone();

    // Always update first point to match ball position
    arcReference.points[0] = currentStartPoint;

    // OPTIMIZATION: Regenerate less frequently - only 10% chance per frame
    const shouldRegenerate =
      Math.random() < 0.1 || Vector3.Distance(currentStartPoint, startPoint) > 0.2;

    if (shouldRegenerate) {
      try {
        // Generate new points using current ball position
        const newPoints = generateLightningPoints(currentStartPoint, endPoint);

        // Update the entire path
        // Update the entire path with consistent thickness
        MeshBuilder.CreateTube(
          'electricArcTube',
          {
            path: newPoints,
            radius: 0.045, // 50% thicker than previous 0.03
            tessellation: 5,
            instance: arcReference.arcMesh,
          },
          scene
        );

        // Update references
        arcReference.points = newPoints;
      } catch (err) {
        console.error('Error updating arc tube:', err);
        return true; // Signal to remove this arc due to error
      }
    } else {
      // OPTIMIZATION: For frames where we don't regenerate, just update the first point
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

    // Random chance to disappear - higher for free-air arcs
    const disappearChance = arcReference.target ? 0.05 : 0.1; // Increased for better performance
    if (Math.random() < disappearChance) {
      return true; // Signal to remove this arc
    }

    return false; // Keep this arc alive
  };

  // Assign the update function to our arc reference
  arcReference.updateFunction = updateArcLine;

  // Add to tracking array
  activeArcs.push(arcReference);

  return arcReference;
}

/**
 * Updates all active arcs and removes finished ones
 * OPTIMIZATION: Simplified update logic
 */
function updateArcs(activeArcs: any[], electricLight: PointLight, ballMesh: any) {
  // Update each active arc and remove dead ones
  for (let i = activeArcs.length - 1; i >= 0; i--) {
    const arc = activeArcs[i];
    arc.life++;

    // Check if arc should be removed
    const shouldRemove = arc.life > arc.maxLife || arc.updateFunction();

    if (shouldRemove) {
      arc.arcMesh.dispose();
      activeArcs.splice(i, 1);
    }
  }

  // Update light intensity based on number of active arcs (capped for performance)
  electricLight.intensity = 0.3 + Math.min(activeArcs.length * 0.05, 0.3);
}

/**
 * Updates the visual effects of the ball (glow, flicker)
 * OPTIMIZATION: Simplified effect calculations
 */
function updateBallEffects(
  ballMesh: any,
  glowSphere: Mesh,
  glowMaterial: StandardMaterial,
  electricLight: PointLight
) {
  // Update positions to follow the ball
  electricLight.position = ballMesh.position.clone();

  // The glowSphere should already follow because it's parented to the ball,
  // but we can ensure its position is updated correctly
  if (!glowSphere.parent) {
    glowSphere.position = ballMesh.position.clone();
  }

  // OPTIMIZATION: Less frequent/intense random flicker
  if (Math.random() < 0.2) {
    // Only update 20% of frames
    // Subtle light flicker without affecting the ball material
    electricLight.intensity = 0.3 + Math.random() * 0.2;
    glowMaterial.alpha = 0.2 + Math.random() * 0.15;
  }
}

/**
 * Creates a Tesla ball effect with electric arcs
 * OPTIMIZATION: Fewer arcs, shared resources, thicker appearance
 */
export function ballSparkEffect(ballMesh: any, color: Color3, scene: Scene) {
  console.log('📣 Creating Optimized Tesla ball effect', ballMesh.name);

  // Collection of all effects for cleanup
  const disposables: any[] = [];

  // Create invisible walls representing canvas boundaries for arc attachment
  const canvasEdges = createCanvasBoundaries(scene);
  disposables.push(...canvasEdges);

  // Setup ball visual effects
  const {
    disposables: ballEffectsDisposables,
    glowSphere,
    glowMaterial,
    electricLight,
    originalEmissiveColor,
    originalEmissiveIntensity,
    sharedGlowLayer,
  } = setupBallVisualEffects(ballMesh, color, scene);

  // Add ball effect disposables to main disposables array
  disposables.push(...ballEffectsDisposables);

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

  // OPTIMIZATION: Use less frequent updates for non-critical effects
  let frameCounter = 0;

  // Main update function
  const observer = scene.onBeforeRenderObservable.add(() => {
    frameCounter++;

    // Update ball glow and flicker effects
    updateBallEffects(ballMesh, glowSphere, glowMaterial, electricLight);

    // OPTIMIZATION: Skip some frames for arc creation/management
    if (frameCounter % 2 !== 0) return;

    // OPTIMIZATION: Fewer arcs
    const minArcs = 2; // Reduced from 4
    const maxArcs = 4; // Reduced from 8

    // Random chance to create a new arc, higher when fewer arcs exist
    const creationProbability = 0.05 + (minArcs - Math.min(minArcs, activeArcs.length)) * 0.1;

    if (Math.random() < creationProbability && activeArcs.length < maxArcs) {
      const newArc = createNewArc(ballMesh, color, scene, activeArcs, sharedGlowLayer);
      if (newArc) {
        disposables.push(newArc.arcMesh);
      }
    }

    // Update and manage existing arcs
    updateArcs(activeArcs, electricLight, ballMesh);
  });

  // Return cleanup function
  return () => {
    console.log('📣 Cleaning up Tesla ball effect');

    // Restore original ball properties
    ballMesh.material.emissiveColor = originalEmissiveColor;
    ballMesh.material.emissiveIntensity = originalEmissiveIntensity;

    // Remove update observer
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
