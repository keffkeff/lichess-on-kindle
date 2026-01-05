var COLUMNS = 'abcdefgh'.split('');
// Global variables for AI game
var currentGameId = null;
var currentFullId = null;
var playerColor = 'white';
var selectedSquare = null;
var possibleMoves = [];
var isPlayerTurn = false;
var gameInProgress = false;
var currentFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'; // Standard starting position

function isString(s) {
  return typeof s === 'string';
}

// convert FEN piece code to bP, wK, etc
function fenToPieceCode(piece) {
  // black piece
  if (piece.toLowerCase() === piece) {
    return 'b' + piece.toUpperCase();
  }
  // white piece
  return 'w' + piece.toUpperCase();
}

function expandFenEmptySquares(fen) {
  return fen.replace(/8/g, '11111111')
    .replace(/7/g, '1111111')
    .replace(/6/g, '111111')
    .replace(/5/g, '11111')
    .replace(/4/g, '1111')
    .replace(/3/g, '111')
    .replace(/2/g, '11');
}

// Helper function to trim move info from FEN
function trimFen(fen) {
  return fen.replace(/ .+$/, '');
}

function validFen(fen) {
  if (!isString(fen)) return false;

  // cut off any move, castling, etc info from the end
  fen = trimFen(fen);

  // expand the empty square numbers to just 1s
  fen = expandFenEmptySquares(fen);

  // FEN should be 8 sections separated by slashes
  var chunks = fen.split('/');
  if (chunks.length !== 8) return false;

  // check each section
  for (var i = 0; i < 8; i++) {
    if (chunks[i].length !== 8 ||
        chunks[i].search(/[^kqrnbpKQRNBP1]/) !== -1) {
      return false;
    }
  }

  return true;
}

// convert FEN string to position object
// returns false if the FEN string is invalid
function fenToObj(fen) {
  if (!validFen(fen)) return false;

  // cut off any move, castling, etc info from the end
  fen = trimFen(fen);

  var rows = fen.split('/');
  var position = {};

  var currentRow = 8;
  for (var i = 0; i < 8; i++) {
    var row = rows[i].split('');
    var colIdx = 0;

    // loop through each character in the FEN section
    for (var j = 0; j < row.length; j++) {
      // number / empty squares
      if (row[j].search(/[1-8]/) !== -1) {
        var numEmptySquares = parseInt(row[j], 10);
        colIdx = colIdx + numEmptySquares;
      } else {
        // piece
        var square = COLUMNS[colIdx] + currentRow;
        position[square] = fenToPieceCode(row[j]);
        colIdx = colIdx + 1;
      }
    }

    currentRow = currentRow - 1;
  }

  return position;
}

function parseData(data, idx) {
  var curJSON = data.substring(idx);
  var curBoard = JSON.parse(curJSON);
  return curBoard;
}

var pngPieces = {
  wR: "<img class=pieces src=img/chesspieces/svg/wR.svg>",
  wN: "<img class=pieces src=img/chesspieces/svg/wN.svg>",
  wB: "<img class=pieces src=img/chesspieces/svg/wB.svg>",
  wQ: "<img class=pieces src=img/chesspieces/svg/wQ.svg>",
  wK: "<img class=pieces src=img/chesspieces/svg/wK.svg>",
  wP: "<img class=pieces src=img/chesspieces/svg/wP.svg>",
  bR: "<img class=pieces src=img/chesspieces/svg/bR.svg>",
  bN: "<img class=pieces src=img/chesspieces/svg/bN.svg>",
  bB: "<img class=pieces src=img/chesspieces/svg/bB.svg>",
  bQ: "<img class=pieces src=img/chesspieces/svg/bQ.svg>",
  bK: "<img class=pieces src=img/chesspieces/svg/bK.svg>",
  bP: "<img class=pieces src=img/chesspieces/svg/bP.svg>"
};

var coordinates = [
  "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8",
  "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8",
  "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8",
  "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8",
  "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8",
  "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8",
  "g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8",
  "h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8"
];

// streaming channel XHR state (only one active at a time)
var currentChannelXhr = null;
var channelIdx = 0;
// track global feed XHR so we can stop it when user selects a specific channel
var globalFeedXhr = null;

function formatTime(seconds) {
  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = Math.floor(seconds % 60);
  return (minutes < 10 ? '0' : '') + minutes + ':' + 
         (remainingSeconds < 10 ? '0' : '') + remainingSeconds;
}

function drawBoard(fen) {
  var fenObj = fenToObj(fen);
  for (var i = 0; i < coordinates.length; i++) {
    var square = document.getElementById(coordinates[i]);
    if (coordinates[i] in fenObj) {
      square.innerHTML = pngPieces[fenObj[coordinates[i]]];
    }
    else {
      square.innerHTML = "";        
    }
    
    // Reset any highlighting
    if (square.className.indexOf('white') !== -1) {
      square.style.backgroundColor = '#fff';
    } else {
      square.style.backgroundColor = '#999';
    }
  }
  
  updateActivePlayer(fen);
}

function updateActivePlayer(fen) {
  var parts = fen.split(' ');
  var isWhiteTurn = parts.length > 1 && parts[1] === 'w';  
  var wpElement = document.getElementById('wp');
  var bpElement = document.getElementById('bp');   
  
  // For compatibility with older browsers that might not support classList.toggle with second parameter
  if (isWhiteTurn) {
    wpElement.classList.add('active-player');
    bpElement.classList.remove('active-player');
  } else {
    wpElement.classList.remove('active-player');
    bpElement.classList.add('active-player');
  }
}

