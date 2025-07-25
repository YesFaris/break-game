'use strict';

// --- Dimensions du jeu de base (référence pour l'échelle) ---
// Ces constantes représentent les dimensions du jeu pour lesquelles le design initial a été fait.
const ORIGINAL_CANVAS_WIDTH = 700;
const ORIGINAL_CANVAS_HEIGHT = 850; // J'ai ajusté la hauteur ici pour correspondre à votre gameWrapper

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
            offsetTop: 40, // Gardez offsetTop car il ne dépend pas du centrage horizontal
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

// --- Références aux éléments DOM ---
let splashScreen;
let levelSelectScreen;
let gameScreen;
let startButton;
let levelButtonsContainer;
let backToSplashButton;
let returnToLevelSelectButton;
let touchControlsContainer; // Conteneur pour les contrôles tactiles
let leftTouchArea;
let rightTouchArea;

document.addEventListener('DOMContentLoaded', function () {
    // Récupérer les éléments DOM
    splashScreen = document.getElementById("splashScreen");
    levelSelectScreen = document.getElementById("levelSelectScreen");
    gameScreen = document.getElementById("gameScreen");
    canvasDom = document.getElementById("canvas");
    ctx = canvasDom.getContext('2d');
    startButton = document.getElementById("startButton");
    levelButtonsContainer = document.getElementById("levelButtonsContainer");
    backToSplashButton = document.getElementById("backToSplashButton");
    returnToLevelSelectButton = document.getElementById("returnToLevelSelectButton");

    // Créer les contrôles tactiles
    createTouchControls();

    // Attacher les écouteurs d'événements
    startButton.addEventListener('click', showLevelSelectScreen);
    backToSplashButton.addEventListener('click', showSplashScreen);
    returnToLevelSelectButton.addEventListener('click', showLevelSelectScreen);

    // Gérer le redimensionnement de la fenêtre
    window.addEventListener('resize', resizeGame);

    // Générer les boutons de niveau
    generateLevelButtons();

    // Redimensionner le jeu au chargement initial
    resizeGame();
    // Afficher l'écran de démarrage par défaut
    showScreen(splashScreen);
});

// État des touches et contrôles tactiles
let rightPressed = false;
let leftPressed = false;
let touchStartX = 0; // Pour le glissement tactile

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
            initGame();
            startGameLoop();
        }
        else {
            gamePaused = !gamePaused;
            if (!gamePaused) {
                startGameLoop();
            } else {
                cancelAnimationFrame(animationFrameId);
                drawAll();
            }
        }
    }
}

// --- Fonctions de gestion des écrans ---
function showScreen(screenToShow) {
    splashScreen.style.display = "none";
    levelSelectScreen.style.display = "none";
    gameScreen.style.display = "none";
    returnToLevelSelectButton.style.display = "none";
    if (touchControlsContainer) touchControlsContainer.style.display = "none"; // Cacher les contrôles tactiles par défaut

    screenToShow.style.display = "flex";

    if (screenToShow === gameScreen) {
        gameStarted = true;
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
        document.addEventListener("keydown", handleSpacePress);
        if (!gameOver && !gameWon && !gamePaused) {
            returnToLevelSelectButton.style.display = "block";
        }
        if (touchControlsContainer) touchControlsContainer.style.display = "flex"; // Afficher les contrôles tactiles en jeu
    } else {
        gameStarted = false;
        cancelAnimationFrame(animationFrameId);
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
        document.removeEventListener("keydown", handleSpacePress);
        // Réinitialiser les états des touches / touch
        rightPressed = false;
        leftPressed = false;
    }
}

function showSplashScreen() {
    showScreen(splashScreen);
}

function showLevelSelectScreen() {
    showScreen(levelSelectScreen);
}

