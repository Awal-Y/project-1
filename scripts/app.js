// Variables created to be used inside function and control difficulty of game. 
const keycodeLeft = 37
const keycodeRight = 39
const keycodeSpace = 32

const gameWidth = 1200
const gameHeight = 800

const playerWidth = 20
const playerSpeed = 600.0
const missileSpeed = 300.0
const missileCooldown = 0.1

const aliensRow = 10
const alienHorizontalPadding = 80
const alienVerticalPadding = 70
const alienVerticalSpacing = 80
const alienCooldown = 6
var score = 0

// Starting position of the gamne. 
const gameState = {
  lastTime: Date.now(),
  leftPressed: false,
  rightPressed: false,
  spacePressed: false,
  playerX: 0,
  playerY: 0,
  playerCooldown: 0,
  lasers: [],
  aliens: [],
  alienLasers: [],
  gameOver: false
}

//Function that calculates when an image rectangle intersect with another rectangle on the grid. 
function rectsIntersect(r1, r2) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  )
}

//Sets position of elements
function setPosition(e, x, y) {
  e.style.transform = `translate(${x}px, ${y}px)`
}

//Sets the border of the game so elements don't go off-grid
function clamp(v, min, max) {
  if (v < min) {
    return min
  } else if (v > max) {
    return max
  } else {
    return v
  }
}

//Random function to fire enemy bullets at random. 
function rand(min, max) {
  if (min === undefined) min = 0
  if (max === undefined) max = 1
  return min + Math.random() * (max - min)
}

//Creates spaceship
function createPlayer($container) {
  gameState.playerX = gameWidth / 2
  gameState.playerY = gameHeight - 50
  const $player = document.createElement('img')
  $player.src = '/Users/awal.y/development/project-1/Images/spaceship.png'
  $player.className = 'player'
  $container.appendChild($player)
  setPosition($player, gameState.playerX, gameState.playerY)
}

//Removes player 
function destroyPlayer($container, player) {
  $container.removeChild(player)
  gameState.gameOver = true
  //const audio =
  //Audio.play()
}

//Updates player position, shooting on the grid
function updatePlayer(dt, $container) {
  if (gameState.leftPressed) {
    gameState.playerX -= dt * playerSpeed
  }
  if (gameState.rightPressed) {
    gameState.playerX += dt * playerSpeed
  }

  gameState.playerX = clamp(
    gameState.playerX,
    playerWidth,
    gameWidth - playerWidth
  )

  if (gameState.spacePressed && gameState.playerCooldown <= 0) {
    createMissile($container, gameState.playerX, gameState.playerY)
    gameState.playerCooldown = missileCooldown
  }
  if (gameState.playerCooldown > 0) {
    gameState.playerCooldown -= dt
  }

  const $player = document.querySelector('.player')
  setPosition($player, gameState.playerX, gameState.playerY)
}

// Creates missile for shooting the aliens. 
function createMissile($container, x, y) {
  const $element = document.createElement('img')
  $element.src = '/Users/awal.y/development/project-1/Images/missile1.png'
  $element.className = 'missile'
  $container.appendChild($element)
  const laser = { x, y, $element }
  gameState.lasers.push(laser)
  //const audio = new Audio("sound/sfx-laser1.ogg");
  //audio.play();
  setPosition($element, x, y)
}

//Updates position of missile on the grid. Determines when missile hits alien. 
function updateMissiles(dt, $container) {
  const lasers = gameState.lasers
  for (let i = 0; i < lasers.length; i++) {
    const laser = lasers[i]
    laser.y -= dt * missileSpeed
    if (laser.y < 0) {
      destroyLaser($container, laser)
    }
    setPosition(laser.$element, laser.x, laser.y)
    const r1 = laser.$element.getBoundingClientRect()
    const aliens = gameState.aliens
    for (let j = 0; j < aliens.length; j++) {
      const alien = aliens[j]
      if (alien.isDead) continue
      const r2 = alien.$element.getBoundingClientRect()
      if (rectsIntersect(r1, r2)) {
        destroyAlien($container, alien)
        destroyLaser($container, laser)
        score += 10
        break
      }
    }
  }
  gameState.lasers = gameState.lasers.filter(e => !e.isDead)
}

//Deletes laser from grid.
function destroyLaser($container, laser) {
  $container.removeChild(laser.$element)
  laser.isDead = true
}

