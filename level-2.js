'use strict';

let squares = [];
const reset = [
	null,null,null,
	null,null,null,
	null,null,null
];
const winningCombos = [
	[0,1,2],
	[3,4,5],
	[6,7,8],
	[0,3,6],
	[1,4,7],
	[2,5,8],
	[0,4,8],
	[2,4,6]
];

// For minimax
const compPlayer = 'x';
const userPlayer = 'o';
let countFunc = 0;

let player = true;  // true is 'o', false is 'x'
let boardLocked = false;
let computerTurn = false;
let turnCounter = 0;
let naughtWins = 0;
let crossesWins = 0;
const board = document.querySelector('.board');
const playersContainer = document.querySelector('.players');
const game = document.querySelector('.game');
const playersTurnNaughts = document.querySelector('.players-turn--naughts');
const playersTurnCrosses = document.querySelector('.players-turn--crosses');
const crossIcon = '<div class="cross-icon cross-icon--animated"><span class="cross-line cross-line--one"></span><span class="cross-line cross-line--two"></span></div>';
const naughtIcon = 
`<div class="naught-icon naught-icon--animated">
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
		<g id="layer_1">
			<circle cx="15" cy="15" r="13" fill="none" stroke="#3b3b40" stroke-miterlimit="10" stroke-width="3" data-name="layer_1" />
		</g>
</svg>
</div>`;

function createBoard() {
	squares = [...reset];
	for (let i = 0; i < squares.length; i++) {
		const square = document.createElement('button');
		square.classList.add('board-square', 'animate');
		square.addEventListener('click', () => handleClick(i, square))
		board.appendChild(square);
	}
}

function handleClick(counter, squareEl) {
	// Board locks after draw/winner || computer's turn - not clickable
	if (boardLocked || computerTurn) return;
	// If square is already taken, return and do not change
	if (squares[counter] !== null) return;

	turnCounter += 1;
	// Assign playerIcon as text to square
	squareEl.innerHTML = naughtIcon;
	// Assign playerIcon to array
	squares[counter] = 'o';
	//Check for winner
	gameLogic();
	// Change active state showing who's turn it is
	setTimeout(() => toggleActiveState('crosses'), 300);

	// Generate random move (!boardlocked prevents it running when winner already declared)
	if (!boardLocked) {
		// Block user from clicking
		computerTurn = true;
		setTimeout(() => autoMove(), 750);
	}
}

function autoMove() {
	let selectedMove = null;
	// Flip player
	player = !player;
	turnCounter += 1;
	// Get squares
	const squaresElArr = document.querySelectorAll('.board-square');
	// Use minimax to predict best move
	selectedMove = minimax([...squares], compPlayer, 0).index;
	console.log(`selectedMove: ${selectedMove}`);
	// console.log(moves)
	// Find correct square
	squaresElArr[selectedMove].innerHTML = crossIcon;
	// Assign playerIcon to array
	squares[selectedMove] = 'x';
	gameLogic();
	// change active state showing who's turn it is
	setTimeout(() => toggleActiveState('naughts'), 300);
	// Flip player back
	player = !player;
	// Unblock user
	computerTurn = false;
}

