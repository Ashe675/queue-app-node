const protocol = window.location.protocol === "https:" ? "wss" : "ws";
const host = window.location.host;
const wsUrl = `${protocol}://${host}/ws`;

function connectToWebSockets() {

  const socket = new WebSocket( wsUrl);

  socket.onmessage = ( event ) => {
    console.log(event.data);
  };

  socket.onclose = ( event ) => {
    console.log( 'Connection closed' );
    setTimeout( () => {
      console.log( 'retrying to connect' );
      connectToWebSockets();
    }, 1500 );

  };

  socket.onopen = ( event ) => {
    console.log( 'Connected' );
  };

}

connectToWebSockets();

