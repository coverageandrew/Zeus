export { createArchitectureDeptHead } from './architecture.js';
export { createDataDeptHead } from './data.js';
export { createApiDeptHead } from './api.js';
export { createUiDeptHead } from './ui.js';
export { createQaSecurityDeptHead } from './qa-security.js';

export const DEPARTMENT_NAMES = [
  'architecture',
  'data',
  'api',
  'ui',
  'qa_security',
] as const;

export type DepartmentName = typeof DEPARTMENT_NAMES[number];
