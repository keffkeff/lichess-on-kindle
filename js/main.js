// Square click handler
function handleSquareClick(event) {
    if (!GameState.isPlayerTurn()) return;
    
    var square = event.currentTarget.id;
    var piece = GameState.board.pieces[square];
    var selected = GameState.board.selectedSquare;
    
    if (selected === null) {
      // First click - select a piece
      if (!piece) return;
      
      // Check if piece belongs to player
      var pieceColor = piece[0] === 'w' ? 'white' : 'black';
      if (pieceColor !== GameState.player.color) return;
      
      GameState.board.selectedSquare = square;
      Board.highlightSquare(square);
    } else {
      // Second click
      if (square === selected) {
        // Deselect
        Board.resetSquareColor(selected);
        GameState.board.selectedSquare = null;
        return;
      }
      
      // Check if clicking on own piece (to change selection)
      if (piece) {
        var clickedColor = piece[0] === 'w' ? 'white' : 'black';
        if (clickedColor === GameState.player.color) {
          Board.resetSquareColor(selected);
          GameState.board.selectedSquare = square;
          Board.highlightSquare(square);
          return;
        }
      }
      
      // Make a move
      var from = selected;
      var to = square;
      
      Board.resetSquareColor(selected);
      GameState.board.selectedSquare = null;
      
      AIGame.makeMove(from, to);
    }
  }
  
  // Setup event handlers
  function setupEventHandlers() {
    var newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
      newGameBtn.onclick = function() {
        AIGame.reset();
        UI.showElement('ai-options');
        UI.hideElement('new-game-btn');
      };
    }
    
    var cancelBtn = document.getElementById('cancel-ai-game');
    if (cancelBtn) {
      cancelBtn.onclick = function() {
        UI.hideElement('ai-options');
        UI.showInline('new-game-btn');
      };
    }
    
    var startBtn = document.getElementById('start-ai-game');
    if (startBtn) {
      startBtn.onclick = function() {
        AIGame.start();
      };
    }
    
    var resignBtn = document.getElementById('resign-game');
    if (resignBtn) {
      resignBtn.onclick = function() {
        AIGame.resign();
      };
    }
    
    // Square click handlers
    for (var i = 0; i < Config.COORDINATES.length; i++) {
      var coord = Config.COORDINATES[i];
      var square = GameState.cache.squares[coord];
      if (square) {
        square.onclick = handleSquareClick;
      }
    }
  }
  
  // Initialize application
  window.onload = function() {
    // Initialize board cache first
    Board.initializeCache();
    
    // Preload piece images
    Board.preloadImages();
    
    // Setup event handlers
    setupEventHandlers();
    
    // Start TV mode by default
    TVMode.start();
  };