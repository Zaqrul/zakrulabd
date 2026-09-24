// Keep upload limits identical in the browser and the route handler. The full
// multipart request must stay below Vercel's 4.5 MB function body limit.
export const MAX_CONTACT_BODY_BYTES = 4 * 1024 * 1024;
export const MAX_CONTACT_FILES = 4;
export const MAX_CONTACT_FILE_BYTES = 3 * 1024 * 1024;
export const MAX_CONTACT_TOTAL_FILE_BYTES = 3 * 1024 * 1024;
