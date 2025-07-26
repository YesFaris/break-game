'use strict';

// --- Dimensions du jeu de base (référence pour l'échelle) ---
// Ces constantes représentent les dimensions du jeu pour lesquelles le design initial a été fait.
const ORIGINAL_CANVAS_WIDTH = 700;
const ORIGINAL_CANVAS_HEIGHT = 850;

// --- Définition des niveaux ---
const gameLevels = [
    {
        id: 1,
        name: "Niveau 1: Facile",
        brick: {
            rowCount: 5,
            columnCount: 7,
            width: 60,
            height: 20,
            padding: 10,
            offsetTop: 40,
            colors: ["#FF6347", "#FF8C00", "#FFD700", "#ADFF2F", "#6A5ACD"],
            hitsToBreak: 1,
            topHighlight: "#FFFFFF",
            sideShadow: "#333333",
            bottomShadow: "#1A1A1A"
        },
        ball: {
            radius: 8,
            dx: 3,
            dy: -3,
            color: "#C0C0C0",
            gradientStart: "#FFFFFF",
            gradientEnd: "#808080"
        },
        paddle: {
            height: 12,
            width: 90,
            speed: 7,
            borderRadius: 8,
            baseColor: "#4682B4",
            highlightColor: "#6A9ECF",
            shadowColor: "#2F5F8F",
        },
        background: {
            gradientStart: "#87CEEB",
            gradientEnd: "#4682B4"
        }
    },
    {
        id: 2,
        name: "Niveau 2: Moyen",
        brick: {
            rowCount: 6,
            columnCount: 8,
            width: 50,
            height: 18,
            padding: 8,
            offsetTop: 35,
            colors: ["#FF4500", "#FFD700", "#DAA520", "#BDB76B", "#6B8E23", "#800000"],
            hitsToBreak: 1,
            topHighlight: "#FFFFFF",
            sideShadow: "#444444",
            bottomShadow: "#2A2A2A"
        },
        ball: {
            radius: 7,
            dx: 4,
            dy: -4,
            color: "#FFD700",
            gradientStart: "#FFFF00",
            gradientEnd: "#B8860B"
        },
        paddle: {
            height: 10,
            width: 80,
            speed: 8,
            borderRadius: 6,
            baseColor: "#800080",
            highlightColor: "#BA55D3",
            shadowColor: "#4B0082",
        },
        background: {
            gradientStart: "#ADD8E6",
            gradientEnd: "#483D8B"
        }
    },
    {
        id: 3,
        name: "Niveau 3: Difficile",
        brick: {
            rowCount: 7,
            columnCount: 9,
            width: 45,
            height: 16,
            padding: 7,
            offsetTop: 30,
            colors: ["#DC143C", "#FF4500", "#FF8C00", "#FFD700", "#ADFF2F", "#00FF7F", "#4169E1"],
            hitsToBreak: 2,
            topHighlight: "#FFFFFF",
            sideShadow: "#666666",
            bottomShadow: "#3A3A3A"
        },
        ball: {
            radius: 6,
            dx: 5,
            dy: -5,
            color: "#FF0000",
            gradientStart: "#FF6347",
            gradientEnd: "#8B0000"
        },
        paddle: {
            height: 8,
            width: 70,
            speed: 9,
            borderRadius: 5,
            baseColor: "#8B0000",
            highlightColor: "#CD5C5C",
            shadowColor: "#4B0000",
        },
        background: {
            gradientStart: "#FFDAB9",
            gradientEnd: "#CD5C5C"
        }
    }
];

// --- Variables globales du jeu ---
let currentLevel = null;
let currentLevelIndex = 0; // Index du niveau actuel dans le tableau gameLevels
const maxLevels = gameLevels.length; // Nombre total de niveaux
let starsCollected = 0; // Nombre d'étoiles (niveaux terminés)

let userName = ""; // Nom de l'utilisateur

let ball = {};
let paddle = {};
let brickInfo = {};

let bricks = [];
let canvasDom;
let ctx;

let gameOver = false;
let gameWon = false;
let gamePaused = false;
let gameStarted = false;
let animationFrameId;

let scaleX = 1; // Facteur de mise à l'échelle pour l'axe X
let scaleY = 1; // Facteur de mise à l'échelle pour l'axe Y (souvent égal à scaleX pour garder le ratio)

let isMobile = false; // Nouvelle variable pour suivre l'état mobile

// --- Références aux éléments DOM ---
let nameEntryScreen; // Nouvelle référence
let userNameInput; // Nouvelle référence
let continueButton; // Nouvelle référence

