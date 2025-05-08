const pendingLbl = document.getElementById("lbl-pending");
const deskHeader = document.querySelector("h1");
const noMoreAlert = document.querySelector(".alert");
const btnDraw = document.querySelector("#btn-draw");
const btnDone = document.querySelector("#btn-done");
const lblCurrentTicket = document.querySelector("small");
const protocol = window.location.protocol === "https:" ? "wss" : "ws";
const host = window.location.host;
const wsUrl = `${protocol}://${host}/ws`;

const searchParams = new URLSearchParams(window.location.search);
let workingTicket = null;

if (!searchParams.has("escritorio")) {
  window.location = "index.html";
  throw new Error("Escritorio es requerido");
}

const deskNumber = searchParams.get("escritorio");
deskHeader.textContent = deskNumber;

function checkTicketCount(currentCount = 0) {
  if (currentCount === 0) {
    noMoreAlert.classList.remove("d-none");
  } else {
    noMoreAlert.classList.add("d-none");
  }
  pendingLbl.textContent = currentCount;
}

async function loadInitialCount() {
  const pendingTickets = await fetch("/api/ticket/pending").then((res) =>
    res.json()
  );

  checkTicketCount(pendingTickets.length);
}

async function getTicket() {
  await finishTicket();

  const { status, ticket, message } = await fetch(
    `/api/ticket/draw/${deskNumber}`
  ).then((resp) => resp.json());

  if (status === "error") {
    lblCurrentTicket.textContent = message;
    return;
  }

  workingTicket = ticket;
  lblCurrentTicket.textContent = ticket.number;
}

async function finishTicket() {
  if (!workingTicket) return;

  const { status, message } = await fetch(
    `/api/ticket/done/${workingTicket.id}`,
    {
      method: "PUT",
    }
  ).then((resp) => resp.json());

  if (status === "ok") {
    workingTicket = null;
    lblCurrentTicket.textContent = "Nadie";
  }
}

function connectToWebSockets() {
  const socket = new WebSocket(wsUrl);

  socket.onmessage = (event) => {
    const { type, payload } = JSON.parse(event.data);

    if (type === "on-ticket-count-changed") {
      checkTicketCount(payload);
    }
  };

  socket.onclose = (event) => {
    console.log("Connection closed");
    setTimeout(() => {
      console.log("retrying to connect");
      connectToWebSockets();
    }, 1500);
  };

  socket.onopen = (event) => {
    console.log("Connected");
  };
}

btnDraw.addEventListener("click", getTicket);
btnDone.addEventListener("click", finishTicket);

loadInitialCount();
connectToWebSockets();
