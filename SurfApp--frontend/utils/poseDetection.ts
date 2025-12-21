/**
 * Pose Detection Utility
 * Provides pose analysis functions for surf drills
 * Uses landmark-based detection similar to MediaPipe Pose
 */

export interface PoseLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface PoseLandmarks {
  // Face
  nose?: PoseLandmark;
  leftEye?: PoseLandmark;
  rightEye?: PoseLandmark;
  leftEar?: PoseLandmark;
  rightEar?: PoseLandmark;
  
  // Upper body
  leftShoulder?: PoseLandmark;
  rightShoulder?: PoseLandmark;
  leftElbow?: PoseLandmark;
  rightElbow?: PoseLandmark;
  leftWrist?: PoseLandmark;
  rightWrist?: PoseLandmark;
  
  // Torso
  leftHip?: PoseLandmark;
  rightHip?: PoseLandmark;
  
  // Lower body
  leftKnee?: PoseLandmark;
  rightKnee?: PoseLandmark;
  leftAnkle?: PoseLandmark;
  rightAnkle?: PoseLandmark;
}

export interface PoseAnalysisResult {
  personDetected: boolean;
  confidence: number; // 0-1
  feedback: string[];
  score: number; // 0-100
  keypoints: {
    [key: string]: {
      detected: boolean;
      confidence: number;
    };
  };
}

// Confidence thresholds - ULTRA STRICT for zero false positives
const MIN_DETECTION_CONFIDENCE = 0.7;
const MIN_TRACKING_CONFIDENCE = 0.7;
const MIN_VISIBILITY_THRESHOLD = 0.75; // Strict threshold: require 0.75 visibility
const REQUIRED_KEYPOINTS_COUNT = 9; // Require at least 9 keypoints for human detection

/**
 * Check if a person is detected in the frame
 * 
 * This function performs ULTRA STRICT validation to ensure a human body is actually visible
 * before allowing pose analysis and scoring. Zero false positives.
 */
export function isPersonDetected(landmarks: PoseLandmarks): boolean {
  // Step 1: Check for at least 9 keypoints with visibility >= 0.75
  const requiredKeypoints = [
    landmarks.nose,
    landmarks.leftShoulder,
    landmarks.rightShoulder,
    landmarks.leftElbow,
    landmarks.rightElbow,
    landmarks.leftHip,
    landmarks.rightHip,
    landmarks.leftKnee,
    landmarks.rightKnee,
  ];

  // Count points that are both present and have sufficient visibility
  const detectedPoints = requiredKeypoints.filter(
    (point) =>
      point &&
      point.visibility !== undefined &&
      point.visibility >= MIN_VISIBILITY_THRESHOLD
  );

  // STRICT: Need at least 9 keypoints (all required points) to consider person detected
  if (detectedPoints.length < REQUIRED_KEYPOINTS_COUNT) {
    return false;
  }

  // Step 2: Geometric body validation
  const lShoulder = landmarks.leftShoulder;
  const rShoulder = landmarks.rightShoulder;
  const lHip = landmarks.leftHip;
  const rHip = landmarks.rightHip;
  const lElbow = landmarks.leftElbow;
  const rElbow = landmarks.rightElbow;
  const lKnee = landmarks.leftKnee;
  const rKnee = landmarks.rightKnee;

  if (!lShoulder || !rShoulder || !lHip || !rHip) {
    return false;
  }

  // Check 1: Shoulders must be roughly horizontal (abs(yL - yR) < 0.1)
  const shoulderVerticalDiff = Math.abs(lShoulder.y - rShoulder.y);
  if (shoulderVerticalDiff >= 0.1) {
    // Shoulders are too misaligned - likely not a person
    return false;
  }

  // Check 2: Hips must be clearly below shoulders (avgY_hips > avgY_shoulders + 0.15)
  const avgShoulderY = (lShoulder.y + rShoulder.y) / 2;
  const avgHipY = (lHip.y + rHip.y) / 2;
  if (avgHipY <= avgShoulderY + 0.15) {
    // Hips should be clearly below shoulders - if not, detection is likely wrong
    return false;
  }

  // Check 3: Shoulder-to-hip distance must be realistic (0.2-0.6 of frame height)
  // Since landmarks are normalized (0-1), we check the vertical distance
  const shoulderToHipDistance = avgHipY - avgShoulderY;
  if (shoulderToHipDistance < 0.2 || shoulderToHipDistance > 0.6) {
    // Body proportions not realistic
    return false;
  }

  // Check 4: Shoulder width must be realistic (not too close or too far)
  const shoulderWidth = Math.abs(lShoulder.x - rShoulder.x);
  if (shoulderWidth < 0.05 || shoulderWidth > 0.4) {
    // Shoulders too close or too far - likely not a person
    return false;
  }

  // Check 5: Body shape consistency - elbows should be between shoulders and hips
  if (lElbow && rElbow) {
    const avgElbowY = (lElbow.y + rElbow.y) / 2;
    if (avgElbowY < avgShoulderY || avgElbowY > avgHipY) {
      // Elbows in wrong position - body shape inconsistent
      return false;
    }
  }

  // Check 6: Knees should be below hips
  if (lKnee && rKnee) {
    const avgKneeY = (lKnee.y + rKnee.y) / 2;
    if (avgKneeY <= avgHipY) {
      // Knees should be below hips
      return false;
    }
  }

  return true;
}

