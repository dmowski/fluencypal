import { ImageJpgConverter } from './imageJpgConverter';

let converter: ImageJpgConverter | null = null;

const FALLBACK_FILE_NAME = 'story-image';

function toProxyMediaUrl(url: string): string {
	if (!url.startsWith('https://')) {
		return url;
	}

	return `/api/proxyMedia?url=${encodeURIComponent(url)}`;
}

function extractFileNameFromUrl(url: string): string {
	try {
		const parsedUrl = new URL(url, window.location.origin);
		const pathname = parsedUrl.pathname;
		const fileName = pathname.split('/').pop();
		return fileName && fileName.length > 0 ? fileName : FALLBACK_FILE_NAME;
	} catch {
		return FALLBACK_FILE_NAME;
	}
}

function triggerBlobDownload(blob: Blob, fileName: string): void {
	const objectUrl = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = objectUrl;
	anchor.download = fileName;
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(objectUrl);
}

export const downloadAsJpg = async (imageUrl: string) => {
	if (typeof window === 'undefined') {
		return;
	}

	try {
		const response = await fetch(toProxyMediaUrl(imageUrl));
		if (!response.ok) {
			throw new Error(`Failed to fetch image: ${response.status}`);
		}

		const inputBlob = await response.blob();
		const fileName = extractFileNameFromUrl(imageUrl);
		const inputFile = new File([inputBlob], fileName, {
			type: inputBlob.type || 'application/octet-stream',
		});

		if (!converter) {
			converter = new ImageJpgConverter();
		}

		const result = await converter.convert(inputFile);
		const jpgBlob = new Blob([result.imageData.slice()], { type: 'image/jpeg' });
		triggerBlobDownload(jpgBlob, result.imageName || `${FALLBACK_FILE_NAME}.jpg`);
	} catch (error) {
		console.error('Failed to convert image to JPG:', error);
		alert('Failed to convert image to JPG. Please try again.');
	}
};