function main() {
  var idx = 0;
  var oReq = new XMLHttpRequest();
  
  oReq.open("GET", "https://lichess.org/api/tv/feed");
  oReq.responseType = "text";
  try { oReq.overrideMimeType('text/plain; charset=x-user-defined'); } catch (e) {}
  oReq.send();
  // keep reference so channel selection can abort this global feed
  globalFeedXhr = oReq;
  
  oReq.onprogress = function () {
    try {
      var curBoard = parseData(oReq.response, idx);
      if (!curBoard) return;
      if (curBoard.d && curBoard.d.fen) drawBoard(curBoard.d.fen);

      if (curBoard.t == "featured") {
        if (curBoard.d && curBoard.d.players) {
          if (curBoard.d.players[0] && curBoard.d.players[0].user) document.getElementById('wpName').innerHTML = curBoard.d.players[0].user.name || '';
          if (curBoard.d.players[1] && curBoard.d.players[1].user) document.getElementById('bpName').innerHTML = curBoard.d.players[1].user.name || '';
        }
      }
      else {
        if (curBoard.d) {
          if (typeof curBoard.d.wc !== 'undefined') document.getElementById('wpTime').innerHTML = formatTime(curBoard.d.wc);
          if (typeof curBoard.d.bc !== 'undefined') document.getElementById('bpTime').innerHTML = formatTime(curBoard.d.bc);
        }
      }
      idx = event.loaded || oReq.response.length;
    } catch (e) {
      // ignore parsing errors from incomplete chunks
    }
  };
}

window.onload = function() {
  // start the live feed (keeps drawing board for streaming feed)
  main();

  // fetch available TV channels and render buttons for user to select
  fetchChannelsXHR();
  
  // Set up AI game button handlers
  setupAIGameHandlers();
};

// Fetch channel list and render dynamic buttons
// XHR-based channels fetch for older browsers
function fetchChannelsXHR() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://lichess.org/api/tv/channels', true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var data = JSON.parse(xhr.responseText);
          renderChannelButtonsXHR(data);
        } catch (e) {
          console.error('Invalid channels JSON', e);
        }
      } else {
        console.error('Failed to load channels', xhr.status);
      }
    }
  };
  xhr.send();
}

function renderChannelButtonsXHR(channels) {
  var container = document.getElementById('new-gb');
  if (!container) return;
  // keep existing static buttons for old Kindle browsers: clear extras but keep two
  container.innerHTML = '';

  // create a button for each channel using traditional DOM API
  for (var key in channels) {
    if (!channels.hasOwnProperty(key)) continue;
    var btn = document.createElement('button');
    btn.className = 'game-btn';
    btn.innerText = key;
    // attach click handler (traditional assignment for compatibility)
    (function(k, ch, b){
      b.onclick = function() { selectChannelXHR(k, ch, b); };
    })(key, channels[key], btn);
    container.appendChild(btn);
  }
}

function selectChannelXHR(name, channelData, btn) {
  // mark selected (remove 'active' from siblings)
  var container = document.getElementById('new-gb');
  var children = container.childNodes;
  for (var i = 0; i < children.length; i++) {
    var c = children[i];
    if (c && c.className && c.className.indexOf('game-btn') !== -1) {
      c.className = c.className.replace(/(?:^|\s)active(?!\S)/g, '');
    }
  }
  btn.className = (btn.className + ' active').trim();

  var user = channelData.user || {};
  var wpNameEl = document.getElementById('wpName');
  var bpNameEl = document.getElementById('bpName');
  wpNameEl.innerText = (user.name || '') + (user.title ? ' (' + user.title + ')' : '');
  bpNameEl.innerText = 'Variant: ' + name + ' — game ' + (channelData.gameId || '');

  // highlight active player according to reported color using className (older browsers)
  var wp = document.getElementById('wp');
  var bp = document.getElementById('bp');
  if (channelData.color === 'white') {
    if (wp.className.indexOf('active-player') === -1) wp.className += ' active-player';
    bp.className = bp.className.replace(/(?:^|\s)active-player(?!\S)/g, '');
  } else {
    if (bp.className.indexOf('active-player') === -1) bp.className += ' active-player';
    wp.className = wp.className.replace(/(?:^|\s)active-player(?!\S)/g, '');
  }

  // start watching the selected channel feed (streaming)
  watchChannelXHR(name);
}

function watchChannelXHR(channelName) {
  // abort previous channel XHR if any
  try {
    if (currentChannelXhr) {
      currentChannelXhr.abort();
      currentChannelXhr = null;
    }
  } catch (e) {}

  // abort the global feed so it doesn't overwrite the selected channel
  try {
    if (globalFeedXhr) {
      globalFeedXhr.abort();
      globalFeedXhr = null;
    }
  } catch (e) {}

  channelIdx = 0;
  var oReq = new XMLHttpRequest();
  var url = 'https://lichess.org/api/tv/' + encodeURIComponent(channelName) + '/feed';
  try { oReq.open('GET', url, true); } catch (e) { console.error('open failed', e); return; }
  oReq.responseType = 'text';
  try { oReq.overrideMimeType('text/plain; charset=x-user-defined'); } catch (e) {}
  oReq.send();

  currentChannelXhr = oReq;

  oReq.onprogress = function () {
    // parse incremental JSON events like main()
    try {
      var curBoard = parseData(oReq.response, channelIdx);
      if (!curBoard) return;
      if (curBoard.d && curBoard.d.fen) {
        drawBoard(curBoard.d.fen);
      }

      if (curBoard.t == 'featured') {
        if (curBoard.d && curBoard.d.players) {
          if (curBoard.d.players[0] && curBoard.d.players[0].user) document.getElementById('wpName').innerHTML = curBoard.d.players[0].user.name || '';
          if (curBoard.d.players[1] && curBoard.d.players[1].user) document.getElementById('bpName').innerHTML = curBoard.d.players[1].user.name || '';
        }
      } else {
        if (curBoard.d) {
          if (typeof curBoard.d.wc !== 'undefined') document.getElementById('wpTime').innerHTML = formatTime(curBoard.d.wc);
          if (typeof curBoard.d.bc !== 'undefined') document.getElementById('bpTime').innerHTML = formatTime(curBoard.d.bc);
        }
      }

      // advance index to the amount of text already consumed
      channelIdx = event.loaded || oReq.response.length;
    } catch (e) {
      // ignore parse errors from incomplete chunks
    }
  };

  oReq.onerror = function() { console.error('Channel XHR error for', channelName); };
  oReq.onreadystatechange = function() {
    if (oReq.readyState === 4 && oReq.status >= 400) {
      console.error('Channel stream ended with status', oReq.status);
    }
  };
}

