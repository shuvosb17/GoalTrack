export interface PrepQuizQuestion {
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export type PrepQuizSubjectType = "cs" | "pattern";
