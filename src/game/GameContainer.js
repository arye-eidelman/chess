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
        : config.opponent === "online_friend"
          ? (config.gameCode !== undefined || config.shouldCreateGame === true) // Only valid if gameCode is set or user clicked Create
          : true)
}

const GameContainer = () => {
  const [config, setConfig] = useState({})
  const [chessAPI, setChessAPI] = useState(null)
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [promotionHold, setPromotionHold] = useState(null)
  const [showShare, setShowShare] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [joinError, setJoinError] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  // const [gameId, setGameId] = useState(null)
  const [gameState, setGameState] = useState(null)
  const readytoJoinGame = useRef(!config?.opponent && !gameState);
  const previousOpponentConnected = useRef(false);
  const shareOpenedManually = useRef(false);

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

  // Close share dialog only when opponent transitions from disconnected to connected
  // Don't close if the dialog was opened manually for rejoin
  useEffect(() => {
    const currentlyConnected = gameState?.opponentConnected || false
    const wasConnected = previousOpponentConnected.current
    
    // Only close if opponent just connected (transition from false to true)
    // AND the dialog wasn't opened manually for rejoin
    if (config.opponent === 'online_friend' && !wasConnected && currentlyConnected && showShare && !shareOpenedManually.current) {
      setShowShare(false)
      shareOpenedManually.current = false
    }
    
    // Update the ref for next comparison
    previousOpponentConnected.current = currentlyConnected
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
              setConfig({ ...config, gameCode: result.gameCode, shouldCreateGame: false })
              setShowShare(true)
            }
            setChessAPI(api)
            const initialState = api.state()
            setGameState(initialState)
            api.onChange(setGameState)
          } catch (error) {
            console.error('Error initializing online game:', error)
            const errorMessage = error.message || 'Failed to join game'
            setJoinError(errorMessage)
            
            // Check if this was a URL-based join attempt
            const urlParams = new URLSearchParams(window.location.search)
            const gameCodeFromUrl = urlParams.get('game')
            const isUrlJoin = gameCodeFromUrl && config.gameCode === gameCodeFromUrl
            
            if (isUrlJoin) {
              // URL join failed - reset config to show setup screen (user can try again)
              setConfig({ opponent: 'online_friend' })
            } else if (!showJoin) {
              // Manual join attempt that failed - show join dialog with error
              // Only if join dialog isn't already showing
              setShowJoin(true)
            }
            // If showJoin is already true, the error is already displayed in the dialog
          }
        }
        initializeOnlineGame()
      }
    }

    // Cleanup function
    return () => {
      // Cleanup will be handled by the chessAPI state cleanup
      // The presence heartbeat will stop when a new API is created
    }
  }, [config])

  // Cleanup presence heartbeat when chessAPI changes or component unmounts
  useEffect(() => {
    return () => {
      if (chessAPI && chessAPI.stopPresenceHeartbeat) {
        chessAPI.stopPresenceHeartbeat()
      }
    }
  }, [chessAPI])

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
    setConfig({ opponent: 'online_friend', shouldCreateGame: true })
  }

  const handleJoinGame = async (gameCode) => {
    if (isJoining) return // Prevent multiple join attempts

    try {
      setIsJoining(true)
      setJoinError('')
      // Try to join the game - this will throw an error if the game doesn't exist or is invalid
      await OnlineChessAPI.joinGame(gameCode)
      // If successful, set the config to initialize the game
      setConfig({ opponent: 'online_friend', gameCode })
      setShowJoin(false)
      setIsJoining(false)
      // Clear URL if present since we're now in the game
      if (window.location.search) {
        window.history.replaceState({}, '', window.location.pathname)
      }
    } catch (error) {
      setJoinError(error.message || 'Failed to join game')
      setIsJoining(false)
    }
  }

  if (gameState) {
    return (
      <ResponsiveDndProvider>
        <div className='flex flex-col md:flex-row items-start md:items-center justify-center gap-4 md:gap-6 p-2 md:p-4 w-full min-h-[100vh] overflow-hidden'>
          <div className='flex flex-col items-center gap-4 grow w-full md:w-auto'>
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
                    : gameState.playingAsColor}
              isAITurn={config.opponent === 'ai' && gameState.isAITurn}
              isThinking={config.opponent === 'ai' && gameState.isThinking}
              isOnlineGame={config.opponent === 'online_friend'}
              isMyTurn={gameState.isMyTurn}
              opponentConnected={gameState.opponentConnected}
            />
          </div>

          <GameInfoPanel
            gameState={gameState}
            playingAsColor={gameState.playingAsColor}
            isOnlineGame={config.opponent === 'online_friend'}
            isMyTurn={gameState.isMyTurn}
            opponentConnected={gameState.opponentConnected}
            opponentOnline={gameState.opponentOnline}
            isAITurn={config.opponent === 'ai' && gameState.isAITurn}
            isThinking={config.opponent === 'ai' && gameState.isThinking}
            opponentType={config.opponent}
            onNewGame={handleNewGame}
            onShareGame={chessAPI && config.gameCode ? () => {
              shareOpenedManually.current = true
              setShowShare(true)
            } : undefined}
            onResign={chessAPI ? () => chessAPI.resign() : undefined}
            onOfferDraw={chessAPI ? () => chessAPI.offerDraw() : undefined}
            onAcceptDraw={chessAPI && config.opponent === 'online_friend' && gameState.drawOffered && gameState.drawOfferedBy && gameState.currentUserId && gameState.drawOfferedBy !== gameState.currentUserId ? () => chessAPI.acceptDraw() : undefined}
            onUndo={chessAPI && (config.opponent === 'local' || config.opponent === 'ai') ? () => chessAPI.undo() : undefined}
            onRequestUndo={chessAPI && config.opponent === 'online_friend' ? () => chessAPI.requestUndo() : undefined}
            onAcceptUndo={chessAPI && config.opponent === 'online_friend' ? async () => {
              console.log('Accept undo clicked')
              try {
                await chessAPI.acceptUndo()
              } catch (error) {
                console.error('Error accepting undo:', error)
              }
            } : undefined}
          />
          {showShare && chessAPI && (
            <GameShare
              gameCode={config.gameCode}
              shareableLink={chessAPI.getShareableLink()}
              onClose={() => {
                shareOpenedManually.current = false
                setShowShare(false)
              }}
            />
          )}
        </div>
      </ResponsiveDndProvider>
    )
  } else {
    return (
      <>
        <GameSetup
          config={config}
          setConfig={setConfig}
          configOptions={configOptions}
          onCreateGame={handleCreateGame}
          onJoinGame={() => {
            setJoinError('')
            setShowJoin(true)
          }}
        />
        {showJoin && (
          <GameJoin
            onJoin={handleJoinGame}
            onCancel={() => {
              setShowJoin(false)
              setConfig({})
              setJoinError('')
              setIsJoining(false)
            }}
            onInputChange={() => setJoinError('')}
            joinError={joinError}
            isJoining={isJoining}
          />
        )}
      </>
    )
  }
}

export default GameContainer