let splashScreen;
let levelSelectScreen;
let gameScreen;
let startButton;
let levelButtonsContainer;
let backToSplashButton;
let returnToLevelSelectButton; // Bouton de retour pour desktop
let touchControlsContainer; // Conteneur pour les contrôles tactiles de la raquette
let leftTouchArea;
let rightTouchArea;
let pausePlayButton; // Nouveau bouton pause/play pour mobile
let mobileReturnButton; // Nouveau bouton retour pour mobile
let mobileControlsDiv; // Référence au conteneur des boutons pause/retour
let gameOverPopup; // Pop-up Game Over
let replayButton; // Bouton Rejouer du pop-up Game Over
let quitButton; // Bouton Quitter du pop-up Game Over

let levelCompletePopup; // Nouveau pop-up de fin de niveau
let levelCompleteMessage; // Message du pop-up de fin de niveau
let nextLevelButton; // Bouton pour passer au niveau suivant

let gameCompletePopup; // Nouveau pop-up de fin de jeu
let finalMessage; // Message du pop-up de fin de jeu
let finalStarsContainer; // Conteneur pour afficher les étoiles
let finalReplayButton; // Bouton pour rejouer le jeu entier
let finalQuitButton; // Bouton pour quitter le jeu (revenir à la saisie du nom)


document.addEventListener('DOMContentLoaded', function () {
    // Récupérer les éléments DOM
    nameEntryScreen = document.getElementById("nameEntryScreen");
    userNameInput = document.getElementById("userNameInput");
    continueButton = document.getElementById("continueButton");

    splashScreen = document.getElementById("splashScreen");
    levelSelectScreen = document.getElementById("levelSelectScreen");
    gameScreen = document.getElementById("gameScreen");
    canvasDom = document.getElementById("canvas");
    ctx = canvasDom.getContext('2d');
    startButton = document.getElementById("startButton");
    levelButtonsContainer = document.getElementById("levelButtonsContainer");
    backToSplashButton = document.getElementById("backToSplashButton");
    returnToLevelSelectButton = document.getElementById("returnToLevelSelectButton");
    pausePlayButton = document.getElementById("pausePlayButton");
    mobileReturnButton = document.getElementById("mobileReturnButton");
    mobileControlsDiv = document.querySelector('.mobile-controls-container');
    gameOverPopup = document.getElementById("gameOverPopup");
    replayButton = document.getElementById("replayButton");
    quitButton = document.getElementById("quitButton");

    levelCompletePopup = document.getElementById("levelCompletePopup");
    levelCompleteMessage = document.getElementById("levelCompleteMessage");
    nextLevelButton = document.getElementById("nextLevelButton");

    gameCompletePopup = document.getElementById("gameCompletePopup");
    finalMessage = document.getElementById("finalMessage");
    finalStarsContainer = document.getElementById("finalStarsContainer");
    finalReplayButton = document.getElementById("finalReplayButton");
    finalQuitButton = document.getElementById("finalQuitButton");


    // Créer les contrôles tactiles (pour la raquette)
    createTouchControls();

    // Attacher les écouteurs d'événements
    continueButton.addEventListener('click', () => {
        userName = userNameInput.value.trim();
        if (userName === "") {
            userName = "Joueur";
        }
        showScreen(splashScreen);
    });
    startButton.addEventListener('click', showLevelSelectScreen);
    backToSplashButton.addEventListener('click', showSplashScreen);
    returnToLevelSelectButton.addEventListener('click', showLevelSelectScreen);
    
    // Écouteurs pour les boutons mobiles de pause/retour
    if (pausePlayButton) {
        pausePlayButton.addEventListener('click', togglePause);
    }
    if (mobileReturnButton) {
        mobileReturnButton.addEventListener('click', showLevelSelectScreen);
    }
    // Écouteurs pour les boutons du pop-up Game Over
    if (replayButton) {
        replayButton.addEventListener('click', () => {
            hideGameOverPopup();
            initGame();
            startGameLoop();
        });
    }
    if (quitButton) {
        quitButton.addEventListener('click', () => {
            hideGameOverPopup();
            showLevelSelectScreen();
        });
    }

    // Écouteurs pour les boutons du pop-up de Fin de Niveau
    if (nextLevelButton) {
        nextLevelButton.addEventListener('click', () => {
            hideLevelCompletePopup();
            currentLevelIndex++;
            initGame();
            startGameLoop();
        });
    }

    // Écouteurs pour les boutons du pop-up de Fin de Jeu
    if (finalReplayButton) {
        finalReplayButton.addEventListener('click', () => {
            hideGameCompletePopup();
            resetGameProgress();
            initGame();
            startGameLoop();
        });
    }
    if (finalQuitButton) {
        finalQuitButton.addEventListener('click', () => {
            hideGameCompletePopup();
            resetGameProgress();
            showNameEntryScreen();
        });
    }


    // Gérer le redimensionnement de la fenêtre
    window.addEventListener('resize', () => {
        resizeGame();
        checkIfMobile();
    });

    // Générer les boutons de niveau
    generateLevelButtons();

    // Redimensionner le jeu au chargement initial
    resizeGame();
    // Vérifier si c'est un appareil mobile au chargement initial
    checkIfMobile();
    // Afficher l'écran de saisie du nom par défaut
    showScreen(nameEntryScreen);
});

