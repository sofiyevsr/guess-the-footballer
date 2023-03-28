export const difficultyLevels = [
	"very-easy",
	"easy",
	"medium",
	"hard",
	"very-hard",
] as const;

export const difficultyMappings = {
	"very-easy": 50,
	easy: 150,
	medium: 300,
	hard: 550,
	"very-hard": 850,
} as const satisfies { [key in (typeof difficultyLevels)[number]]: number };

export const playerCount = 850;

export const defaultPaginationLimit = 20;
