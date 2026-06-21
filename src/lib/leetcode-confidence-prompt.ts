export interface LeetcodeConfidencePromptRequest {
  problemId: string;
  problemTitle: string;
  pattern: string;
}

type PromptHandler = (request: LeetcodeConfidencePromptRequest) => void;

let promptHandler: PromptHandler | null = null;

export function registerLeetcodeConfidencePromptHandler(handler: PromptHandler | null) {
  promptHandler = handler;
}

export function enqueueLeetcodeConfidencePrompt(request: LeetcodeConfidencePromptRequest) {
  promptHandler?.(request);
}
