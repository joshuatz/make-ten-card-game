type CardSuite = 'diamonds' | 'clubs' | 'hearts' | 'spades';
type CardValue =
	| 'A'
	| '2'
	| '3'
	| '4'
	| '5'
	| '6'
	| '7'
	| '8'
	| '9'
	| '10'
	| 'J'
	| 'Q'
	| 'K';
interface ICard {
	suite: CardSuite;
	value: CardValue;
	valueNum: number;
}

interface IPlayCard extends ICard {
	key: string;
	selected?: boolean;
}

interface IPlayCardWithPos {
	card: IPlayCard;
	row: number;
	stack: number;
	index: number;
}

type GameStatus = 'new' | 'paused' | 'active' | 'complete';

interface ITimeInfo {
	ms: number;
	secs: number;
	mins: number;
	hrs?: number;
	days?: number;
}
