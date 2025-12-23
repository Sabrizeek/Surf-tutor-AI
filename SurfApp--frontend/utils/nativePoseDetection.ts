/**
 * Native Pose Detection Utilities
 * JavaScript implementation of stability score and pose processing
 * Ported from Python MediaPipe implementation
 */

import { PoseLandmarks } from './poseDetection';

/**
 * Calculate stability score based on variance of hip and shoulder landmarks
 * Returns a score from 0.0 to 1.0, where 1.0 is most stable
 * Ported from Python implementation
 */
export function calculateStabilityScore(landmarks: PoseLandmarks): number {
  if (!landmarks) {
    return 0.0;
  }
  
  // Key landmarks for stability calculation
  const keyPoints = ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'] as const;
  const positions: number[][] = [];
  
  for (const key of keyPoints) {
    const landmark = landmarks[key];
    if (landmark && landmark !== null) {
      positions.push([
        landmark.x || 0,
        landmark.y || 0,
        landmark.z || 0
      ]);
    }
  }
  
  if (positions.length < 4) {
    return 0.0;
  }
  
  // Calculate variance for each axis
  const xValues = positions.map(p => p[0]);
  const yValues = positions.map(p => p[1]);
  const zValues = positions.map(p => p[2]);
  
  const xVariance = calculateVariance(xValues);
  const yVariance = calculateVariance(yValues);
  const zVariance = calculateVariance(zValues);
  
  // Lower variance = more stable
  // Normalize: variance of 0.01 = score of 0.5, variance of 0.001 = score of 0.95
  // Use exponential decay for scoring
  const xScore = Math.exp(-xVariance * 50);
  const yScore = Math.exp(-yVariance * 50);
  const zScore = Math.exp(-zVariance * 50);
  
  // Average the scores
  const stabilityScore = (xScore + yScore + zScore) / 3.0;
  
  // Clamp to [0, 1]
  return Math.max(0.0, Math.min(1.0, stabilityScore));
}

/**
 * Calculate variance of an array of numbers
 */
function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDifferences = values.map(val => Math.pow(val - mean, 2));
  return squaredDifferences.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Convert native pose detection result to our PoseLandmarks format
 */
