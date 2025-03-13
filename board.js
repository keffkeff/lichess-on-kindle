// Board rendering and updates
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
};

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
};

const coordinates = [
    "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8",
    "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8",
    "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8",
    "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8",
    "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8",
    "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8",
    "g1", "g2", "g3", "g4", "g5", "g6", "g7", "g8",
    "h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8"
];

function drawBoard(fen) {
    var fenObj = fenToObj(fen);
    
    for (i = 0; i < coordinates.length; i++) {
        if (coordinates[i] in fenObj) {
            document.getElementById(coordinates[i]).innerHTML = pngPieces[fenObj[coordinates[i]]];
        } else {
            document.getElementById(coordinates[i]).innerHTML = "";
        }
    }
    
    // Update active player indicator based on FEN
    updateActivePlayer(fen);
}

function updateActivePlayer(fen) {
    // In FEN notation, the active player is indicated after the board position
    // Example: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    // where 'w' means white to move, 'b' means black to move
    const parts = fen.split(' ');
    const isWhiteTurn = parts.length > 1 && parts[1] === 'w';
    const wpElement = document.getElementById('wp');
    const bpElement = document.getElementById('bp');
    wpElement.classList.toggle('active-player', isWhiteTurn);
    bpElement.classList.toggle('active-player', !isWhiteTurn);
} 