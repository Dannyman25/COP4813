const cards = [
    {
        id: "ace-hearts",
        name: "Ace of Hearts",
        image: "images/ace-hearts.png"
    },
    {
        id: "two-clubs",
        name: "Two of Clubs",
        image: "images/two-clubs.png"
    },
    {
        id: "king-diamonds",
        name: "King of Diamonds",
        image: "images/king-diamonds.png"
    },
    {
        id: "jack-spades",
        name: "Jack of Spades",
        image: "images/jack-spades.png"
    },
    {
        id: "ten-hearts",
        name: "Ten of Hearts",
        image: "images/ten-hearts.png"
    }
];

const dealButton = document.querySelector("#deal-button");
const hand = document.querySelector("#hand");
const discardPile = document.querySelector("#discard-pile");
const dropStatus = document.querySelector("#drop-status");
const discardCountOutput = document.querySelector("#discard-count");

let discardCount = 0;

dealButton.addEventListener("click", dealCards);

function dealCards() {
    hand.innerHTML = "";
    discardCount = 0;

    discardCountOutput.textContent = discardCount;
    dropStatus.textContent = "Drag a card into the discard pile.";

    const shuffledCards = [...cards].sort(() => Math.random() - 0.5);

    shuffledCards.forEach(function (card) {
        const cardElement = document.createElement("img");

        cardElement.id = card.id;
        cardElement.src = card.image;
        cardElement.alt = card.name;
        cardElement.className = "playing-card";
        cardElement.draggable = true;
        cardElement.dataset.cardName = card.name;
        cardElement.title = card.name;

        cardElement.addEventListener("dragstart", dragCard);
        cardElement.addEventListener("dragend", finishDrag);

        hand.appendChild(cardElement);
    });
}

function dragCard(event) {
    event.dataTransfer.setData("text/plain", event.currentTarget.id);
    event.currentTarget.classList.add("dragging");
}

function finishDrag(event) {
    event.currentTarget.classList.remove("dragging");
    discardPile.classList.remove("drag-over");
}

discardPile.addEventListener("dragover", function (event) {
    event.preventDefault();
    discardPile.classList.add("drag-over");
});

discardPile.addEventListener("dragleave", function () {
    discardPile.classList.remove("drag-over");
});

discardPile.addEventListener("drop", function (event) {
    event.preventDefault();

    const cardId = event.dataTransfer.getData("text/plain");
    const cardElement = document.getElementById(cardId);

    if (cardElement) {
        const cardName = cardElement.dataset.cardName;

        cardElement.remove();
        discardCount++;

        discardCountOutput.textContent = discardCount;
        dropStatus.textContent = `${cardName} was successfully discarded.`;
    }

    discardPile.classList.remove("drag-over");

    if (hand.children.length === 0) {
        hand.innerHTML = "<p>All five cards have been discarded.</p>";
    }
});