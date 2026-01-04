var COLUMNS = 'abcdefgh'.split('');

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
    if (coordinates[i] in fenObj) {
      document.getElementById(coordinates[i]).innerHTML = pngPieces[fenObj[coordinates[i]]];
    }
    else {
      document.getElementById(coordinates[i]).innerHTML = "";        
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