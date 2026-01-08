var Config = {
    COLUMNS: 'abcdefgh'.split(''),
    COORDINATES: [
      "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8",
      "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8",
      "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8",
      "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8",
      "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8",
      "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8",
      "g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8",
      "h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8"
    ],
    
    // Piece image configuration
    PIECE_IMAGE_PATH: 'img/chesspieces/svg/',
    PIECE_IMAGE_EXT: '.svg',
    PIECE_IMAGE_CLASS: 'pieces',
    PIECE_CODES: ['wR', 'wN', 'wB', 'wQ', 'wK', 'wP', 'bR', 'bN', 'bB', 'bQ', 'bK', 'bP'],
    PIECE_IMAGES: {}, // Populated at init
    
    // Game status constants
    GAME_STATUS: {
      IDLE: 'idle',       // No game
      WAITING: 'waiting', // Game created, waiting for first move
      ACTIVE: 'active',   // Game in progress with moves
      ENDED: 'ended'      // Game finished
    },
    
    // Game mode constants
    GAME_MODE: {
      TV: 'tv',
      AI: 'ai'
    },
    
    STARTING_FEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    DEFAULT_TIME_MS: 300000, // 5 minutes
    TIME_INCREMENT_MS: 1000, // 1 second increment
    API_TOKEN: 'Bearer API_KEY',
    LICHESS_API_BASE: 'https://lichess.org/api',
    
    // Square colors
    SQUARE_COLORS: {
      LIGHT: '#fff',
      DARK: '#999',
      SELECTED: '#aaffaa'
    },
    
    // Initialize dynamic config values
    init: function() {
      // Generate piece image HTML strings
      for (var i = 0; i < this.PIECE_CODES.length; i++) {
        var code = this.PIECE_CODES[i];
        this.PIECE_IMAGES[code] = '<img class="' + this.PIECE_IMAGE_CLASS + 
          '" src="' + this.PIECE_IMAGE_PATH + code + this.PIECE_IMAGE_EXT + '">';
      }
    },
    
    // Helper to get piece image HTML (for dynamic use)
    getPieceImageHtml: function(pieceCode) {
      return this.PIECE_IMAGES[pieceCode] || '';
    },
    
    // Helper to get piece image URL (for preloading)
    getPieceImageUrl: function(pieceCode) {
      return this.PIECE_IMAGE_PATH + pieceCode + this.PIECE_IMAGE_EXT;
    }
  };
  
  // Initialize config immediately
  Config.init();