'use strict';

///////////////////////////////////////

const gameField = document.querySelector('.game-field')
const scoreDisplay = document.querySelector('#score')
const startBtn = document.querySelector('#start-btn')
const upBtn = document.querySelector('#up-btn')
const leftBtn = document.querySelector('#left-btn')
const rightBtn = document.querySelector('#right-btn')
const downBtn = document.querySelector('#down-btn')
let squares = Array.from(document.querySelectorAll('.game-field div'))


///////////////////////////////////////
// VARIABLES

// game field width
const width = 10

const colors = [
    '#daa520',
    '#ff6200',
    '#fa50b0',
    '#610635',
    '#042588',
    '#5d00ff',
    '#00ffb7',
]

// Figures in all shapes and rotations
const figL = [
    [1, width + 1, (width * 2) + 1, (width * 2) + 2],
    [width, width + 1, width + 2, width * 2],
    [0, 1, width + 1, (width * 2) + 1],
    [width, width + 1, width + 2, 2]
]

const figLr = [   // r for reversed
    [1, 2, width + 1, (width * 2) + 1],
    [width, width + 1, width + 2, (width * 2) + 2],
    [1, width + 1, (width * 2) + 1, width * 2],
    [0, width, width + 1, width + 2]
]

const figZ = [
    [width, width + 1, (width * 2) + 1, (width * 2) + 2],
    [1, width, width + 1, width * 2],
    [width, width + 1, (width * 2) + 1, (width * 2) + 2],
    [1, width, width + 1, width * 2]
]

const figZr = [
    [width + 1, width + 2, width * 2, (width * 2) + 1],
    [0, width, width + 1, (width * 2) + 1],
    [width + 1, width + 2, width * 2, (width * 2) + 1,],
    [0, width, width + 1, (width * 2) + 1,]
]

const figT = [
    [1, width, width + 1, width + 2],
    [1, width + 1, width + 2, (width * 2) + 1],
    [width, width + 1, width + 2, (width * 2) + 1],
    [1, width, width + 1, (width * 2) + 1]
]

const figO = [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1]
]

const figI = [
    [1, width + 1, (width * 2) + 1, (width * 3) + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, (width * 2) + 1, (width * 3) + 1],
    [width, width + 1, width + 2, width + 3]
]

const figs = [figL, figLr, figZ, figZr, figT, figO, figI]


// Choose the square around that we build our figure at the first time
let curPos = 4

let curRot = 0

// Random select figure
let randFig = Math.floor(Math.random() * figs.length)

let curFig = figs[randFig][curRot]

// random next figure
let randNextFig = Math.floor(Math.random() * figs.length)

///////////////////////////////////////
// DRAWING
function draw() {
    curFig.forEach(i => squares[curPos + i].classList.add('fig'))
    curFig.forEach(i => squares[curPos + i].style.backgroundColor = colors[randFig])
}

function erase() {
    curFig.forEach(i => squares[curPos + i].classList.remove('fig'))
    curFig.forEach(i => squares[curPos + i].style.backgroundColor = '')
}

///////////////////////////////////////
// MOVEMENTS
function moveDown() {
    if (!curFig.some(i => squares[curPos + i + width].classList.contains('landed'))) {
        erase()
        curPos += width
        draw()
    } else gameLoop()
}

// check if fig is reached left border (0, 10, 20 ... 190 indexes)
const isAtLeftBorder = () => curFig.some(i => (curPos + i) % width === 0)
// (9, 19, 29 ... 199 indexes)
const isAtRightBorder = () => curFig.some(i => (curPos + i) % width === width - 1)


function moveLeft() {
    erase()
    if (!isAtLeftBorder()) curPos--
    if (curFig.some(i => squares[curPos + i].classList.contains('landed'))) curPos++
    draw()
}

function moveRight() {
    erase()
    if (!isAtRightBorder()) curPos++
    if (curFig.some(i => squares[curPos + i].classList.contains('landed'))) curPos--
    draw()
}

// prevent parts of figs from 'jumping' on other side of game field when rotate close to borders 
function validBorderRotate() {
    if ((curPos + 1) % width < 4) {        // +1 is for figs which dont't contain curPos square (e.g. figI-vertical lays to the right of curPos)
        if (isAtRightBorder()) {
            curPos++
            validBorderRotate()            // check again for figI (needs to move twice)
        }
    }
    else if (curPos % width > 5) {
        if (isAtLeftBorder()) {
            curPos--
            validBorderRotate()
        }
    }
}

// prevent curFig overlaying other figs when rotating close to them
function validCloseRotate() {
    const nextRot = curRot === curFig.length - 1 ? 0 : curRot + 1

    if (!figs[randFig][nextRot].some(i => squares[curPos + i].classList.contains('landed'))) {
        curRot = nextRot
        curFig = figs[randFig][curRot]
    }
}

function rotate() {
    erase()
    validCloseRotate()
    validBorderRotate()
    draw()
}

///////////////////////////////////////
// GAME LOOP (landing curFig & starting over)
function gameLoop() {
    // stop moveDown before going out of field (reaching bottom row)
    curFig.forEach(i => squares[curPos + i].classList.add('landed'))
    // draw new fig at the top of game field
    randFig = randNextFig
    randNextFig = Math.floor(Math.random() * figs.length)
    curFig = figs[randFig][curRot]
    curPos = 4

    removeFullRow()
    draw()
    displayPreview()
    gameOver()
}