// État des touches et contrôles tactiles
let rightPressed = false;
let leftPressed = false;

function handleKeyDown(e) {
    if (gameStarted && !gamePaused && !gameOver && !gameWon) {
        if (e.key === "ArrowRight") {
            rightPressed = true;
        } else if (e.key === "ArrowLeft") {
            leftPressed = true;
        }
    }
}

function handleKeyUp(e) {
    if (gameStarted && !gamePaused && !gameOver && !gameWon) {
        if (e.key === "ArrowRight") {
            rightPressed = false;
        } else if (e.key === "ArrowLeft") {
            leftPressed = false;
        }
    }
}

function handleSpacePress(e) {
    if (e.key === " ") {
        e.preventDefault();

        if (!gameStarted && !(gameOver || gameWon)) {
            return;
        }

        if (gameOver || gameWon) {
            // Si le jeu est terminé, ESPACE redémarre (uniquement sur desktop)
            if (!isMobile) {
                initGame();
                startGameLoop();
            }
        } else {
            // Si le jeu est en cours, ESPACE met en pause/reprend
            togglePause();
        }
    }
}

// Fonction pour basculer l'état de pause du jeu
function togglePause() {
    if (!gameStarted || gameOver || gameWon) return;

    gamePaused = !gamePaused;
    if (gamePaused) {
        cancelAnimationFrame(animationFrameId);
        if (pausePlayButton) {
            pausePlayButton.textContent = "REPRENDRE";
        }
    } else {
        startGameLoop();
        if (pausePlayButton) {
            pausePlayButton.textContent = "PAUSE";
        }
    }
    drawAll();
}


// --- Fonctions de gestion des écrans et pop-ups ---
function showScreen(screenToShow) {
    // Cache tous les écrans et pop-ups par défaut
    nameEntryScreen.style.display = "none";
    splashScreen.style.display = "none";
    levelSelectScreen.style.display = "none";
    gameScreen.style.display = "none";
    
    // Cache tous les contrôles et pop-ups par défaut (importants pour le flux de jeu)
    if (returnToLevelSelectButton) returnToLevelSelectButton.style.display = "none";
    if (touchControlsContainer) touchControlsContainer.style.display = "none";
    if (mobileControlsDiv) mobileControlsDiv.style.display = "none";
    
    // Cache tous les pop-ups de jeu explicitement
    if (gameOverPopup) gameOverPopup.style.display = "none";
    if (levelCompletePopup) levelCompletePopup.style.display = "none";
    if (gameCompletePopup) gameCompletePopup.style.display = "none";

    screenToShow.style.display = "flex";

    if (screenToShow === gameScreen) {
        gameStarted = true;
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
        document.addEventListener("keydown", handleSpacePress);
        
        // Gérer la visibilité des boutons en fonction du mode (mobile/desktop)
        if (isMobile) {
            if (touchControlsContainer) touchControlsContainer.style.display = "flex";
            if (mobileControlsDiv) mobileControlsDiv.style.display = "flex";
            if (returnToLevelSelectButton) returnToLevelSelectButton.style.display = "none";
        } else {
            // Sur desktop, le bouton de retour est visible si le jeu est actif et non terminé/en pause
            if (!gameOver && !gameWon && !gamePaused) {
                if (returnToLevelSelectButton) returnToLevelSelectButton.style.display = "block";
            }
            if (touchControlsContainer) touchControlsContainer.style.display = "none";
            if (mobileControlsDiv) mobileControlsDiv.style.display = "none";
        }
        
    } else {
        gameStarted = false;
        cancelAnimationFrame(animationFrameId);
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
        document.removeEventListener("keydown", handleSpacePress);
        rightPressed = false;
        leftPressed = false;
    }
    if (pausePlayButton) {
        pausePlayButton.textContent = gamePaused ? "REPRENDRE" : "PAUSE";
    }
}

