/*
    MineSweeper
    @copyright 2022 Takahashi Akari <akaritakahashioss@gmail.com>
    @license MIT License
    @date 2022-11-20
    @version 1.0.0
*/

import { useEffect, useState } from 'react';
import React from 'react';
import './mineSweeper.css';
import CustomModal from './customModal';
// React component
export default class MineSweeper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            board: [],
            gameStatus: 'playing',
            gameMessage: '',
            gameTimer: 0,
            gameTimerInterval: null,
            gameDifficulty: 'easy',
            gameDifficultyOptions: ['easy', 'medium', 'hard'],
            gameDifficultySettings: {
                easy: {
                    rows: 8,
                    cols: 8,
                    mines: 10
                },
                medium: {
                    rows: 16,
                    cols: 16,
                    mines: 40
                },
                hard: {
                    rows: 16,
                    cols: 30,
                    mines: 99
                }
            }
        };

        this.handleCellLeftClick = this.handleCellLeftClick.bind(this);
        this.handleCellRightClick = this.handleCellRightClick.bind(this);
        this.handleGameEnd = this.handleGameEnd.bind(this);
        this.handleGameDifficultyChange = this.handleGameDifficultyChange.bind(this);

        this.startGame = this.startGame.bind(this);
        this.startTimer = this.startTimer.bind(this);
        this.renderBoard = this.renderBoard.bind(this);
        this.renderCell = this.renderCell.bind(this);
        this.renderGameStatus = this.renderGameStatus.bind(this);
        this.renderGameDifficulty = this.renderGameDifficulty.bind(this);
        this.revealCell = this.revealCell.bind(this);
        this.gameOver = this.gameOver.bind(this);
        this.gameWin = this.gameWin.bind(this);
        this.checkGameWin = this.checkGameWin.bind(this);
        // getSurroundingCells
        this.getSurroundingCells = this.getSurroundingCells.bind(this);
    }

    componentDidMount() {
        this.startGame();
    }

    // handleCellLeftClick
    handleCellLeftClick(row, col) {
        const row2 = row.row, col2 = row.col;
        const { board, gameStatus } = this.state;
        if (gameStatus !== 'playing') return;
        if (board[row2][col2].isRevealed) return;
        if (board[row2][col2].isFlagged) return;
        if (board[row2][col2].isMine) {
            this.gameOver();
            return;
        }
        this.revealCell(row2, col2);
        if (board[row2][col2].surroundingMines === 0) {
            for (let i = row2 - 1; i <= row2 + 1; i++) {
                for (let j = col2 - 1; j <= col2 + 1; j++) {
                    if (i >= 0 && i < board.length && j >= 0 && j < board[0].length) {
                        this.handleCellLeftClick({ row: i, col: j }, 0);
                    }
                }
            }
        }
        this.checkGameWin();
    };
    // change game difficulty
    handleGameDifficultyChange(e) {
        const { gameDifficultyOptions } = this.state;
        const gameDifficulty = e.target.value;
        if (gameDifficultyOptions.includes(gameDifficulty)) {
            this.setState({
                gameDifficulty: gameDifficulty,
                gameStatus: 'playing',
                gameMessage: '',
                gameTimer: 0,
                gameTimerInterval: null
            }, () => {
                this.startGame();
            });
        }
    }

    // gameOver
    gameOver() {
        const { board } = this.state;
        this.setState({
            gameStatus: 'gameOver',
            gameMessage: 'Game Over!'
        });
        board.forEach(row => {
            row.forEach(cell => {
                if (cell.isMine) {
                    cell.isRevealed = true;
                }
            });
        });
        this.setState({ board });
    }

    // checkGameWin
    checkGameWin() {
        const { board } = this.state;
        let isGameWin = true;
        board.forEach(row => {
            row.forEach(cell => {
                if (!cell.isMine && !cell.isRevealed) {
                    isGameWin = false;
                }
            });
        });
        if (isGameWin) {
            this.gameWin();
        }
    }

    // gameWin
    gameWin() {
        const { gameTimer } = this.state;
        this.setState({
            gameStatus: 'gameWin',
            gameMessage: `🎉 You Win! Time: ${gameTimer} 🎉`
        });
    }

    // startGame
    startGame() {
        const { gameDifficulty, gameDifficultySettings } = this.state;
        const { rows, cols, mines } = gameDifficultySettings[gameDifficulty];
        const board = this.createBoard(rows, cols, mines);
        this.setState({
            board,
            gameStatus: 'playing',
            gameMessage: '',
            gameTimer: 0
        });
        this.handleGameEnd();
        this.startTimer();
        this.setState({ board });
    }

    // Create a 2D array of cells
    createBoard(rows, cols, mines) {
        const board = [];
        for (let row = 0; row < rows; row++) {
            board.push([]);
            for (let col = 0; col < cols; col++) {
                board[row].push({
                    row,
                    col,
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    surroundingMines: 0
                });
            }
        }
        // Place mines
        let minesPlaced = 0;
        while (minesPlaced < mines) {
            const randomRow = Math.floor(Math.random() * rows);
            const randomCol = Math.floor(Math.random() * cols);
            const currentCell = board[randomRow][randomCol];
            if (!currentCell.isMine) {
                currentCell.isMine = true;
                board[randomRow][randomCol].isMine = true;
                minesPlaced++;
            }
        }
        // Calculate surrounding mines
        board.forEach(row => {
            row.forEach(cell => {
                const surroundingCells = this.getSurroundingCells(board, cell);
                let surroundingMines = 0;
                surroundingCells.forEach(cell => {
                    if (cell.isMine) {
                        surroundingMines++;
                    }
                });
                cell.surroundingMines = surroundingMines;
            });
        });

        this.setState({ board });

        return board;
    }

    // getSurroundingCells
    getSurroundingCells(board, cell) {
        const { row, col } = cell;
        const surroundingCells = [];
        for (let i = row - 1; i <= row + 1; i++) {
            for (let j = col - 1; j <= col + 1; j++) {
                if (i >= 0 && i < board.length && j >= 0 && j < board[0].length) {
                    surroundingCells.push(board[i][j]);
                }
            }
        }
        return surroundingCells;
    }

    // Create a function to render the cells
    renderCell = (cell, i, j) => {
        const { isMine, isRevealed, isFlagged, surroundingMines } = cell;
        return (
            <div
                key={`${i}-${j}`}
                className={`cell ${isRevealed ? 'revealed' : ''} ${isFlagged ? 'flagged' : ''}`}
                onClick={() => this.handleCellClick(i, j)}
                onContextMenu={(e) => this.handleCellRightClick(i, j)}
            >
                {isRevealed && isMine && <span role="img" aria-label="bomb">💣</span>}
                {isRevealed && !isMine && surroundingMines > 0 && surroundingMines}
            </div>
        );
    }

    // Create a function to handle the click event
    handleCellClick = (row, col) => {
        const row2 = row.row, col2 = row.col;
        const { board, gameStatus } = this.state;
        if (gameStatus !== 'playing') return;
        const cell = board[row][col];
        if (cell.isRevealed || cell.isFlagged) return;
        if (cell.isMine) {
            this.handleGameOver();
            return;
        }
        this.revealCell(row2, col2);
    }

    // Create a function to handle the right click event
    handleCellRightClick = (row, col) => {
        const row2 = row.row, col2 = row.col;
        const { board, gameStatus } = this.state;
        if (gameStatus !== 'playing') return;
        const cell = board[row2][col2];
        if (cell.isRevealed) return;
        cell.isFlagged = !cell.isFlagged;
        this.setState({ board });
    }

    // Create a function to handle the game over event
    handleGameOver = () => {
        const { board } = this.state;
        board.forEach((row) => {
            row.forEach((cell) => {
                if (cell.isMine) cell.isRevealed = true;
            });
        });
        this.setState({
            board,
            gameStatus: 'game over',
            gameMessage: 'Game Over!'
        });
        this.handleGameEnd();
    }

    // Create a function to handle the game win event
    handleGameWin = () => {
        this.setState({
            gameStatus: 'game win',
            gameMessage: 'You Win!'
        });
        this.handleGameEnd();
    }

    // Create a function to handle the game end event
    handleGameEnd = () => {
        clearInterval(this.state.gameTimerInterval);
    }

    // Create a function to start the timer
    startTimer = () => {
        // gameTimerInterval clear
        for (var i = 1; i < 99999; i++) {
            window.clearInterval(i);
        }
        const gameTimerInterval = setInterval(() => {
            this.setState({ gameTimer: this.state.gameTimer + 1 });
        }, 1000);
        this.setState({ gameTimerInterval });
    }

    // Create a function to place mines
    placeMines = (board, mines) => {
        const { rows, cols } = board;
        while (mines > 0) {
            const row = Math.floor(Math.random() * rows);
            const col = Math.floor(Math.random() * cols);
            const cell = board[row][col];
            if (!cell.isMine) {
                cell.isMine = true;
                mines--;
            }
        }
    }

    // Create a function to place numbers
    placeNumbers = (board) => {
        const { rows, cols } = board;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = board[row][col];
                if (!cell.isMine) {
                    const neighbors = this.getNeighbors(row, col);
                    const surroundingMines = neighbors.filter((neighbor) => neighbor.isMine).length;
                    cell.surroundingMines = surroundingMines;
                    board[row][col].surroundingMines = surroundingMines;
                }
            }
        }
        this.setState({ board });
    }

    // Create a function to reveal a cell
    revealCell = (row, col) => {
        const { board } = this.state;
        const cell = board[row][col];
        if (cell.isRevealed) return;
        cell.isRevealed = true;
        if (cell.surroundingMines === 0) {
            const neighbors = this.getNeighbors(row, col);
            neighbors.forEach((neighbor) => this.revealCell(neighbor.row, neighbor.col));
        }
        this.setState({ board });
        this.checkGameStatus();
    }

    // Create a function to get the neighbors of a cell
    getNeighbors = (row, col) => {
        const { board } = this.state;
        const { rows, cols } = board;
        const neighbors = [];
        for (let i = row - 1; i <= row + 1; i++) {
            for (let j = col - 1; j <= col + 1; j++) {
                if (i >= 0 && i < rows && j >= 0 && j < cols) {
                    neighbors.push(board[i][j]);
                }
            }
        }
        return neighbors;
    }

    // Create a function to check the game status
    checkGameStatus = () => {
        const { board } = this.state;
        let isGameWin = true;
        board.forEach((row) => {
            row.forEach((cell) => {
                if (!cell.isMine && !cell.isRevealed) isGameWin = false;
            });
        });
        if (isGameWin) this.handleGameWin();
    }

    // Create a function to render the board
    renderBoard = () => {
        const { board } = this.state;
        return board.map((row, rowIndex) => (
            <div key={rowIndex} className="rowm">
                {row.map((cell, colIndex) => (
                    <Cell
                        key={colIndex}
                        cell={cell}
                        handleCellLeftClick={this.handleCellLeftClick}
                        handleCellRightClick={this.handleCellRightClick}
                        handleCellDoubleClick={this.handleCellRightClick}
                    />
                ))}
            </div>
        ));
    }
    // Create a function to render the game status
    renderGameStatus = () => {
        const { gameStatus, gameMessage, gameTimer } = this.state;
        if (gameStatus === 'playing') {
            return (
                <div className="game-status">
                    <span>{gameTimer}</span>
                </div>
            );
        }
        return (
            <div className="game-status">
                <span>{gameMessage}</span>
                {gameStatus !== 'gameWin' && (
                    <CustomModal message={gameMessage} />
                )}
            </div>
        );
    }

    // Create a function to render the game difficulty
    renderGameDifficulty = () => {
        const { gameDifficulty, gameDifficultySettings } = this.state;
        return (
            <div className="game-difficulty form-group">
                <select className="form-control" value={gameDifficulty} onChange={this.handleGameDifficultyChange}>
                    {Object.keys(gameDifficultySettings).map((difficulty) => (
                        <option key={difficulty} value={difficulty}>
                            {difficulty}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

    // Create a function to render the game
    render() {
        return (
            <div className="game">
                {this.renderGameStatus()}
                {this.renderGameDifficulty()}
                <div className="board">{this.renderBoard()}</div>
                <div>
                <button
                    className="game__button btn btn-primary"
                    onClick={() => this.startGame()}
                >
                Reset</button>
                </div>
            </div>
        );
    }
}

// Create a function to render the cell
const Cell = ({ cell, handleCellLeftClick, handleCellRightClick, handleCellDoubleClick }) => {
    const { isRevealed, isMine, isFlagged, surroundingMines } = cell;
    const cellClassName = `cell ${isRevealed ? 'revealed' : ''} ${isMine ? 'mine' : ''} ${
        isFlagged ? 'flagged' : ''
    }`;

    const useLongPress = (callback = () => {}, ms = 300) => {
        const [startLongPress, setStartLongPress] = useState(false);

        useEffect(() => {
            let timerId;
            if (startLongPress) {
                timerId = setTimeout(callback, ms);
            } else {
                clearTimeout(timerId);
            }
            return () => {
                clearTimeout(timerId);
            };
        }, [callback, ms, startLongPress]);

        return {
            onMouseDown: () => setStartLongPress(true),
            onMouseUp: () => setStartLongPress(false),
            onMouseLeave: () => setStartLongPress(false),
        };
    };

    const longPress = useLongPress((e) => handleCellRightClick(cell), 300);
    return (
        <div
            className={cellClassName}
            onClick={() => handleCellLeftClick(cell)}
            onContextMenu={(e) => handleCellRightClick(cell)}
            onDoubleClick={(e) => handleCellRightClick(cell)}
            {...longPress}
        >
            {isRevealed && !isMine && surroundingMines > 0 && <span className={`number-${surroundingMines}`}>{surroundingMines}</span>}
        </div>
    );
}
