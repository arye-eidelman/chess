import React, { useState, useEffect } from 'react'
import invert from 'lodash/invert'
import ResponsiveDndProvider from './ResponsiveDndProvider.js'
import { getAuth } from "firebase/auth";

import LocalChessAPI from './LocalChessAPI.js'
import LocalAIChessAPI from './LocalAIChessAPI.js'
import OnlineChessAPI from './OnlineChessAPI.js'
import GamePlay from './GamePlay.js'
import GameSetup from './GameSetup.js'
import { pieceKeys } from './constants.js'


const configOptions = {
  opponent: [["local", "Local"], ["online_random", "Online random"], ["online_friend", "Online friend"], ["ai", "AI"]],
  color: [["random", "Random"], ["w", "White"], ["b", "Black"]],
  difficulty: [["easy", "Easy"], ["medium", "Medium"], ["hard", "Hard"], ["impossible", "Impossible"]],
  rotate: [[true, "Yes"], [false, "No"]]
}


function isValidConfig(config) {
  return config.opponent !== undefined
    && (config.opponent === "local"
      ? (config.rotate !== undefined)
      : config.opponent === "ai"
        ? (config.color !== undefined && config.difficulty !== undefined)
        : true)
}

const GameContainer = () => {
  const [config, setConfig] = useState({})
  const [chessAPI, setChessAPI] = useState(null)
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [promotionHold, setPromotionHold] = useState(null)

  // const [gameId, setGameId] = useState(null)
  const [gameState, setGameState] = useState(null)

  useEffect(() => {
    if (isValidConfig(config)) {
      if (config.opponent === "local") {
        const api = new LocalChessAPI()
        setChessAPI(api)
        setGameState(api.state())
        api.onChange(setGameState)
      } else if (config.opponent === "ai") {
        // Determine AI color based on player's color choice
        let playerColor = config.color
        if (playerColor === "random") {
          playerColor = Math.random() < 0.5 ? "w" : "b"
        }
        // AI plays opposite color of player
        const aiColor = playerColor === "w" ? "b" : "w"
        
        const api = new LocalAIChessAPI(config.difficulty, aiColor)
        setChessAPI(api)
        setGameState(api.state())
        api.onChange(setGameState)
        
        // If AI plays white, make first move
        if (aiColor === "w") {
          setTimeout(() => {
            api.makeAIMove()
          }, 500)
        }
      }
    }
  }, [config])

  const xyToPosition = ({ x, y }) => gameState.SQUARES[y * 8 + x]
  const positionToXY = (position) => {
    if (typeof position === "number") {
      const x = position % 8
      const y = Math.floor(position / 8)
      return { x, y }
    } else if (typeof position === "string") {
      const x = position.charCodeAt(0) - 97
      const y = 7 - (position.charCodeAt(1) - 49)
      return { x, y }
    }
  }

  const canPickUp = position => {
    return chessAPI.moves({ square: position }).length > 0
      && !promotionHold
      && gameState.playingAsColor === gameState.turn
  }

  const pickUpPiece = (position) => {
    if (canPickUp(position)) {
      setSelectedSquare(position)
    }
  }

  const legalMoves = chessAPI ? chessAPI.moves({ square: selectedSquare || "or it'll return []", verbose: true }) : []

  const canPutDown = (position) => {
    if (promotionHold) { return false }
    return position === selectedSquare || legalMoves.some(move => move.to === position)
  }

  const putDownPiece = (position) => {
    if (canPutDown(position)) {
      move({ from: selectedSquare, to: position })
      setSelectedSquare(null)
    }
  }

  const selectSquare = (position) => {
    if (canPutDown(position)) {
      putDownPiece(position)
    } else {
      pickUpPiece(position)
    }
  }

  const move = (moveObject) => {
    if (legalMoves.some(move => move.to === moveObject.to && move.flags.includes("p"))) {
      setPromotionHold(moveObject)
    } else {
      chessAPI.move(moveObject)
    }
  }

  const selectPromotion = (piece) => {
    const promotionMove = { ...promotionHold, promotion: invert(pieceKeys)[piece] }
    chessAPI.move(promotionMove)
    setPromotionHold(null)
  }

  const cancelPromotion = () => setPromotionHold(null)

  if (gameState) {
    return (
      <ResponsiveDndProvider>
        <GamePlay
          gameState={gameState}
          xyToPosition={xyToPosition}
          positionToXY={positionToXY}
          canPickUp={canPickUp}
          canPutDown={canPutDown}
          pickUpPiece={pickUpPiece}
          putDownPiece={putDownPiece}
          selectedSquare={selectedSquare}
          selectSquare={selectSquare}
          promotionHold={promotionHold}
          selectPromotion={selectPromotion}
          cancelPromotion={cancelPromotion}
          playingAsColor={gameState.playingAsColor}
          boardPerspective={
            config.rotate
              ? gameState.turn
              : config.opponent === 'local'
                ? 'w'
                : config.opponent === 'ai'
                  ? gameState.playingAsColor
                  : gameState.playingAsColor}
        />
      </ResponsiveDndProvider>
    )
  } else {
    return (
      <GameSetup config={config} setConfig={setConfig} configOptions={configOptions} />
    )
  }
}

export default GameContainer