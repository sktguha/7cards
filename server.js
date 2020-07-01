const express = require("express");
const app = express();
function sortCards(cards) {
    return cards.sort((a, b) => {
        let numa = a.split('_')[0], suita = a.split('_').pop();
        let numb = b.split('_')[0], suitb = b.split('_').pop();
        const so = ["clubs", "diamonds", "hearts", "spades"];
        suita = so.indexOf(suita), suitb = so.indexOf(suitb);
        return suita !== suitb ? suita - suitb : numa - numb;
    })
}
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

let deck = [];
let underDeck = [];
let players = [];
let currIndex = 0;
let currPlayers = [];
let cards = {};
const logs = [];
let turnHistory = [];
let topCard = null;

app.get("/", (req, res) => { res.redirect('/index.html') });
app.use(express.static('public'))
function log() {
    console.log.apply(console, arguments);
    line = Date.now() + " : " + [...arguments].map(JSON.stringify).join(",")
    logs.push(line);
}

function takeCardFromDeck() {
    if (deck.length === 0) {
        deck = shuffle(underDeck);
        underDeck = [];
    }
    return deck.shift();
}
function addCardToPlayerHand(name, card) {
    cards[name] = cards[name] || [];
    if (cards[name].indexOf(card) !== -1) {
        console.error('addCardToPlayerHand: card exists already');
    } else {
        cards[name].push(card);
    }
    cards[name] = sortCards(cards[name]);
}
function removeCardFromPlayerHand(name, card) {
    cards[name] = cards[name] || [];
    const idx = cards[name].indexOf(card);
    if (idx === -1) {
        console.error('removeCardFromPlayerHand: card to remove doesn\'t exists already');
    } else {
        cards[name].splice(idx, 1);
    }
    cards[name] = sortCards(cards[name]);
}
app.get("/api/start-new-game", (req, res) => {
    addToPlayers(req.query.name);
    deck = shuffle(getInitialDeck());
    underDeck = [];
    currPlayers = shuffle(players);
    currIndex = 0;
    cards = {};
    currPlayers.forEach(player => {
        for (let i = 0; i < (req.query.noOfCards * 1 || 7); i++) {
            addCardToPlayerHand(player, takeCardFromDeck());
        }
    })
    console.log({ cards });
    turnHistory = [];
    topCard = null;
    log('started new game by', req.query.name);
    res.json({});
});

app.get("/api/play-turn", (req, res) => {

})

function addToPlayers(name) {
    if (players.indexOf(name) === -1) { players.push(name); console.log('added to players', name) }
}
app.get("/api/set-name", (req, res) => {
    const { name } = req.query;
    addToPlayers(name);
    log('setname call of ', name);
    res.send({})
})

app.get("/api/refresh-data", (req, res) => {
    const { name } = req.query;
    addToPlayers(name);
    const obj = {
        topCard, cards: cards[name] || [], currIndex, currPlayers
    }
    log('sent obj to client', name, obj);
    res.json(obj);
});
console.log('came here');
app.listen(3000, () => console.log("Server listening on port 3000!"));