/**
 * Calculate angle between three points
 */
export function calculateAngle(
  point1: PoseLandmark,
  point2: PoseLandmark,
  point3: PoseLandmark
): number {
  const radians =
    Math.atan2(point3.y - point2.y, point3.x - point2.x) -
    Math.atan2(point1.y - point2.y, point1.x - point2.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  return angle > 180.0 ? 360 - angle : angle;
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(
  point1: PoseLandmark,
  point2: PoseLandmark
): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Get landmark coordinates safely
 */
export function getLandmark(
  landmarks: PoseLandmarks,
  key: keyof PoseLandmarks
): PoseLandmark | null {
  const landmark = landmarks[key];
  if (
    !landmark ||
    (landmark.visibility !== undefined &&
      landmark.visibility < MIN_VISIBILITY_THRESHOLD)
  ) {
    return null;
  }
  return landmark;
}

/**
 * Analyze stance drill
 */
export function analyzeStance(landmarks: PoseLandmarks): PoseAnalysisResult {
  const feedback: string[] = [];
  let score = 0;
  const keypoints: { [key: string]: { detected: boolean; confidence: number } } = {};

  // Check required landmarks
  const lShoulder = getLandmark(landmarks, 'leftShoulder');
  const rShoulder = getLandmark(landmarks, 'rightShoulder');
  const lHip = getLandmark(landmarks, 'leftHip');
  const rHip = getLandmark(landmarks, 'rightHip');
  const lKnee = getLandmark(landmarks, 'leftKnee');
  const rKnee = getLandmark(landmarks, 'rightKnee');
  const lAnkle = getLandmark(landmarks, 'leftAnkle');
  const rAnkle = getLandmark(landmarks, 'rightAnkle');

  if (!lShoulder || !rShoulder || !lHip || !rHip || !lKnee || !rKnee || !lAnkle || !rAnkle) {
    return {
      personDetected: false,
      confidence: 0,
      feedback: ['Ensure full body is visible'],
      score: 0,
      keypoints: {},
    };
  }

  // Calculate angles
  const leftKneeAngle = calculateAngle(lHip, lKnee, lAnkle);
  const rightKneeAngle = calculateAngle(rHip, rKnee, rAnkle);
  const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

  const leftHipAngle = calculateAngle(lShoulder, lHip, lKnee);
  const rightHipAngle = calculateAngle(rShoulder, rHip, rKnee);
  const avgHipAngle = (leftHipAngle + rightHipAngle) / 2;

  // Stance requirements: knee 90-140 deg, hip 140-170 deg
  const STANCE_KNEE_MIN = 90;
  const STANCE_KNEE_MAX = 140;
  const STANCE_HIP_MIN = 140;
  const STANCE_HIP_MAX = 170;

  const kneeCorrect = avgKneeAngle >= STANCE_KNEE_MIN && avgKneeAngle <= STANCE_KNEE_MAX;
  const hipCorrect = avgHipAngle >= STANCE_HIP_MIN && avgHipAngle <= STANCE_HIP_MAX;

  keypoints.knee = { detected: true, confidence: kneeCorrect ? 1 : 0.5 };
  keypoints.hip = { detected: true, confidence: hipCorrect ? 1 : 0.5 };

  if (kneeCorrect && hipCorrect) {
    feedback.push('GREAT STANCE!');
    score = 95;
  } else {
    if (!kneeCorrect) {
      if (avgKneeAngle < STANCE_KNEE_MIN) {
        feedback.push('Bend knees more');
      } else {
        feedback.push('Straighten knees slightly');
      }
    }
    if (!hipCorrect) {
      if (avgHipAngle < STANCE_HIP_MIN) {
        feedback.push('Hinge at hips more');
      } else {
        feedback.push('Straighten hips slightly');
      }
    }
    score = (kneeCorrect ? 50 : 0) + (hipCorrect ? 45 : 0);
  }

  return {
    personDetected: true,
    confidence: 0.9,
    feedback,
    score: Math.round(score),
    keypoints,
  };
}

/**
 * Analyze pop-up drill
 */
export function analyzePopUp(landmarks: PoseLandmarks, previousStage?: string): PoseAnalysisResult {
  const feedback: string[] = [];
  let score = 0;

  const lShoulder = getLandmark(landmarks, 'leftShoulder');
  const lHip = getLandmark(landmarks, 'leftHip');
  const lKnee = getLandmark(landmarks, 'leftKnee');
  const lElbow = getLandmark(landmarks, 'leftElbow');
  const lWrist = getLandmark(landmarks, 'leftWrist');
  const rElbow = getLandmark(landmarks, 'rightElbow');
  const rWrist = getLandmark(landmarks, 'rightWrist');

  if (!lShoulder || !lHip || !lKnee || !lElbow || !lWrist || !rElbow || !rWrist) {
    return {
      personDetected: false,
      confidence: 0,
      feedback: ['Ensure full body is visible'],
      score: 0,
      keypoints: {},
    };
  }

  const hipAngle = calculateAngle(lShoulder, lHip, lKnee);
  const DOWN_HIP_MIN = 160;

  if (hipAngle > DOWN_HIP_MIN) {
    // Check push-up stage
    const lElbowAngle = calculateAngle(lShoulder, lElbow, lWrist);
    const rElbowAngle = calculateAngle(landmarks.rightShoulder!, rElbow, rWrist);
    const PUSH_ELBOW_MAX = 100;

    if (lElbowAngle < PUSH_ELBOW_MAX && rElbowAngle < PUSH_ELBOW_MAX) {
      feedback.push('Now JUMP to your feet!');
      score = 70;
    } else {
      feedback.push('Push with your arms!');
      score = 40;
    }
  } else {
    feedback.push('Straighten your body');
    score = 20;
  }

  return {
    personDetected: true,
    confidence: 0.85,
    feedback,
    score: Math.round(score),
    keypoints: {},
  };
}

/**
 * Analyze paddling drill
 */
export function analyzePaddling(landmarks: PoseLandmarks): PoseAnalysisResult {
  const feedback: string[] = [];
  let score = 0;

  const lEar = getLandmark(landmarks, 'leftEar');
  const lShoulder = getLandmark(landmarks, 'leftShoulder');
  const lHip = getLandmark(landmarks, 'leftHip');
  const nose = getLandmark(landmarks, 'nose');
  const rShoulder = getLandmark(landmarks, 'rightShoulder');

  if (!lEar || !lShoulder || !lHip || !nose || !rShoulder) {
    return {
      personDetected: false,
      confidence: 0,
      feedback: ['Ensure torso and head visible'],
      score: 0,
      keypoints: {},
    };
  }

  const backArchAngle = calculateAngle(lEar, lShoulder, lHip);
  const PADDLE_ARCH_MAX = 165;
  const backIsArched = backArchAngle < PADDLE_ARCH_MAX;

  const shoulderY = (lShoulder.y + rShoulder.y) / 2;
  const headIsUp = nose.y < shoulderY;

  if (backIsArched && headIsUp) {
    feedback.push('GOOD PADDLE POSTURE!');
    score = 95;
  } else {
    if (!backIsArched) {
      feedback.push('Lift your chest and head!');
    }
    if (!headIsUp) {
      feedback.push('Look forward!');
    }
    score = (backIsArched ? 50 : 0) + (headIsUp ? 45 : 0);
  }

  return {
    personDetected: true,
    confidence: 0.9,
    feedback,
    score: Math.round(score),
    keypoints: {},
  };
}

/**
 * Analyze bottom turn drill
 */
export function analyzeBottomTurn(landmarks: PoseLandmarks): PoseAnalysisResult {
  const feedback: string[] = [];
  let score = 0;

  const lShoulder = getLandmark(landmarks, 'leftShoulder');
  const rShoulder = getLandmark(landmarks, 'rightShoulder');
  const lHip = getLandmark(landmarks, 'leftHip');
  const rHip = getLandmark(landmarks, 'rightHip');
  const lKnee = getLandmark(landmarks, 'leftKnee');
  const rKnee = getLandmark(landmarks, 'rightKnee');
  const lAnkle = getLandmark(landmarks, 'leftAnkle');
  const rAnkle = getLandmark(landmarks, 'rightAnkle');

  if (!lShoulder || !rShoulder || !lHip || !rHip || !lKnee || !rKnee || !lAnkle || !rAnkle) {
    return {
      personDetected: false,
      confidence: 0,
      feedback: ['Ensure full body is visible'],
      score: 0,
      keypoints: {},
    };
  }

  const leftKneeAngle = calculateAngle(lHip, lKnee, lAnkle);
  const rightKneeAngle = calculateAngle(rHip, rKnee, rAnkle);
  const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

  const TURN_KNEE_MAX = 120;
  const kneesCompressed = avgKneeAngle < TURN_KNEE_MAX;

  const shoulderWidth = Math.abs(lShoulder.x - rShoulder.x);
  const shouldersRotated = shoulderWidth < 0.15;

  if (kneesCompressed && shouldersRotated) {
    feedback.push('GOOD TURN POSTURE!');
    score = 95;
  } else {
    if (!kneesCompressed) {
      feedback.push('Bend knees DEEPER!');
    }
    if (!shouldersRotated) {
      feedback.push('Rotate shoulders more!');
    }
    score = (kneesCompressed ? 50 : 0) + (shouldersRotated ? 45 : 0);
  }

  return {
    personDetected: true,
    confidence: 0.9,
    feedback,
    score: Math.round(score),
    keypoints: {},
  };
}

/**
 * Analyze pumping drill
 */
export function analyzePumping(
  landmarks: PoseLandmarks,
  previousState?: 'HIGH' | 'LOW'
): PoseAnalysisResult {
  const feedback: string[] = [];
  let score = 0;

  const lHip = getLandmark(landmarks, 'leftHip');
  const rHip = getLandmark(landmarks, 'rightHip');
  const lKnee = getLandmark(landmarks, 'leftKnee');
  const rKnee = getLandmark(landmarks, 'rightKnee');
  const lAnkle = getLandmark(landmarks, 'leftAnkle');
  const rAnkle = getLandmark(landmarks, 'rightAnkle');

  if (!lHip || !rHip || !lKnee || !rKnee || !lAnkle || !rAnkle) {
    return {
      personDetected: false,
      confidence: 0,
      feedback: ['Ensure legs are visible'],
      score: 0,
      keypoints: {},
    };
  }

  const leftKneeAngle = calculateAngle(lHip, lKnee, lAnkle);
  const rightKneeAngle = calculateAngle(rHip, rKnee, rAnkle);
  const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

  const PUMP_KNEE_LOW_MAX = 110;
  const PUMP_KNEE_HIGH_MIN = 140;

  const currentState = avgKneeAngle < PUMP_KNEE_LOW_MAX ? 'LOW' : 'HIGH';

  if (previousState && currentState !== previousState) {
    // Transition detected - good pumping motion
    feedback.push('Good pumping motion!');
    score = 85;
  } else if (currentState === 'HIGH') {
    feedback.push('Action: Compress DOWN!');
    score = 50;
  } else {
    feedback.push('Action: Extend UP!');
    score = 50;
  }

  return {
    personDetected: true,
    confidence: 0.85,
    feedback,
    score: Math.round(score),
    keypoints: {},
  };
}

/**
 * Analyze tube stance drill
 */
export function analyzeTubeStance(landmarks: PoseLandmarks): PoseAnalysisResult {
  const feedback: string[] = [];
  let score = 0;

  const lHip = getLandmark(landmarks, 'leftHip');
  const rHip = getLandmark(landmarks, 'rightHip');
  const lKnee = getLandmark(landmarks, 'leftKnee');
  const rKnee = getLandmark(landmarks, 'rightKnee');
  const lAnkle = getLandmark(landmarks, 'leftAnkle');
  const rAnkle = getLandmark(landmarks, 'rightAnkle');
  const lShoulder = getLandmark(landmarks, 'leftShoulder');
  const rShoulder = getLandmark(landmarks, 'rightShoulder');

  if (!lHip || !rHip || !lKnee || !rKnee || !lAnkle || !rAnkle || !lShoulder || !rShoulder) {
    return {
      personDetected: false,
      confidence: 0,
      feedback: ['Ensure full body is visible'],
      score: 0,
      keypoints: {},
    };
  }

  const leftKneeAngle = calculateAngle(lHip, lKnee, lAnkle);
  const rightKneeAngle = calculateAngle(rHip, rKnee, rAnkle);
  const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

  const leftHipAngle = calculateAngle(lShoulder, lHip, lKnee);
  const rightHipAngle = calculateAngle(rShoulder, rHip, rKnee);
  const avgHipAngle = (leftHipAngle + rightHipAngle) / 2;

  const TUBE_KNEE_MAX = 90;
  const TUBE_HIP_MAX = 100;

  const kneesLow = avgKneeAngle < TUBE_KNEE_MAX;
  const hipsLow = avgHipAngle < TUBE_HIP_MAX;

  if (kneesLow && hipsLow) {
    feedback.push('GREAT TUBE STANCE!');
    score = 95;
  } else {
    if (!kneesLow) {
      feedback.push('Get LOWER! Bend knees more!');
    }
    if (!hipsLow) {
      feedback.push('Crouch! Bring chest to knees!');
    }
    score = (kneesLow ? 50 : 0) + (hipsLow ? 45 : 0);
  }

  return {
    personDetected: true,
    confidence: 0.9,
    feedback,
    score: Math.round(score),
    keypoints: {},
  };
}

/**
 * Analyze falling drill
 */
export function analyzeFalling(
  landmarks: PoseLandmarks,
  previousHipMid?: { x: number; y: number }
): PoseAnalysisResult {
  const feedback: string[] = [];
  let score = 0;

  const lHip = getLandmark(landmarks, 'leftHip');
  const rHip = getLandmark(landmarks, 'rightHip');
  const lWrist = getLandmark(landmarks, 'leftWrist');
  const rWrist = getLandmark(landmarks, 'rightWrist');
  const nose = getLandmark(landmarks, 'nose');

  if (!lHip || !rHip || !lWrist || !rWrist || !nose) {
    return {
      personDetected: false,
      confidence: 0,
      feedback: ['Ensure hips, hands and head are visible'],
      score: 0,
      keypoints: {},
    };
  }

  const hipMid = {
    x: (lHip.x + rHip.x) / 2,
    y: (lHip.y + rHip.y) / 2,
  };

  let fallingDetected = false;
  if (previousHipMid) {
    const dx = Math.abs(hipMid.x - previousHipMid.x);
    const dy = hipMid.y - previousHipMid.y;
    if (dx > 0.06 || dy > 0.05) {
      fallingDetected = true;
    }
  }

  const leftDist = calculateDistance(lWrist, nose);
  const rightDist = calculateDistance(rWrist, nose);
  const handsCover = leftDist < 0.12 && rightDist < 0.12;

  if (fallingDetected && handsCover) {
    feedback.push('Safe fall: GOOD');
    score = 95;
  } else {
    if (!fallingDetected) {
      feedback.push('No falling motion detected');
    }
    if (!handsCover) {
      feedback.push('Cover your head!');
    }
    score = (fallingDetected ? 50 : 0) + (handsCover ? 45 : 0);
  }

  return {
    personDetected: true,
    confidence: 0.85,
    feedback,
    score: Math.round(score),
    keypoints: {},
  };
}

/**
 * Analyze cutback drill
 */
export function analyzeCutback(landmarks: PoseLandmarks): PoseAnalysisResult {
  const feedback: string[] = [];
  let score = 0;

  const lShoulder = getLandmark(landmarks, 'leftShoulder');
  const rShoulder = getLandmark(landmarks, 'rightShoulder');
  const lHip = getLandmark(landmarks, 'leftHip');
  const rHip = getLandmark(landmarks, 'rightHip');
  const nose = getLandmark(landmarks, 'nose');
  const lKnee = getLandmark(landmarks, 'leftKnee');
  const rKnee = getLandmark(landmarks, 'rightKnee');
  const lAnkle = getLandmark(landmarks, 'leftAnkle');
  const rAnkle = getLandmark(landmarks, 'rightAnkle');

  if (!lShoulder || !rShoulder || !lHip || !rHip || !nose || !lKnee || !rKnee || !lAnkle || !rAnkle) {
    return {
      personDetected: false,
      confidence: 0,
      feedback: ['Ensure shoulders, hips, head and legs are visible'],
      score: 0,
      keypoints: {},
    };
  }

  // Calculate rotation angle
  const shAng = Math.atan2(rShoulder.y - lShoulder.y, rShoulder.x - lShoulder.x);
  const hipAng = Math.atan2(rHip.y - lHip.y, rHip.x - lHip.x);
  const rotDeg = Math.abs(((shAng - hipAng) * 180.0) / Math.PI);

  const hipMidX = (lHip.x + rHip.x) / 2;
  const noseAhead = Math.abs(nose.x - hipMidX) > 0.05;

  const leftKneeAngle = calculateAngle(lHip, lKnee, lAnkle);
  const rightKneeAngle = calculateAngle(rHip, rKnee, rAnkle);
  const avgKnee = (leftKneeAngle + rightKneeAngle) / 2;
  const STANCE_KNEE_MIN = 90;
  const STANCE_KNEE_MAX = 140;
  const stanceOk = avgKnee >= STANCE_KNEE_MIN && avgKnee <= STANCE_KNEE_MAX;

  if (rotDeg >= 10 && noseAhead && stanceOk) {
    feedback.push('GOOD CUTBACK!');
    score = 95;
  } else {
    if (rotDeg < 10) {
      feedback.push('Turn head and shoulders first!');
    }
    if (!noseAhead) {
      feedback.push('Lead with head toward the turn!');
    }
    if (!stanceOk) {
      feedback.push('Stay low and balanced!');
    }
    score = (rotDeg >= 10 ? 35 : 0) + (noseAhead ? 30 : 0) + (stanceOk ? 30 : 0);
  }

  return {
    personDetected: true,
    confidence: 0.9,
    feedback,
    score: Math.round(score),
    keypoints: {},
  };
}

/**
 * Main pose analysis function
 */
export function analyzePose(
  drillId: string,
  landmarks: PoseLandmarks,
  previousData?: any
): PoseAnalysisResult {
  // First check if person is detected
  if (!isPersonDetected(landmarks)) {
    return {
      personDetected: false,
      confidence: 0,
      feedback: ['No person detected. Step into view.'],
      score: 0,
      keypoints: {},
    };
  }

  // Route to specific drill analysis
  switch (drillId) {
    case 'stance':
      return analyzeStance(landmarks);
    case 'popup':
      return analyzePopUp(landmarks, previousData?.stage);
    case 'paddling':
      return analyzePaddling(landmarks);
    case 'bottom_turn':
      return analyzeBottomTurn(landmarks);
    case 'pumping':
      return analyzePumping(landmarks, previousData?.pumpState);
    case 'tube_stance':
      return analyzeTubeStance(landmarks);
    case 'falling':
      return analyzeFalling(landmarks, previousData?.hipMid);
    case 'cutback':
      return analyzeCutback(landmarks);
    default:
      return {
        personDetected: true,
        confidence: 0.5,
        feedback: ['Drill analysis not available'],
        score: 0,
        keypoints: {},
      };
  }
}

