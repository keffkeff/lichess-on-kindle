var UI = {
  showMessage: function(text) {
    var el = document.getElementById('game-message');
    if (el) el.innerText = text;
  },
  
  updateClock: function(color, timeMs) {
    var elementId = color === 'white' ? 'wpTime' : 'bpTime';
    var el = document.getElementById(elementId);
    if (el) {
      el.innerText = Clock.formatTime(Math.floor(timeMs / 1000));
    }
  },
  
  updatePlayerName: function(color, name) {
    var elementId = color === 'white' ? 'wpName' : 'bpName';
    var el = document.getElementById(elementId);
    if (el) {
      el.innerText = name;
    }
  },
  
  updateActivePlayer: function(fen) {
    var activeColor = FenUtils.getActiveColor(fen);
    this.setActivePlayerHighlight(activeColor);
  },
  
  updateActivePlayerByTurn: function() {
    var activeColor;
    if (GameState.isPlayerTurn()) {
      activeColor = GameState.player.color;
    } else {
      activeColor = GameState.player.color === 'white' ? 'black' : 'white';
    }
    this.setActivePlayerHighlight(activeColor);
  },
  
  setActivePlayerHighlight: function(activeColor) {
    var wpElement = document.getElementById('wp');
    var bpElement = document.getElementById('bp');
    
    if (activeColor === 'white') {
      wpElement.className = 'player-box active-player';
      bpElement.className = 'player-box';
    } else {
      wpElement.className = 'player-box';
      bpElement.className = 'player-box active-player';
    }
  },
  
  showElement: function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'block';
  },
  
  hideElement: function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  },
  
  showInline: function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'inline-block';
  },
  
  clearPlayerInfo: function() {
    this.updatePlayerName('white', '');
    this.updatePlayerName('black', '');
    document.getElementById('wpTime').innerText = '';
    document.getElementById('bpTime').innerText = '';
  }
};