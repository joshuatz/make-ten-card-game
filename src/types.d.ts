type CardSuite = "diamonds" | "clubs" | "hearts" | "spades";
type CardValue =
	| "A"
	| "2"
	| "3"
	| "4"
	| "5"
	| "6"
	| "7"
	| "8"
	| "9"
	| "10"
	| "J"
	| "Q"
	| "K";
interface ICard {
	suite: CardSuite;
	value: CardValue;
}
