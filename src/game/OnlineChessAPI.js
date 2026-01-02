import { getDatabase, ref, set, update, onValue, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import Chess from 'chess.js'
import '../firebaseInit.js'

const auth = getAuth();
const db = getDatabase();

class OnlineChessAPI {
  onChangeCallbacks = []
  gameId = null
  game = null
  lastMove = null
  isHost = false
  gameData = null
  unsubscribe = null

  constructor(gameId = null) {
    this.game = new Chess()
    this.gameId = gameId
  }

  // Create a new game and return the game code
  static async createGame() {
    // Wait for auth to be ready
    if (!auth.currentUser) {
      await new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          unsubscribe()
          resolve()
        })
      })
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
    }

    await set(ref(db, `games/${gameCode}`), gameData)
    
    const api = new OnlineChessAPI(gameCode)
    api.isHost = true
    api.game = game
    api.gameData = gameData
    return { api, gameCode }
  }

  // Join an existing game by code
  static async joinGame(gameCode) {
    // Wait for auth to be ready
    if (!auth.currentUser) {
      await new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          unsubscribe()
          resolve()
        })
      })
    }

    const gameRef = ref(db, `games/${gameCode}`)
    const snapshot = await get(gameRef)
    
    if (!snapshot.exists()) {
      throw new Error('Game not found')
    }

    const gameData = snapshot.val()
    
    if (gameData.guestPlayer && gameData.guestPlayer !== auth.currentUser.uid) {
      throw new Error('Game is full')
    }

    if (gameData.hostPlayer === auth.currentUser.uid) {
      throw new Error('You are already the host of this game')
    }

    // Set guest player and ensure whitePlayer is set
    if (!gameData.whitePlayer) {
      // Randomly assign if not set
      const isWhite = Math.random() < 0.5
      await update(gameRef, {
        guestPlayer: auth.currentUser.uid,
        whitePlayer: isWhite ? auth.currentUser.uid : gameData.hostPlayer,
        lastActiveAt: new Date().toISOString(),
      })
    } else {
      await update(gameRef, {
        guestPlayer: auth.currentUser.uid,
        lastActiveAt: new Date().toISOString(),
      })
    }

    const api = new OnlineChessAPI(gameCode)
    api.isHost = false
    const game = new Chess()
    game.load(gameData.fen)
    api.game = game
    api.gameData = gameData
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
    
    await update(gameRef, {
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
      lastActiveAt: new Date().toISOString(),
    })

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
            this.game.load(newFen)
            this.lastMove = gameData.lastMove || null
          }
          // Always trigger state update to sync opponent connection status and other metadata
          const state = this.state()
          this.onChangeCallbacks.forEach(cb => cb(state))
        }
      })
    }
  }

  state() {
    if (!this.game) {
      return null
    }

    const gameData = this.gameData || {}
    const isWhite = gameData?.whitePlayer === auth.currentUser.uid

    return {
      fen: this.game.fen(),
      board: this.game.board(),
      SQUARES: this.game.SQUARES || [
        'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
        'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
        'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
        'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
        'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
        'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
        'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
        'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'
      ],
      turn: this.game.turn(),
      playingAsColor: isWhite ? 'w' : 'b',
      gameOver: this.game.game_over(),
      check: this.game.in_check(),
      checkmate: this.game.in_checkmate(),
      draw: this.game.in_draw(),
      stalemate: this.game.in_stalemate(),
      threefoldRepetition: this.game.in_threefold_repetition(),
      insufficient_material: this.game.insufficient_material(),
      lastMove: this.lastMove,
      isMyTurn: this.game.turn() === (isWhite ? 'w' : 'b'),
      opponentConnected: gameData?.guestPlayer ? true : false,
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
    return `${window.location.origin}${window.location.pathname}?game=${this.gameId}`
  }
}

export default OnlineChessAPI
