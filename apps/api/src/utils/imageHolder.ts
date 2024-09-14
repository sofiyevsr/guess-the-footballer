import { nanoid } from "nanoid";
import pMap from "p-map";

export class ImageHolder {
	// [filename, url]
	private images: [string, string][] = [];

	addImage(filename: string, url: string) {
		if (!url.trim()) return "default.png";
		filename =
			filename.replaceAll(" ", "-").replaceAll(".", "-").replaceAll("/", "-") +
			".png";
		if (filename == ".png") {
			filename = nanoid() + ".png";
		}
		url = url
			.replaceAll("verysmall", "head")
			.replaceAll("small", "head")
			.replaceAll("middle", "head")
			.replaceAll("normal", "header");
		this.images.push([filename, url]);
		return filename;
	}

	getImages() {
		return this.images;
	}

	mergeImageHolder(imageHolder: ImageHolder) {
		this.images.push(...imageHolder.getImages());
	}

	async downloadAndSaveImages(r2: R2Bucket) {
		return await pMap(
			this.images,
			async ([filename, url]) => {
				const response = await fetch(url);
				const blob = await response.arrayBuffer();
				await r2.put(filename, blob);
			},
			{ concurrency: 30 }
		);
	}
}
