var TVMode = {
  start: function() {
    GameState.game.mode = Config.GAME_MODE.TV;
    GameState.game.status = Config.GAME_STATUS.ACTIVE;
    
    Clock.start();
    this.watchGlobalFeed();
    this.fetchChannels();
  },
  
  watchGlobalFeed: function() {
    var idx = 0;
    var url = Config.LICHESS_API_BASE + '/tv/feed';
    
    var xhr = Network.makeRequest('GET', url, null, null, {
      onProgress: function(event) {
        try {
          var data = Network.parseStreamData(event.target.response, idx);
          if (!data) return;
          
          TVMode.processStreamData(data);
          idx = event.loaded || event.target.response.length;
        } catch (e) {}
      }
    });
    
    xhr.responseType = 'text';
    try { xhr.overrideMimeType('text/plain; charset=x-user-defined'); } catch (e) {}
    GameState.network.globalFeedXhr = xhr;
  },
  
  processStreamData: function(data) {
    if (data.d && data.d.fen) {
      Board.draw(data.d.fen);
      GameState.updateTurnFromFen(data.d.fen);
    }
    
    if (data.t === 'featured' && data.d && data.d.players) {
      if (data.d.players[0] && data.d.players[0].user) {
        UI.updatePlayerName('white', data.d.players[0].user.name || '');
      }
      if (data.d.players[1] && data.d.players[1].user) {
        UI.updatePlayerName('black', data.d.players[1].user.name || '');
      }
    } else if (data.d) {
      this.updateClocks(data.d);
    }
  },
  
  updateClocks: function(data) {
    if (typeof data.wc !== 'undefined') {
      GameState.clock.whiteTimeMs = data.wc * 1000;
      UI.updateClock('white', GameState.clock.whiteTimeMs);
    }
    if (typeof data.bc !== 'undefined') {
      GameState.clock.blackTimeMs = data.bc * 1000;
      UI.updateClock('black', GameState.clock.blackTimeMs);
    }
    Clock.syncWithServer();
  },
  
  fetchChannels: function() {
    Network.makeRequest('GET', Config.LICHESS_API_BASE + '/tv/channels', null, null, {
      onComplete: function(xhr) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            var data = JSON.parse(xhr.responseText);
            TVMode.renderChannelButtons(data);
          } catch (e) {
            console.error('Invalid channels JSON', e);
          }
        }
      }
    });
  },
  
  renderChannelButtons: function(channels) {
    var container = document.getElementById('new-gb');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (var key in channels) {
      if (!channels.hasOwnProperty(key)) continue;
      
      var btn = document.createElement('button');
      btn.className = 'game-btn';
      btn.innerText = key;
      
      (function(k, ch, b) {
        b.onclick = function() {
          TVMode.selectChannel(k, ch, b);
        };
      })(key, channels[key], btn);
      
      container.appendChild(btn);
    }
  },
  
  selectChannel: function(name, channelData, btn) {
    // Update button styling
    var container = document.getElementById('new-gb');
    var children = container.childNodes;
    for (var i = 0; i < children.length; i++) {
      var c = children[i];
      if (c && c.className && c.className.indexOf('game-btn') !== -1) {
        c.className = c.className.replace(/(?:^|\s)active(?!\S)/g, '');
      }
    }
    btn.className = (btn.className + ' active').trim();
    
    // Update display
    var user = channelData.user || {};
    UI.updatePlayerName('white', (user.name || '') + (user.title ? ' (' + user.title + ')' : ''));
    UI.updatePlayerName('black', 'Variant: ' + name + ' — game ' + (channelData.gameId || ''));
    
    // Watch the channel
    this.watchChannel(name);
  },
  
  watchChannel: function(channelName) {
    Network.abortAllStreams();
    
    GameState.game.mode = Config.GAME_MODE.TV;
    GameState.game.status = Config.GAME_STATUS.ACTIVE;
    
    Clock.stop();
    Clock.start();
    
    var url = Config.LICHESS_API_BASE + '/tv/' + encodeURIComponent(channelName) + '/feed';
    var self = this;
    
    var xhr = Network.makeRequest('GET', url, null, null, {
      onProgress: function(event) {
        try {
          var idx = 0;
          var data = Network.parseStreamData(event.target.response, idx);
          if (data) {
            self.processStreamData(data);
          }
        } catch (e) {}
      }
    });
    
    xhr.responseType = 'text';
    try { xhr.overrideMimeType('text/plain; charset=x-user-defined'); } catch (e) {}
    
    GameState.network.currentStreamXhr = xhr;
  }
};