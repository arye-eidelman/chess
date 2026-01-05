import LocalChessAPI from './LocalChessAPI.js'
import { getDatabase, ref, set, update, onValue, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import Chess from 'chess.js'
import '../firebaseInit.js'

const auth = getAuth();
const db = getDatabase();

class OnlineChessAPI extends LocalChessAPI {
  onChangeCallbacks = []
  gameId = null
  game = null
  lastMove = null
  isHost = false
  gameData = null
  unsubscribe = null
  presenceInterval = null

  constructor(gameId = null) {
    super()
    this.gameId = gameId
  }

  // Create a new game and return the game code
  static async createGame() {
    // Wait for auth to be ready - ensure we have an authenticated user
    if (!auth.currentUser) {
      await new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            unsubscribe()
            resolve()
          }
        })
      })
    }
    
    // Double-check that we have an authenticated user before proceeding
    if (!auth.currentUser) {
      throw new Error('Authentication required. Please refresh the page and try again.')
    }

    const game = new Chess()
    const gameCode = this.generateGameCode()
    
    const gameData = {
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      hostPlayer: auth.currentUser.uid,
      guestPlayer: null,
      whitePlayer: Math.random() < 0.5 ? auth.currentUser.uid : null,
      fen: game.fen(),
      board: game.board(),
      SQUARES: game.SQUARES,
      turn: game.turn(),
      gameOver: game.game_over(),
      check: game.in_check(),
      checkmate: game.in_checkmate(),
      draw: game.in_draw(),
      stalemate: game.in_stalemate(),
      threefoldRepetition: game.in_threefold_repetition(),
      insufficient_material: game.insufficient_material(),
      lastMove: null,
      moveHistory: [], // Initialize empty move history
    }

    await set(ref(db, `games/${gameCode}`), gameData)
    
    const api = new OnlineChessAPI(gameCode)
    api.isHost = true
    api.game = game
    api.gameData = { ...gameData, hostLastActiveAt: gameData.lastActiveAt }
    return { api, gameCode }
  }

  // Join an existing game by code
  static async joinGame(gameCode, joinAsPlayer = null) {
    // Wait for auth to be ready - ensure we have an authenticated user
    if (!auth.currentUser) {
      await new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            unsubscribe()
            resolve()
          }
        })
      })
    }
    
    // Double-check that we have an authenticated user before proceeding
    if (!auth.currentUser) {
      throw new Error('Authentication required. Please refresh the page and try again.')
    }

    const gameRef = ref(db, `games/${gameCode}`)
    const snapshot = await get(gameRef)
    
    if (!snapshot.exists()) {
      throw new Error('Game not found')
    }

    const gameData = snapshot.val()
    const currentUser = auth.currentUser.uid
    
    // Allow host to rejoin their own game (even with new user ID)
    if (gameData.hostPlayer === currentUser || joinAsPlayer === 'host') {
      const api = new OnlineChessAPI(gameCode)
      api.isHost = true
      const game = new Chess()
      // Reconstruct game from move history if available
      if (gameData.moveHistory && Array.isArray(gameData.moveHistory) && gameData.moveHistory.length > 0) {
        gameData.moveHistory.forEach(move => {
          game.move(move)
        })
      } else {
        game.load(gameData.fen)
      }
      api.game = game
      api.gameData = { ...gameData, hostLastActiveAt: new Date().toISOString() }
      api.lastMove = gameData.lastMove || null
      
      // Update host's presence and user ID (in case it changed)
      const updateData = {
        hostLastActiveAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      }
      // Update hostPlayer if user ID changed (rejoining with new anonymous ID)
      if (gameData.hostPlayer !== currentUser && joinAsPlayer === 'host') {
        updateData.hostPlayer = currentUser
        // Also update whitePlayer if it was the old host
        if (gameData.whitePlayer === gameData.hostPlayer) {
          updateData.whitePlayer = currentUser
        }
      }
      await update(gameRef, updateData)
      
      return api
    }
    
    // Allow guest to rejoin if they were already the guest (even with new user ID)
    if (gameData.guestPlayer === currentUser || joinAsPlayer === 'guest') {
      const api = new OnlineChessAPI(gameCode)
      api.isHost = false
      const game = new Chess()
      // Reconstruct game from move history if available
      if (gameData.moveHistory && Array.isArray(gameData.moveHistory) && gameData.moveHistory.length > 0) {
        gameData.moveHistory.forEach(move => {
          game.move(move)
        })
      } else {
        game.load(gameData.fen)
      }
      api.game = game
      api.gameData = { ...gameData, guestLastActiveAt: new Date().toISOString() }
      api.lastMove = gameData.lastMove || null
      
      // Update guest's presence and user ID (in case it changed)
      const updateData = {
        guestLastActiveAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      }
      // Update guestPlayer if user ID changed (rejoining with new anonymous ID)
      if (gameData.guestPlayer !== currentUser && joinAsPlayer === 'guest') {
        updateData.guestPlayer = currentUser
        // Also update whitePlayer if it was the old guest
        if (gameData.whitePlayer === gameData.guestPlayer) {
          updateData.whitePlayer = currentUser
        }
      }
      await update(gameRef, updateData)
      
      return api
    }
    
    // Check if game is full (has a guest who is not the current user)
    if (gameData.guestPlayer && gameData.guestPlayer !== currentUser) {
      throw new Error('Game is full')
    }

    // Set guest player and ensure whitePlayer is set
    if (!gameData.whitePlayer) {
      // Randomly assign if not set
      const isWhite = Math.random() < 0.5
      await update(gameRef, {
        guestPlayer: currentUser,
        whitePlayer: isWhite ? currentUser : gameData.hostPlayer,
        lastActiveAt: new Date().toISOString(),
        guestLastActiveAt: new Date().toISOString(),
      })
    } else {
      await update(gameRef, {
        guestPlayer: currentUser,
        lastActiveAt: new Date().toISOString(),
        guestLastActiveAt: new Date().toISOString(),
      })
    }

    const api = new OnlineChessAPI(gameCode)
    api.isHost = false
    const game = new Chess()
    // Reconstruct game from move history if available
    if (gameData.moveHistory && Array.isArray(gameData.moveHistory) && gameData.moveHistory.length > 0) {
      gameData.moveHistory.forEach(move => {
        game.move(move)
      })
    } else {
      game.load(gameData.fen)
    }
    api.game = game
    api.gameData = { ...gameData, guestLastActiveAt: gameData.lastActiveAt }
    api.lastMove = gameData.lastMove || null
    return api
  }

  static generateGameCode() {
    // Generate a 6-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  async move(move, options = {}) {
    if (!this.gameId) {
      throw new Error('No game ID')
    }

    const moveResult = this.game.move(move, options)
    if (!moveResult) {
      return false
    }

    if (moveResult) {
      this.lastMove = {
        from: moveResult.from,
        to: moveResult.to
      }
    }

    const state = this.state()
    const gameRef = ref(db, `games/${this.gameId}`)
    
    // Store move history as array of moves in UCI format (e.g., "e2e4")
    const moveHistory = this.game.history({ verbose: false })
    
    const updateData = {
      fen: this.game.fen(),
      board: this.game.board(),
      turn: this.game.turn(),
      gameOver: this.game.game_over(),
      check: this.game.in_check(),
      checkmate: this.game.in_checkmate(),
      draw: this.game.in_draw(),
      stalemate: this.game.in_stalemate(),
      threefoldRepetition: this.game.in_threefold_repetition(),
      insufficient_material: this.game.insufficient_material(),
      lastMove: this.lastMove,
      moveHistory: moveHistory, // Store full move history
      lastActiveAt: new Date().toISOString(),
    }

    // Also update player-specific lastActiveAt
    if (this.isHost) {
      updateData.hostLastActiveAt = new Date().toISOString()
    } else {
      updateData.guestLastActiveAt = new Date().toISOString()
    }
    
    await update(gameRef, updateData)

    // Trigger callbacks
    this.onChangeCallbacks.forEach(callback => callback(state))
    return true
  }

  async onChange(callback) {
    this.onChangeCallbacks.push(callback)

    if (this.gameId && !this.unsubscribe) {
      // Listen for game updates
      const gameRef = ref(db, `games/${this.gameId}`)
      this.unsubscribe = onValue(gameRef, (snapshot) => {
        const gameData = snapshot.val()
        if (gameData && this.game) {
          const oldFen = this.game.fen()
          this.gameData = gameData
          // Update game state from Firebase
          const newFen = gameData.fen
          if (newFen && newFen !== oldFen) {
            // Reconstruct game from move history if available (preserves history for undo)
            if (gameData.moveHistory && Array.isArray(gameData.moveHistory) && gameData.moveHistory.length > 0) {
              // Reconstruct by replaying all moves
              this.game.reset()
              gameData.moveHistory.forEach(move => {
                this.game.move(move)
              })
            } else {
              // Fallback to loading FEN (loses history)
              this.game.load(newFen)
            }
            this.lastMove = gameData.lastMove || null
          }
          // Always trigger state update to sync opponent connection status and other metadata
          const state = this.state()
          this.onChangeCallbacks.forEach(cb => cb(state))
        }
      })

      // Start presence heartbeat - update lastActiveAt every 10 seconds
      this.startPresenceHeartbeat()
    }
  }

  startPresenceHeartbeat() {
    if (this.presenceInterval) return

    // Update presence immediately
    this.updatePresence()

    // Then update every 10 seconds
    this.presenceInterval = setInterval(() => {
      this.updatePresence()
    }, 10000)
  }

  async updatePresence() {
    if (!this.gameId) return

    const gameRef = ref(db, `games/${this.gameId}`)
    const currentUser = auth.currentUser
    if (!currentUser) return

    try {
      // Update lastActiveAt for the current player
      const updateData = {}
      if (this.isHost) {
        updateData.hostLastActiveAt = new Date().toISOString()
      } else {
        updateData.guestLastActiveAt = new Date().toISOString()
      }
      await update(gameRef, updateData)
    } catch (error) {
      console.error('Error updating presence:', error)
    }
  }

  stopPresenceHeartbeat() {
    if (this.presenceInterval) {
      clearInterval(this.presenceInterval)
      this.presenceInterval = null
    }
  }

  state() {
    if (!this.game) {
      return null
    }

    const gameData = this.gameData || {}
    const isWhite = gameData?.whitePlayer === auth.currentUser.uid
    const currentUser = auth.currentUser

    // Determine if opponent is online based on lastActiveAt
    let opponentOnline = false
    if (gameData?.guestPlayer) {
      // Opponent has joined
      if (this.isHost) {
        // We're host, check guest's last active time
        const guestLastActive = gameData.guestLastActiveAt || gameData.lastActiveAt
        if (guestLastActive) {
          const timeSinceActive = Date.now() - new Date(guestLastActive).getTime()
          // Consider online if active within last 30 seconds
          opponentOnline = timeSinceActive < 30000
        }
      } else {
        // We're guest, check host's last active time
        const hostLastActive = gameData.hostLastActiveAt || gameData.lastActiveAt
        if (hostLastActive) {
          const timeSinceActive = Date.now() - new Date(hostLastActive).getTime()
          // Consider online if active within last 30 seconds
          opponentOnline = timeSinceActive < 30000
        }
      }
    }

    const baseState = super.state()
    return {
      ...baseState,
      playingAsColor: isWhite ? 'w' : 'b',
      gameOver: gameData?.gameOver || this.game.game_over(),
      draw: gameData?.draw || this.game.in_draw(),
      
      isMyTurn: this.game.turn() === (isWhite ? 'w' : 'b'),
      opponentConnected: gameData?.guestPlayer ? true : false,
      opponentOnline: opponentOnline,
      drawOffered: !!gameData?.drawOfferedBy,
      drawOfferedBy: gameData?.drawOfferedBy,
      undoRequested: !!gameData?.undoRequestedBy,
      undoRequestedBy: gameData?.undoRequestedBy,
      resigned: gameData?.resigned || false,
      resignedBy: gameData?.resignedBy,
      currentUserId: currentUser?.uid,
    }
  }

  moves(...args) {
    return this.game.moves(...args)
  }

  getGameCode() {
    return this.gameId
  }

  getShareableLink() {
    if (!this.gameId) return null
    return `${window.location.origin}${window.location.pathname}?game=${this.gameId}&joinAs=${this.isHost ? 'guest' : 'host'}`
  }

  // Resign the game
  async resign() {
    if (!this.gameId) return
    const gameRef = ref(db, `games/${this.gameId}`)
    const currentUser = auth.currentUser.uid
    const isWhite = this.gameData?.whitePlayer === currentUser
    const resignedColor = isWhite ? 'w' : 'b' // Store color, not user ID
    
    await update(gameRef, {
      gameOver: true,
      resigned: true,
      resignedBy: resignedColor, // Store color ('w' or 'b')
      checkmate: true, // Mark as checkmate so the opponent wins
      lastActiveAt: new Date().toISOString(),
    })
    
    // Update local state
    const state = this.state()
    state.gameOver = true
    state.resigned = true
    state.resignedBy = resignedColor // Store color
    state.checkmate = true
    this.onChangeCallbacks.forEach(callback => callback(state))
  }

  // Offer draw
  async offerDraw() {
    if (!this.gameId) return
    const gameRef = ref(db, `games/${this.gameId}`)
    const currentUser = auth.currentUser.uid
    
    await update(gameRef, {
      drawOfferedBy: currentUser,
      lastActiveAt: new Date().toISOString(),
    })
    
    // Update local state
    const state = this.state()
    state.drawOffered = true
    state.drawOfferedBy = currentUser
    this.onChangeCallbacks.forEach(callback => callback(state))
  }

  // Accept draw
  async acceptDraw() {
    if (!this.gameId) return
    const gameRef = ref(db, `games/${this.gameId}`)
    
    await update(gameRef, {
      gameOver: true,
      draw: true,
      drawAccepted: true,
      lastActiveAt: new Date().toISOString(),
    })
    
    // Update local state
    const state = this.state()
    state.gameOver = true
    state.draw = true
    state.drawAccepted = true
    this.onChangeCallbacks.forEach(callback => callback(state))
  }

  // Request undo (for online games)
  async requestUndo() {
    if (!this.gameId) return
    const gameRef = ref(db, `games/${this.gameId}`)
    const currentUser = auth.currentUser.uid
    
    await update(gameRef, {
      undoRequestedBy: currentUser,
      lastActiveAt: new Date().toISOString(),
    })
    
    // Update local state
    const state = this.state()
    state.undoRequested = true
    state.undoRequestedBy = currentUser
    this.onChangeCallbacks.forEach(callback => callback(state))
  }

  // Accept undo request (for online games)
  async acceptUndo() {
    try {
      // Wait for auth to be ready - ensure we have an authenticated user
      if (!auth.currentUser) {
        await new Promise((resolve) => {
          const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
              unsubscribe()
              resolve()
            }
          })
        })
      }
      
      // Double-check that we have an authenticated user before proceeding
      if (!auth.currentUser) {
        console.error('acceptUndo: No authenticated user')
        return
      }
      
      if (!this.gameId) {
        console.error('acceptUndo: No gameId')
        return
      }
      
      const gameRef = ref(db, `games/${this.gameId}`)
      
      // Get current game data
      const snapshot = await get(ref(db, `games/${this.gameId}`))
      const gameData = snapshot.val()
      
      if (!gameData) {
        console.error('acceptUndo: No game data')
        return
      }
      
      // Check if undo was requested by opponent
      if (!gameData.undoRequestedBy) {
        console.log('acceptUndo: No undo requested')
        return
      }
      
      const currentUser = auth.currentUser
      if (!currentUser || !currentUser.uid) {
        console.error('acceptUndo: No current user after waiting')
        return
      }
      
      const currentUserId = currentUser.uid
      const undoRequestedBy = gameData.undoRequestedBy
      
      console.log('acceptUndo:', { currentUserId, undoRequestedBy })
      
      // Only allow accepting if opponent requested it
      if (undoRequestedBy === currentUserId) {
        console.log('acceptUndo: Cannot accept own request')
        return // Can't accept your own request
      }
      
      // Determine how many moves to undo
      // If the requester moved last, only undo one move. Otherwise, undo two moves.
      const isWhite = gameData.whitePlayer === undoRequestedBy
      const currentTurn = this.game.turn() // 'w' means it's white's turn (black just moved), 'b' means it's black's turn (white just moved)
      const requesterMovedLast = (isWhite && currentTurn === 'b') || (!isWhite && currentTurn === 'w')
      
      if (this.game.history().length === 0) {
        console.log('acceptUndo: No moves to undo')
        return
      }
      
      console.log('acceptUndo: Performing undo, history length:', this.game.history().length, 'requesterMovedLast:', requesterMovedLast)
      
      // Undo the requester's move
      this.game.undo()
      
      // If the requester didn't move last, also undo the opponent's move
      if (!requesterMovedLast && this.game.history().length > 0) {
        this.game.undo()
      }
      
      // Update lastMove based on remaining history
      const history = this.game.history({ verbose: true })
      this.lastMove = history.length > 0 ? {
        from: history[history.length - 1].from,
        to: history[history.length - 1].to
      } : null
      
      // Update Firebase with new game state
      const moveHistory = this.game.history({ verbose: false })
      const updateData = {
        fen: this.game.fen(),
        board: this.game.board(),
        turn: this.game.turn(),
        lastMove: this.lastMove,
        moveHistory: moveHistory, // Update move history after undo
        undoRequestedBy: null, // Clear undo request
        lastActiveAt: new Date().toISOString(),
      }
      
      // Also update player-specific lastActiveAt
      if (this.isHost) {
        updateData.hostLastActiveAt = new Date().toISOString()
      } else {
        updateData.guestLastActiveAt = new Date().toISOString()
      }
      
      console.log('acceptUndo: Updating Firebase with:', updateData)
      await update(gameRef, updateData)
      
      // Update local gameData immediately
      if (this.gameData) {
        this.gameData.fen = this.game.fen()
        this.gameData.board = this.game.board()
        this.gameData.turn = this.game.turn()
        this.gameData.lastMove = this.lastMove
        this.gameData.undoRequestedBy = null
      }
      
      // Update local state
      const state = this.state()
      console.log('acceptUndo: Updated state:', state)
      this.onChangeCallbacks.forEach(callback => callback(state))
    } catch (error) {
      console.error('acceptUndo error:', error)
    }
  }
}

export default OnlineChessAPI
