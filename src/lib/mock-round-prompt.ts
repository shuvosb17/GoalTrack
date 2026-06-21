export interface MockRoundPromptRequest {
  mode: "global" | "pattern";
  pattern?: string;
  patternLabel?: string;
}

type PromptHandler = (request: MockRoundPromptRequest) => void;

let promptHandler: PromptHandler | null = null;

export function registerMockRoundPromptHandler(handler: PromptHandler | null) {
  promptHandler = handler;
}

export function enqueueMockRoundPrompt(request: MockRoundPromptRequest) {
  promptHandler?.(request);
}