// remove full row of landed squares
const lastIndex = squares.indexOf(squares.at(-(width + 1)))

function removeFullRow() {
    for (let i = 0; i < lastIndex; i += width) {
        const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9]

        if (row.every(i => squares[i].classList.contains('landed'))) {
            row.forEach(i => {
                squares[i].classList.remove('landed')
                squares[i].classList.remove('fig')
                squares[i].style.backgroundColor = ''
            })
            const removedRow = squares.splice(i, width)
            squares = removedRow.concat(squares)
            squares.forEach(square => gameField.appendChild(square))

            addScore()
        }
    }
}

///////////////////////////////////////
// GAME SCORE & DIFFICULTY 
let score = 0

// difficulty (score/fig movement speed dependency)
function speed(score) {
    if (score < 10) return 800
    if (score < 20) return 700
    if (score < 50) return 600
    if (score < 100) return 500
    if (score < 150) return 400
    if (score < 200) return 300
    if (score < 250) return 200
    if (score < 300) return 100
}

function addScore() {
    score += 10
    scoreDisplay.innerText = score
    clearInterval(timer)
    timer = setInterval(moveDown, speed(score))
}

///////////////////////////////////////
// HANDLERS
function movementsHandler(e) {
    if (e.key === 'ArrowUp' || e.key === 'w') rotate()
    if (e.key === 'ArrowLeft' || e.key === 'a') moveLeft()
    if (e.key === 'ArrowRight' || e.key === 'd') moveRight()
    if (e.key === 'ArrowDown' || e.key === 's') moveDown()
}

function startPauseHandler(e) {
    if (e.key === ' ') startPause()
}

upBtn.addEventListener('click', rotate)
leftBtn.addEventListener('click', moveLeft)
rightBtn.addEventListener('click', moveRight)
downBtn.addEventListener('click', moveDown)

// // prevent zoom on phones
// upBtn.addEventListener('dblclick', (e) => e.preventDefault())
// leftBtn.addEventListener('dblclick', (e) => e.preventDefault())
// rightBtn.addEventListener('dblclick', (e) => e.preventDefault())
// downBtn.addEventListener('dblclick', (e) => e.preventDefault())


function lockControls() {
    upBtn.setAttribute('disabled', 'disabled')
    leftBtn.setAttribute('disabled', 'disabled')
    rightBtn.setAttribute('disabled', 'disabled')
    downBtn.setAttribute('disabled', 'disabled')
}

function unlockControls() {
    upBtn.removeAttribute('disabled')
    leftBtn.removeAttribute('disabled')
    rightBtn.removeAttribute('disabled')
    downBtn.removeAttribute('disabled')
}

///////////////////////////////////////
// START/PAUSE
let timer = null

function startPause() {
    if (timer) {
        document.removeEventListener('keyup', movementsHandler) // block movement controls when paused
        lockControls()
        clearInterval(timer)
        timer = null
    } else {
        document.addEventListener('keyup', movementsHandler) // unblock movement controls
        unlockControls()
        draw()
        timer = setInterval(moveDown, speed(score))
    }
}

///////////////////////////////////////
// GAME OVER

function finalBlockControls() {
    document.removeEventListener('keyup', movementsHandler)
    document.removeEventListener('keyup', startPauseHandler) // block spacebar handler
    startBtn.setAttribute('disabled', 'disabled')            // disable startBtn
    lockControls()
}

function gameOver() {
    if (curFig.some(i => squares[curPos + i].classList.contains('landed'))) {
        scoreDisplay.innerText = 'Game Over :('
        scoreDisplay.style.color = 'red'
        clearInterval(timer)
        finalBlockControls()
    }
    if (score >= 300) {
        scoreDisplay.innerText = 'WINNER! :)'
        scoreDisplay.style.color = 'green'
        clearInterval(timer)
        finalBlockControls()
    }
}

///////////////////////////////////////
// PREVIEW
const previewSquares = document.querySelectorAll('.preview-field div')
const previewWidth = 4
const previewCurPos = 0

// only 1st rotation of every fig
const nextFigs = [
    [1, previewWidth + 1, (previewWidth * 2) + 1, (previewWidth * 2) + 2],             // L
    [1, 2, previewWidth + 1, (previewWidth * 2) + 1],                                  // Lr
    [previewWidth, previewWidth + 1, (previewWidth * 2) + 1, (previewWidth * 2) + 2],  // Z
    [previewWidth + 1, previewWidth + 2, previewWidth * 2, (previewWidth * 2) + 1],    // Zr
    [1, previewWidth, previewWidth + 1, previewWidth + 2],                             // T  
    [0, 1, previewWidth, previewWidth + 1],                                            // O
    [1, previewWidth + 1, (previewWidth * 2) + 1, (previewWidth * 3) + 1]              // I
]

function displayPreview() {
    previewSquares.forEach(square => {
        square.classList.remove('fig')
        square.style.backgroundColor = ''
    })

    nextFigs[randNextFig].forEach(i => {
        previewSquares[previewCurPos + i].classList.add('fig')
        previewSquares[previewCurPos + i].style.backgroundColor = colors[randNextFig]
    })
}

///////////////////////////////////////
function init() {
    startBtn.addEventListener('click', startPause)
    document.addEventListener('keyup', startPauseHandler)
    lockControls()

    draw()
    displayPreview()
}
init()