function showNameEntryScreen() {
    showScreen(nameEntryScreen);
    userNameInput.value = "";
}

function showSplashScreen() {
    showScreen(splashScreen);
}

function showLevelSelectScreen() {
    showScreen(levelSelectScreen);
}

// Les fonctions show/hide des pop-ups ne doivent plus dépendre de isMobile
function showGameOverPopup() {
    if (gameOverPopup) {
        gameOverPopup.style.display = "flex";
    }
    // Cache les autres contrôles pendant que le pop-up est affiché
    if (returnToLevelSelectButton) returnToLevelSelectButton.style.display = "none";
    if (touchControlsContainer) touchControlsContainer.style.display = "none";
    if (mobileControlsDiv) mobileControlsDiv.style.display = "none";
}

function hideGameOverPopup() {
    if (gameOverPopup) {
        gameOverPopup.style.display = "none";
    }
}

function showLevelCompletePopup() {
    if (levelCompletePopup) {
        levelCompleteMessage.textContent = `NIVEAU ${currentLevelIndex + 1} TERMINÉ !`;
        levelCompletePopup.style.display = "flex";
    }
    // Cache les autres contrôles pendant que le pop-up est affiché
    if (returnToLevelSelectButton) returnToLevelSelectButton.style.display = "none";
    if (touchControlsContainer) touchControlsContainer.style.display = "none";
    if (mobileControlsDiv) mobileControlsDiv.style.display = "none";
}

function hideLevelCompletePopup() {
    if (levelCompletePopup) {
        levelCompletePopup.style.display = "none";
    }
}

function showGameCompletePopup() {
    if (gameCompletePopup) {
        finalMessage.textContent = `BRAVO, ${userName.toUpperCase()} !`;
        finalStarsContainer.innerHTML = '';
        for (let i = 0; i < starsCollected; i++) {
            const star = document.createElement('div');
            star.classList.add('final-star');
            star.innerHTML = '&#9733;';
            finalStarsContainer.appendChild(star);
        }
        gameCompletePopup.style.display = "flex";
    }
    // Cache les autres contrôles pendant que le pop-up est affiché
    if (returnToLevelSelectButton) returnToLevelSelectButton.style.display = "none";
    if (touchControlsContainer) touchControlsContainer.style.display = "none";
    if (mobileControlsDiv) mobileControlsDiv.style.display = "none";
}

function hideGameCompletePopup() {
    if (gameCompletePopup) {
        gameCompletePopup.style.display = "none";
    }
}

function resetGameProgress() {
    currentLevelIndex = 0;
    starsCollected = 0;
}

function startGame(levelId) {
    if (levelId !== undefined) {
        currentLevelIndex = gameLevels.findIndex(level => level.id === levelId);
        if (currentLevelIndex === -1) {
            console.error("Niveau introuvable :", levelId);
            currentLevelIndex = 0;
        }
        starsCollected = currentLevelIndex;
    }

    currentLevel = gameLevels[currentLevelIndex];
    if (!currentLevel) {
        console.error("Niveau actuel introuvable à l'index :", currentLevelIndex);
        currentLevelIndex = 0;
        currentLevel = gameLevels[currentLevelIndex];
    }
    
    Object.assign(ball, currentLevel.ball);
    Object.assign(paddle, currentLevel.paddle);
    Object.assign(brickInfo, currentLevel.brick);

    showScreen(gameScreen);
    initGame();
    startGameLoop();
}

function generateLevelButtons() {
    levelButtonsContainer.innerHTML = '';
    gameLevels.forEach(level => {
        const button = document.createElement('button');
        button.classList.add('level-button');
        button.textContent = level.name;
        button.addEventListener('click', () => startGame(level.id));
        levelButtonsContainer.appendChild(button);
    });
}

