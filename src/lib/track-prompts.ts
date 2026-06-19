/** Copies a study-strategy prompt to the clipboard for use in an external assistant. */
export async function sendPrompt(question: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(question);
    return true;
  } catch {
    return false;
  }
}

export function studyTipsPrompt(trackName: string) {
  return `What are the most effective study tips and habits for mastering ${trackName} on a structured learning path?`;
}

export function nextTopicsPrompt(trackName: string) {
  return `Based on a ${trackName} curriculum, what topics should I prioritize next to stay on pace?`;
}

export function weeklyPlanPrompt(trackName: string) {
  return `Help me build a realistic weekly study plan for ${trackName} that balances depth and consistency.`;
}
