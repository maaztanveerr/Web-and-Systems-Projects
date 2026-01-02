// wait for the html to be parsed so elements actually exist in the dom
document.addEventListener('DOMContentLoaded', () => {

    // grab stuff from the dom

    // getting elements
    const board = document.getElementById('board')  // div that will hold all the cards
    const attemptsEl = document.getElementById('attempts') // the number showing attempts
    const timeEl = document.getElementById('time') // number showing total time at the end
    const matchesEl = document.getElementById('matches') // how many pairs we matched so far
    const resetBtn = document.getElementById('resetBtn') // reset button to restart the game

    // game values
    const PAIRS = 8  // 8 pairs makes a 4x4 board which is nice and tidy
    const symbols = ['🍎', '🍌', '🍇', '🍉', '🍒', '🥝', '🍑', '🍍'] // emojis as faces since theyre super quick to use

    let deck = [] // after building this will be 16 items two of each symbol shuffled
    let firstCard = null // the first card the user flips in a try
    let secondCard = null // the second card the user flips in a try
    let lockBoard = false  // when true we ignore clicks so users cant spam flip during check
    let attempts = 0  // how many pair checks we have done each two flips increments this by one
    let matches = 0 // how many pairs are found
    let startedAt = null // times when the first flip happened so we calculate total sec at  end

    // helper to shuffle an array in place
    function shuffle(arr) {
        // sort returns new order based on the compare fn
        // compare fn here: random between -0.5 and 0.5
        // so each item might swap around randomly
        return arr.sort(() => Math.random() - 0.5)
    }

    // make the deck data

    // we copy the symbols array so there are two of each card
    // then we shuffle so positions are random every game
    function buildDeck() {
        const pairs = symbols.concat(symbols)
        shuffle(pairs)
        deck = pairs
    }

    // now for the the board 

    function makeBoard() {
        // clear any existing children from previous game
        board.innerHTML = ''

        // go through each card value in the deck and build the dom
        deck.forEach((value) => {
            // outer card element this gets .flipped and .matched classes
            const card = document.createElement('div')
            card.className = 'card'

            // this is what actually rotates 180deg on flip
            const inner = document.createElement('div')
            inner.className = 'card-inner'

            // front face shows the symbol but only after the card flips
            const front = document.createElement('div')
            front.className = 'card-front'
            front.textContent = value  // put the emoji here using textcontent since its just text

            // back face is the cover shown at the start before flipping
            const back = document.createElement('div')
            back.className = 'card-back'
            back.textContent = '🂠'     // simple card cover emoji looks like a face down card

            // now append everythign
            inner.append(front)
            inner.append(back)
            card.append(inner)
            board.append(card)

            // adding event listeners 
            card.addEventListener('click', onCardClick) //clicking flips and triggers the matching logic

        })
    }

    // clicking a card and checking pairs. main game logic now
    function onCardClick(e) {
        const card = e.currentTarget // the specific .card that was clicked not some child

        // ignore weird interactions 
        if (lockBoard) {
            return
        }
        // already flipped dont do it again
        if (card.classList.contains('flipped')) {
            return
        }
        // already matched leave it alone
        if (card.classList.contains('matched')) {
            return
        }

        // start a timer on the very first flip only
        if (!startedAt) {
            startedAt = Date.now()
        }

        // css will rotate the inner thanks to .card.flipped .card-inner
        flip(card)

        // if this is the first card of the pair just store it and wait for the second click
        if (!firstCard) {
            firstCard = card
            return
        }

        // if we reach here we already had the first card so this is the second one
        secondCard = card
        lockBoard = true // no more clicks while we compare the two

        // increase attempts because we are doing a pair comparison now
        attempts += 1
        attemptsEl.textContent = 'Attempts: ' + attempts

        // read the values from the front faces and compare them
        const v1 = firstCard.querySelector('.card-front').textContent
        const v2 = secondCard.querySelector('.card-front').textContent
        const isMatch = v1 === v2

        // branch based on match or not
        if (isMatch) {
            handleMatch()
        } else {
            handleMismatch()
        }
    }

    //  helpers to flip and unflip by switching classes
    function flip(card) {
        card.classList.add('flipped')
    }
    function unflip(card) {
        card.classList.remove('flipped')
    }

    // if  two cards match mark them as matched so they stay visible and cant be clicked again
    function handleMatch() {
        firstCard.classList.add('matched')
        secondCard.classList.add('matched')
        matches += 1
        matchesEl.textContent = 'Matches: ' + matches

        // clear pair and unlock board
        resetTurn()

        // check if finished
        if (matches === PAIRS) {
            const secs = Math.round((Date.now() - startedAt) / 1000) //  total seconds
            timeEl.textContent = 'Time: ' + secs + 's'
        }
    }

    // when the two cards do not match

    // we wait so player sees the second card then flip both back
    function handleMismatch() {
        setTimeout(() => {
            unflip(firstCard)
            unflip(secondCard)
            resetTurn() // clear  and unlock
        }, 700) // short pause feels better not instant
    }

    // clears  pair tracking and unlocks for the next move
    function resetTurn() {
        firstCard = null
        secondCard = null
        lockBoard = false
    }

    // reset and start new game
    function newGame() {
        attempts = 0
        matches = 0
        startedAt = null

        // update numbers 
        attemptsEl.textContent = 'Attempts: 0'
        matchesEl.textContent = 'Matches: 0'
        timeEl.textContent = 'Time: 0s'

        // clear any temp flip state
        firstCard = null
        secondCard = null
        lockBoard = false

        // build new data and draw it
        buildDeck()
        makeBoard()
    }

    resetBtn.addEventListener('click', newGame)

    newGame()
})
