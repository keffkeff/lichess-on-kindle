var Network = {
  parseStreamData: function(data, idx) {
    var curJSON = data.substring(idx);
    try {
      return JSON.parse(curJSON);
    } catch (e) {
      return null;
    }
  },
  
  abortStream: function(xhr) {
    if (xhr) {
      try {
        xhr.abort();
      } catch (e) {}
    }
  },
  
  abortAllStreams: function() {
    this.abortStream(GameState.network.currentStreamXhr);
    this.abortStream(GameState.network.globalFeedXhr);
    GameState.network.currentStreamXhr = null;
    GameState.network.globalFeedXhr = null;
  },
  
  makeRequest: function(method, url, headers, data, callbacks) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    
    if (headers) {
      for (var key in headers) {
        if (headers.hasOwnProperty(key)) {
          try {
            xhr.setRequestHeader(key, headers[key]);
          } catch (e) {}
        }
      }
    }
    
    if (callbacks.onProgress) {
      xhr.onprogress = callbacks.onProgress;
    }
    
    if (callbacks.onError) {
      xhr.onerror = callbacks.onError;
    }
    
    if (callbacks.onComplete) {
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          callbacks.onComplete(xhr);
        }
      };
    }
    
    xhr.send(data || null);
    return xhr;
  },
  
  // Make an authenticated request to Lichess API
  makeAuthRequest: function(method, endpoint, data, callbacks) {
    var headers = {
      'Authorization': Config.API_TOKEN,
      'Accept': 'application/json'
    };
    
    if (method === 'POST' && data) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    
    return this.makeRequest(
      method, 
      Config.LICHESS_API_BASE + endpoint, 
      headers, 
      data, 
      callbacks
    );
  },
  
  // Start a streaming request with line-based parsing
  streamRequest: function(url, headers, onData, onError) {
    var lastResponseLength = 0;
    var buffer = '';
    
    var xhr = this.makeRequest('GET', url, headers, null, {
      onProgress: function(event) {
        var currentLength = event.target.response.length;
        if (currentLength <= lastResponseLength) return;
        
        var newData = event.target.response.substring(lastResponseLength);
        lastResponseLength = currentLength;
        
        buffer += newData;
        var lastNewlineIndex = buffer.lastIndexOf('\n');
        
        if (lastNewlineIndex === -1) return;
        
        var completeData = buffer.substring(0, lastNewlineIndex);
        buffer = buffer.substring(lastNewlineIndex + 1);
        
        var lines = completeData.split('\n');
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (!line) continue;
          
          try {
            var data = JSON.parse(line);
            onData(data);
          } catch (e) {
            console.error('Error parsing stream line:', e);
          }
        }
      },
      onError: onError
    });
    
    xhr.responseType = 'text';
    return xhr;
  },
  
  // Start an authenticated streaming request
  streamAuthRequest: function(endpoint, onData, onError) {
    return this.streamRequest(
      Config.LICHESS_API_BASE + endpoint,
      {
        'Authorization': Config.API_TOKEN,
        'Accept': 'application/x-ndjson'
      },
      onData,
      onError
    );
  }
};