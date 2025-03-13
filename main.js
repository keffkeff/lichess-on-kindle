
var COLUMNS = 'abcdefgh'.split('')

function isString (s) {
    return typeof s === 'string'
  }

 // convert FEN piece code to bP, wK, etc
  function fenToPieceCode (piece) {
    // black piece
    if (piece.toLowerCase() === piece) {
      return 'b' + piece.toUpperCase()
    }

    // white piece
    return 'w' + piece.toUpperCase()
  }

function expandFenEmptySquares (fen) {
    return fen.replace(/8/g, '11111111')
      .replace(/7/g, '1111111')
      .replace(/6/g, '111111')
      .replace(/5/g, '11111')
      .replace(/4/g, '1111')
      .replace(/3/g, '111')
      .replace(/2/g, '11')
  }

function validFen (fen) {
    if (!isString(fen)) return false

    // cut off any move, castling, etc info from the end
    // we're only interested in position information
    fen = fen.replace(/ .+$/, '')

    // expand the empty square numbers to just 1s
    fen = expandFenEmptySquares(fen)

    // FEN should be 8 sections separated by slashes
    var chunks = fen.split('/')
    if (chunks.length !== 8) return false

    // check each section
    for (var i = 0; i < 8; i++) {
      if (chunks[i].length !== 8 ||
          chunks[i].search(/[^kqrnbpKQRNBP1]/) !== -1) {
        return false
      }
    }

    return true
  }

  // convert FEN string to position object
  // returns false if the FEN string is invalid
  function fenToObj (fen) {
    if (!validFen(fen)) return false

    // cut off any move, castling, etc info from the end
    // we're only interested in position information
    fen = fen.replace(/ .+$/, '')

    var rows = fen.split('/')
    var position = {}

    var currentRow = 8
    for (var i = 0; i < 8; i++) {
      var row = rows[i].split('')
      var colIdx = 0

      // loop through each character in the FEN section
      for (var j = 0; j < row.length; j++) {
        // number / empty squares
        if (row[j].search(/[1-8]/) !== -1) {
          var numEmptySquares = parseInt(row[j], 10)
          colIdx = colIdx + numEmptySquares
        } else {
          // piece
          var square = COLUMNS[colIdx] + currentRow
          position[square] = fenToPieceCode(row[j])
          colIdx = colIdx + 1
        }
      }

      currentRow = currentRow - 1
    }

    return position
  }

  function parseData(data, idx) {
    // document.write('Current idx: ', idx, '<br>');
    // document.write('Data: ', data, '<br>');
    var curJSON = data.substring(idx);
    console.log(curJSON);
    const curBoard = JSON.parse(curJSON);
    // console.log(curBoard);
    // document.write('Data: ', curBoard.d.fen, '<br>');
    return curBoard;
  }

  function updateRect(fen) {
    console.log(fen.toString());
    const color = fen.toString().substring(fen.length - 1);
    // console.log(color[0]);

    // document.getElementById('box').style.width="300px";
    var rect = document.getElementById("box");
    fenObj = fenToObj(fen.toString());
    // console.log(fenObj);
  }

  const unicodePieces = {
    wR: "&#9814;",
    wN: "&#9816;",
    wB: "&#9815;",
    wQ: "&#9813;",
    wK: "&#9812;",
    wP: "&#9817;",
    bR: "&#9820;",
    bN: "&#9822;",
    bB: "&#9821;",
    bQ: "&#9819;",
    bK: "&#9818;",
    bP: "&#9823;"
  }

  const pngPieces = {
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
  }

  const coordinates = [
  "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8",
  "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8",
  "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8",
  "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8",
  "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8",
  "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8",
  "g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8",
  "h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8"
  ]

  function drawBoard(fen) {
    // console.log(fen);
    var fenObj = fenToObj(fen);
    // console.log(fenObj);
    // console.log(Object.values(fenObj));
    for (i = 0; i < coordinates.length; i++) {
      if (coordinates[i] in fenObj) {
        // document.getElementById(coordinates[i]).innerHTML = unicodePieces[fenObj[coordinates[i]]];
        document.getElementById(coordinates[i]).innerHTML = pngPieces[fenObj[coordinates[i]]];
      }
      else {
        document.getElementById(coordinates[i]).innerHTML = "";        
      }
        // console.log(i);
        // console.log(fenObj[i]);
    }
    
    // Update active player indicator based on FEN
    updateActivePlayer(fen);
  }

  function updateActivePlayer(fen) {
    // In FEN notation, the active player is indicated after the board position
    // Example: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    // where 'w' means white to move, 'b' means black to move
    const parts = fen.split(' ');
    // const activeColor = parts.length > 1 ? parts[1] : 'w'; // Default to white if not specified
    const isWhiteTurn = parts.length > 1 && parts[1] === 'w';  
    const wpElement = document.getElementById('wp');
    const bpElement = document.getElementById('bp');   
    wpElement.classList.toggle('active-player', isWhiteTurn);
    bpElement.classList.toggle('active-player', !isWhiteTurn);
  }

  function main() {
    // do things after the DOM loads fully
    var idx = 0;
    var firstChunk = 1;
    var oReq = new XMLHttpRequest();
    // oReq.addEventListener("load", reqListener);
      oReq.open("GET", "https://lichess.org/api/tv/feed");
      oReq.responseType = "text";
      oReq.overrideMimeType('text\/plain; charset=x-user-defined');
      oReq.send();
      oReq.onprogress = function () {
        curBoard = parseData(oReq.response, idx);
        drawBoard(curBoard.d.fen);
        if (curBoard.t == "featured") {
          document.getElementById('wpName').innerHTML = "White: <br>" + curBoard.d.players[0].user.name
          document.getElementById('bpName').innerHTML = "Black: <br>" + curBoard.d.players[1].user.name
        }
        else {
          document.getElementById('wpTime').innerHTML = Math.floor(curBoard.d.wc / 60) + ":" + Math.floor(curBoard.d.wc % 60)
          document.getElementById('bpTime').innerHTML = Math.floor(curBoard.d.bc / 60) + ":" + Math.floor(curBoard.d.bc % 60)
        }
        idx = event.loaded;
        // if (curBoard.t == "featured" && !firstChunk) {

        //   oReq.abort();
        //   oReq.open("GET", "https://lichess.org/api/tv/feed");
        //   oReq.send();
        // }
        // firstChunk = 0;
    }
  }

  window.onload = function() {
    main();
  }


