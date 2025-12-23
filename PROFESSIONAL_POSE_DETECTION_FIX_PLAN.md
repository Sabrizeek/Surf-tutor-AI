# Professional Pose Detection Fix Plan

## Critical Issues Identified

### 1. Person Detection Not Working
**Problem**: Backend returns landmarks but frontend still shows "No person detected"
- **Root Cause**: `isReadyForAction` logic (line 526-532) is too strict, requiring perfect calibration before showing person
- **Impact**: Users can't see skeleton or get feedback even when landmarks are detected

### 2. UI Blocking Issues
**Problem**: "No person detected" message blocks stop button, camera switch, timer, and back button
- **Root Cause**: `noPersonContainer` positioned at `bottom: 200` with `zIndex: 1` may overlap controls
- **Impact**: Users can't stop practice or access controls

### 3. Drill Switching UI Issues
**Problem**: All drills appear on screen when switching
- **Root Cause**: Side panel visibility logic may not be working correctly during drill transitions
- **Impact**: Confusing UI, drills overlap

### 4. Backend Session ID Missing
**Problem**: `pose_server.py` doesn't pass `session_id` to `detect_pose_from_base64`
- **Root Cause**: Missing parameter in API endpoint
- **Impact**: Velocity tracking not working (Phase 5 feature)

---

## Fix Strategy

### Phase 1: Fix Person Detection Logic (CRITICAL)

**Goal**: Show skeleton and basic feedback even with partial detection

**Changes**:
1. **Relax `isReadyForAction` requirements**:
   - Current: Requires `calibrationStatus === 'ready'`, `detectionQuality > 0.7`, full body completeness, and 70% overlap
   - New: Show skeleton if `detectionStage !== 'none'` (preview/partial/full)
   - Only require full calibration for scoring, not for visualization

2. **Update `personDetected` state logic**:
   - Show skeleton if `detectionStage === 'preview' || detectionStage === 'partial' || detectionStage === 'full'`
   - Only enable scoring when `isReadyForAction` is true
   - Always show skeleton overlay when landmarks exist (even with low confidence)

3. **Improve detection thresholds**:
   - Lower `MIN_VISIBILITY_THRESHOLD` from `0.2` to `0.1` in `poseDetection.ts`
   - Accept landmarks with any visibility > 0.1 for preview mode
   - Show skeleton even with 1-2 keypoints detected

### Phase 2: Fix UI Layout and Z-Index (CRITICAL)

**Goal**: Ensure all critical buttons are always accessible

**Changes**:
1. **Reposition "No person detected" message**:
   - Move from `bottom: 200` to `bottom: 300` (above controls)
   - Reduce size and opacity (make it less intrusive)
   - Ensure `zIndex: 1` (below controls which are `zIndex: 10`)

2. **Add Stop Button to Top-Right**:
   - Create a floating stop button in top-right corner (always visible)
   - Use existing `stopButtonTopRight` style (already defined but not used)
   - Set `zIndex: 20` to ensure it's always on top
   - Make it work even when `personDetected` is false

3. **Ensure all critical controls have proper z-index**:
   - Menu button: `zIndex: 15`
   - Camera toggle: `zIndex: 15`
   - Timer: `zIndex: 15`
   - Stop button (top-right): `zIndex: 20`
   - Stop button (bottom): `zIndex: 10`
   - All with `pointerEvents: 'auto'`

4. **Fix "No person detected" container**:
   - Make it smaller and less intrusive
   - Position it so it doesn't overlap any controls
   - Add `pointerEvents: 'none'` to ensure it doesn't block touches

### Phase 3: Fix Drill Switching Logic

**Goal**: Proper drill menu visibility and transitions

**Changes**:
1. **Hide side panel when recording**:
   - Already implemented (line 1532), but ensure it works correctly
   - Add explicit state reset when switching drills

2. **Fix drill switching flow**:
   - When switching drills while recording, stop current practice first
   - Clear all states before starting new drill
   - Ensure menu is hidden when drill is selected

3. **Improve drill selection menu**:
   - Only show when `!selectedDrill` (no drill selected)
   - Hide immediately when drill is selected
   - Ensure smooth transitions

### Phase 4: Fix Backend Session ID

**Goal**: Enable velocity tracking (Phase 5 feature)

**Changes**:
1. **Update `pose_server.py`**:
   - Add `session_id` parameter to `PoseDetectionRequest`
   - Pass `session_id` to `detect_pose_from_base64`
   - Generate session ID on frontend if not provided

2. **Update frontend API call**:
   - Include `session_id` in pose detection requests
   - Use practice session ID or generate unique ID per session

### Phase 5: Enhance Detection Feedback

**Goal**: Better user guidance for positioning

**Changes**:
1. **Improve calibration status messages**:
   - Show specific guidance based on `calibrationStatus`
   - Display detection quality percentage
   - Show which body parts are missing

2. **Enhance skeleton visualization**:
   - Show skeleton even in preview mode (with lower opacity)
   - Color-code skeleton based on detection stage:
     - Preview: Orange (low opacity)
     - Partial: Yellow (medium opacity)
     - Full: Green (full opacity)

3. **Add detection confidence indicator**:
   - Show confidence percentage in UI
   - Update dynamically as detection improves

---

## Implementation Priority

1. **CRITICAL (Fix Immediately)**:
   - Phase 1: Fix Person Detection Logic
   - Phase 2: Fix UI Layout and Z-Index

2. **HIGH (Fix Soon)**:
   - Phase 3: Fix Drill Switching Logic
   - Phase 4: Fix Backend Session ID

3. **MEDIUM (Enhancement)**:
   - Phase 5: Enhance Detection Feedback

---

## Testing Checklist

After implementing fixes:

- [ ] Person is detected and skeleton shows even with partial detection
- [ ] Stop button is always accessible (top-right and bottom)
- [ ] Camera switch button is always accessible
- [ ] Timer is always visible
- [ ] Back button is always accessible
- [ ] "No person detected" message doesn't block any controls
- [ ] Drill switching works smoothly without UI overlap
- [ ] Skeleton shows in preview mode (orange, low opacity)
- [ ] Detection quality improves as user positions correctly
- [ ] Voice guidance works correctly
- [ ] Session ID is passed to backend for velocity tracking

---

## Files to Modify

1. `SurfApp--frontend/components/PosePracticeScreen.tsx`:
   - Fix detection logic (lines 510-715)
   - Fix UI layout and z-index (lines 1340-1630)
   - Add top-right stop button
   - Fix drill switching logic

2. `SurfApp--frontend/utils/poseDetection.ts`:
   - Lower visibility thresholds
   - Improve progressive detection logic

3. `surfapp--ml-engine/services/pose_server.py`:
   - Add session_id parameter
   - Pass session_id to detect_pose_from_base64

4. `SurfApp--frontend/services/api.ts`:
   - Include session_id in pose detection requests

---

## Expected Outcomes

After implementing all fixes:

1. **Detection**: Person detected immediately when visible, skeleton shows even with partial detection
2. **UI**: All controls always accessible, no blocking messages
3. **UX**: Smooth drill switching, clear feedback, professional appearance
4. **Performance**: Velocity tracking enabled, better motion analysis