function initGame() {
    scaleX = canvasDom.width / ORIGINAL_CANVAS_WIDTH;
    scaleY = canvasDom.height / ORIGINAL_CANVAS_HEIGHT;

    ball.x = (ORIGINAL_CANVAS_WIDTH / 2) * scaleX;
    ball.y = (ORIGINAL_CANVAS_HEIGHT - 30) * scaleY;
    
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * currentLevel.ball.dx * scaleX;
    ball.dy = -Math.abs(currentLevel.ball.dy) * scaleY;
    ball.radius = currentLevel.ball.radius * scaleX;

    paddle.width = currentLevel.paddle.width * scaleX;
    paddle.height = currentLevel.paddle.height * scaleY;
    paddle.speed = currentLevel.paddle.speed * scaleX;
    paddle.x = (ORIGINAL_CANVAS_WIDTH / 2 - paddle.width / 2) * scaleX;
    paddle.y = canvasDom.height - paddle.height - (20 * scaleY); 
    paddle.borderRadius = currentLevel.paddle.borderRadius * scaleX;

    brickInfo.width = currentLevel.brick.width * scaleX;
    brickInfo.height = currentLevel.brick.height * scaleY;
    brickInfo.padding = currentLevel.brick.padding * scaleX;
    brickInfo.offsetTop = currentLevel.brick.offsetTop * scaleY;
    brickInfo.columnCount = currentLevel.brick.columnCount;
    brickInfo.rowCount = currentLevel.brick.rowCount;
    brickInfo.hitsToBreak = currentLevel.brick.hitsToBreak;


    gameOver = false;
    gameWon = false;
    gamePaused = false;

    const originalTotalBricksWidth = currentLevel.brick.columnCount * currentLevel.brick.width +
                                     (currentLevel.brick.columnCount - 1) * currentLevel.brick.padding;
    brickInfo.offsetLeft = ((ORIGINAL_CANVAS_WIDTH - originalTotalBricksWidth) / 2) * scaleX;

    bricks = [];
    for (let c = 0; c < brickInfo.columnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickInfo.rowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1, hitsLeft: brickInfo.hitsToBreak };
        }
    }
    ctx.font = `${20 * scaleX}px 'Press Start 2P', cursive`;
}

function resizeGame() {
    const gameWrapper = document.getElementById('gameWrapper');
    
    if (isMobile && mobileControlsDiv && mobileControlsDiv.style.display !== 'none') {
        const mobileControlsHeight = mobileControlsDiv.offsetHeight;
        canvasDom.width = gameScreen.clientWidth;
        canvasDom.height = gameScreen.clientHeight - mobileControlsHeight;
    } else {
        canvasDom.width = gameScreen.clientWidth;
        canvasDom.height = gameScreen.clientHeight;
    }

    scaleX = canvasDom.width / ORIGINAL_CANVAS_WIDTH;
    scaleY = canvasDom.height / ORIGINAL_CANVAS_HEIGHT;

    if (currentLevel) {
        initGame();
    }
    drawAll();
}

function checkIfMobile() {
    isMobile = window.matchMedia("(max-width: 600px)").matches;

    if (returnToLevelSelectButton) {
        returnToLevelSelectButton.style.display = isMobile ? 'none' : 'block';
    }
    if (mobileControlsDiv) {
        mobileControlsDiv.style.display = isMobile && gameStarted && !gameOver && !gameWon && !gamePaused ? 'flex' : 'none';
    }
    if (touchControlsContainer) {
        touchControlsContainer.style.display = isMobile && gameStarted && !gameOver && !gameWon && !gamePaused ? 'flex' : 'none';
    }
    
    // Les pop-ups ne sont plus cachés par isMobile ici, ils sont gérés par leurs show/hide
    // Assurez-vous qu'ils sont cachés par défaut si le jeu n'est pas dans un état de pop-up
    if (gameOverPopup) gameOverPopup.style.display = 'none';
    if (levelCompletePopup) levelCompletePopup.style.display = 'none';
    if (gameCompletePopup) gameCompletePopup.style.display = 'none';

    resizeGame();
}

function drawBall() {
    ctx.beginPath();
    const gradient = ctx.createRadialGradient(
        ball.x - ball.radius / 3, ball.y - ball.radius / 3, ball.radius / 5,
        ball.x, ball.y, ball.radius
    );
    gradient.addColorStop(0, ball.gradientStart);
    gradient.addColorStop(0.7, ball.color);
    gradient.addColorStop(1, ball.gradientEnd);

    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.shadowBlur = 10 * scaleX;
    ctx.shadowColor = ball.color;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
}