function fetchGameFenXHR(gameId) {
  var xhr = new XMLHttpRequest();
  // Lichess game export endpoint; request JSON
  var url = 'https://lichess.org/api/game/export/' + encodeURIComponent(gameId) + '?moves=false&tags=false&clocks=true&players=true';
  xhr.open('GET', url, true);
  try { xhr.setRequestHeader('Accept', 'application/json'); } catch (e) {}
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        var text = xhr.responseText;
        var parsed = null;
        try { parsed = JSON.parse(text); } catch (e) { parsed = null; }
        if (parsed && parsed.fen) {
          drawBoard(parsed.fen);
          // update clocks if provided
          if (parsed.wtime != null) document.getElementById('wpTime').innerText = formatTime(Math.floor(parsed.wtime/1000));
          if (parsed.btime != null) document.getElementById('bpTime').innerText = formatTime(Math.floor(parsed.btime/1000));
        } else {
          // try to find FEN inside the response text (fallback)
          var m = text.match(/FEN: (\S+)/);
          if (m && m[1]) {
            drawBoard(m[1]);
          } else {
            console.error('No fen found in game export for', gameId);
          }
        }
      } else {
        console.error('Failed to fetch game export', xhr.status);
      }
    }
  };
  xhr.send();
}

// AI Game Functions
function resetGameState() {
  // Reset all game state variables
  currentGameId = null;
  currentFullId = null;
  selectedSquare = null;
  possibleMoves = [];
  isPlayerTurn = false;
  gameInProgress = false;
  
  // Reset UI elements
  document.getElementById('game-message').innerText = '';
  document.getElementById('new-game-btn').style.display = 'inline-block';
  document.getElementById('ai-options').style.display = 'none';
  document.getElementById('game-controls').style.display = 'none';
  
  // Reset player names and clocks
  document.getElementById('wpName').innerText = '';
  document.getElementById('bpName').innerText = '';
  document.getElementById('wpTime').innerText = '';
  document.getElementById('bpTime').innerText = '';
  
  // Reset board colors
  resetSquareColors();
  
  // Abort any active XHR
  try {
    if (currentChannelXhr) {
      currentChannelXhr.abort();
      currentChannelXhr = null;
    }
  } catch (e) {}
  
  console.log('Game state reset');
}

function resignGame() {
  if (!gameInProgress || !currentGameId) {
    console.log('No active game to resign');
    return;
  }
  
  var messageEl = document.getElementById('game-message');
  messageEl.innerText = 'Resigning game...';
  
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://lichess.org/api/board/game/' + currentGameId + '/resign', true);
  // xhr.setRequestHeader('Authorization', 'Bearer API_KEY');
  xhr.setRequestHeader('Accept', 'application/json');
  
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      console.log('Resign response status:', xhr.status);
      console.log('Resign response:', xhr.responseText);
      
      if (xhr.status === 200) {
        messageEl.innerText = 'Game resigned.';
        gameInProgress = false;
        document.getElementById('game-controls').style.display = 'none';
        document.getElementById('new-game-btn').style.display = 'inline-block';
      } else {
        messageEl.innerText = 'Failed to resign game. Status: ' + xhr.status;
      }
    }
  };
  
  xhr.onerror = function() {
    messageEl.innerText = 'Network error while resigning game.';
  };
  
  xhr.send();
}

function setupAIGameHandlers() {
  // New Game button shows options
  var newGameBtn = document.getElementById('new-game-btn');
  if (newGameBtn) {
    newGameBtn.addEventListener('click', function() {
      // Reset game state first
      resetGameState();
      
      document.getElementById('ai-options').style.display = 'block';
      document.getElementById('new-game-btn').style.display = 'none';
    });
  }
  
  // Cancel button hides options
  var cancelBtn = document.getElementById('cancel-ai-game');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
      document.getElementById('ai-options').style.display = 'none';
      document.getElementById('new-game-btn').style.display = 'inline-block';
    });
  }
  
  // Start Game button initiates game with AI
  var startBtn = document.getElementById('start-ai-game');
  if (startBtn) {
    startBtn.addEventListener('click', startAIGame);
  }
  
  // Resign Game button
  var resignBtn = document.getElementById('resign-game');
  if (resignBtn) {
    resignBtn.addEventListener('click', resignGame);
  }
  
  // Add click handlers to chess squares for making moves
  for (var i = 0; i < coordinates.length; i++) {
    var square = document.getElementById(coordinates[i]);
    if (square) {
      square.addEventListener('click', handleSquareClick);
    }
  }
}