function minimax(testBoard, player, depth) {
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
	if (testWin(testBoard, userPlayer)) {
		return {score:-100};
	} else if (testWin(testBoard, compPlayer)) {
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
		if (player === compPlayer) {
			let result = minimax(testBoard, userPlayer, depth+1);
			// Apply returned score to move, taking into account the depth of the leaf node
			move.score = result.score - depth;
		} else {
			let result = minimax(testBoard, compPlayer, depth+1);
			move.score = result.score - depth;
		}
		// Reset square to empty
		testBoard[availableSquares[i]] = null;
		// Push object to array
		moves.push(move);
	}

	let bestMove = null;
	if (player === compPlayer) {
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
	return moves[bestMove];
}

function testWin(testBoard, player) {
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

function calculateNextMove(playerIcon) {
	/* 
		playerIcon is either 'x' or 'o'
		Use 'x' first to see if comp can win on this turn
		If it can't, run it again with 'o' to see if it can block the user winning
	*/
	for (let i = 0; i < winningCombos.length; i++) {
		const [a,b,c] = winningCombos[i];
		if (squares[a] === playerIcon && squares[b] === playerIcon && squares[c] === null) {
			return c;
		} else if (squares[a] === playerIcon && squares[c] === playerIcon && squares[b] === null) {
			return b;
		} else if (squares[b] === playerIcon && squares[c] === playerIcon && squares[a] === null) {
			return a;
		}
	}
}

function gameLogic() {
	for (let i = 0; i < winningCombos.length; i++) {
		const [a,b,c] = winningCombos[i];
		if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
			winner(winningCombos[i], false);
			// Lock board so it is not clickable
			boardLocked = true;
			break;
		}
	}
	// Call a draw if no winner and all squares taken
	if (!boardLocked && turnCounter >= 9) {
		winner(null, true);
		// Lock board so it is not clickable
		boardLocked = true;
	}
}

function winner(winningCombo, playersDraw) {
	// Create container for results
	const resultsContainer = document.createElement('div');
	resultsContainer.classList.add('results-container');
	const resultsLabel = document.createElement('p');
	// Create containers for icons
	const crossIconDiv = document.createElement('div');
	const naughtIconDiv = document.createElement('div');
	crossIconDiv.innerHTML = crossIcon;
	naughtIconDiv.innerHTML = naughtIcon;
	// Create reset button
	const resetBtn = document.createElement('button');
	resetBtn.classList.add('reset-button');
	resetBtn.textContent = 'Play again';
	resetBtn.addEventListener('click', resetGame);

	if (playersDraw) {
		resultsContainer.appendChild(crossIconDiv);
		resultsContainer.appendChild(naughtIconDiv);
		resultsLabel.textContent = 'Draw';
	} else {
		resultsLabel.textContent = 'Winner!';
		// Highlight winning sequence
		const squareBtns = document.querySelectorAll('.board-square');
		for (let i = 0; i < squareBtns.length; i++) {
			if (i === winningCombo[0] || i === winningCombo[1] || i === winningCombo[2]) {
				setTimeout(() => squareBtns[i].classList.add('winning-combo'), i*20 );
			}
		}
		if (player) { 
			resultsContainer.appendChild(naughtIconDiv);
			naughtWins += 1;
			document.querySelector('.winsCounter--naughts').textContent = naughtWins;
		} else { 
			resultsContainer.appendChild(crossIconDiv);
			crossesWins += 1;
			document.querySelector('.winsCounter--crosses').textContent = crossesWins;
		}

	}
	// Hide players turns
	playersContainer.classList.add('players--hide');
	resultsContainer.appendChild(resultsLabel);
	setTimeout(() => game.appendChild(resultsContainer), 500);
	setTimeout(() => game.appendChild(resetBtn), 1000);
}

function resetGame() {
	// Show players turns
	playersContainer.classList.remove('players--hide');
	// reset squares array to null values 
	squares = [...reset];
	// Reset turnCounter for next game
	turnCounter = 0;
	// Remove results and button
	document.querySelector('.results-container').remove();
	document.querySelector('.reset-button').remove();
	// Remove highlight from winning squares
	const boardSquares = document.querySelectorAll('.board-square');
	boardSquares.forEach((item) => {
		item.textContent = '';
		item.classList.remove('winning-combo', 'animate');
		// Remove and add animate class to trigger css animations 
		setTimeout(() => item.classList.add('animate'), 1);
		
	});
	// change active state to show naught plays first
	toggleActiveState('naughts');
	// unlock board for next game
	boardLocked = false;
}

function toggleActiveState(nextPlayer) {
	// Active state showing who's turn it is 
	if (nextPlayer === 'naughts') {
		playersTurnCrosses.classList.remove('players-turn--active');
		playersTurnNaughts.classList.add('players-turn--active');
	} else if (nextPlayer === 'crosses') {
		playersTurnNaughts.classList.remove('players-turn--active');
		playersTurnCrosses.classList.add('players-turn--active');
	}
}
	
createBoard();