function drawPaddle() {
    ctx.beginPath();
    let x = paddle.x;
    let y = paddle.y;
    let width = paddle.width;
    let height = paddle.height;
    let radius = paddle.borderRadius;

    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    const paddleGradient = ctx.createLinearGradient(x, y, x, y + height);
    paddleGradient.addColorStop(0, paddle.highlightColor);
    paddleGradient.addColorStop(0.5, paddle.baseColor);
    paddleGradient.addColorStop(1, paddle.shadowColor);

    ctx.fillStyle = paddleGradient;
    ctx.shadowBlur = 15 * scaleX;
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawBricks() {
    for (let c = 0; c < brickInfo.columnCount; c++) {
        for (let r = 0; r < brickInfo.rowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                let brickX = (c * (brickInfo.width + brickInfo.padding)) + brickInfo.offsetLeft;
                let brickY = (r * (brickInfo.height + brickInfo.padding)) + brickInfo.offsetTop;
                b.x = brickX;
                b.y = brickY;

                let currentBrickColor = brickInfo.colors[r % brickInfo.colors.length];
                if (b.hitsLeft < brickInfo.hitsToBreak) {
                    const originalColor = currentBrickColor;
                    const colorValue = parseInt(originalColor.substring(1), 16);
                    const darkerColorValue = Math.max(0, colorValue - 0x202020);
                    currentBrickColor = '#' + darkerColorValue.toString(16).padStart(6, '0');
                }

                ctx.beginPath();
                ctx.rect(brickX, brickY, brickInfo.width, brickInfo.height);
                ctx.fillStyle = currentBrickColor;
                ctx.fill();
                ctx.closePath();

                ctx.fillStyle = brickInfo.topHighlight;
                ctx.fillRect(brickX, brickY, brickInfo.width, 2 * scaleY);
                ctx.fillStyle = brickInfo.sideShadow;
                ctx.fillRect(brickX + brickInfo.width - (2 * scaleX), brickY, 2 * scaleX, brickInfo.height);
                ctx.fillStyle = brickInfo.bottomShadow;
                ctx.fillRect(brickX, brickY + brickInfo.height - (2 * scaleY), brickInfo.width, 2 * scaleY);
                
                ctx.strokeStyle = "rgba(0,0,0,0.5)";
                ctx.lineWidth = 1 * scaleX;
                ctx.strokeRect(brickX, brickY, brickInfo.width, brickInfo.height);
            }
        }
    }
}

function drawScore() {
    let score = 0;
    for (let c = 0; c < brickInfo.columnCount; c++) {
        for (let r = 0; r < brickInfo.rowCount; r++) {
            if (bricks[c][r].status === 0) {
                score++;
            }
        }
    }
    ctx.font = `${Math.floor(20 * scaleX)}px 'Press Start 2P', cursive`; 
    ctx.fillStyle = "#FFF";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 20 * scaleX, 30 * scaleY);
    ctx.fillText("Niveau: " + (currentLevelIndex + 1), (ORIGINAL_CANVAS_WIDTH - 150) * scaleX, 30 * scaleY);
    ctx.textAlign = "start";
    return score;
}

