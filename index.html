<html>

<head>
<meta charset="UTF-8"> 
<title>Chessboard using Pure CSS and HTML</title>

<style type="text/css">

.chessboard {
    width: 640px;
    height: 640px;
    margin: 20px;
    border: 25px solid #333;
}
.black {
    float: left;
    width: 80px;
    height: 80px;
    background-color: #999;
      font-size:50px;
    text-align:center;
    display: table-cell;
    vertical-align:middle;
}
.white {
    float: left;
    width: 80px;
    height: 80px;
    background-color: #fff;
    font-size:50px;
    text-align:center;
    display: table-cell;
    vertical-align:middle;
}

#wp {
    float: right;
    border: 1px solid;
}

#bp {
    float: left;
    border: 1px solid;
}

#bpTime {
    font-size: 3em;
}

#wpTime {
    font-size: 3em;
}

.pieces {
    width: 1.6em;
    height: auto;
}

</style>

</head>

<body>

<div class="chessboard">
<!-- 8th -->
<div class="white" id="a8">&#9820;</div>
<div class="black" id="b8">&#9822;</div>
<div class="white" id="c8">&#9821;</div>
<div class="black" id="d8">&#9819;</div>
<div class="white" id="e8">&#9818;</div>
<div class="black" id="f8">&#9821;</div>
<div class="white" id="g8">&#9822;</div>
<div class="black" id="h8">&#9820;</div>
<!-- 7th -->
<div class="black" id="a7">&#9823;</div>
<div class="white" id="b7">&#9823;</div>
<div class="black" id="c7">&#9823;</div>
<div class="white" id="d7">&#9823;</div>
<div class="black" id="e7">&#9823;</div>
<div class="white" id="f7">&#9823;</div>
<div class="black" id="g7">&#9823;</div>
<div class="white" id="h7">&#9823;</div>
<!-- 6th -->
<div class="white" id="a6"></div>
<div class="black" id="b6"></div>
<div class="white" id="c6"></div>
<div class="black" id="d6"></div>
<div class="white" id="e6"></div>
<div class="black" id="f6"></div>
<div class="white" id="g6"></div>
<div class="black" id="h6"></div>
<!-- 5th -->
<div class="black" id="a5"></div>
<div class="white" id="b5"></div>
<div class="black" id="c5"></div>
<div class="white" id="d5"></div>
<div class="black" id="e5"></div>
<div class="white" id="f5"></div>
<div class="black" id="g5"></div>
<div class="white" id="h5"></div>
<!-- 4th -->
<div class="white" id="a4"></div>
<div class="black" id="b4"></div>
<div class="white" id="c4"></div>
<div class="black" id="d4"></div>
<div class="white" id="e4"></div>
<div class="black" id="f4"></div>
<div class="white" id="g4"></div>
<div class="black" id="h4"></div>
<!-- 3rd -->
<div class="black" id="a3"></div>
<div class="white" id="b3"></div>
<div class="black" id="c3"></div>
<div class="white" id="d3"></div>
<div class="black" id="e3"></div>
<div class="white" id="f3"></div>
<div class="black" id="g3"></div>
<div class="white" id="h3"></div>
<!-- 2nd -->
<div class="white" id="a2">&#9817;</div>
<div class="black" id="b2">&#9817;</div>
<div class="white" id="c2">&#9817;</div>
<div class="black" id="d2">&#9817;</div>
<div class="white" id="e2">&#9817;</div>
<div class="black" id="f2">&#9817;</div>
<div class="white" id="g2">&#9817;</div>
<div class="black" id="h2">&#9817;</div>
<!-- 1st -->
<div class="black" id="a1">&#9814;</div>
<div class="white" id="b1">&#9816;</div>
<div class="black" id="c1">&#9815;</div>
<div class="white" id="d1">&#9813;</div>
<div class="black" id="e1">&#9812;</div>
<div class="white" id="f1">&#9815;</div>
<div class="black" id="g1">&#9816;</div>
<div class="white" id="h1">&#9814;</div>
</div>

<div id="wp">
    <div id=wpName></div>
    <div id=wpTime></div><div id=wpTime></div>
</div>

<div id="bp">
    <div id=bpName></div>
    <div id=bpTime></div><div id=bpTime></div>
</div>

</body>

<script>

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



</script>
</html>