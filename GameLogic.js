class GameLogic {
	constructor() {

	}

	calculateNextMove(playerIcon) {
		/* 
			playerIcon is either 'x' or 'o'
			Use 'x' first to see if comp can win on this turn
			If it can't, run it again with 'o' to see if it can block the user winning
		*/
		for (let i = 0; i < this.winningCombos.length; i++) {
			const [a,b,c] = this.winningCombos[i];
			if (this.squares[a] === playerIcon && 
				this.squares[b] === playerIcon && 
				this.squares[c] === null) {
				return c;
			} else if (this.squares[a] === playerIcon && 
						this.squares[c] === playerIcon && 
						this.squares[b] === null) {
				return b;
			} else if (this.squares[b] === playerIcon && 
						this.squares[c] === playerIcon && 
						this.squares[a] === null) {
				return a;
			}
		}
	}
}

export GameLogic;