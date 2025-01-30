import React, { useState } from "react";
import { create } from "zustand";

const useGameStore = create((set) => ({
  boardSize: 5,
  players: [
    { id: 1, x: 0, y: 0, color: "red", movingDown: true },
    { id: 2, x: 0, y: 4, color: "blue", movingDown: false },
  ],
  currentPlayerIndex: 0,
  gameOver: false,
  winner: null,
  movePlayer: (playerId, steps) =>
    set((state) => {
      const players = [...state.players];
      const playerIndex = players.findIndex((p) => p.id === playerId);
      if (playerIndex === -1 || state.gameOver) return state;
      
      const player = players[playerIndex];
      const boardSize = state.boardSize;
      let currentPosition = player.y * boardSize + player.x;
      
      let newPosition;
      if (player.movingDown) {
        newPosition = currentPosition + steps;
        if (newPosition >= boardSize * boardSize) {
          player.movingDown = false;
          newPosition = (boardSize * boardSize - 1) - (newPosition - (boardSize * boardSize - 1));
        }
      } else {
        newPosition = currentPosition - steps;
        if (newPosition < 0) {
          player.movingDown = true;
          newPosition = Math.abs(newPosition);
        }
      }

      newPosition = Math.max(0, Math.min(boardSize * boardSize - 1, newPosition));

      const newY = Math.floor(newPosition / boardSize);
      const newX = newPosition % boardSize;

      players[playerIndex] = { ...player, x: newX, y: newY };
      
      const otherPlayer = players.find(p => p.id !== playerId);
      let gameOver = state.gameOver;
      let winner = state.winner;
      
      if (newX === otherPlayer.x && newY === otherPlayer.y) {
        gameOver = true;
        winner = playerId;
        // If blue player (id: 2) wins, remove the red player
        if (playerId === 2) {
          players.splice(players.findIndex(p => p.id === 1), 1);
        }
      }
      
      return { 
        players, 
        currentPlayerIndex: (state.currentPlayerIndex + 1) % players.length,
        gameOver,
        winner
      };
    }),
  setPlayerPosition: (id, x, y) =>
    set((state) => {
      const players = state.players.map((player) =>
        player.id === id ? { ...player, x, y } : player
      );
      return { players, currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length };
    }),
}));

const BoardGame = () => {
  const { boardSize, players, currentPlayerIndex, movePlayer, gameOver, winner } = useGameStore();
  const [diceRoll, setDiceRoll] = useState(1);

  const rollDice = () => {
    if (gameOver) return;
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceRoll(roll);
    movePlayer(players[currentPlayerIndex].id, roll);
  };

  const handleDrop = (event, x, y) => {
    const playerId = parseInt(event.dataTransfer.getData("playerId"), 10);
    useGameStore.getState().setPlayerPosition(playerId, x, y);
  };

  return (
    <div className="container">
      <h1 className="title">Virtual Board Game</h1>
      <div className="game-info">
        {gameOver ? (
          <div className="game-over">
            <h2>Game Over!</h2>
            <p>Player {winner} ({players[winner === 2 ? 0 : winner-1].color}) Wins!</p>
          </div>
        ) : (
          <>
            <p>Current Turn: Player {players[currentPlayerIndex].id} ({players[currentPlayerIndex].color})</p>
            <p>Last Dice Roll: {diceRoll}</p>
            <p>Direction: {players[currentPlayerIndex].movingDown ? "Moving Down" : "Moving Up"}</p>
            <button onClick={rollDice}>Roll Dice</button>
          </>
        )}
      </div>
      <div className="board">
        {[...Array(boardSize * boardSize)].map((_, index) => {
          const x = index % boardSize;
          const y = Math.floor(index / boardSize);
          const player = players.find((p) => p.x === x && p.y === y);
          return (
            <div 
              key={index} 
              className="cell" 
              onDragOver={(e) => e.preventDefault()} 
              onDrop={(e) => handleDrop(e, x, y)}
            >
              {player && (
                <div
                  className="player"
                  style={{ backgroundColor: player.color }}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("playerId", player.id.toString());
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="turn-indicator">Player {players[currentPlayerIndex].id}'s turn</p>
    </div>
  );
};

export default BoardGame;
