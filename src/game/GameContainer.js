import React, { useState, useEffect, useRef } from 'react'
import invert from 'lodash/invert'
import ResponsiveDndProvider from './ResponsiveDndProvider.js'

import LocalChessAPI from './LocalChessAPI.js'
import LocalAIChessAPI from './LocalAIChessAPI.js'
import OnlineChessAPI from './OnlineChessAPI.js'
import GamePlay from './GamePlay.js'
import GameSetup from './GameSetup.js'
import GameShare from './GameShare.js'
import GameJoin from './GameJoin.js'
import GameInfoPanel from './GameInfoPanel.js'
import { pieceKeys } from './constants.js'


const configOptions = {
  opponent: [["local", "IRL friend"], ["online_friend", "Online friend"], ["ai", "Computer AI"]],
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
  const [showShare, setShowShare] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [, setJoinError] = useState('')

  // const [gameId, setGameId] = useState(null)
  const [gameState, setGameState] = useState(null)
  const readytoJoinGame = useRef(!config.opponent && !gameState);

  // Check URL for game code (only on initial mount)
  useEffect(() => {
    if (readytoJoinGame.current) {
      const urlParams = new URLSearchParams(window.location.search)
      const gameCode = urlParams.get('game')
      if (gameCode) {
        setConfig({ opponent: 'online_friend', gameCode })
      }
    }
  }, []) // Only run once on mount

  // Close share dialog when opponent joins
  useEffect(() => {
    if (config.opponent === 'online_friend' && gameState?.opponentConnected && showShare) {
      setShowShare(false)
    }
  }, [gameState?.opponentConnected, config.opponent, showShare])

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
      } else if (config.opponent === "online_friend") {
        // Handle online friend mode
        const initializeOnlineGame = async () => {
          try {
            let api
            if (config.gameCode) {
              // Joining existing game
              api = await OnlineChessAPI.joinGame(config.gameCode)
            } else {
              // Creating new game
              const result = await OnlineChessAPI.createGame()
              api = result.api
              setConfig({ ...config, gameCode: result.gameCode })
              setShowShare(true)
            }
            setChessAPI(api)
            const initialState = api.state()
            setGameState(initialState)
            api.onChange(setGameState)
          } catch (error) {
            console.error('Error initializing online game:', error)
            setJoinError(error.message || 'Failed to join game')
            setShowJoin(true)
          }
        }
        initializeOnlineGame()
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
    return !gameState.gameOver
      && chessAPI.moves({ square: position }).length > 0
      && !promotionHold
      && gameState.playingAsColor === gameState.turn
      && (config.opponent !== 'online_friend' || gameState.isMyTurn)
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

  const handleNewGame = () => {
    setConfig({})
    setChessAPI(null)
    setGameState(null)
    setSelectedSquare(null)
    setPromotionHold(null)
    setShowShare(false)
    setShowJoin(false)
    setJoinError('')
    // Clear URL parameter if present
    if (window.location.search) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }

  const handleCreateGame = async () => {
    setConfig({ opponent: 'online_friend' })
  }

  const handleJoinGame = async (gameCode) => {
    try {
      setJoinError('')
      setConfig({ opponent: 'online_friend', gameCode })
      setShowJoin(false)
    } catch (error) {
      setJoinError(error.message || 'Failed to join game')
    }
  }

  if (gameState) {
    return (
      <ResponsiveDndProvider>
        <div className='flex flex-col lg:flex-row items-start lg:items-center justify-center gap-6 p-4'>
          <div className='flex flex-col items-center gap-4'>
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
              isAITurn={config.opponent === 'ai' && gameState.isAITurn}
              isThinking={config.opponent === 'ai' && gameState.isThinking}
              isOnlineGame={config.opponent === 'online_friend'}
              isMyTurn={gameState.isMyTurn}
              opponentConnected={gameState.opponentConnected}
            />
            {config.opponent === 'online_friend' && chessAPI && !gameState.gameOver && !gameState.opponentConnected && (
              <div className='text-center'>
                <button
                  onClick={() => setShowShare(true)}
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors'
                >
                  Share Game
                </button>
              </div>
            )}
          </div>

          <GameInfoPanel
            gameState={gameState}
            playingAsColor={gameState.playingAsColor}
            isOnlineGame={config.opponent === 'online_friend'}
            isMyTurn={gameState.isMyTurn}
            opponentConnected={gameState.opponentConnected}
            isAITurn={config.opponent === 'ai' && gameState.isAITurn}
            isThinking={config.opponent === 'ai' && gameState.isThinking}
            opponentType={config.opponent}
            onNewGame={handleNewGame}
          />
          {showShare && chessAPI && (
            <GameShare
              gameCode={config.gameCode}
              shareableLink={chessAPI.getShareableLink()}
              onClose={() => setShowShare(false)}
            />
          )}
        </div>
      </ResponsiveDndProvider>
    )
  } else {
    return (
      <>
        <GameSetup config={config} setConfig={setConfig} configOptions={configOptions} />
        {config.opponent === 'online_friend' && !config.gameCode && (
          <div className='flex flex-col items-center gap-4 mt-4'>
            <button
              onClick={handleCreateGame}
              className='px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors'
            >
              Create Game
            </button>
            <button
              onClick={() => setShowJoin(true)}
              className='px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors'
            >
              Join Game
            </button>
          </div>
        )}
        {showJoin && (
          <GameJoin
            onJoin={handleJoinGame}
            onCancel={() => {
              setShowJoin(false)
              setConfig({})
            }}
          />
        )}
      </>
    )
  }
}

export default GameContainer