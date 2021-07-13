/**
 * Card SVGs and Sizing Calculations
 */
export const cardAspectRatio = 240 / 336;
export const maxCardWidth = 80;
export const maxCardHeight = maxCardWidth / cardAspectRatio;
export const cardVOffset = maxCardWidth * -1 - 6;

/**
 * Card Value Lookups
 */
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

/**
 * Configuration
 */
export const TOAST_DELAY_MS = 3 * 1000;
export const APP_NAME = 'Make Ten Game';
export const REPO_URL = 'https://github.com/joshuatz/make-ten-card-game';
