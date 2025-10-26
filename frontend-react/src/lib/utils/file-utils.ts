/**
 * Loads the contents of a specified file.
 *
 * @param file - The file object to load contents from.
 * @param encoding - The encoding to use while reading the file. Default is UTF-8.
 *
 * @returns - A Promise that resolves with the contents of the file as a string.
 *          - If the file is empty, the Promise will be rejected with an error.
 */
export function loadFileContents(
	file: File,
	encoding = 'utf-8'
): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.addEventListener('load', () => {
			if (reader.result) {
				if (typeof reader.result !== 'string')
					// ArrayBuffer
					return resolve(new TextDecoder(encoding).decode(reader.result));

				resolve(reader.result);
			} else {
				reject(
					new Error('Empty file specified. Please select a non-empty file.')
				);
			}
		});
		reader.addEventListener('error', reject);
		reader.readAsText(file, encoding);
	});
}
