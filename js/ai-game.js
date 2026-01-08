var AIGame = {
  start: function() {
    var level = document.getElementById('ai-level').value;
    var colorChoice = document.getElementById('player-color').value;
    
    GameState.player.color = colorChoice;
    GameState.game.mode = Config.GAME_MODE.AI;
    GameState.setWaiting();
    
    UI.showMessage('Starting game...');
    UI.hideElement('ai-options');
    UI.showElement('game-controls');
    
    Network.abortAllStreams();
    Clock.stop();
    
    var params = 'level=' + level + '&clock.limit=300&clock.increment=1';
    if (colorChoice !== 'random') {
      params += '&color=' + colorChoice;
    }
    
    Network.makeAuthRequest('POST', '/challenge/ai', params, {
      onComplete: function(xhr) {
        if (xhr.status === 200 || xhr.status === 201) {
          AIGame.handleGameCreated(xhr.responseText);
        } else {
          AIGame.handleStartError(xhr);
        }
      },
      onError: function() {
        UI.showMessage('Network error occurred.');
        UI.showInline('new-game-btn');
        UI.hideElement('game-controls');
      }
    });
  },
  
  handleGameCreated: function(responseText) {
    try {
      var response = JSON.parse(responseText);
      GameState.game.id = response.id;
      
      // Resolve random color
      if (GameState.player.color === 'random') {
        GameState.player.color = response.color || (Math.random() < 0.5 ? 'white' : 'black');
      }
      
      var colorName = GameState.player.color === 'white' ? 'White' : 'Black';
      UI.showMessage('Game started! You are ' + colorName + '. Make your move!');
      
      UI.updatePlayerName('white', GameState.player.color === 'white' ? 'You' : 'AI');
      UI.updatePlayerName('black', GameState.player.color === 'black' ? 'You' : 'AI');
      
      GameState.setWaiting();
      GameState.turn.color = 'white';
      
      UI.updateActivePlayerByTurn();
      Clock.setTimes(Config.DEFAULT_TIME_MS, Config.DEFAULT_TIME_MS);
      Clock.start();
      
      var fen = response.fen || Config.STARTING_FEN;
      GameState.board.currentFen = fen;
      Board.draw(fen);
      
      this.watchGame(GameState.game.id);
    } catch (e) {
      console.error('Error parsing game response:', e);
      UI.showMessage('Error starting game: ' + e.message);
      UI.showInline('new-game-btn');
      UI.hideElement('game-controls');
    }
  },
  
  handleStartError: function(xhr) {
    try {
      var errorResponse = JSON.parse(xhr.responseText);
      UI.showMessage('Error: ' + (errorResponse.error || 'Unknown error'));
    } catch (e) {
      UI.showMessage('Error starting game. Status: ' + xhr.status);
    }
    UI.showInline('new-game-btn');
    UI.hideElement('game-controls');
  },
  
  watchGame: function(gameId) {
    Network.abortAllStreams();
    
    var self = this;
    var xhr = Network.streamAuthRequest(
      '/board/game/stream/' + gameId,
      function(data) {
        if (!GameState.turn.pending) {
          self.processGameEvent(data);
        }
      },
      function() {
        console.error('Stream connection error');
        UI.showMessage('Connection error. Reconnecting...');
        
        if (GameState.isGameActive()) {
          setTimeout(function() {
            self.watchGame(gameId);
          }, 3000);
        }
      }
    );
    
    GameState.network.currentStreamXhr = xhr;
  },
  
  processGameEvent: function(data) {
    if (data.type === 'gameFull') {
      if (data.state) {
        this.processGameState(data.state);
      }
      UI.updatePlayerName('white', GameState.player.color === 'white' ? 'You' : 'AI');
      UI.updatePlayerName('black', GameState.player.color === 'black' ? 'You' : 'AI');
    } else if (data.type === 'gameState') {
      this.processGameState(data);
    }
  },
  
  processGameState: function(data) {
    // Handle empty moves (game start)
    if (!data.moves || data.moves.trim() === '') {
      GameState.turn.color = 'white';
      GameState.turn.moveCount = 0;
      var isPlayerTurn = GameState.player.color === 'white';
      UI.showMessage(isPlayerTurn ? 'Your turn - make your move!' : 'AI is thinking...');
      UI.updateActivePlayerByTurn();
      return;
    }
    
    var moves = data.moves.trim().split(' ');
    var moveCount = moves.length;
    var lastMove = moves[moveCount - 1];
    
    // Transition from waiting to active on first move
    if (GameState.game.status === Config.GAME_STATUS.WAITING && moveCount > 0) {
      GameState.setActive();
      GameState.clock.lastUpdate = Date.now();
    }
    
    // Update turn state
    GameState.updateTurnFromMoveCount(moveCount);
    
    // Check if this update includes an AI move we need to animate
    var lastMoveByWhite = (moveCount % 2 === 1);
    var isAIMoveUpdate = (GameState.player.color === 'white' && !lastMoveByWhite) || 
                         (GameState.player.color === 'black' && lastMoveByWhite);
    
    if (isAIMoveUpdate && lastMove && lastMove.length >= 4) {
      this.applyMove(lastMove, lastMoveByWhite);
    }
    
    UI.updateActivePlayerByTurn();
    
    // Update clocks from server
    if (data.wtime != null) {
      GameState.clock.whiteTimeMs = data.wtime;
      UI.updateClock('white', data.wtime);
    }
    if (data.btime != null) {
      GameState.clock.blackTimeMs = data.btime;
      UI.updateClock('black', data.btime);
    }
    Clock.syncWithServer();
    
    // Handle game status
    this.handleGameStatus(data.status, data.winner);
  },
  
  // Apply a move from the server (AI moves)
  applyMove: function(move, byWhite) {
    var from = move.substring(0, 2);
    var to = move.substring(2, 4);
    var promotion = move.length > 4 ? move.substring(4, 5) : null;
    
    var pieceColor = byWhite ? 'w' : 'b';
    var piece = GameState.board.pieces[from]; // Get piece BEFORE moving
    
    if (promotion) {
      var promotionMap = { 'q': 'Q', 'r': 'R', 'n': 'N', 'b': 'B' };
      var promotedPiece = pieceColor + (promotionMap[promotion] || 'Q');
      Board.setPiece(from, null);
      Board.setPiece(to, promotedPiece);
    } else {
      Board.movePiece(from, to);
      // Handle en passant capture
      Board.handleEnPassant(from, to, piece);
    }
    
    Board.handleCastling(from, to, pieceColor);
  },
  
  handleGameStatus: function(status, winner) {
    var isPlayerTurn = GameState.isPlayerTurn();
    
    if (status === 'started') {
      UI.showMessage(isPlayerTurn ? 'Your turn' : 'AI is thinking...');
    } else if (status === 'mate') {
      Clock.stop();
      UI.showMessage(isPlayerTurn ? 'You lost by checkmate.' : 'Checkmate! You won!');
      this.end();
    } else if (status === 'draw' || status === 'stalemate') {
      Clock.stop();
      UI.showMessage('Game drawn.');
      this.end();
    } else if (status === 'resign') {
      Clock.stop();
      UI.showMessage('Game ended by resignation.');
      this.end();
    } else if (status === 'outoftime') {
      Clock.stop();
      var playerWon = (winner === GameState.player.color);
      UI.showMessage(playerWon ? 'You won on time!' : 'You lost on time.');
      this.end();
    }
  },
  
  // Make a move (player moves)
  makeMove: function(from, to) {
    if (!GameState.isGameActive() || GameState.turn.pending) return;
    
    GameState.turn.pending = true;
    UI.showMessage('Moving...');
    
    var piece = GameState.board.pieces[from];
    if (!piece) {
      console.error('No piece at', from);
      GameState.turn.pending = false;
      return;
    }
    
    // Store original state for potential revert
    var originalState = {
      fromPiece: piece,
      toPiece: GameState.board.pieces[to],
      fromHTML: GameState.cache.squares[from].innerHTML,
      toHTML: GameState.cache.squares[to].innerHTML
    };
    
    // Optimistic update
    Board.movePiece(from, to);
    
    // Handle castling
    var castlingInfo = this.detectCastling(from, to, piece);
    if (castlingInfo) {
      this.applyCastlingOptimistic(castlingInfo);
    }
    
    // Handle en passant
    var enPassantInfo = Board.handleEnPassant(from, to, piece);
    
    var self = this;
    Network.makeAuthRequest('POST', '/board/game/' + GameState.game.id + '/move/' + from + to, null, {
      onComplete: function(xhr) {
        GameState.turn.pending = false;
        
        if (xhr.status === 200 || xhr.status === 201) {
          self.handleMoveSuccess();
        } else {
          self.handleMoveError(xhr, from, to, originalState, castlingInfo, enPassantInfo);
        }
      },
      onError: function() {
        GameState.turn.pending = false;
        UI.showMessage('Network error.');
        self.revertMove(from, to, originalState, castlingInfo, enPassantInfo);
      }
    });
  },
  
  detectCastling: function(from, to, piece) {
    if (piece[1] === 'K' && from[0] === 'e' && (to[0] === 'g' || to[0] === 'c')) {
      var rank = from[1];
      return {
        rookFrom: (to[0] === 'g' ? 'h' : 'a') + rank,
        rookTo: (to[0] === 'g' ? 'f' : 'd') + rank
      };
    }
    return null;
  },
  
  applyCastlingOptimistic: function(info) {
    info.rookOriginalPiece = GameState.board.pieces[info.rookFrom];
    info.rookOriginalHTML = GameState.cache.squares[info.rookFrom].innerHTML;
    Board.movePiece(info.rookFrom, info.rookTo);
  },
  
  handleMoveSuccess: function() {
    // Transition to active if this was the first move
    if (GameState.game.status === Config.GAME_STATUS.WAITING) {
      GameState.setActive();
      GameState.clock.lastUpdate = Date.now();
    }
    
    // Increment move count
    GameState.turn.moveCount++;
    GameState.turn.color = (GameState.turn.color === 'white') ? 'black' : 'white';
    
    UI.showMessage('AI is thinking...');
    
    // Add time increment for the player who just moved
    Clock.addIncrement(GameState.player.color);
    
    UI.updateActivePlayerByTurn();
  },
  
  handleMoveError: function(xhr, from, to, originalState, castlingInfo, enPassantInfo) {
    this.revertMove(from, to, originalState, castlingInfo, enPassantInfo);
    
    try {
      var errorResponse = JSON.parse(xhr.responseText);
      UI.showMessage('Invalid move: ' + (errorResponse.error || 'Unknown'));
    } catch (e) {
      UI.showMessage('Invalid move.');
    }
  },
  
  revertMove: function(from, to, originalState, castlingInfo, enPassantInfo) {
    // Revert the main piece move
    GameState.cache.squares[from].innerHTML = originalState.fromHTML;
    GameState.cache.squares[to].innerHTML = originalState.toHTML;
    GameState.board.pieces[from] = originalState.fromPiece;
    GameState.board.pieces[to] = originalState.toPiece;
    
    // Revert castling if applicable
    if (castlingInfo) {
      GameState.cache.squares[castlingInfo.rookFrom].innerHTML = castlingInfo.rookOriginalHTML || '';
      GameState.cache.squares[castlingInfo.rookTo].innerHTML = '';
      GameState.board.pieces[castlingInfo.rookFrom] = castlingInfo.rookOriginalPiece || null;
      GameState.board.pieces[castlingInfo.rookTo] = null;
    }
    
    // Revert en passant if applicable
    if (enPassantInfo) {
      GameState.cache.squares[enPassantInfo.square].innerHTML = enPassantInfo.html;
      GameState.board.pieces[enPassantInfo.square] = enPassantInfo.piece;
    }
  },
  
  resign: function() {
    if (!GameState.isGameActive() || !GameState.game.id) {
      console.log('No active game to resign');
      return;
    }
    
    UI.showMessage('Resigning game...');
    
    Network.makeAuthRequest('POST', '/board/game/' + GameState.game.id + '/resign', null, {
      onComplete: function(xhr) {
        if (xhr.status === 200) {
          UI.showMessage('Game resigned.');
          AIGame.end();
        } else {
          UI.showMessage('Failed to resign game. Status: ' + xhr.status);
        }
      },
      onError: function() {
        UI.showMessage('Network error while resigning game.');
      }
    });
  },
  
  end: function() {
    GameState.setEnded();
    Clock.stop();
    UI.showInline('new-game-btn');
    UI.hideElement('game-controls');
  },
  
  reset: function() {
    Clock.stop();
    GameState.reset();
    Board.resetAllSquareColors();
    Board.clear();
    
    UI.showMessage('');
    UI.showInline('new-game-btn');
    UI.hideElement('ai-options');
    UI.hideElement('game-controls');
    UI.clearPlayerInfo();
    
    Network.abortAllStreams();
  }
};