function startAIGame() {
  // Get selected options
  var level = document.getElementById('ai-level').value;
  playerColor = document.getElementById('player-color').value;
  
  // Show loading message
  var messageEl = document.getElementById('game-message');
  messageEl.innerText = 'Starting game...';
  
  // Hide options, show game controls
  document.getElementById('ai-options').style.display = 'none';
  document.getElementById('game-controls').style.display = 'block';
  
  // Stop any existing streams
  try {
    if (currentChannelXhr) {
      currentChannelXhr.abort();
      currentChannelXhr = null;
    }
    if (globalFeedXhr) {
      globalFeedXhr.abort();
      globalFeedXhr = null;
    }
  } catch (e) {}
  
  // Create a new game against AI
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://lichess.org/api/challenge/ai', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');
  
  // Add the Lichess API token
  xhr.setRequestHeader('Authorization', 'Bearer YOUR_API_KEY');
  
  // Prepare parameters according to the API documentation
  var params = 'level=' + level + 
               '&clock.limit=300' + 
               '&clock.increment=1';
               
  // Set color if not random
  if (playerColor !== 'random') {
    params += '&color=' + playerColor;
  }
  
  // Log the request for debugging
  console.log('Starting AI game with params:', params);
  
  xhr.onerror = function() {
    messageEl.innerText = 'Network error occurred. This might be due to CORS restrictions.';
    document.getElementById('new-game-btn').style.display = 'inline-block';
  };
  
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      console.log('AI game response status:', xhr.status);
      console.log('AI game response:', xhr.responseText);
      
      if (xhr.status === 201 || xhr.status === 200) {
        try {
          var response = JSON.parse(xhr.responseText);
          currentGameId = response.id;
          currentFullId = response.fullId || response.id;
          
          // Determine player color
          var actualPlayerColor = playerColor;
          if (playerColor === 'random') {
            actualPlayerColor = response.color || (Math.random() < 0.5 ? 'white' : 'black');
          }
          playerColor = actualPlayerColor; // Update the global variable
          
          // Update UI
          messageEl.innerText = 'Game started! You are playing as ' + 
            (actualPlayerColor === 'white' ? 'White' : 'Black');
          
          // Set player names
          document.getElementById('wpName').innerText = actualPlayerColor === 'white' ? 'You' : 'AI';
          document.getElementById('bpName').innerText = actualPlayerColor === 'black' ? 'You' : 'AI';
          
          // Start watching the game
          watchAIGame(currentGameId);
          
          // Update game state
          gameInProgress = true;
          isPlayerTurn = actualPlayerColor === 'white'; // White moves first
          
          // Draw the initial position immediately
          if (response.fen) {
            currentFen = response.fen;
            drawBoard(currentFen);
            
            // Reset clocks
            document.getElementById('wpTime').innerText = formatTime(300);
            document.getElementById('bpTime').innerText = formatTime(300);
          } else {
            // Use standard starting position if FEN is not provided
            currentFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
            drawBoard(currentFen);
          }
          
        } catch (e) {
          console.error('Error parsing game response:', e);
          messageEl.innerText = 'Error starting game: ' + e.message;
          document.getElementById('new-game-btn').style.display = 'inline-block';
        }
      } else {
        // Handle error - parse and display the error message
        try {
          var errorResponse = JSON.parse(xhr.responseText);
          messageEl.innerText = 'Error: ' + (errorResponse.error || 'Unknown error') + 
                               ' (Status: ' + xhr.status + ')';
        } catch (e) {
          messageEl.innerText = 'Error starting game. Status: ' + xhr.status + 
                               '. Please try again.';
        }
        
        // Show new game button again
        document.getElementById('new-game-btn').style.display = 'inline-block';
      }
    }
  };
  
  xhr.send(params);
}

