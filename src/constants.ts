// Based on card SVGs
export const cardAspectRatio = 240 / 336;
export const maxCardWidth = 80;
export const maxCardHeight = maxCardWidth / cardAspectRatio;
export const cardVOffset = maxCardWidth * -1 - 6;

// Card value stuff
export const cardValueMap: Record<CardValue, number> = {
	A: 1,
	'2': 2,
	'3': 3,
	'4': 4,
	'5': 5,
	'6': 6,
	'7': 7,
	'8': 8,
	'9': 9,
	'10': 10,
	// Not actualy in use...
	J: 10,
	Q: 10,
	K: 10,
};
