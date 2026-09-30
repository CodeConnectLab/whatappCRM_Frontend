/** A placeholder the auto-response renderer substitutes before sending. */
export type TemplateVariable = {
  key: string;
  label: string;
  /** What the contact would actually see, so the picker is self-explanatory. */
  example: string;
};

/** Keep in step with the server's renderer in auto-response.service.ts. */
export const AUTO_RESPONSE_VARIABLES: TemplateVariable[] = [
  { key: 'name', label: 'Contact name', example: 'Ramesh' },
  { key: 'phone', label: 'Contact phone', example: '919876543210' },
  { key: 'email', label: 'Contact email', example: 'ramesh@example.com' },
  { key: 'product', label: 'Matched product', example: 'Solar Rooftop 3kW' },
  { key: 'agent', label: 'Assigned agent', example: 'Priya' },
];