function watchAIGame(gameId) {
  // Abort previous streams
  try {
    if (currentChannelXhr) {
      currentChannelXhr.abort();
      currentChannelXhr = null;
    }
    if (globalFeedXhr) {
      globalFeedXhr.abort();
      globalFeedXhr = null;
    }
  } catch (e) {}
  
  console.log('Starting to watch AI game:', gameId);
  
  // Use the game stream API instead of polling
  var streamUrl = 'https://lichess.org/api/board/game/stream/' + gameId;
  console.log('Connecting to stream:', streamUrl);
  
  var xhr = new XMLHttpRequest();
  xhr.open('GET', streamUrl, true);
  xhr.setRequestHeader('Authorization', 'Bearer YOUR_API_KEY');
  xhr.setRequestHeader('Accept', 'application/x-ndjson');
  xhr.responseType = 'text';
  
  var messageEl = document.getElementById('game-message');
  var lastResponseLength = 0;
  
  xhr.onprogress = function() {
    try {
      // Get only the new data
      var newData = xhr.response.substring(lastResponseLength);
      lastResponseLength = xhr.response.length;
      
      console.log('New stream data:', newData);
      
      // Process each line separately (ndjson format)
      var lines = newData.split('\n');
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line) continue;
        
        try {
          var data = JSON.parse(line);
          console.log('Parsed game data:', data);
          
          if (data.type === 'gameFull') {
            // Full game state
            console.log('Received full game state');
            if (data.state && data.state.fen) {
              drawBoard(data.state.fen);
              
              // Check if it's player's turn
              var isWhiteTurn = data.state.fen.indexOf(' w ') > -1;
              isPlayerTurn = (playerColor === 'white' && isWhiteTurn) || 
                            (playerColor === 'black' && !isWhiteTurn);
              
              messageEl.innerText = isPlayerTurn ? 'Your turn' : 'AI is thinking...';
            }
            
            // Update player names
            if (data.white) {
              document.getElementById('wpName').innerText = playerColor === 'white' ? 'You' : 'AI';
            }
            if (data.black) {
              document.getElementById('bpName').innerText = playerColor === 'black' ? 'You' : 'AI';
            }
          } 
          else if (data.type === 'gameState') {
            // Game state update
            console.log('Received game state update');
            
            // The stream doesn't provide FEN, but it does provide moves
            if (data.moves) {
              console.log('Moves from stream:', data.moves);
              
              // Get the last move
              var moves = data.moves.trim().split(' ');
              var lastMove = moves[moves.length - 1];
              console.log('Last move:', lastMove);
              
              if (lastMove) {
                // Update the board visually based on the move
                if (lastMove.length >= 4) {
                  var from = lastMove.substring(0, 2);
                  var to = lastMove.substring(2, 4);
                  
                  console.log('Moving piece from', from, 'to', to);
                  
                  // Move the piece on the board
                  var fromSquare = document.getElementById(from);
                  var toSquare = document.getElementById(to);
                  
                  console.log('Stream moving piece:', from, 'to', to);
                  
                  if (fromSquare && toSquare) {
                    // Check if this is an AI move or a player move
                    var isAIMove = (playerColor === 'white' && moves.length % 2 === 0) || 
                                  (playerColor === 'black' && moves.length % 2 === 1);
                    
                    console.log('Is AI move:', isAIMove, 'Player color:', playerColor, 'Moves length:', moves.length);
                    
                    // For AI moves, we need to find the piece on the board
                    if (isAIMove) {
                      // Determine the piece type based on the position and moves
                      var pieceColor = (moves.length % 2 === 0) ? 'b' : 'w'; // Odd moves are white, even are black
                      var pieceType = '';
                      
                      // Try to determine piece type based on position
                      if (from[1] === '7' || from[1] === '2') {
                        // Likely a pawn
                        pieceType = 'P';
                      } else if (from === 'g8' || from === 'b8' || from === 'g1' || from === 'b1') {
                        // Knight starting position
                        pieceType = 'N';
                      } else if (from === 'f8' || from === 'c8' || from === 'f1' || from === 'c1') {
                        // Bishop starting position
                        pieceType = 'B';
                      } else if (from === 'a8' || from === 'h8' || from === 'a1' || from === 'h1') {
                        // Rook starting position
                        pieceType = 'R';
                      } else if (from === 'd8' || from === 'd1') {
                        // Queen starting position
                        pieceType = 'Q';
                      } else if (from === 'e8' || from === 'e1') {
                        // King starting position
                        pieceType = 'K';
                      }
                      
                      // If we couldn't determine the piece type, use the piece at the location if it exists
                      if (pieceType === '' && fromSquare.innerHTML.trim() !== '') {
                        var pieceImg = fromSquare.querySelector('img');
                        if (pieceImg) {
                          var srcParts = pieceImg.src.split('/');
                          var filename = srcParts[srcParts.length - 1];
                          if (filename.startsWith('w')) {
                            pieceColor = 'w';
                            pieceType = filename[1];
                          } else if (filename.startsWith('b')) {
                            pieceColor = 'b';
                            pieceType = filename[1];
                          }
                        }
                      }
                      
                      // If we still don't have a piece type, default to pawn
                      if (pieceType === '') {
                        pieceType = 'P';
                      }
                      
                      console.log('Determined AI piece:', pieceColor + pieceType);
                      
                      // Handle special moves like castling, en passant, and promotion
                      if (lastMove.length > 4) {
                        // This is a promotion move (e.g. e7e8q)
                        var promotionPiece = lastMove.substring(4, 5);
                        
                        // Set the promotion piece
                        switch (promotionPiece) {
                          case 'q':
                            toSquare.innerHTML = pngPieces[pieceColor + 'Q'];
                            break;
                          case 'r':
                            toSquare.innerHTML = pngPieces[pieceColor + 'R'];
                            break;
                          case 'n':
                            toSquare.innerHTML = pngPieces[pieceColor + 'N'];
                            break;
                          case 'b':
                            toSquare.innerHTML = pngPieces[pieceColor + 'B'];
                            break;
                          default:
                            // Default to queen
                            toSquare.innerHTML = pngPieces[pieceColor + 'Q'];
                        }
                        fromSquare.innerHTML = '';
                      } else {
                        // Standard move - use the piece HTML if available, otherwise generate it
                        if (fromSquare.innerHTML.trim() !== '') {
                          toSquare.innerHTML = fromSquare.innerHTML;
                          fromSquare.innerHTML = '';
                        } else {
                          // Generate the piece HTML
                          toSquare.innerHTML = pngPieces[pieceColor + pieceType];
                          fromSquare.innerHTML = '';
                        }
                        
                        // Check for castling - more robust detection
                        var isCastling = false;
                        var rookFrom = null;
                        var rookTo = null;
                        
                        // King moved two squares - likely castling
                        if (from[0] === 'e' && (to[0] === 'g' || to[0] === 'c') && from[1] === to[1]) {
                          isCastling = true;
                          
                          // Determine rook positions based on castling type
                          if (to[0] === 'g') {
                            // Kingside castling
                            rookFrom = 'h' + from[1];
                            rookTo = 'f' + from[1];
                            console.log('Detected kingside castling, moving rook from', rookFrom, 'to', rookTo);
                          } else if (to[0] === 'c') {
                            // Queenside castling
                            rookFrom = 'a' + from[1];
                            rookTo = 'd' + from[1];
                            console.log('Detected queenside castling, moving rook from', rookFrom, 'to', rookTo);
                          }
                        }
                        
                        // If this is castling, also move the rook
                        if (isCastling && rookFrom && rookTo) {
                          var rookFromSquare = document.getElementById(rookFrom);
                          var rookToSquare = document.getElementById(rookTo);
                          
                          if (rookFromSquare && rookToSquare) {
                            // Check if the rook is present
                            var rookHTML = rookFromSquare.innerHTML;
                            if (rookHTML && rookHTML.trim() !== '') {
                              console.log('Moving existing rook piece');
                              rookToSquare.innerHTML = rookHTML;
                              rookFromSquare.innerHTML = '';
                            } else {
                              // Generate the rook HTML if not present
                              console.log('Generating new rook piece');
                              rookToSquare.innerHTML = pngPieces[pieceColor + 'R'];
                              rookFromSquare.innerHTML = '';
                            }
                          }
                        }
                      }
                    } else {
                      // For player moves, the piece should already be on the board from the optimistic update
                      // But let's check if the destination square is empty, and if so, try to fix it
                      if (toSquare.innerHTML.trim() === '') {
                        console.warn('Player piece missing at destination', to, 'after move from', from);
                        
                        // Try to determine what piece was moved
                        var pieceColor = playerColor === 'white' ? 'w' : 'b';
                        var pieceType = '';
                        
                        // Try to determine piece type based on position
                        if (from[1] === '7' || from[1] === '2') {
                          // Likely a pawn
                          pieceType = 'P';
                        } else if (from === 'g8' || from === 'b8' || from === 'g1' || from === 'b1') {
                          // Knight starting position
                          pieceType = 'N';
                        } else if (from === 'f8' || from === 'c8' || from === 'f1' || from === 'c1') {
                          // Bishop starting position
                          pieceType = 'B';
                        } else if (from === 'a8' || from === 'h8' || from === 'a1' || from === 'h1') {
                          // Rook starting position
                          pieceType = 'R';
                        } else if (from === 'd8' || from === 'd1') {
                          // Queen starting position
                          pieceType = 'Q';
                        } else if (from === 'e8' || from === 'e1') {
                          // King starting position
                          pieceType = 'K';
                        }
                        
                        // If we still don't have a piece type, default to pawn
                        if (pieceType === '') {
                          pieceType = 'P';
                        }
                        
                        // Generate the piece HTML
                        toSquare.innerHTML = pngPieces[pieceColor + pieceType];
                      }
                    }
                  } else {
                    console.error('Square not found:', !fromSquare ? from : to);
                  }
                  
                  // Determine whose turn it is now
                  var isWhiteTurn = moves.length % 2 === 0; // Even number of moves means white's turn
                  isPlayerTurn = (playerColor === 'white' && isWhiteTurn) || 
                                (playerColor === 'black' && !isWhiteTurn);
                  
                  // Update message
                  if (data.status === 'started') {
                    messageEl.innerText = isPlayerTurn ? 'Your turn' : 'AI is thinking...';
                  }
                  
                  // Update clocks if available
                  if (data.wtime) {
                    document.getElementById('wpTime').innerText = formatTime(Math.floor(data.wtime / 1000));
                  }
                  if (data.btime) {
                    document.getElementById('bpTime').innerText = formatTime(Math.floor(data.btime / 1000));
                  }
                }
              }
              
              // No need to fetch the full game state, we can work with the stream data
            }
            
            // Update game status
            if (data.status) {
              if (data.status === 'mate') {
                messageEl.innerText = 'Checkmate! Game over.';
                gameInProgress = false;
                document.getElementById('new-game-btn').style.display = 'inline-block';
                document.getElementById('game-controls').style.display = 'none';
              } else if (data.status === 'draw') {
                messageEl.innerText = 'Game drawn.';
                gameInProgress = false;
                document.getElementById('new-game-btn').style.display = 'inline-block';
                document.getElementById('game-controls').style.display = 'none';
              } else if (data.status === 'stalemate') {
                messageEl.innerText = 'Stalemate! Game drawn.';
                gameInProgress = false;
                document.getElementById('new-game-btn').style.display = 'inline-block';
                document.getElementById('game-controls').style.display = 'none';
              }
            }
            
            // Update clocks
            if (data.wtime) {
              document.getElementById('wpTime').innerText = formatTime(Math.floor(data.wtime / 1000));
            }
            if (data.btime) {
              document.getElementById('bpTime').innerText = formatTime(Math.floor(data.btime / 1000));
            }
          }
          else if (data.type === 'chatLine') {
            // Chat message - could display in a chat area if added to UI
            console.log('Chat message:', data.text);
          }
        } catch (e) {
          console.error('Error parsing stream line:', e, line);
        }
      }
    } catch (e) {
      console.error('Error processing stream data:', e);
    }
  };
  
  xhr.onerror = function() {
    console.error('Stream connection error');
    messageEl.innerText = 'Connection error. Reconnecting...';
    
    // Try to reconnect after a delay
    if (gameInProgress) {
      setTimeout(function() {
        watchAIGame(gameId);
      }, 3000);
    }
  };
  
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      console.log('Stream closed with status:', xhr.status);
      
      if (xhr.status !== 200 && gameInProgress) {
        messageEl.innerText = 'Connection closed. Reconnecting...';
        
        // Try to reconnect after a delay
        setTimeout(function() {
          watchAIGame(gameId);
        }, 3000);
      }
    }
  };
  
  xhr.send();
  currentChannelXhr = xhr;
  
  // We'll rely entirely on the stream data
}

