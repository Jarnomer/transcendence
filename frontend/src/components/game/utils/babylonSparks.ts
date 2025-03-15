import {
  Color3,
  GlowLayer,
  LinesMesh,
  Mesh,
  MeshBuilder,
  PointLight,
  Scene,
  StandardMaterial,
  Vector3,
} from 'babylonjs';

/**
 * Creates invisible boundary planes for edge attachment
 */
function createCanvasBoundaries(scene: Scene): Mesh[] {
  // Define canvas boundaries with generous size
  const width = 50;
  const height = 30;
  const depth = 0.1;

  // Create invisible material
  const invisibleMat = new StandardMaterial('boundaryMat', scene);
  invisibleMat.alpha = 0;

  // Create four edge planes
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

  const leftWall = MeshBuilder.CreateBox(
    'leftBoundary',
    { width: depth, height: height, depth: 1 },
    scene
  );
  leftWall.position.x = -width / 2;
  leftWall.material = invisibleMat;
  leftWall.isVisible = false;

  const rightWall = MeshBuilder.CreateBox(
    'rightBoundary',
    { width: depth, height: height, depth: 1 },
    scene
  );
  rightWall.position.x = width / 2;
  rightWall.material = invisibleMat;
  rightWall.isVisible = false;

  return [topWall, bottomWall, leftWall, rightWall];
}

/**
 * Creates ball visual effects (glow and inner sphere)
 */
function setupBallVisualEffects(ballMesh: any, baseColor: Color3, scene: Scene) {
  // Collection of disposable items
  const disposables: any[] = [];

  // Save original material properties
  const originalEmissiveColor = ballMesh.material.emissiveColor.clone();
  const originalEmissiveIntensity = ballMesh.material.emissiveIntensity;

  // Enhanced ball glow
  const ballGlow = new GlowLayer('ballElectricGlow', scene);
  ballGlow.intensity = 1.5;
  ballGlow.blurKernelSize = 32;
  ballGlow.addIncludedOnlyMesh(ballMesh);
  disposables.push(ballGlow);

  // Plasma core effect - modify ball material
  ballMesh.material.emissiveColor = new Color3(
    baseColor.r * 1.2,
    baseColor.g * 0.5,
    baseColor.b * 0.5
  );
  ballMesh.material.emissiveIntensity = 2.0;

  // Create an inner ball glow effect
  const glowSphere = MeshBuilder.CreateSphere(
    'ballGlow',
    { diameter: ballMesh.getBoundingInfo().boundingSphere.radius * 1.4, segments: 16 },
    scene
  );
  glowSphere.position = ballMesh.position.clone();
  glowSphere.parent = ballMesh; // Make it follow the ball

  const glowMaterial = new StandardMaterial('glowMaterial', scene);
  glowMaterial.emissiveColor = new Color3(baseColor.r * 1.2, baseColor.g * 0.8, baseColor.b * 0.8);
  glowMaterial.alpha = 0.6;
  glowMaterial.disableLighting = true;
  glowSphere.material = glowMaterial;
  disposables.push(glowSphere);

  // Additional point light that flickers with electricity
  const electricLight = new PointLight('electricLight', ballMesh.position.clone(), scene);
  electricLight.diffuse = new Color3(baseColor.r * 1.5, baseColor.g * 1.5, baseColor.b * 1.5);
  electricLight.intensity = 0.8;
  electricLight.range = 10;
  disposables.push(electricLight);

  return {
    disposables,
    glowSphere,
    glowMaterial,
    electricLight,
    originalEmissiveColor,
    originalEmissiveIntensity,
  };
}

/**
 * Finds potential targets for electric arcs within range and distributed in 360°
 */