function startGame(levelId) {
    currentLevel = gameLevels.find(level => level.id === levelId);
    if (!currentLevel) {
        console.error("Niveau introuvable :", levelId);
        return;
    }

    // Copiez les propriétés du niveau, elles seront ensuite mises à l'échelle dans initGame
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
    // Calcul de l'échelle à partir des dimensions actuelles du canvas
    scaleX = canvasDom.width / ORIGINAL_CANVAS_WIDTH;
    scaleY = canvasDom.height / ORIGINAL_CANVAS_HEIGHT;

    // IMPORTANT : Mettre à l'échelle toutes les propriétés du jeu ici
    // Utiliser ORIGINAL_CANVAS_WIDTH / ORIGINAL_CANVAS_HEIGHT pour le positionnement initial
    // et les propriétés `dx`, `dy`, `radius`, `width`, `height`, `speed`, `offsetTop`, etc.

    ball.x = (ORIGINAL_CANVAS_WIDTH / 2) * scaleX;
    ball.y = (ORIGINAL_CANVAS_HEIGHT - 30) * scaleY;
    
    // Les vitesses dx et dy doivent aussi être mises à l'échelle
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * currentLevel.ball.dx * scaleX;
    ball.dy = -Math.abs(currentLevel.ball.dy) * scaleY;
    ball.radius = currentLevel.ball.radius * scaleX; // Le rayon de la balle est aussi mis à l'échelle

    paddle.width = currentLevel.paddle.width * scaleX;
    paddle.height = currentLevel.paddle.height * scaleY;
    paddle.speed = currentLevel.paddle.speed * scaleX; // La vitesse de la raquette est aussi mise à l'échelle
    paddle.x = (ORIGINAL_CANVAS_WIDTH / 2 - paddle.width / 2) * scaleX; // Position x initiale centrée
    paddle.y = (ORIGINAL_CANVAS_HEIGHT - paddle.height - 20) * scaleY;
    paddle.borderRadius = currentLevel.paddle.borderRadius * scaleX;

    brickInfo.width = currentLevel.brick.width * scaleX;
    brickInfo.height = currentLevel.brick.height * scaleY;
    brickInfo.padding = currentLevel.brick.padding * scaleX;
    brickInfo.offsetTop = currentLevel.brick.offsetTop * scaleY; // Top offset est aussi mis à l'échelle

    gameOver = false;
    gameWon = false;
    gamePaused = false;

    // Calcul pour centrer les briques, maintenant basé sur les dimensions d'origine avant mise à l'échelle
    const originalTotalBricksWidth = currentLevel.brick.columnCount * currentLevel.brick.width +
                                     (currentLevel.brick.columnCount - 1) * currentLevel.brick.padding;
    brickInfo.offsetLeft = ((ORIGINAL_CANVAS_WIDTH - originalTotalBricksWidth) / 2) * scaleX;

    bricks = [];
    for (let c = 0; c < brickInfo.columnCount; c++) { // columnCount et rowCount ne sont pas mis à l'échelle
        bricks[c] = [];
        for (let r = 0; r < brickInfo.rowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1, hitsLeft: brickInfo.hitsToBreak };
        }
    }
    if (gameStarted) {
        returnToLevelSelectButton.style.display = "block";
    }
    // Assurez-vous que le contexte de dessin est mis à jour pour les nouvelles dimensions du canvas
    ctx.font = `${20 * scaleX}px 'Press Start 2P', cursive`; // Mettre à l'échelle la taille de police pour le score
}

// Fonction pour redimensionner le canvas et recalculer les échelles
function resizeGame() {
    const gameWrapper = document.getElementById('gameWrapper');
    
    // Définir les dimensions réelles du canvas en fonction de son conteneur
    canvasDom.width = gameWrapper.clientWidth;
    canvasDom.height = gameWrapper.clientHeight;

    // Recalculer les facteurs de mise à l'échelle
    scaleX = canvasDom.width / ORIGINAL_CANVAS_WIDTH;
    scaleY = canvasDom.height / ORIGINAL_CANVAS_HEIGHT;

    // Si un niveau est en cours ou a été sélectionné, réinitialiser le jeu avec la nouvelle échelle
    if (currentLevel) {
        initGame(); // initGame va recalculer toutes les positions et tailles avec la nouvelle échelle
    }
    // Redessiner tout pour que les changements soient visibles immédiatement
    drawAll();
}