function handleGameState(data) {
  // Draw the board with the current position
  if (data.state && data.state.fen) {
    drawBoard(data.state.fen);
    
    // Update clocks
    if (data.state.wtime) {
      document.getElementById('wpTime').innerText = formatTime(Math.floor(data.state.wtime / 1000));
    }
    if (data.state.btime) {
      document.getElementById('bpTime').innerText = formatTime(Math.floor(data.state.btime / 1000));
    }
    
    // Check if it's player's turn
    var isWhiteTurn = data.state.fen.indexOf(' w ') > -1;
    isPlayerTurn = (playerColor === 'white' && isWhiteTurn) || 
                   (playerColor === 'black' && !isWhiteTurn);
                   
    // Update message
    var messageEl = document.getElementById('game-message');
    if (data.state.status === 'started') {
      messageEl.innerText = isPlayerTurn ? 'Your turn' : 'AI is thinking...';
    } else if (data.state.status === 'mate') {
      messageEl.innerText = 'Checkmate! Game over.';
      gameInProgress = false;
      document.getElementById('new-game-btn').style.display = 'inline-block';
    } else if (data.state.status === 'draw') {
      messageEl.innerText = 'Game drawn.';
      gameInProgress = false;
      document.getElementById('new-game-btn').style.display = 'inline-block';
    } else if (data.state.status === 'stalemate') {
      messageEl.innerText = 'Stalemate! Game drawn.';
      gameInProgress = false;
      document.getElementById('new-game-btn').style.display = 'inline-block';
    }
  }
  
  // Set player names if available
  if (data.white && data.white.name) {
    document.getElementById('wpName').innerText = data.white.name;
  }
  if (data.black && data.black.name) {
    document.getElementById('bpName').innerText = data.black.name;
  }
}

