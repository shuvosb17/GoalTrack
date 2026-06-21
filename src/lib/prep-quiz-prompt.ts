export type PrepQuizSubjectType = "cs" | "pattern";

export interface PrepQuizPromptRequest {
  subjectType: PrepQuizSubjectType;
  subjectKey: string;
  subjectLabel: string;
  csItemId?: string;
}

type PromptHandler = (request: PrepQuizPromptRequest) => void;

let promptHandler: PromptHandler | null = null;

export function registerPrepQuizPromptHandler(handler: PromptHandler | null) {
  promptHandler = handler;
}

export function enqueuePrepQuizPrompt(request: PrepQuizPromptRequest) {
  promptHandler?.(request);
}
