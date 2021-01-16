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
	const squaresArr = document.querySelectorAll('.board-square');
	// Select move based on whether it can win or if it can block user winning on this move
	selectedMove = calculateNextMove('x');
	if (!selectedMove) {
		selectedMove = calculateNextMove('o');
	}
	// If it cannot win or block, select random move
	if (!selectedMove) {
		while (true) {
			let randomNumber = Math.floor(Math.random() * 9);
			if (squares[randomNumber] === null) {
				selectedMove = randomNumber;
				break;
			}
		}
	}
	// Find correct square
	squaresArr[selectedMove].innerHTML = crossIcon;
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
