var GameState = {
  // Game identification and status
  game: {
    id: null,
    mode: 'tv',
    status: 'idle'
  },
  
  // Player information
  player: {
    color: 'white'
  },
  
  // Board state
  board: {
    currentFen: Config.STARTING_FEN,
    pieces: {},
    selectedSquare: null
  },
  
  // Turn tracking
  turn: {
    color: 'white',
    moveCount: 0,
    pending: false
  },
  
  // Clock state
  clock: {
    whiteTimeMs: Config.DEFAULT_TIME_MS,
    blackTimeMs: Config.DEFAULT_TIME_MS,
    lastUpdate: null,
    interval: null
  },
  
  // DOM cache
  cache: {
    squares: {},
    squareColors: {}
  },
  
  // Network state
  network: {
    currentStreamXhr: null,
    globalFeedXhr: null
  },
  
  // ----- Helper Methods -----
  
  // Check if game is currently playable (waiting for first move OR active)
  isGameActive: function() {
    return this.game.status === Config.GAME_STATUS.ACTIVE ||
           this.game.status === Config.GAME_STATUS.WAITING;
  },
  
  // Check if it's the player's turn
  // FIX: Use isGameActive() instead of checking only for ACTIVE status
  isPlayerTurn: function() {
    return this.isGameActive() && 
           this.turn.color === this.player.color;
  },
  
  // Check if a color has made at least one move
  hasColorMoved: function(color) {
    if (color === 'white') {
      return this.turn.moveCount >= 1;
    }
    return this.turn.moveCount >= 2;
  },
  
  // Update turn state from move count
  updateTurnFromMoveCount: function(count) {
    this.turn.moveCount = count;
    this.turn.color = (count % 2 === 0) ? 'white' : 'black';
  },
  
  // Update turn color from FEN
  updateTurnFromFen: function(fen) {
    if (!fen) return;
    var parts = fen.split(' ');
    if (parts.length > 1) {
      this.turn.color = (parts[1] === 'w') ? 'white' : 'black';
    }
  },
  
  // Reset all state to initial values
  reset: function() {
    this.game.id = null;
    this.game.status = Config.GAME_STATUS.IDLE;
    
    this.board.selectedSquare = null;
    this.board.currentFen = Config.STARTING_FEN;
    
    this.turn.color = 'white';
    this.turn.moveCount = 0;
    this.turn.pending = false;
    
    this.clock.whiteTimeMs = Config.DEFAULT_TIME_MS;
    this.clock.blackTimeMs = Config.DEFAULT_TIME_MS;
    this.clock.lastUpdate = null;
    
    for (var coord in this.board.pieces) {
      if (this.board.pieces.hasOwnProperty(coord)) {
        this.board.pieces[coord] = null;
      }
    }
  },
  
  setWaiting: function() {
    this.game.status = Config.GAME_STATUS.WAITING;
    this.turn.moveCount = 0;
    this.turn.color = 'white';
  },
  
  setActive: function() {
    this.game.status = Config.GAME_STATUS.ACTIVE;
  },
  
  setEnded: function() {
    this.game.status = Config.GAME_STATUS.ENDED;
  }
};