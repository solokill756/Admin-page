export const DISCARD_MESSAGE = "Discard unsaved changes?";
export const DISCARD_RETAG_MESSAGE = "Discard unsaved changes and re-tag?";

/** True when the action may proceed: nothing is dirty, or the admin agreed to discard. */
export function canProceed(isDirty: boolean, confirmFn: (message: string) => boolean, message = DISCARD_MESSAGE): boolean {
  return !isDirty || confirmFn(message);
}

export function canProceedInBrowser(isDirty: boolean, message = DISCARD_MESSAGE): boolean {
  return canProceed(isDirty, (text) => window.confirm(text), message);
}