function drawAll() {
    ctx.clearRect(0, 0, canvasDom.width, canvasDom.height);

    if (currentLevel && (gameStarted || gameOver || gameWon)) {
        let gradient = ctx.createLinearGradient(0, 0, 0, canvasDom.height);
        gradient.addColorStop(0, currentLevel.background.gradientStart);
        gradient.addColorStop(1, currentLevel.background.gradientEnd);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasDom.width, canvasDom.height);
    } else {
        ctx.fillStyle = "#222";
        ctx.fillRect(0, 0, canvasDom.width, canvasDom.height);
    }

    if (gameStarted || gameOver || gameWon) {
        drawBricks();
        drawBall();
        drawPaddle();
        drawScore();
    }
    
    // La visibilité des contrôles est gérée ici et dans showScreen.
    const mobileControlsDiv = document.querySelector('.mobile-controls-container');

    if (gamePaused) {
        drawPauseScreen(); // Dessine le texte de pause sur le canvas
        // Cache les contrôles de la raquette quand le jeu est en pause
        if (touchControlsContainer) touchControlsContainer.style.display = "none";
        // Les contrôles mobiles (pause/reprendre, retour) restent visibles en pause sur mobile
        if (mobileControlsDiv && isMobile) mobileControlsDiv.style.display = "flex";
        else if (mobileControlsDiv && !isMobile) mobileControlsDiv.style.display = "none"; // Cache sur desktop si pas mobile
        if (returnToLevelSelectButton) returnToLevelSelectButton.style.display = "none"; // Toujours caché sur desktop en pause
        // S'assurer que les pop-ups de fin de niveau/jeu sont cachés
        if (gameOverPopup) gameOverPopup.style.display = "none"; 
        if (levelCompletePopup) levelCompletePopup.style.display = "none";
        if (gameCompletePopup) gameCompletePopup.style.display = "none";
    } else if (gameOver) {
        // Si Game Over, afficher le pop-up pour TOUS les appareils
        showGameOverPopup(); 
        // Cacher tous les autres contrôles
        if (returnToLevelSelectButton) returnToLevelSelectButton.style.display = "none";
        if (touchControlsContainer) touchControlsContainer.style.display = "none";
        if (mobileControlsDiv) mobileControlsDiv.style.display = "none";
        // S'assurer que les pop-ups de fin de niveau/jeu sont cachés
        if (levelCompletePopup) levelCompletePopup.style.display = "none";
        if (gameCompletePopup) gameCompletePopup.style.display = "none";
    } else if (gameWon) {
        // Ici, nous allons gérer les différents pop-ups de victoire
        starsCollected++; // Incrémente le nombre d'étoiles/niveaux terminés
        cancelAnimationFrame(animationFrameId); // Arrête la boucle de jeu

        if (currentLevelIndex < maxLevels - 1) { // Si ce n'est pas le dernier niveau
            showLevelCompletePopup();
        } else { // Si c'est le dernier niveau
            showGameCompletePopup();
        }
        
        // Cacher tous les contrôles quand le jeu est terminé (victoire)
        if (returnToLevelSelectButton) returnToLevelSelectButton.style.display = "none";
        if (touchControlsContainer) touchControlsContainer.style.display = "none";
        if (mobileControlsDiv) mobileControlsDiv.style.display = "none";
        if (gameOverPopup) gameOverPopup.style.display = "none"; // S'assurer que le pop-up est caché
        // Les pop-ups de victoire sont déjà affichés par la logique ci-dessus.
    } else if (gameStarted) {
        // Afficher les contrôles appropriés si le jeu est actif
        if (isMobile) {
            if (returnToLevelSelectButton) returnToLevelSelectButton.style.display = "none";
            if (touchControlsContainer) touchControlsContainer.style.display = "flex";
            if (mobileControlsDiv) mobileControlsDiv.style.display = "flex";
        } else {
            if (returnToLevelSelectButton) returnToLevelSelectButton.style.display = "block";
            if (touchControlsContainer) touchControlsContainer.style.display = "none";
            if (mobileControlsDiv) mobileControlsDiv.style.display = "none";
        }
        // S'assurer que les pop-ups sont cachés pendant le jeu normal
        if (gameOverPopup) gameOverPopup.style.display = "none"; 
        if (levelCompletePopup) levelCompletePopup.style.display = "none";
        if (gameCompletePopup) gameCompletePopup.style.display = "none";
    }
}

function drawGameOverScreen() {
    ctx.font = `bold ${Math.floor(3 * 16 * scaleX)}px 'Press Start 2P', cursive`;
    ctx.fillStyle = "#FF4500";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvasDom.width / 2, (ORIGINAL_CANVAS_HEIGHT / 2 - 20) * scaleY);
    
    // Afficher le message "Appuyez sur ESPACE..." uniquement sur desktop
    if (!isMobile) {
        ctx.font = `${Math.floor(1.2 * 16 * scaleX)}px 'Press Start 2P', cursive`;
        ctx.fillStyle = "#FFF";
        ctx.fillText("Appuyez sur ESPACE pour rejouer", canvasDom.width / 2, (ORIGINAL_CANVAS_HEIGHT / 2 + 20) * scaleY);
    }
    ctx.textAlign = "start";
}

function drawGameWonScreen() {
    // Cette fonction est désormais obsolète pour les niveaux terminés, remplacée par les pop-ups
    // Cependant, si vous avez besoin d'un écran de victoire sans pop-up sur desktop, elle peut rester.
    ctx.font = `bold ${Math.floor(3 * 16 * scaleX)}px 'Press Start 2P', cursive`;
    ctx.fillStyle = "#32CD32";
    ctx.textAlign = "center";
    ctx.fillText("VOUS AVEZ GAGNÉ !", canvasDom.width / 2, (ORIGINAL_CANVAS_HEIGHT / 2 - 20) * scaleY);
    
    if (!isMobile) {
        ctx.font = `${Math.floor(1.2 * 16 * scaleX)}px 'Press Start 2P', cursive`;
        ctx.fillStyle = "#FFF";
        ctx.fillText("Appuyez sur ESPACE pour rejouer", canvasDom.width / 2, (ORIGINAL_CANVAS_HEIGHT / 2 + 20) * scaleY);
    }
    ctx.textAlign = "start";
}