export function convertNativePoseToLandmarks(nativePose: any): PoseLandmarks | null {
  if (!nativePose || !nativePose.landmarks) {
    return null;
  }
  
  const landmarks = nativePose.landmarks;
  
  // Map native landmarks to our format
  // Note: The exact mapping depends on the native plugin's output format
  return {
    nose: landmarks.nose ? {
      x: landmarks.nose.x,
      y: landmarks.nose.y,
      z: landmarks.nose.z || 0,
      visibility: landmarks.nose.visibility || 1.0
    } : undefined,
    leftEye: landmarks.leftEye ? {
      x: landmarks.leftEye.x,
      y: landmarks.leftEye.y,
      z: landmarks.leftEye.z || 0,
      visibility: landmarks.leftEye.visibility || 1.0
    } : undefined,
    rightEye: landmarks.rightEye ? {
      x: landmarks.rightEye.x,
      y: landmarks.rightEye.y,
      z: landmarks.rightEye.z || 0,
      visibility: landmarks.rightEye.visibility || 1.0
    } : undefined,
    leftEar: landmarks.leftEar ? {
      x: landmarks.leftEar.x,
      y: landmarks.leftEar.y,
      z: landmarks.leftEar.z || 0,
      visibility: landmarks.leftEar.visibility || 1.0
    } : undefined,
    rightEar: landmarks.rightEar ? {
      x: landmarks.rightEar.x,
      y: landmarks.rightEar.y,
      z: landmarks.rightEar.z || 0,
      visibility: landmarks.rightEar.visibility || 1.0
    } : undefined,
    leftShoulder: landmarks.leftShoulder ? {
      x: landmarks.leftShoulder.x,
      y: landmarks.leftShoulder.y,
      z: landmarks.leftShoulder.z || 0,
      visibility: landmarks.leftShoulder.visibility || 1.0
    } : undefined,
    rightShoulder: landmarks.rightShoulder ? {
      x: landmarks.rightShoulder.x,
      y: landmarks.rightShoulder.y,
      z: landmarks.rightShoulder.z || 0,
      visibility: landmarks.rightShoulder.visibility || 1.0
    } : undefined,
    leftElbow: landmarks.leftElbow ? {
      x: landmarks.leftElbow.x,
      y: landmarks.leftElbow.y,
      z: landmarks.leftElbow.z || 0,
      visibility: landmarks.leftElbow.visibility || 1.0
    } : undefined,
    rightElbow: landmarks.rightElbow ? {
      x: landmarks.rightElbow.x,
      y: landmarks.rightElbow.y,
      z: landmarks.rightElbow.z || 0,
      visibility: landmarks.rightElbow.visibility || 1.0
    } : undefined,
    leftWrist: landmarks.leftWrist ? {
      x: landmarks.leftWrist.x,
      y: landmarks.leftWrist.y,
      z: landmarks.leftWrist.z || 0,
      visibility: landmarks.leftWrist.visibility || 1.0
    } : undefined,
    rightWrist: landmarks.rightWrist ? {
      x: landmarks.rightWrist.x,
      y: landmarks.rightWrist.y,
      z: landmarks.rightWrist.z || 0,
      visibility: landmarks.rightWrist.visibility || 1.0
    } : undefined,
    leftHip: landmarks.leftHip ? {
      x: landmarks.leftHip.x,
      y: landmarks.leftHip.y,
      z: landmarks.leftHip.z || 0,
      visibility: landmarks.leftHip.visibility || 1.0
    } : undefined,
    rightHip: landmarks.rightHip ? {
      x: landmarks.rightHip.x,
      y: landmarks.rightHip.y,
      z: landmarks.rightHip.z || 0,
      visibility: landmarks.rightHip.visibility || 1.0
    } : undefined,
    leftKnee: landmarks.leftKnee ? {
      x: landmarks.leftKnee.x,
      y: landmarks.leftKnee.y,
      z: landmarks.leftKnee.z || 0,
      visibility: landmarks.leftKnee.visibility || 1.0
    } : undefined,
    rightKnee: landmarks.rightKnee ? {
      x: landmarks.rightKnee.x,
      y: landmarks.rightKnee.y,
      z: landmarks.rightKnee.z || 0,
      visibility: landmarks.rightKnee.visibility || 1.0
    } : undefined,
    leftAnkle: landmarks.leftAnkle ? {
      x: landmarks.leftAnkle.x,
      y: landmarks.leftAnkle.y,
      z: landmarks.leftAnkle.z || 0,
      visibility: landmarks.leftAnkle.visibility || 1.0
    } : undefined,
    rightAnkle: landmarks.rightAnkle ? {
      x: landmarks.rightAnkle.x,
      y: landmarks.rightAnkle.y,
      z: landmarks.rightAnkle.z || 0,
      visibility: landmarks.rightAnkle.visibility || 1.0
    } : undefined,
  };
}

/**
 * Native pose detection options
 */
export interface NativePoseDetectionOptions {
  modelComplexity: 0 | 1 | 2; // 0=fastest, 1=balanced, 2=most accurate
  enableSegmentation: boolean;
  smoothLandmarks: boolean;
  minDetectionConfidence: number;
  minTrackingConfidence: number;
}

/**
 * Default options for high-accuracy pose detection
 */
export const DEFAULT_POSE_OPTIONS: NativePoseDetectionOptions = {
  modelComplexity: 2, // Maximum accuracy for surf coaching
  enableSegmentation: false, // Disable for performance
  smoothLandmarks: true, // Enable for stable tracking
  minDetectionConfidence: 0.3, // Lowered for better sensitivity
  minTrackingConfidence: 0.3, // Lowered for better tracking
};