//Creates alien on the grid. 
function createAlien($container, x, y) {
  const $element = document.createElement('img')
  $element.src = '/Users/awal.y/development/project-1/Images/predator.png'
  $element.className = 'alien'
  $container.appendChild($element)
  const alien = { x, y, cooldown: rand(0.1, alienCooldown), $element
  }
  gameState.aliens.push(alien)
  setPosition($element, x, y)
}

//Updates alien on the grid, deletes itsel when hit with missile, shoots alien missile. 
function updateAliens(dt, $container) {
  const dx = Math.sin(gameState.lastTime / 1000.0) * 50
  const dy = Math.cos(gameState.lastTime / 1000.0) * 10

  
  const aliens = gameState.aliens
  for (let i = 0; i < aliens.length; i++) {
    const alien = aliens[i]
    const x = alien.x + dx 
    const y = alien.y + dy
    setPosition(alien.$element, x, y)
    alien.cooldown -= dt
    if (alien.cooldown <= 0) {
      createAlienMissile($container, x, y)
      alien.cooldown = alienCooldown
    }
  }
  gameState.aliens = gameState.aliens.filter(e => !e.isDead)
}

//Deletes alien from grid.
function destroyAlien($container, alien) {
  $container.removeChild(alien.$element)
  alien.isDead = true
}

//Creates Alien Missile. 
function createAlienMissile($container, x, y) {
  const $element = document.createElement('img')
  $element.src = '/Users/awal.y/development/project-1/Images/bluelaser.png'
  $element.className = 'AlienLaser'
  $container.appendChild($element)
  const laser = { x, y, $element }
  gameState.alienLasers.push(laser)
  setPosition($element, x, y)
}

//Shoots laser from aliens on the grid. Determines when an alien bullet hits the spaceship
function updateAlienLaser(dt, $container) {
  const lasers = gameState.alienLasers
  for (let i = 0; i < lasers.length; i++) {
    const laser = lasers[i]
    laser.y += dt * missileSpeed
    if (laser.y > gameHeight) {
      destroyLaser($container, laser)
      
    }
    setPosition(laser.$element, laser.x, laser.y)
    const r1 = laser.$element.getBoundingClientRect()
    const player = document.querySelector('.player')
    const r2 = player.getBoundingClientRect()
    if (rectsIntersect(r1, r2)) {
      destroyPlayer($container, player)
      
      break
    }
  }

  gameState.alienLasers = gameState.alienLasers.filter(e => !e.isDead)
}

// Draws initial state of the game with spaceship and aliens. 
function init() {
  const $container = document.querySelector('.game')
  createPlayer($container)

  const alienSpacing = (gameWidth - alienHorizontalPadding * 2) / (aliensRow - 1)
  for (let j = 0; j < 3; j++) {
    const y = alienVerticalPadding + j * alienVerticalSpacing
    for (let i = 0; i < aliensRow; i++) {
      const x = i * alienSpacing + alienHorizontalPadding
      createAlien($container, x, y)
    }
    
  }
}

//Determines when a player has won. 
function playerWin() {
  return gameState.aliens.length === 0
}

function scoreBoard() {
  var scoreElement = document.getElementById('score')
  scoreElement.textContent = score
}

//Updates the game with animation frame function. 
function update() {
  const currentTime = Date.now()
  const dt = (currentTime - gameState.lastTime) / 1000.0

  if (gameState.gameOver) {
    document.querySelector('.game-over').style.display = 'block'
    
    return 
  }

  if (playerWin()) {
    document.querySelector('.congratulations').style.display = 'block'
    return 
  }
  const $container = document.querySelector('.game')
  updatePlayer(dt, $container)
  updateMissiles(dt, $container)
  updateAliens(dt, $container)
  updateAlienLaser(dt, $container)
  scoreBoard()

  gameState.lastTime = currentTime
  window.requestAnimationFrame(update)
}

//Controls of the game
function onKeyDown(e) {
  if (e.keyCode === keycodeLeft) {
    gameState.leftPressed = true
  } else if (e.keyCode === keycodeRight) {
    gameState.rightPressed = true
  } else if (e.keyCode === keycodeSpace) {
    gameState.spacePressed = true
  }
}

//Controls of the game
function onKeyUp(e) {
  if (e.keyCode === keycodeLeft) {
    gameState.leftPressed = false
  } else if (e.keyCode === keycodeRight) {
    gameState.rightPressed = false
  } else if (e.keyCode === keycodeSpace) {
    gameState.spacePressed = false
  }
}

init()
window.addEventListener('keydown', onKeyDown)
window.addEventListener('keyup', onKeyUp)
window.requestAnimationFrame(update)