function updateGameState(data) {
  // Update the board with the new position
  if (data.fen) {
    drawBoard(data.fen);
    
    // Update clocks
    if (data.wtime) {
      document.getElementById('wpTime').innerText = formatTime(Math.floor(data.wtime / 1000));
    }
    if (data.btime) {
      document.getElementById('bpTime').innerText = formatTime(Math.floor(data.btime / 1000));
    }
    
    // Check if it's player's turn
    var isWhiteTurn = data.fen.indexOf(' w ') > -1;
    isPlayerTurn = (playerColor === 'white' && isWhiteTurn) || 
                   (playerColor === 'black' && !isWhiteTurn);
                   
    // Update message
    var messageEl = document.getElementById('game-message');
    if (data.status === 'started') {
      messageEl.innerText = isPlayerTurn ? 'Your turn' : 'AI is thinking...';
    } else if (data.status === 'mate') {
      messageEl.innerText = 'Checkmate! Game over.';
      gameInProgress = false;
      document.getElementById('new-game-btn').style.display = 'inline-block';
    } else if (data.status === 'draw') {
      messageEl.innerText = 'Game drawn.';
      gameInProgress = false;
      document.getElementById('new-game-btn').style.display = 'inline-block';
    } else if (data.status === 'stalemate') {
      messageEl.innerText = 'Stalemate! Game drawn.';
      gameInProgress = false;
      document.getElementById('new-game-btn').style.display = 'inline-block';
    }
  }
}

function handleSquareClick(event) {
  // Only allow moves if it's the player's turn and game is in progress
  if (!isPlayerTurn || !gameInProgress) return;
  
  var square = event.currentTarget.id;
  
  if (selectedSquare === null) {
    // First click - select a piece
    // Check if the square has a piece of the player's color
    var squareElement = event.currentTarget;
    var hasPiece = squareElement.innerHTML.trim() !== '';
    var isPieceOfPlayerColor = false;
    
    if (hasPiece) {
      // Check if the piece belongs to the player
      var isWhitePiece = squareElement.innerHTML.indexOf('w') > -1;
      isPieceOfPlayerColor = (playerColor === 'white' && isWhitePiece) || 
                            (playerColor === 'black' && !isWhitePiece);
    }
    
    if (!hasPiece || !isPieceOfPlayerColor) {
      // Can't select an empty square or opponent's piece
      return;
    }
    
    // Valid piece selection
    selectedSquare = square;
    
    // Highlight the selected square
    event.currentTarget.style.backgroundColor = '#aaffaa';
  } else {
    // Second click - make a move or select a different piece
    if (square === selectedSquare) {
      // Clicked the same square again - deselect
      resetSquareColors();
      selectedSquare = null;
      return;
    }
    
    var fromElement = document.getElementById(selectedSquare);
    var toElement = event.currentTarget;
    
    // Check if clicking on own piece (to change selection)
    var isOwnPiece = false;
    if (toElement.innerHTML.trim() !== '') {
      var isToWhitePiece = toElement.innerHTML.indexOf('w') > -1;
      isOwnPiece = (playerColor === 'white' && isToWhitePiece) || 
                  (playerColor === 'black' && !isToWhitePiece);
    }
    
    if (isOwnPiece) {
      // Change selection to the new piece
      resetSquareColors();
      selectedSquare = square;
      toElement.style.backgroundColor = '#aaffaa';
      return;
    }
    
    // Make a move
    var from = selectedSquare;
    var to = square;
    
    // Clear highlighting
    resetSquareColors();
    selectedSquare = null;
    
    // Make the move
    makeMove(from, to);
  }
}

// Helper function to reset all square colors
function resetSquareColors() {
  for (var i = 0; i < coordinates.length; i++) {
    var square = document.getElementById(coordinates[i]);
    if (square.className.indexOf('white') !== -1) {
      square.style.backgroundColor = '#fff';
    } else {
      square.style.backgroundColor = '#999';
    }
  }
}

