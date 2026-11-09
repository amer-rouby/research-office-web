/** Saves a downloaded Blob in the browser under the given file name. */
export function saveBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Builds the multipart body the backend expects for uploads (`files` parts). */
export function filesForm(files: readonly File[]): FormData {
  const form = new FormData();
  files.forEach((f) => form.append('files', f, f.name));
  return form;
}
