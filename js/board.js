var Board = {
  initializeCache: function() {
    for (var i = 0; i < Config.COORDINATES.length; i++) {
      var coord = Config.COORDINATES[i];
      var el = document.getElementById(coord);
      GameState.cache.squares[coord] = el;
      GameState.cache.squareColors[coord] = (el.className.indexOf('white') !== -1);
      GameState.board.pieces[coord] = null;
    }
  },
  
  draw: function(fen) {
    var position = FenUtils.toPosition(fen);
    
    for (var i = 0; i < Config.COORDINATES.length; i++) {
      var coord = Config.COORDINATES[i];
      var square = GameState.cache.squares[coord];
      var newPiece = position[coord] || null;
      var oldPiece = GameState.board.pieces[coord];
      
      if (newPiece !== oldPiece) {
        square.innerHTML = newPiece ? Config.getPieceImageHtml(newPiece) : '';
        GameState.board.pieces[coord] = newPiece;
      }
      
      this.resetSquareColor(coord);
    }
    
    UI.updateActivePlayer(fen);
  },
  
  getSquareColor: function(coord) {
    return GameState.cache.squareColors[coord] ? 
           Config.SQUARE_COLORS.LIGHT : 
           Config.SQUARE_COLORS.DARK;
  },
  
  resetSquareColor: function(coord) {
    var el = GameState.cache.squares[coord];
    if (el) {
      el.style.backgroundColor = this.getSquareColor(coord);
    }
  },
  
  resetAllSquareColors: function() {
    for (var i = 0; i < Config.COORDINATES.length; i++) {
      this.resetSquareColor(Config.COORDINATES[i]);
    }
  },
  
  highlightSquare: function(coord) {
    var el = GameState.cache.squares[coord];
    if (el) {
      el.style.backgroundColor = Config.SQUARE_COLORS.SELECTED;
    }
  },
  
  setPiece: function(coord, pieceCode) {
    var el = GameState.cache.squares[coord];
    if (el) {
      el.innerHTML = pieceCode ? Config.getPieceImageHtml(pieceCode) : '';
      GameState.board.pieces[coord] = pieceCode;
    }
  },
  
  movePiece: function(from, to) {
    var piece = GameState.board.pieces[from];
    this.setPiece(to, piece);
    this.setPiece(from, null);
    return piece;
  },
  
  handleCastling: function(from, to, pieceColor) {
    // Detect king moving two squares horizontally
    if (from[0] === 'e' && (to[0] === 'g' || to[0] === 'c') && from[1] === to[1]) {
      var rookFrom, rookTo;
      
      if (to[0] === 'g') {
        // Kingside castling
        rookFrom = 'h' + from[1];
        rookTo = 'f' + from[1];
      } else {
        // Queenside castling
        rookFrom = 'a' + from[1];
        rookTo = 'd' + from[1];
      }
      
      this.movePiece(rookFrom, rookTo);
    }
  },
  
  // Handle en passant capture
  // Returns info object for reverting, or null if not en passant
  handleEnPassant: function(from, to, piece) {
    // Only pawns can capture en passant
    if (!piece || piece[1] !== 'P') return null;
    
    // Must be a diagonal move (file changed)
    if (from[0] === to[0]) return null;
    
    // The captured pawn's square: destination file + origin rank
    // (the captured pawn is beside where our pawn started, on the file we're moving to)
    var capturedSquare = to[0] + from[1];
    
    // Check if there's a pawn to capture on that square
    var capturedPiece = GameState.board.pieces[capturedSquare];
    if (capturedPiece && capturedPiece[1] === 'P') {
      // Store info for potential revert
      var info = {
        square: capturedSquare,
        piece: capturedPiece,
        html: GameState.cache.squares[capturedSquare].innerHTML
      };
      
      // Remove the captured pawn
      this.setPiece(capturedSquare, null);
      
      return info;
    }
    
    return null;
  },
  
  clear: function() {
    for (var i = 0; i < Config.COORDINATES.length; i++) {
      var coord = Config.COORDINATES[i];
      GameState.cache.squares[coord].innerHTML = '';
      GameState.board.pieces[coord] = null;
    }
  },
  
  preloadImages: function() {
    for (var i = 0; i < Config.PIECE_CODES.length; i++) {
      var img = new Image();
      img.src = Config.getPieceImageUrl(Config.PIECE_CODES[i]);
    }
  }
};