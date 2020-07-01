const express = require("express");
const app = express();

function getInitialDeck() {
    let cards = [];

    ["clubs", "diamonds", "hearts", "spades"].forEach(suit => {
        for (let i = 1; i <= 13; i++) {
            cards.push(i + '_of_' + suit)
        }
    })
    return JSON.parse(JSON.stringify(cards))
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

const deck = shuffle(getInitialDeck());
const underDeck = [];
const players = [];
let currIndex = 0;
let currPlayers = [];

app.get("/", (req, res) => { res.send("Hello World!") });

app.listen(3000, () => console.log("Server listening on port 3000!"));