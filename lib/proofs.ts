// Volunteer ID proofs (any one). Stored in the PRIVATE "proofs" bucket; only admins can view them.
export const PROOF_FILE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf',
};
export const PROOF_MAX_MB = 5;

/** Validates a proof file and returns its extension, or throws a friendly error. */
export function checkProof(file: { type: string; size: number }): string {
  const ext = PROOF_FILE_TYPES[file.type];
  if (!ext) throw new Error('Please upload a photo (JPG, PNG, WEBP) or a PDF of your ID proof');
  if (file.size > PROOF_MAX_MB * 1024 * 1024) throw new Error(`The file must be smaller than ${PROOF_MAX_MB} MB`);
  return ext;
}