// --- Fonctions de dessin ---
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
    ctx.shadowBlur = 10 * scaleX; // Mettre à l'échelle le flou d'ombre
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
    ctx.shadowBlur = 15 * scaleX; // Mettre à l'échelle le flou d'ombre
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawBricks() {
    for (let c = 0; c < brickInfo.columnCount; c++) {
        for (let r = 0; r < brickInfo.rowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                // Utilisez brickInfo.offsetLeft qui est mis à l'échelle dans initGame
                // Les propriétés width, height, padding, offsetTop sont déjà mises à l'échelle dans initGame
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
                ctx.fillRect(brickX, brickY, brickInfo.width, 2 * scaleY); // Épaisseur de la surbrillance mise à l'échelle

                ctx.fillStyle = brickInfo.sideShadow;
                ctx.fillRect(brickX + brickInfo.width - (2 * scaleX), brickY, 2 * scaleX, brickInfo.height); // Épaisseur de l'ombre latérale mise à l'échelle

                ctx.fillStyle = brickInfo.bottomShadow;
                ctx.fillRect(brickX, brickY + brickInfo.height - (2 * scaleY), brickInfo.width, 2 * scaleY); // Épaisseur de l'ombre du bas mise à l'échelle
                
                ctx.strokeStyle = "rgba(0,0,0,0.5)";
                ctx.lineWidth = 1 * scaleX; // Largeur de ligne mise à l'échelle
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
    // Mettre à l'échelle la taille de la police pour le score
    ctx.font = `${Math.floor(20 * scaleX)}px 'Press Start 2P', cursive`; 
    ctx.fillStyle = "#FFF";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 20 * scaleX, 30 * scaleY); // Positions mises à l'échelle
    ctx.fillText("Niveau: " + (currentLevel ? currentLevel.id : 'N/A'), (ORIGINAL_CANVAS_WIDTH - 150) * scaleX, 30 * scaleY);
    ctx.textAlign = "start"; // Réinitialiser le textAlign
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
    
    // La visibilité du bouton de retour est gérée ici.
    if (gamePaused) {
        drawPauseScreen();
        returnToLevelSelectButton.style.display = "none";
        if (touchControlsContainer) touchControlsContainer.style.display = "none";
    } else if (gameOver) {
        drawGameOverScreen();
        returnToLevelSelectButton.style.display = "none";
        if (touchControlsContainer) touchControlsContainer.style.display = "none";
    } else if (gameWon) {
        drawGameWonScreen();
        returnToLevelSelectButton.style.display = "none";
        if (touchControlsContainer) touchControlsContainer.style.display = "none";
    } else if (gameStarted) {
        returnToLevelSelectButton.style.display = "block";
        if (touchControlsContainer) touchControlsContainer.style.display = "flex"; // S'assurer qu'ils sont visibles en jeu
    }
}

function drawGameOverScreen() {
    ctx.font = `bold ${Math.floor(3 * 16 * scaleX)}px 'Press Start 2P', cursive`; // 3rem -> 3 * 16px par défaut
    ctx.fillStyle = "#FF4500";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvasDom.width / 2, (ORIGINAL_CANVAS_HEIGHT / 2 - 20) * scaleY);
    ctx.font = `${Math.floor(1.2 * 16 * scaleX)}px 'Press Start 2P', cursive`; // 1.2rem
    ctx.fillStyle = "#FFF";
    ctx.fillText("Appuyez sur ESPACE pour rejouer", canvasDom.width / 2, (ORIGINAL_CANVAS_HEIGHT / 2 + 20) * scaleY);
    ctx.textAlign = "start";
}

