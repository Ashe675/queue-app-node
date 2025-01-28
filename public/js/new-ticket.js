const newTicketLabel = document.querySelector("#lbl-new-ticket");
const createTicketBtn = document.querySelector("button");

fetchLastTicket();

async function fetchLastTicket() {
  const lastTicket = await fetch("/api/ticket/last")
    .then((res) => res.json())
    .catch((error) => console.log(error));

  updateLast(lastTicket);

  return lastTicket;
}

function updateLast(number) {
  newTicketLabel.textContent = number;
}

createTicketBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  await fetch("/api/ticket", {
    method: "POST",
  }).then((res) => res.json());

  await fetchLastTicket();
});
