export const TEMPLATE_PLACEHOLDERS = [
  { key: 'name', token: '{{name}}', hint: "Contact's display name" },
  { key: 'phone', token: '{{phone}}', hint: 'Phone number on file' },
  { key: 'email', token: '{{email}}', hint: 'Email on file' },
] as const;

export type PlaceholderSample = {
  name: string;
  phone: string;
  email: string;
};

export const DEFAULT_PREVIEW_SAMPLE: PlaceholderSample = {
  name: 'Alex Kumar',
  phone: '+1 555 010-2048',
  email: 'alex@example.com',
};

/** Client-side preview: same rules as server `applyTemplate`. */
export function applyTemplatePreview(body: string, sample: PlaceholderSample): string {
  return body
    .replace(/\{\{\s*name\s*\}\}/gi, sample.name)
    .replace(/\{\{\s*phone\s*\}\}/gi, sample.phone)
    .replace(/\{\{\s*email\s*\}\}/gi, sample.email);
}

export function insertAtCursor(textarea: HTMLTextAreaElement, insert: string): void {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const before = textarea.value.slice(0, start);
  const after = textarea.value.slice(end);
  textarea.value = before + insert + after;
  const pos = start + insert.length;
  textarea.selectionStart = textarea.selectionEnd = pos;
  textarea.focus();
}