function drawGameWonScreen() {
    ctx.font = `bold ${Math.floor(3 * 16 * scaleX)}px 'Press Start 2P', cursive`;
    ctx.fillStyle = "#32CD32";
    ctx.textAlign = "center";
    ctx.fillText("VOUS AVEZ GAGNÉ !", canvasDom.width / 2, (ORIGINAL_CANVAS_HEIGHT / 2 - 20) * scaleY);
    ctx.font = `${Math.floor(1.2 * 16 * scaleX)}px 'Press Start 2P', cursive`;
    ctx.fillStyle = "#FFF";
    ctx.fillText("Appuyez sur ESPACE pour rejouer", canvasDom.width / 2, (ORIGINAL_CANVAS_HEIGHT / 2 + 20) * scaleY);
    ctx.textAlign = "start";
}

function drawPauseScreen() {
    ctx.font = `bold ${Math.floor(3 * 16 * scaleX)}px 'Press Start 2P', cursive`;
    ctx.fillStyle = "#FFFF00";
    ctx.textAlign = "center";
    ctx.fillText("PAUSE", canvasDom.width / 2, (ORIGINAL_CANVAS_HEIGHT / 2 - 20) * scaleY);
    ctx.font = `${Math.floor(1.2 * 16 * scaleX)}px 'Press Start 2P', cursive`;
    ctx.fillStyle = "#FFF";
    ctx.fillText("Appuyez sur ESPACE pour continuer", canvasDom.width / 2, (ORIGINAL_CANVAS_HEIGHT / 2 + 20) * scaleY);
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
    else if (ball.y + ball.radius > paddle.y) {
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.y = paddle.y - ball.radius;
            ball.dy = -ball.dy;

            let hitPoint = ball.x - (paddle.x + paddle.width / 2);
            // La logique de rebond doit aussi être mise à l'échelle
            ball.dx = hitPoint * 0.2 * scaleX; // Ajuster le facteur 0.2 avec scaleX
            ball.dx = Math.max(-6 * scaleX, Math.min(6 * scaleX, ball.dx)); // Les limites aussi sont mises à l'échelle
        } else {
            gameOver = true;
            cancelAnimationFrame(animationFrameId);
            drawAll();
            returnToLevelSelectButton.style.display = "none";
            if (touchControlsContainer) touchControlsContainer.style.display = "none";
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
                        cancelAnimationFrame(animationFrameId);
                        drawAll();
                        returnToLevelSelectButton.style.display = "none";
                        if (touchControlsContainer) touchControlsContainer.style.display = "none";
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

    // Mise à l'échelle de la vitesse de la raquette
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

// --- Fonctions pour les contrôles tactiles ---
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

    // Écouteurs d'événements tactiles pour déplacer la raquette
    leftTouchArea.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Empêche le défilement et le zoom
        leftPressed = true;
    });
    leftTouchArea.addEventListener('touchend', (e) => {
        e.preventDefault();
        leftPressed = false;
    });
    leftTouchArea.addEventListener('touchcancel', (e) => { // Gérer l'annulation du toucher
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

    // Optionnel: Gérer la pause avec un appui sur le canvas (peut être sensible)
    canvasDom.addEventListener('click', (e) => {
        // Seulement si le jeu est actif et non en game over/won
        if (gameStarted && !gameOver && !gameWon && !gamePaused) {
            // Empêche la pause si le clic est sur le bouton "Retour Niveaux"
            const rect = returnToLevelSelectButton.getBoundingClientRect();
            if (e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom) {
                return; // Clic sur le bouton de retour, ne pas mettre en pause
            }
            // Mettre en pause si l'on tape ailleurs sur le canvas
            gamePaused = true;
            cancelAnimationFrame(animationFrameId);
            drawAll();
        } else if (gameOver || gameWon) {
             // Si game over/won, un tap n'importe où redémarre le jeu (alternative à Espace)
            initGame();
            startGameLoop();
        }
    });

    // Ajout d'une gestion de la pause/reprise via un tap sur le canvas
    // Si gamePaused, un tap sur le canvas reprend le jeu
    canvasDom.addEventListener('click', (e) => {
        if (gamePaused) {
            gamePaused = false;
            startGameLoop();
        }
    });
}