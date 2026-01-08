var Clock = {
    formatTime: function(seconds) {
      var minutes = Math.floor(seconds / 60);
      var remainingSeconds = Math.floor(seconds % 60);
      return (minutes < 10 ? '0' : '') + minutes + ':' + 
             (remainingSeconds < 10 ? '0' : '') + remainingSeconds;
    },
    
    update: function() {
      var clock = GameState.clock;
      var turn = GameState.turn;
      var game = GameState.game;
      
      if (!clock.lastUpdate) return;
      
      // In AI mode, don't count down until game is active
      if (game.mode === Config.GAME_MODE.AI && 
          game.status !== Config.GAME_STATUS.ACTIVE) {
        return;
      }
      
      var now = Date.now();
      var elapsed = now - clock.lastUpdate;
      clock.lastUpdate = now;
      
      if (turn.color === 'white') {
        // Only count down if white has made at least one move
        if (!GameState.hasColorMoved('white')) return;
        
        clock.whiteTimeMs = Math.max(0, clock.whiteTimeMs - elapsed);
        UI.updateClock('white', clock.whiteTimeMs);
        
        if (clock.whiteTimeMs === 0 && game.mode === Config.GAME_MODE.AI && 
            game.status === Config.GAME_STATUS.ACTIVE) {
          Clock.stop();
          UI.showMessage('White ran out of time!');
          AIGame.end();
        }
      } else {
        // Only count down if black has made at least one move
        if (!GameState.hasColorMoved('black')) return;
        
        clock.blackTimeMs = Math.max(0, clock.blackTimeMs - elapsed);
        UI.updateClock('black', clock.blackTimeMs);
        
        if (clock.blackTimeMs === 0 && game.mode === Config.GAME_MODE.AI && 
            game.status === Config.GAME_STATUS.ACTIVE) {
          Clock.stop();
          UI.showMessage('Black ran out of time!');
          AIGame.end();
        }
      }
    },
    
    start: function() {
      if (GameState.clock.interval) return;
      
      GameState.clock.lastUpdate = Date.now();
      GameState.clock.interval = setInterval(function() {
        Clock.update();
      }, 1000);
    },
    
    stop: function() {
      if (GameState.clock.interval) {
        clearInterval(GameState.clock.interval);
        GameState.clock.interval = null;
      }
      GameState.clock.lastUpdate = null;
    },
    
    setTimes: function(whiteMs, blackMs) {
      GameState.clock.whiteTimeMs = whiteMs;
      GameState.clock.blackTimeMs = blackMs;
      
      UI.updateClock('white', whiteMs);
      UI.updateClock('black', blackMs);
      
      if (GameState.clock.interval) {
        GameState.clock.lastUpdate = Date.now();
      }
    },
    
    reset: function(whiteMs, blackMs) {
      this.setTimes(
        whiteMs || Config.DEFAULT_TIME_MS,
        blackMs || Config.DEFAULT_TIME_MS
      );
    },
    
    addIncrement: function(color) {
      if (color === 'white') {
        GameState.clock.whiteTimeMs += Config.TIME_INCREMENT_MS;
        UI.updateClock('white', GameState.clock.whiteTimeMs);
      } else {
        GameState.clock.blackTimeMs += Config.TIME_INCREMENT_MS;
        UI.updateClock('black', GameState.clock.blackTimeMs);
      }
    },
    
    syncWithServer: function() {
      if (GameState.clock.interval) {
        GameState.clock.lastUpdate = Date.now();
      }
    }
  };