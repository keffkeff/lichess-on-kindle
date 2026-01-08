var FenUtils = {
  isString: function(s) {
    return typeof s === 'string';
  },
  
  // Convert FEN piece code to internal format (bP, wK, etc)
  fenToPieceCode: function(piece) {
    if (piece.toLowerCase() === piece) {
      return 'b' + piece.toUpperCase();
    }
    return 'w' + piece.toUpperCase();
  },
  
  expandEmptySquares: function(fen) {
    return fen.replace(/8/g, '11111111')
      .replace(/7/g, '1111111')
      .replace(/6/g, '111111')
      .replace(/5/g, '11111')
      .replace(/4/g, '1111')
      .replace(/3/g, '111')
      .replace(/2/g, '11');
  },
  
  trimMoveInfo: function(fen) {
    return fen.replace(/ .+$/, '');
  },
  
  validate: function(fen) {
    if (!this.isString(fen)) return false;
    
    fen = this.trimMoveInfo(fen);
    fen = this.expandEmptySquares(fen);
    
    var chunks = fen.split('/');
    if (chunks.length !== 8) return false;
    
    for (var i = 0; i < 8; i++) {
      if (chunks[i].length !== 8 || 
          chunks[i].search(/[^kqrnbpKQRNBP1]/) !== -1) {
        return false;
      }
    }
    return true;
  },
  
  toPosition: function(fen) {
    if (!this.validate(fen)) return false;
    
    fen = this.trimMoveInfo(fen);
    var rows = fen.split('/');
    var position = {};
    var currentRow = 8;
    
    for (var i = 0; i < 8; i++) {
      var row = rows[i].split('');
      var colIdx = 0;
      
      for (var j = 0; j < row.length; j++) {
        if (row[j].search(/[1-8]/) !== -1) {
          colIdx += parseInt(row[j], 10);
        } else {
          var square = Config.COLUMNS[colIdx] + currentRow;
          position[square] = this.fenToPieceCode(row[j]);
          colIdx++;
        }
      }
      currentRow--;
    }
    return position;
  },
  
  getActiveColor: function(fen) {
    if (!fen) return 'white';
    var parts = fen.split(' ');
    return (parts.length > 1 && parts[1] === 'w') ? 'white' : 'black';
  }
};