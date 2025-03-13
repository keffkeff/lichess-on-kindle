// Chess logic and FEN parsing
const COLUMNS = 'abcdefgh'.split('');

function isString(s) {
    return typeof s === 'string';
}

// Convert FEN piece code to bP, wK, etc
function fenToPieceCode(piece) {
    // Black piece
    if (piece.toLowerCase() === piece) {
        return 'b' + piece.toUpperCase();
    }
    // White piece
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

function validFen(fen) {
    if (!isString(fen)) return false;

    // Cut off any move, castling, etc info from the end
    // We're only interested in position information
    fen = fen.replace(/ .+$/, '');

    // Expand the empty square numbers to just 1s
    fen = expandFenEmptySquares(fen);

    // FEN should be 8 sections separated by slashes
    var chunks = fen.split('/');
    if (chunks.length !== 8) return false;

    // Check each section
    for (var i = 0; i < 8; i++) {
        if (chunks[i].length !== 8 ||
            chunks[i].search(/[^kqrnbpKQRNBP1]/) !== -1) {
            return false;
        }
    }

    return true;
}

// Convert FEN string to position object
// Returns false if the FEN string is invalid
function fenToObj(fen) {
    if (!validFen(fen)) return false;

    // Cut off any move, castling, etc info from the end
    // We're only interested in position information
    fen = fen.replace(/ .+$/, '');

    var rows = fen.split('/');
    var position = {};

    var currentRow = 8;
    for (var i = 0; i < 8; i++) {
        var row = rows[i].split('');
        var colIdx = 0;

        // Loop through each character in the FEN section
        for (var j = 0; j < row.length; j++) {
            // Number / empty squares
            if (row[j].search(/[1-8]/) !== -1) {
                var numEmptySquares = parseInt(row[j], 10);
                colIdx = colIdx + numEmptySquares;
            } else {
                // Piece
                var square = COLUMNS[colIdx] + currentRow;
                position[square] = fenToPieceCode(row[j]);
                colIdx = colIdx + 1;
            }
        }

        currentRow = currentRow - 1;
    }

    return position;
} 