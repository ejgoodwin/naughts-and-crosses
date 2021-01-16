class Game {
	constructor() {
		this.difficultyLevel = 'level-2';
		this.squares = [];
		this.reset = [
			null,null,null,
			null,null,null,
			null,null,null
		];
		this.winningCombos = [
			[0,1,2],
			[3,4,5],
			[6,7,8],
			[0,3,6],
			[1,4,7],
			[2,5,8],
			[0,4,8],
			[2,4,6]
		];
		this.player = true;  // true is 'o', false is 'x'
		this.boardLocked = false;
		this.computerTurn = false;
		this.turnCounter = 0;
		this.naughtWins = 0;
		this.crossesWins = 0;
		this.board = document.querySelector('.board');
		this.playersContainer = document.querySelector('.players');
		this.game = document.querySelector('.game');
		this.playersTurnNaughts = document.querySelector('.players-turn--naughts');
		this.playersTurnCrosses = document.querySelector('.players-turn--crosses');
		this.difficultyBtns = document.querySelectorAll('.difficulty__btn');
		this.crossIcon = '<div class="cross-icon cross-icon--animated"><span class="cross-line cross-line--one"></span><span class="cross-line cross-line--two"></span></div>';
		this.naughtIcon = 
		`<div class="naught-icon naught-icon--animated">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
				<g id="layer_1">
					<circle cx="15" cy="15" r="13" fill="none" stroke="#3b3b40" stroke-miterlimit="10" stroke-width="3" data-name="layer_1" />
				</g>
		</svg>
		</div>`;
		// this.nextMoveLogic = new GameLogic(this.winningCombos, this.squares);
		// For minimax
		this.compPlayer = 'x';
		this.userPlayer = 'o';
	}

	startGame() {
		this.squares = [...this.reset];
		for (let i = 0; i < this.squares.length; i++) {
			const square = document.createElement('button');
			square.classList.add('board-square', 'animate');
			square.addEventListener('click', () => this.handleSquareClick(i, square))
			this.board.appendChild(square);
		}
		console.log(this.difficultyLevel);
	}

	initDifficultyButtons() {
		// Event listeners for difficulty buttons
		this.difficultyBtns.forEach((button) => {
			button.addEventListener('click', () => this.handleDifficultyClick(button))
		});
	}

	handleDifficultyClick(button) {
		// Set new difficulty level
		this.difficultyLevel = button.dataset.difficulty;
		// Remove active class from buttons
		this.difficultyBtns.forEach((button) => {
			button.classList.remove('difficulty__btn--active');
		})
		// Add active class to clicked button
		button.classList.add('difficulty__btn--active');
		this.resetGame();
	}

	handleSquareClick(counter, squareEl) {
		// Board locks after draw/winner || computer's turn - not clickable
		if (this.boardLocked || this.computerTurn) return;
		// If square is already taken, return and do not change
		if (this.squares[counter] !== null) return;

		this.turnCounter += 1;
		// Assign playerIcon as text to square
		squareEl.innerHTML = this.naughtIcon;
		// Assign playerIcon to array
		this.squares[counter] = 'o';
		//Check for winner
		this.winningLogic();
		// Change active state showing who's turn it is
		setTimeout(() => this.toggleActiveState('crosses'), 300);

		// Generate random move (!boardlocked prevents it running when winner already declared)
		if (!this.boardLocked) {
			// Block user from clicking
			this.computerTurn = true;
			setTimeout(() => this.autoMove(), 750);
		}
	}

	autoMove() {
		let selectedMove = null;
		// Flip player
		this.player = !this.player;
		this.turnCounter += 1;
		// Get squares
		const squaresArr = document.querySelectorAll('.board-square');

		// Select algorithm for next move based on difficulty level
		if (this.difficultyLevel === 'level-1') {
			const nextMoveLogic = new GameLogic(this.winningCombos, this.squares);
			console.log('playing 1')
			// Select move based on whether it can win or if it can block user winning on this move
			selectedMove = this.nextMoveLogic.nextMoveEasy('x', this.squares);
			if (!selectedMove) {
				selectedMove = this.nextMoveLogic.nextMoveEasy('o', this.squares);
			}
			// If it cannot win or block, select random move
			if (!selectedMove) {
				while (true) {
					let randomNumber = Math.floor(Math.random() * 9);
					if (this.squares[randomNumber] === null) {
						selectedMove = randomNumber;
						break;
					}
				}
			}
		} else {
			const nextMoveLogic = new GameLogic(this.winningCombos, this.squares);
			console.log('using minimax')
			// Use minimax to predict best move
			selectedMove = nextMoveLogic.minimax([...this.squares], this.compPlayer, 0).index;
		}


		// Find correct square
		squaresArr[selectedMove].innerHTML = this.crossIcon;
		// Assign playerIcon to array
		this.squares[selectedMove] = 'x';
		this.winningLogic();
		// change active state showing who's turn it is
		setTimeout(() => this.toggleActiveState('naughts'), 300);
		// Flip player back
		this.player = !this.player;
		// Unblock user
		this.computerTurn = false;
	}

	winningLogic() {
		for (let i = 0; i < this.winningCombos.length; i++) {
			const [a,b,c] = this.winningCombos[i];
			if (this.squares[a] && 
				this.squares[a] === this.squares[b] && 
				this.squares[a] === this.squares[c]) {
				this.winner(this.winningCombos[i], false);
				// Lock board so it is not clickable
				this.boardLocked = true;
				break;
			}
		}
		// Call a draw if no winner and all squares taken
		if (!this.boardLocked && this.turnCounter >= 9) {
			this.winner(null, true);
			// Lock board so it is not clickable
			this.boardLocked = true;
		}
	}

	winner(winningCombo, playersDraw) {
		// Create container for results
		const resultsContainer = document.createElement('div');
		resultsContainer.classList.add('results-container');
		const resultsLabel = document.createElement('p');
		// Create containers for icons
		const crossIconDiv = document.createElement('div');
		const naughtIconDiv = document.createElement('div');
		crossIconDiv.innerHTML = this.crossIcon;
		naughtIconDiv.innerHTML = this.naughtIcon;
		// Create reset button
		const resetBtn = document.createElement('button');
		resetBtn.classList.add('reset-button');
		resetBtn.textContent = 'Play again';
		resetBtn.addEventListener('click', this.resetGame.bind(this));

		if (playersDraw) {
			resultsContainer.appendChild(crossIconDiv);
			resultsContainer.appendChild(naughtIconDiv);
			resultsLabel.textContent = 'Draw';
		} else {
			resultsLabel.textContent = 'Winner!';
			// Highlight winning sequence
			const squareBtns = document.querySelectorAll('.board-square');
			for (let i = 0; i < squareBtns.length; i++) {
				if (i === winningCombo[0] || 
					i === winningCombo[1] || 
					i === winningCombo[2]) {
					setTimeout(() => squareBtns[i].classList.add('winning-combo'), i*20 );
				}
			}
			if (this.player) { 
				resultsContainer.appendChild(naughtIconDiv);
				this.naughtWins += 1;
				document.querySelector('.winsCounter--naughts').textContent = this.naughtWins;
			} else { 
				resultsContainer.appendChild(crossIconDiv);
				this.crossesWins += 1;
				document.querySelector('.winsCounter--crosses').textContent = this.crossesWins;
			}

		}
		// Hide players turns
		this.playersContainer.classList.add('players--hide');
		resultsContainer.appendChild(resultsLabel);
		setTimeout(() => this.game.appendChild(resultsContainer), 500);
		setTimeout(() => this.game.appendChild(resetBtn), 1000);
	}

	resetGame() {
		// Show players turns
		this.playersContainer.classList.remove('players--hide');
		// reset squares array to null values 
		this.squares = [...this.reset];
		// Reset turnCounter for next game
		this.turnCounter = 0;
		// Remove results and button
		const resultsContainer = document.querySelector('.results-container');
		const resetBtn = document.querySelector('.reset-button');
		if (resultsContainer) resultsContainer.remove();
		if (resetBtn) resetBtn.remove();
		// Remove highlight from winning squares
		const boardSquares = document.querySelectorAll('.board-square');
		boardSquares.forEach((item) => {
			item.textContent = '';
			item.classList.remove('winning-combo', 'animate');
			// Remove and add animate class to trigger css animations 
			setTimeout(() => item.classList.add('animate'), 1);
			
		});
		// change active state to show naught plays first
		this.toggleActiveState('naughts');
		// unlock board for next game
		this.boardLocked = false;
		console.log(this.difficultyLevel);
	}


	toggleActiveState(nextPlayer) {
		// Active state showing who's turn it is 
		if (nextPlayer === 'naughts') {
			this.playersTurnCrosses.classList.remove('players-turn--active');
			this.playersTurnNaughts.classList.add('players-turn--active');
		} else if (nextPlayer === 'crosses') {
			this.playersTurnNaughts.classList.remove('players-turn--active');
			this.playersTurnCrosses.classList.add('players-turn--active');
		}
	}

}