function makeMove(from, to) {
  // Prevent move if game not in progress
  if (!gameInProgress) return;
  
  var messageEl = document.getElementById('game-message');
  messageEl.innerText = 'Submitting move...';
  
  console.log('Making move:', from, 'to', to);
  
  // Optimistically update the board to show the move immediately
  var fromSquare = document.getElementById(from);
  var toSquare = document.getElementById(to);
  
  if (!fromSquare || !toSquare) {
    console.error('Square not found:', !fromSquare ? from : to);
    return;
  }
  
  // Save the piece HTML
  var piece = fromSquare.innerHTML;
  
  console.log('Moving piece in UI:', from, 'to', to);
  console.log('Piece HTML:', piece);
  
  if (!piece || piece.trim() === '') {
    console.error('No piece found at', from);
    return;
  }
  
  // Store the original board state in case we need to revert
  var originalFromHTML = fromSquare.innerHTML;
  var originalToHTML = toSquare.innerHTML;
  
  // Update the board visually - use cloneNode for better copying
  var pieceElement = fromSquare.querySelector('img');
  if (pieceElement) {
    // If there's an img element, clone it
    var clonedPiece = pieceElement.cloneNode(true);
    fromSquare.innerHTML = '';
    toSquare.innerHTML = '';
    toSquare.appendChild(clonedPiece);
  } else {
    // Fallback to innerHTML if no img element
    fromSquare.innerHTML = '';
    toSquare.innerHTML = piece;
  }
  
  // Check for castling and move the rook if needed
  var isCastling = false;
  var rookFrom = null;
  var rookTo = null;
  
  // King moved two squares - likely castling
  if (from[0] === 'e' && (to[0] === 'g' || to[0] === 'c') && from[1] === to[1]) {
    var pieceImg = toSquare.querySelector('img');
    if (pieceImg && pieceImg.src.indexOf('K.svg') > -1) {
      isCastling = true;
      
      // Determine rook positions based on castling type
      if (to[0] === 'g') {
        // Kingside castling
        rookFrom = 'h' + from[1];
        rookTo = 'f' + from[1];
        console.log('Player castling kingside, moving rook from', rookFrom, 'to', rookTo);
      } else if (to[0] === 'c') {
        // Queenside castling
        rookFrom = 'a' + from[1];
        rookTo = 'd' + from[1];
        console.log('Player castling queenside, moving rook from', rookFrom, 'to', rookTo);
      }
    }
  }
  
  // If this is castling, also move the rook
  if (isCastling && rookFrom && rookTo) {
    var rookFromSquare = document.getElementById(rookFrom);
    var rookToSquare = document.getElementById(rookTo);
    
    if (rookFromSquare && rookToSquare) {
      var rookPieceElement = rookFromSquare.querySelector('img');
      if (rookPieceElement) {
        // Clone the rook
        var clonedRook = rookPieceElement.cloneNode(true);
        rookFromSquare.innerHTML = '';
        rookToSquare.innerHTML = '';
        rookToSquare.appendChild(clonedRook);
      } else {
        // Fallback if no img element
        var rookHTML = rookFromSquare.innerHTML;
        rookToSquare.innerHTML = rookHTML;
        rookFromSquare.innerHTML = '';
      }
    }
  }
  
  console.log('After move - fromSquare:', fromSquare.innerHTML, 'toSquare:', toSquare.innerHTML);
  
  var xhr = new XMLHttpRequest();
  // The correct endpoint for making moves
  var moveEndpoint = 'https://lichess.org/api/board/game/' + currentGameId + '/move/' + from + to;
  console.log('Move endpoint:', moveEndpoint);
  
  xhr.open('POST', moveEndpoint, true);
  xhr.setRequestHeader('Authorization', 'Bearer YOUR_API_KEY');
  xhr.setRequestHeader('Accept', 'application/json');
  
  xhr.onerror = function() {
    console.error('Network error making move');
    messageEl.innerText = 'Network error occurred while making move.';
    
    // Revert the board to original state on error
    fromSquare.innerHTML = originalFromHTML;
    toSquare.innerHTML = originalToHTML;
  };
  
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      console.log('Move response status:', xhr.status);
      console.log('Move response:', xhr.responseText);
      
      if (xhr.status === 200 || xhr.status === 201) {
        // Move successful
        isPlayerTurn = false;
        messageEl.innerText = 'AI is thinking...';
        
        try {
          var response = JSON.parse(xhr.responseText);
          console.log('Move successful, response:', response);
          
          // Make sure the piece is still visible
          if (toSquare.innerHTML.trim() === '') {
            console.warn('Piece disappeared after successful move, restoring it');
            toSquare.innerHTML = piece;
          }
        } catch (e) {
          console.log('Move successful but could not parse response');
        }
      } else {
        // Move failed - revert the board
        fromSquare.innerHTML = originalFromHTML;
        toSquare.innerHTML = originalToHTML;
        
        // Display error
        try {
          var errorResponse = JSON.parse(xhr.responseText);
          messageEl.innerText = 'Invalid move: ' + (errorResponse.error || 'Unknown error') + 
                               ' (Status: ' + xhr.status + ')';
          console.error('Move failed:', errorResponse);
        } catch (e) {
          messageEl.innerText = 'Invalid move. Status: ' + xhr.status + '. Please try again.';
          console.error('Move failed with status:', xhr.status);
        }
      }
    }
  };
  
  xhr.send();
}

// We don't need a separate function to fetch game state
// since we're relying entirely on the stream data