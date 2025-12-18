# Implementation Plan: Resume Exam from Last Question

## Problem Statement

When users resume an exam, it always starts from Question 1, even if they were on Question 150 before pausing. For large exams (200+ questions), this forces users to manually navigate back to where they left off.

**Current Behavior:**
- ✅ Answers are persisted to Firestore
- ✅ Timer state is maintained
- ❌ Current question position is NOT saved (always resumes at Question 1)

**Root Cause:**
The `currentQuestionIndex` is only stored in Zustand (in-memory state) and is never persisted to Firestore. When the page is reloaded or user navigates away, this state is lost.

---

## Solution Overview

Persist the current question index to Firestore and restore it when resuming an exam.

---

## Implementation Plan

### Phase 1: Update Data Model

**File:** `lib/types/index.ts`

**Changes:**
1. Add `currentQuestionIndex` field to `ExamSession` interface:
   ```typescript
   export interface ExamSession {
     // ... existing fields
     currentQuestionIndex: number  // NEW: 0-based index of current question
     lastActivityAt: number        // NEW: Timestamp of last interaction
   }
   ```

**File:** `app/actions/exams.ts` - `createExamSession()`

**Changes:**
1. Initialize new fields when creating exam session:
   ```typescript
   currentQuestionIndex: 0,
   lastActivityAt: Date.now()
   ```

---

### Phase 2: Persist Question Navigation

**File:** `app/actions/exams.ts`

**Changes:**
1. Create new Server Action to update current question:
   ```typescript
   export async function updateCurrentQuestion(
     sessionId: string,
     questionIndex: number
   ): Promise<{ success: boolean; error?: string }>
   ```

   - Updates Firestore: `currentQuestionIndex` and `lastActivityAt`
   - Validates: `questionIndex` is within bounds (0 to totalQuestions-1)
   - Returns success/error status

---

### Phase 3: Update Exam Interface

**File:** `components/exams/exam-interface.tsx`

**Changes:**

1. **Import new action:**
   ```typescript
   import { updateCurrentQuestion } from '@/app/actions/exams'
   ```

2. **Track when question changes:**
   ```typescript
   useEffect(() => {
     // Debounce to avoid excessive Firestore writes
     const timer = setTimeout(() => {
       updateCurrentQuestion(session.id, currentQuestionIndex)
     }, 1000) // Wait 1 second after navigation stops

     return () => clearTimeout(timer)
   }, [currentQuestionIndex, session.id])
   ```

   **Rationale for debouncing:**
   - User might quickly click Next/Previous multiple times
   - Avoid hammering Firestore with rapid writes
   - Only save after user "settles" on a question

3. **Alternative: Save on specific events** (more efficient):
   - When user selects an answer
   - When user clicks "Submit" or leaves exam
   - On periodic intervals (every 30 seconds)

---

### Phase 4: Restore Position on Resume

**File:** `app/(dashboard)/exams/[id]/session/[sessionId]/page.tsx`

**Changes:**
1. Pass `currentQuestionIndex` from session to `ExamInterface`:
   ```typescript
   <ExamInterface
     session={session}
     questions={questions}
     initialQuestionIndex={session.currentQuestionIndex || 0}  // NEW
   />
   ```

**File:** `components/exams/exam-interface.tsx`

**Changes:**
1. Accept new prop:
   ```typescript
   interface ExamInterfaceProps {
     // ... existing props
     initialQuestionIndex?: number  // NEW
   }
   ```

2. Initialize Zustand store with saved position:
   ```typescript
   const { setCurrentQuestionIndex } = useExamStore()

   useEffect(() => {
     if (initialQuestionIndex !== undefined) {
       setCurrentQuestionIndex(initialQuestionIndex)
     }
   }, [initialQuestionIndex, setCurrentQuestionIndex])
   ```

---

### Phase 5: UX Enhancements (Optional but Recommended)

**File:** `components/exams/exam-interface.tsx`

**Enhancements:**

1. **Show "Resuming from Question X" notification:**
   ```typescript
   {initialQuestionIndex > 0 && (
     <Alert>
       <InfoIcon />
       <AlertTitle>Resuming Exam</AlertTitle>
       <AlertDescription>
         Continuing from Question {initialQuestionIndex + 1} of {totalQuestions}
       </AlertDescription>
     </Alert>
   )}
   ```

2. **Add progress indicator:**
   - Show "{answered}/{total} questions answered"
   - Visual progress bar showing completion percentage

3. **"Jump to first unanswered question" button:**
   - Find first question without an answer
   - Navigate directly to it