class GameLogic {
	constructor(winningCombos) {
		this.winningCombos = winningCombos;
	}
	nextMoveEasy(playerIcon, squares) {
		/* 
			playerIcon is either 'x' or 'o'
			Use 'x' first to see if comp can win on this turn
			If it can't, run it again with 'o' to see if it can block the user winning
		*/
		for (let i = 0; i < this.winningCombos.length; i++) {
			const [a,b,c] = this.winningCombos[i];
			if (squares[a] === playerIcon && 
				squares[b] === playerIcon && 
				squares[c] === null) {
				return c;
			} else if (squares[a] === playerIcon && 
						squares[c] === playerIcon && 
						squares[b] === null) {
				return b;
			} else if (squares[b] === playerIcon && 
						squares[c] === playerIcon && 
						squares[a] === null) {
				return a;
			}
		}
	}

	minimax(testBoard, player, depth) {
		/*
			testBoard 	=> 	initial = copy of board state: [...squares], 
							then state of board with new move added.
			player 		=> 	compPlayer || userPlayer.
			depth 		=> 	the depth of that path on the search tree.
			Recursive algorithm using depth first search to build a search tree
			of possible outcomes for each potential move. A score is applied depending
			on whether the leaf node shows a win for compPlayer, win for userPlayer, or draw.
		*/
		const moves = []; 
		// Array to store frontier
		let availableSquares = [];
		// Find available squares to add to frontier
		for (let i = 0; i < testBoard.length; i++) {
			if (testBoard[i] === null) {
				// Add the index of that available square
				availableSquares.push(i)
			}
		}

		// Check if current board state holds a win/draw
		if (this.testWin(testBoard, this.userPlayer)) {
			return {score:-100};
		} else if (this.testWin(testBoard, this.compPlayer)) {
			return {score:100};
		} else if (availableSquares.length === 0) {
			return {score:0};
		} 


		// Loop through frontier (available squares)
		for (let i = 0; i < availableSquares.length; i++) {
			// Create object for each move and store the number of that square as the index
			let move = {};
			move.index = availableSquares[i];
			// Set empty square to current player 
			testBoard[availableSquares[i]] = player;

			// Collect score from calling func for opponent
			if (player === this.compPlayer) {
				let result = this.minimax(testBoard, this.userPlayer, depth+1);
				// Apply returned score to move, taking into account the depth of the leaf node
				move.score = result.score - depth;
			} else {
				let result = this.minimax(testBoard, this.compPlayer, depth+1);
				move.score = result.score - depth;
			}
			// Reset square to empty
			testBoard[availableSquares[i]] = null;
			// Push object to array
			moves.push(move);
		}

		let bestMove = null;
		if (player === this.compPlayer) {
			let bestScore = -1000;
			for (let i = 0; i < moves.length; i++) {
				if (moves[i].score > bestScore) {
					bestScore = moves[i].score;
					bestMove = i;
				}
			}
		} else {
			let bestScore = 1000; 
			for (let i = 0; i < moves.length; i++) {
				if (moves[i].score < bestScore) {
					bestScore = moves[i].score;
					bestMove = i;
				}
			} 
		}
		console.log(moves)
		return moves[bestMove];
	}

	testWin(testBoard, player) {
		if (
			(testBoard[0] === player && testBoard[1] === player && testBoard[2] === player) ||
			(testBoard[3] === player && testBoard[4] === player && testBoard[5] === player) ||
			(testBoard[6] === player && testBoard[7] === player && testBoard[8] === player) ||
			(testBoard[0] === player && testBoard[3] === player && testBoard[6] === player) ||
			(testBoard[1] === player && testBoard[4] === player && testBoard[7] === player) ||
			(testBoard[2] === player && testBoard[5] === player && testBoard[8] === player) ||
			(testBoard[0] === player && testBoard[4] === player && testBoard[8] === player) ||
			(testBoard[2] === player && testBoard[4] === player && testBoard[6] === player)	
		) {
			return true;
		} else {
			return false;
		}
	}
}

let newGame = new Game();
newGame.initDifficultyButtons();
newGame.startGame();
