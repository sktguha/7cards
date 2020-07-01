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
    console.log.apply(console, [Date.now(), ...arguments]);
    line = Date.now() + " : " + [...arguments].map(JSON.stringify).join(",")
    logs.push(line);
}
// console.log = () => { }

// log = () => { }
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

function pullCard(name) {
    card = takeCardFromDeck();
    addCardToPlayerHand(name, card);
}
function incrementIndex() {
    currIndex = currIndex === currPlayers.length - 1 ? 0 : currIndex + 1;
}
app.get("/api/play-turn", (req, res) => {
    let { name, actionType, cardNoToPlace, order, cardNoToGive } = req.query;
    actionType = actionType * 1;
    cardNoToGive = cardNoToGive * 1;
    order = order * 1;
    cardNoToPlace = cardNoToPlace * 1;
    if (name !== currPlayers[currIndex]) {
        log('play by ', name, ' ignored as not curr player', currPlayers[currIndex], req.query);
        return;
    }
    actionType = actionType * 1;
    if (actionType === 1) {
        topCard && underDeck.push(topCard);
        const cardToPlace = cards[name][cardNoToPlace];
        log(name, 'played turn ', actionType, ' card = ', cardToPlace);
        removeCardFromPlayerHand(name, cardToPlace);
        topCard = cardToPlace;
        const nextPlayer = currPlayers[currIndex === currPlayers.length - 1 ? 0 : currIndex + 1];
        if (order === 1) {
            const cardToGive = cards[name][cardNoToGive];
            removeCardFromPlayerHand(name, cardToGive);
            addCardToPlayerHand(nextPlayer, cardToGive);
            log(nextPlayer, ' gave ', cardToGive, ' to ', name, ' by order');
        } else if (order === 2) {
            log(nextPlayer, ' ordered to pull two cards by', name);
            pullCard(nextPlayer);
            pullCard(nextPlayer);
        }
    } else if (actionType === 2) {
        pullCard(name);
        log(name, ' pulled card ');
    } else if (actionType === 3) {
        pullCard(name);
        pullCard(name);
        log(name, ' pulled 2 cards ');
    }
    if (!order) {
        incrementIndex();
    }
    log('turn transferred to next player', currPlayers[currIndex], currIndex, currPlayers);
    res.send({});
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
let lastLog = {}
app.get("/api/refresh-data", (req, res) => {
    const { name } = req.query;
    addToPlayers(name);
    const obj = {
        topCard, cards: cards[name] || [], currIndex, currPlayerName: currPlayers[currIndex], currPlayers: currPlayers.map(player => player + ' (' + cards[player].length + ' cards )')
    }
    if (Date.now() - (lastLog[name] || 0) > 15000) {
        log('sent obj to client', name, obj);
        lastLog[name] = Date.now();
    }
    res.json(obj);
});
console.log('came here');
app.listen(3000, () => console.log("Server listening on port 3000!"));