**File:** `app/(dashboard)/exams/page.tsx`

**Enhancements:**

1. **Show last activity timestamp on Resume button:**
   ```typescript
   Resume Exam • Last activity: {formatDistance(session.lastActivityAt, Date.now())} ago
   ```

2. **Show progress on exam cards:**
   ```typescript
   Progress: {Object.keys(session.answers).length} / {session.totalQuestions} answered
   ```

---

## Technical Considerations

### 1. Firestore Write Optimization

**Problem:** Updating `currentQuestionIndex` on every navigation could cause excessive writes.

**Solutions:**
- ✅ **Debouncing** (recommended): Wait 1-2 seconds after navigation stops
- ✅ **Batch updates**: Update both answer and current question in single write
- ✅ **Conditional updates**: Only update if index changed by 5+ questions
- ❌ **On every navigation**: Too many writes, costly

### 2. Race Conditions

**Scenario:** User navigates quickly through questions while Firestore writes are pending.

**Mitigation:**
- Use debouncing to avoid stale writes
- Include timestamp in update to detect out-of-order writes
- Zustand state is source of truth during active session

### 3. Offline Support

**Challenge:** What if user loses internet connection?

**Approach:**
- Firestore has built-in offline persistence
- Updates queue locally and sync when online
- currentQuestionIndex follows same pattern as answers

### 4. Multi-Device Sync

**Edge Case:** User opens same exam on two devices.

**Behavior:**
- Last write wins (standard Firestore behavior)
- Both devices can answer questions independently
- On submit, answers merge (newest timestamp per question)
- Not a critical issue for typical use case

---

## Testing Checklist

### Unit Tests
- [ ] `updateCurrentQuestion()` validates bounds
- [ ] Debounce logic works correctly
- [ ] Store initialization with `initialQuestionIndex`

### Integration Tests
- [ ] Create exam → answer question 50 → refresh → verify starts at 50
- [ ] Answer questions in order → verify position saves after each
- [ ] Navigate backward → verify position updates
- [ ] Multiple rapid navigations → verify only last position saves (debounce)

### Manual Testing
- [ ] Large exam (200 questions): Navigate to Q150, close tab, resume → starts at Q150
- [ ] Answer questions 1-10, close browser, reopen → resumes at Q10 (or Q11 if on Next)
- [ ] Timer countdown continues correctly when resuming mid-exam
- [ ] Submit exam from middle question → all answers saved correctly
- [ ] Progress indicators show correct counts

---

## Performance Impact

### Firestore Operations
- **Reads:** No change (still 1 read per exam resume)
- **Writes:** +1 write per question navigation (debounced)
  - Worst case: User navigates to every question = 200 writes for 200Q exam
  - Realistic: User navigates to ~20-30 questions = 20-30 writes
  - Cost: ~$0.18 per million writes (negligible)

### Client Performance
- **Memory:** +8 bytes per session (1 integer)
- **Rendering:** No impact (same components)
- **Network:** Minimal (small field updates)

---

## Migration Strategy

### Existing Incomplete Exams

**Option 1: No migration** (recommended)
- Existing sessions without `currentQuestionIndex` default to 0
- Next time user resumes, position will be saved going forward
- Simple, no risk

**Option 2: Backfill with best guess**
- Count answered questions → assume user is at that question
- Risk: Might be incorrect if user skipped questions

**Recommendation:** Option 1 (graceful degradation)

---

## Rollback Plan

If issues arise:
1. Remove `initialQuestionIndex` prop from `ExamInterface`
2. Stop calling `updateCurrentQuestion()` action
3. Exams resume from Question 1 (original behavior)
4. User answers remain intact (no data loss)

---

## Files to Modify

| File | Changes |
|------|---------|
| `lib/types/index.ts` | Add fields to `ExamSession` interface |
| `app/actions/exams.ts` | Add `updateCurrentQuestion()` Server Action, update `createExamSession()` |
| `components/exams/exam-interface.tsx` | Track navigation, initialize from saved position |
| `app/(dashboard)/exams/[id]/session/[sessionId]/page.tsx` | Pass `initialQuestionIndex` prop |
| `app/(dashboard)/exams/page.tsx` | (Optional) Show progress on exam cards |

---

## Estimated Effort

- **Development:** 2-3 hours
- **Testing:** 1-2 hours
- **Total:** 3-5 hours

---

## Success Metrics

After implementation:
- [ ] Users can resume exams from last viewed question
- [ ] No increase in Firestore errors or throttling
- [ ] Existing answered questions still load correctly
- [ ] Performance remains acceptable (< 100ms delay on navigation)
