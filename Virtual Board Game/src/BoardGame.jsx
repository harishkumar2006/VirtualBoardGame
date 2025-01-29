import React, { useState } from "react";
import { create } from "zustand";

const useGameStore = create((set) => ({
  boardSize: 5,
  players: [
    { id: 1, x: 0, y: 0, color: "red" },
    { id: 2, x: 4, y: 4, color: "blue" },
  ],
  currentPlayerIndex: 0,
  movePlayer: (playerId, dx, dy) =>
    set((state) => {
      const players = [...state.players];
      const playerIndex = players.findIndex((p) => p.id === playerId);
      if (playerIndex === -1) return state;
      
      const player = players[playerIndex];
      const newX = Math.max(0, Math.min(state.boardSize - 1, player.x + dx));
      const newY = Math.max(0, Math.min(state.boardSize - 1, player.y + dy));
      players[playerIndex] = { ...player, x: newX, y: newY };
      
      return { players, currentPlayerIndex: (state.currentPlayerIndex + 1) % players.length };
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
  const { boardSize, players, currentPlayerIndex, movePlayer, setPlayerPosition } = useGameStore();
  const [diceRoll, setDiceRoll] = useState(1);

  const rollDice = () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceRoll(roll);
    movePlayer(players[currentPlayerIndex].id, roll, 0); 
  };

  const handleDrop = (event, x, y) => {
    const playerId = parseInt(event.dataTransfer.getData("playerId"), 10);
    setPlayerPosition(playerId, x, y);
  };

  return (
    <div className="container">
      <h1 className="title">Virtual Board Game</h1>
      <div className="board">
        {[...Array(boardSize * boardSize)].map((_, index) => {
          const x = index % boardSize;
          const y = Math.floor(index / boardSize);
          const player = players.find((p) => p.x === x && p.y === y);
          return (
            <div key={index} className="cell" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, x, y)}>
              {player && (
                <div
                  className="player"
                  style={{ backgroundColor: player.color }}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("playerId", player.id)}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="controls">
        <button className="button" onClick={rollDice}>🎲 Roll Dice</button>
        <p>Dice Roll: {diceRoll}</p>
      </div>
      <p className="turn-indicator">Player {players[currentPlayerIndex].id}'s turn</p>
    </div>
  );
};

export default BoardGame;