function getTargetsInRange(ballMesh: any, scene: Scene, maxRange: number = 9) {
  const targets: Array<{ mesh: any; point: Vector3 }> = [];

  // Divide the 360° circle into sectors
  const sectorCount = 8;
  const sectorAngle = (Math.PI * 2) / sectorCount;

  // Get all potential target meshes from scene
  const potentialTargets = scene.meshes.filter(
    (mesh) =>
      mesh !== ballMesh &&
      !mesh.name.includes('ballGlow') &&
      !mesh.name.includes('arc') &&
      !mesh.name.includes('line') &&
      !mesh.name.includes('glow')
  );

  // For each sector, try to find targets
  for (let sector = 0; sector < sectorCount; sector++) {
    // Base angle for this sector
    const baseAngle = sector * sectorAngle;

    // First, try to find game objects in this direction
    let foundObjectInSector = false;

    // Check for game objects in this sector
    for (const target of potentialTargets) {
      // Skip very small objects
      if (!target.getBoundingInfo) continue;

      // Get vector from ball to target
      const toTarget = target.position.subtract(ballMesh.position);
      const distance = toTarget.length();

      // Skip if too far
      if (distance > maxRange) continue;

      // Calculate angle to target
      const angleToTarget = Math.atan2(toTarget.y, toTarget.x);

      // Check if target is within this sector
      const angleDiff = Math.abs(
        ((angleToTarget - baseAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI
      );
      if (angleDiff > sectorAngle / 2) continue;

      // Now the target is in our sector and in range
      foundObjectInSector = true;

      // Don't always connect to every valid target (vary probability based on distance)
      const connectionProbability = 0.7 - (distance / maxRange) * 0.5;
      if (Math.random() > connectionProbability) continue;

      // Calculate a connection point on the target's surface
      const boundingInfo = target.getBoundingInfo();
      const dimensions = boundingInfo.boundingBox.maximumWorld.subtract(
        boundingInfo.boundingBox.minimumWorld
      );

      // Different connection logic based on target type
      let connectionPoint;

      // For large flat objects like the floor, connect to top surface
      if (target.name === 'floor') {
        connectionPoint = new Vector3(
          ballMesh.position.x + toTarget.x * 0.7,
          ballMesh.position.y + toTarget.y * 0.7,
          boundingInfo.boundingBox.maximumWorld.z + 0.1
        );
      }
      // For paddles, connect to closest point on paddle
      else if (target.name.includes('paddle')) {
        const paddleDir = target.position.x > 0 ? 1 : -1;
        connectionPoint = new Vector3(
          target.position.x - paddleDir * 0.25,
          target.position.y + (Math.random() - 0.5) * dimensions.y * 0.8,
          target.position.z + (Math.random() - 0.5) * 0.2
        );
      }
      // For boundaries, connect to edge
      else if (target.name.includes('Boundary')) {
        // Calculate a random point on the boundary
        if (target.name.includes('top') || target.name.includes('bottom')) {
          // For top/bottom boundaries
          connectionPoint = new Vector3(
            ballMesh.position.x + (Math.random() - 0.5) * 5,
            target.position.y,
            target.position.z
          );
        } else {
          // For left/right boundaries
          connectionPoint = new Vector3(
            target.position.x,
            ballMesh.position.y + (Math.random() - 0.5) * 5,
            target.position.z
          );
        }
      }
      // For other objects, use a random point on their bounding box
      else {
        connectionPoint = new Vector3(
          target.position.x + (Math.random() - 0.5) * dimensions.x * 0.8,
          target.position.y + (Math.random() - 0.5) * dimensions.y * 0.8,
          target.position.z + (Math.random() - 0.5) * dimensions.z * 0.8
        );
      }

      targets.push({
        mesh: target,
        point: connectionPoint,
      });
    }

    // If no object found in this sector, add a free-air target
    if (!foundObjectInSector && Math.random() < 0.6) {
      // Random distance between 2-4 units
      const distance = 2 + Math.random() * 2;

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
 */
function generateLightningPoints(start: Vector3, end: Vector3): Vector3[] {
  const points: Vector3[] = [];
  const distance = Vector3.Distance(start, end);

  // More segments for longer distances
  const segmentCount = 5 + Math.floor(distance / 1.5);

  // Base displacement amount - larger for longer arcs
  const displacementAmount = distance * 0.15;

  // First point is always the start
  points.push(start.clone());

  // Generate intermediate points with zigzag pattern
  for (let i = 1; i < segmentCount; i++) {
    const ratio = i / segmentCount;

    // Get point along straight line
    const basePoint = new Vector3(
      start.x + (end.x - start.x) * ratio,
      start.y + (end.y - start.y) * ratio,
      start.z + (end.z - start.z) * ratio
    );

    // Calculate direction perpendicular to line
    const direction = end.subtract(start).normalize();
    const perpVector = new Vector3(
      -direction.y,
      direction.x,
      direction.z * 0.1 // Less variation in Z
    ).normalize();

    // Add random displacement perpendicular to line direction
    // More displacement in the middle, less at endpoints
    const midPointFactor = 1 - Math.abs((ratio - 0.5) * 2);
    const displacement = (Math.random() - 0.5) * displacementAmount * midPointFactor;

    // Apply displacement
    const point = new Vector3(
      basePoint.x + perpVector.x * displacement,
      basePoint.y + perpVector.y * displacement,
      basePoint.z + perpVector.z * displacement * 0.5
    );

    points.push(point);
  }

  // Last point is always the end
  points.push(end.clone());

  return points;
}

/**
 * Creates an electric arc from ball to a target point
 */
function createArcLine(startPoint: Vector3, endPoint: Vector3, baseColor: Color3, scene: Scene) {
  // Calculate points for the zigzag pattern
  const arcPoints = generateLightningPoints(startPoint, endPoint);

  // Create line mesh for the arc
  const lineMesh = MeshBuilder.CreateLines('electricArc', { points: arcPoints }, scene);

  // Set line appearance
  lineMesh.color = new Color3(
    Math.min(baseColor.r * 1.5 + 0.3, 1),
    Math.min(baseColor.g * 1.5 + 0.3, 1),
    Math.min(baseColor.b * 1.5 + 0.3, 1)
  );

  // Create an additional glow layer specifically for this line
  const lineGlow = new GlowLayer(`lineGlow_${Date.now()}`, scene);
  lineGlow.intensity = 1.0;
  lineGlow.blurKernelSize = 16;
  lineGlow.addIncludedOnlyMesh(lineMesh);

  return { lineMesh, lineGlow, points: arcPoints };
}

/**
 * Creates a new electric arc connecting the ball to a target
 */
function createNewArc(ballMesh: any, baseColor: Color3, scene: Scene, activeArcs: any[]) {
  // Find potential connection points
  const targets = getTargetsInRange(ballMesh, scene);

  if (targets.length === 0) {
    return null;
  }

  // Choose a random target
  const targetInfo = targets[Math.floor(Math.random() * targets.length)];
  const startPoint = ballMesh.position.clone();
  const endPoint = targetInfo.point;

  // Create the arc line with glow
  const { lineMesh, lineGlow, points } = createArcLine(startPoint, endPoint, baseColor, scene);

  // Create a reference for the arc that will be stored in activeArcs
  const arcReference = {
    lineMesh,
    target: targetInfo.mesh,
    targetPoint: targetInfo.point,
    life: 0,
    maxLife: 30 + Math.floor(Math.random() * 30), // 0.5-1 second at 60fps
    points,
    lineGlow,
    updateFunction: null as any, // Will be set below
  };

  // Create update function for this arc
  const updateArcLine = () => {
    // Get current ball position as the new starting point
    const currentStartPoint = ballMesh.position.clone();

    // Always update first point to match ball position
    arcReference.points[0] = currentStartPoint;

    // Frequently regenerate the zigzag pattern to make it flicker
    // Also regenerate whenever the ball has moved significantly
    const shouldRegenerate =
      Math.random() < 0.25 || Vector3.Distance(currentStartPoint, startPoint) > 0.1;

    if (shouldRegenerate) {
      try {
        // Generate new points using current ball position
        const newPoints = generateLightningPoints(currentStartPoint, endPoint);

        // Create a replacement line mesh
        const newLineMesh = MeshBuilder.CreateLines('electricArc', { points: newPoints }, scene);

        // Copy properties from old line to new line
        newLineMesh.color = arcReference.lineMesh.color.clone();

        // Update the glow layer to include the new mesh instead of the old one
        if (arcReference.lineGlow) {
          arcReference.lineGlow.removeIncludedOnlyMesh(arcReference.lineMesh);
          arcReference.lineGlow.addIncludedOnlyMesh(newLineMesh);
        }

        // Store old mesh for disposal
        const oldMesh = arcReference.lineMesh;

        // Update the reference directly in our arc object
        arcReference.lineMesh = newLineMesh;
        arcReference.points = newPoints;

        // Now it's safe to dispose of the old line mesh
        oldMesh.dispose();
      } catch (err) {
        console.error('Error updating arc line:', err);
        return true; // Signal to remove this arc due to error
      }
    }

    // Random chance to disappear - higher for free-air arcs
    const disappearChance = arcReference.target ? 0.03 : 0.08;
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
 */
function updateArcs(activeArcs: any[], electricLight: PointLight, ballMesh: any) {
  // Update each active arc and remove dead ones
  for (let i = activeArcs.length - 1; i >= 0; i--) {
    const arc = activeArcs[i];
    arc.life++;

    // If we don't regenerate the line this frame, at least update the first point
    // to follow the ball's position
    if (arc.points && arc.points.length > 0 && arc.lineMesh) {
      const positions = arc.lineMesh.getVerticesData('position');
      if (positions && positions.length >= 3) {
        // Update just the first vertex position to match ball position
        positions[0] = ballMesh.position.x;
        positions[1] = ballMesh.position.y;
        positions[2] = ballMesh.position.z;
        arc.lineMesh.updateVerticesData('position', positions);
      }
    }

    // Check if arc should be removed
    const shouldRemove = arc.life > arc.maxLife || arc.updateFunction();

    if (shouldRemove) {
      if (arc.lineGlow) {
        arc.lineGlow.dispose();
      }
      arc.lineMesh.dispose();
      activeArcs.splice(i, 1);
    }
  }

  // Update light intensity based on number of active arcs
  electricLight.intensity = 0.8 + activeArcs.length * 0.1;
}

/**
 * Updates the visual effects of the ball (glow, flicker)
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

  // Random flicker for ball and light
  electricLight.intensity = 0.8 + Math.random() * 0.4;
  ballMesh.material.emissiveIntensity = 1.8 + Math.random() * 0.4;
  glowMaterial.alpha = 0.4 + Math.random() * 0.2;
}

/**
 * Creates a Tesla ball effect with electric arcs connecting to nearby objects
 * The effect is constant, with arcs emanating in 360 degrees
 */
export function createConstantTeslaBallEffect(ballMesh: any, scene: Scene, baseColor: Color3) {
  console.log('📣 Creating Constant 360° Tesla ball effect', ballMesh.name);

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
  } = setupBallVisualEffects(ballMesh, baseColor, scene);

  // Add ball effect disposables to main disposables array
  disposables.push(...ballEffectsDisposables);

  // Track active electric arcs
  const activeArcs: {
    lineMesh: LinesMesh;
    target: any;
    targetPoint: Vector3;
    life: number;
    maxLife: number;
    points: Vector3[];
    lineGlow?: GlowLayer;
    updateFunction: () => boolean;
  }[] = [];

  // Main update function
  const observer = scene.onBeforeRenderObservable.add(() => {
    // Update ball glow and flicker effects
    updateBallEffects(ballMesh, glowSphere, glowMaterial, electricLight);

    // Maintain a minimum number of arcs by creating new ones if needed
    const minArcs = 4; // Minimum number of arcs to maintain
    const maxArcs = 8; // Maximum number of arcs

    // Random chance to create a new arc, higher when fewer arcs exist
    const creationProbability = 0.1 + (minArcs - Math.min(minArcs, activeArcs.length)) * 0.2;

    if (Math.random() < creationProbability && activeArcs.length < maxArcs) {
      const newArc = createNewArc(ballMesh, baseColor, scene, activeArcs);
      if (newArc) {
        disposables.push(newArc.lineMesh);
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
      if (arc.lineGlow) {
        arc.lineGlow.dispose();
      }
      arc.lineMesh.dispose();
    });

    // Dispose all created resources
    disposables.forEach((item) => {
      if (item && item.dispose) {
        item.dispose();
      }
    });
  };
}

export function ballSparkEffect(ballMesh: any, color: Color3, scene: Scene) {
  return createConstantTeslaBallEffect(ballMesh, scene, color);
}