function drawPauseScreen() {
    ctx.font = `bold ${Math.floor(3 * 16 * scaleX)}px 'Press Start 2P', cursive`;
    ctx.fillStyle = "#FFFF00";
    ctx.textAlign = "center";
    ctx.fillText("PAUSE", canvasDom.width / 2, (ORIGINAL_CANVAS_HEIGHT / 2 - 20) * scaleY);
    
    // Afficher le message "Appuyez sur ESPACE..." uniquement sur desktop
    if (!isMobile) {
        ctx.font = `${Math.floor(1.2 * 16 * scaleX)}px 'Press Start 2P', cursive`;
        ctx.fillStyle = "#FFF";
        ctx.fillText("Appuyez sur ESPACE pour continuer", canvasDom.width / 2, (ORIGINAL_CANVAS_HEIGHT / 2 + 20) * scaleY);
    }
    ctx.textAlign = "start";
}

function detectCollisions() {
    if (!gameStarted || gamePaused || gameOver || gameWon) return;

    // Mise à l'échelle des limites de collision avec le canvas
    const canvasWidthScaled = canvasDom.width;
    const canvasHeightScaled = canvasDom.height;

    if (ball.x + ball.dx > canvasWidthScaled - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    }
    // Condition Game Over: la balle doit dépasser le bas du canvas
    else if (ball.y + ball.radius > canvasHeightScaled) { 
        gameOver = true;
        cancelAnimationFrame(animationFrameId);
        drawAll(); // Redessine pour afficher l'écran Game Over ou le pop-up
    }
    // Collision avec la raquette
    else if (ball.y + ball.radius > paddle.y && ball.y - ball.radius < paddle.y + paddle.height) {
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.y = paddle.y - ball.radius;
            ball.dy = -ball.dy;

            let hitPoint = ball.x - (paddle.x + paddle.width / 2);
            ball.dx = hitPoint * 0.2 * scaleX;
            ball.dx = Math.max(-6 * scaleX, Math.min(6 * scaleX, ball.dx));
        }
    }

    for (let c = 0; c < brickInfo.columnCount; c++) {
        for (let r = 0; r < brickInfo.rowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                let brickLeft = b.x;
                let brickRight = b.x + brickInfo.width;
                let brickTop = b.y;
                let brickBottom = b.y + brickInfo.height;

                if (ball.x + ball.radius > brickLeft && ball.x - ball.radius < brickRight &&
                    ball.y + ball.radius > brickTop && ball.y - ball.radius < brickBottom) {

                    b.hitsLeft--;
                    
                    if (b.hitsLeft <= 0) {
                        b.status = 0;
                    }

                    let prevBallX = ball.x - ball.dx;
                    let prevBallY = ball.y - ball.dy;

                    if (prevBallY + ball.radius <= brickTop || prevBallY - ball.radius >= brickBottom) {
                        ball.dy = -ball.dy;
                    }
                    else {
                        ball.dx = -ball.dx;
                    }

                    let remainingBricks = 0;
                    for (let col = 0; col < brickInfo.columnCount; col++) {
                        for (let row = 0; row < brickInfo.rowCount; row++) {
                            if (bricks[col][row].status === 1) {
                                remainingBricks++;
                            }
                        }
                    }

                    if (remainingBricks === 0) {
                        gameWon = true;
                    }
                }
            }
        }
    }
}

function updateGameLogic() {
    if (gameOver || gameWon || gamePaused || !gameStarted) return;

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (rightPressed && paddle.x < canvasDom.width - paddle.width) {
        paddle.x += paddle.speed;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= paddle.speed;
    }

    detectCollisions();
}

function gameLoop() {
    updateGameLogic();
    drawAll();

    if (!gameOver && !gameWon && !gamePaused && gameStarted) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

function startGameLoop() {
    if (!gameOver && !gameWon && !gamePaused && gameStarted) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

function createTouchControls() {
    touchControlsContainer = document.createElement('div');
    touchControlsContainer.classList.add('touch-controls');
    document.getElementById('gameScreen').appendChild(touchControlsContainer);

    leftTouchArea = document.createElement('div');
    leftTouchArea.classList.add('touch-area', 'left');
    touchControlsContainer.appendChild(leftTouchArea);

    rightTouchArea = document.createElement('div');
    rightTouchArea.classList.add('touch-area', 'right');
    touchControlsContainer.appendChild(rightTouchArea);

    leftTouchArea.addEventListener('touchstart', (e) => {
        e.preventDefault();
        leftPressed = true;
    });
    leftTouchArea.addEventListener('touchend', (e) => {
        e.preventDefault();
        leftPressed = false;
    });
    leftTouchArea.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        leftPressed = false;
    });

    rightTouchArea.addEventListener('touchstart', (e) => {
        e.preventDefault();
        rightPressed = true;
    });
    rightTouchArea.addEventListener('touchend', (e) => {
        e.preventDefault();
        rightPressed = false;
    });
    rightTouchArea.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        rightPressed = false;
    });
}
