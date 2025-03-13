// Main application logic and API calls
function parseData(data, idx) {
    var curJSON = data.substring(idx);
    console.log(curJSON);
    const curBoard = JSON.parse(curJSON);
    return curBoard;
}

function updatePlayerInfo(curBoard) {
    if (curBoard.t == "featured") {
        document.getElementById('wpName').innerHTML = "White: <br>" + curBoard.d.players[0].user.name;
        document.getElementById('bpName').innerHTML = "Black: <br>" + curBoard.d.players[1].user.name;
    } else {
        document.getElementById('wpTime').innerHTML = Math.floor(curBoard.d.wc / 60) + ":" + 
            String(Math.floor(curBoard.d.wc % 60)).padStart(2, '0');
        document.getElementById('bpTime').innerHTML = Math.floor(curBoard.d.bc / 60) + ":" + 
            String(Math.floor(curBoard.d.bc % 60)).padStart(2, '0');
    }
}

function main() {
    // Do things after the DOM loads fully
    var idx = 0;
    var oReq = new XMLHttpRequest();
    
    oReq.open("GET", "https://lichess.org/api/tv/feed");
    oReq.responseType = "text";
    oReq.overrideMimeType('text\/plain; charset=x-user-defined');
    oReq.send();
    
    oReq.onprogress = function(event) {
        curBoard = parseData(oReq.response, idx);
        drawBoard(curBoard.d.fen);
        updatePlayerInfo(curBoard);
        idx = event.loaded;
    };
}

window.onload = function() {
    main();
}; 