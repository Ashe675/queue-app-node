async function getWorkingOnTickets() {
  const tickets = await fetch("/api/ticket/working-on").then((res) =>
    res.json()
  );

  renderTickets(tickets);
}

function renderTickets(tickets = []) {
  for (let i = 0; i < 4; i++) {
    const ticket = tickets[i];
    const lblTicket = document.getElementById(`lbl-ticket-0${i + 1}`);

    const lblDesk = document.getElementById(`lbl-desk-0${i + 1}`);

    if (!ticket) continue;

    lblTicket.textContent = `Ticket ${ticket.number}`;
    lblDesk.textContent = `${ticket.handleAtDesk}`;
  }
}

function connectToWebSockets() {
  const socket = new WebSocket("ws://localhost:3000/ws");

  socket.onmessage = (event) => {
    const { type, payload } = JSON.parse(event.data);

    if (type === "on-working-changed") {
      renderTickets(payload);
    }
  };

  socket.onclose = (event) => {
    setTimeout(() => {
      console.log("retrying to connect");
      connectToWebSockets();
    }, 1500);
  };

  socket.onopen = (event) => {
    console.log("Connected");
  };
}


connectToWebSockets();
getWorkingOnTickets();
