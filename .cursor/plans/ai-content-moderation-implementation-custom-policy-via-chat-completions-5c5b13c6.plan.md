<!-- 5c5b13c6-5373-41f6-b922-3821725afc83 4bc7dc6c-0a82-4108-b052-d7ecce35a053 -->
# AI Content Moderation Implementation (Custom Policy via Chat Completions)

## 1. Data Preparation

- **Transcript**: Use the full text from the Whisper step.
- **Frames**: Sample `videoFrames` at 1 frame per 5 seconds (indices 0, 5, 10...) to optimize token usage while maintaining coverage.

## 2. API Integration (Chat Completions)

We will use the standard `https://api.openai.com/v1/chat/completions` endpoint (often referred to as creating a response).

- **Model**: `gpt-4o` (or user-configurable model string). We will use `gpt-4o` by default as it supports Vision, but allow easy configuration for future models.
- **Prompting Strategy**:
- We will make **one unified call** (or two parallel calls if payload is too large) containing:

  1.  **System Prompt**: Your exact "Transcript Moderation Checklist" and "Frame Moderation Checklist" rules.
  2.  **User Content**: The full Transcript text AND the sampled Image frames (base64).

- **Output Format**: We will enforce `response_format: { type: "json_object" }` to get a structured list of violations.

## 3. UI Implementation

Update `ModPod.tsx`:

- **State**: `moderationReport` (JSON object), `isModerating` (boolean).
- **Visuals**:
- **Violations List**: A detailed breakdown of every rule broken, categorized by "Text" or "Visual".
- **Timestamp Linking**: Clicking a visual violation (e.g., "0:15 - Gun detected") scrolls the carousel to that frame.
- **Text Highlighting**: (Optional) Show which part of the transcript triggered the flag.

## 4. File Changes

- [`src/components/generated/ModPod.tsx`](src/components/generated/ModPod.tsx): Implement the `moderateContent` function and the results display UI.

### To-dos

- [ ] Read ModPod.tsx to identify tab logic
- [ ] Change default tab to Video in ModPod.tsx
- [ ] Reorder tabs in ModPod.tsx to make Video first
- [ ] Implement extractFramesFromVideo helper function in ModPod.tsx
- [ ] Update state and handlers (handleFileChange, handleDrop) to use extraction
- [ ] Replace static preview with Video Player and Frame Carousel in JSX
- [ ] Read ModPod.tsx to identify tab logic
- [ ] Change default tab to Video in ModPod.tsx
- [ ] Reorder tabs in ModPod.tsx to make Video first
- [ ] Define Moderation Interfaces (Checklist categories, Result types)
- [ ] Implement moderateContent helper (Chat Completions API with JSON mode)
- [ ] Update UI to display Granular Moderation Results (Highlights & Timeline markers)