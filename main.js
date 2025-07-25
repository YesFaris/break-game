'use strict';

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
            offsetLeft: 30,
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
            offsetLeft: 25,
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
            offsetLeft: 20,
            colors: ["#DC143C", "#FF4500", "#FF8C00", "#FFD700", "#ADFF2F", "#00FF7F", "#4169E1"],
            hitsToBreak: 2, // Les briques nécessitent 2 coups !
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

// --- Références aux éléments DOM ---
let splashScreen;
let levelSelectScreen;
let gameScreen;
let startButton;
let levelButtonsContainer;
let backToSplashButton;
let returnToLevelSelectButton; // Nouveau bouton

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
    returnToLevelSelectButton = document.getElementById("returnToLevelSelectButton"); // Récupérer le nouveau bouton

    // Attacher les écouteurs d'événements
    startButton.addEventListener('click', showLevelSelectScreen);
    backToSplashButton.addEventListener('click', showSplashScreen);
    returnToLevelSelectButton.addEventListener('click', showLevelSelectScreen); // Écouteur pour le nouveau bouton

    // Générer les boutons de niveau
    generateLevelButtons();

    // Afficher l'écran de démarrage par défaut
    showScreen(splashScreen);
});

// État des touches
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
        e.preventDefault(); // Empêche le défilement de la page avec la barre d'espace

        // Si le jeu n'a pas encore commencé (sur un écran de menu), la barre d'espace ne fait rien
        if (!gameStarted && !(gameOver || gameWon)) {
            return;
        }

        // Cas 1 : Le jeu est en état Game Over ou Game Won
        if (gameOver || gameWon) {
            initGame(); // Réinitialise le jeu (même niveau, mais nouvelle partie)
            startGameLoop(); // Relance la boucle de jeu
        }
        // Cas 2 : Le jeu est en cours (ou en pause)
        else {
            gamePaused = !gamePaused; // Inverse l'état de pause
            if (!gamePaused) {
                startGameLoop(); // Reprend le jeu
            } else {
                cancelAnimationFrame(animationFrameId); // Met le jeu en pause
                drawAll(); // S'assure que l'écran de pause est dessiné immédiatement
            }
        }
    }
}


// --- Fonctions de gestion des écrans ---
function showScreen(screenToShow) {
    // Cache tous les écrans
    splashScreen.style.display = "none";
    levelSelectScreen.style.display = "none";
    gameScreen.style.display = "none";
    returnToLevelSelectButton.style.display = "none"; // Cache toujours le bouton retour au début

    // Affiche l'écran désiré
    screenToShow.style.display = "flex";

    // Gère l'état 'gameStarted' et les écouteurs de clavier
    if (screenToShow === gameScreen) {
        gameStarted = true;
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
        document.addEventListener("keydown", handleSpacePress);
        // Afficher le bouton de retour seulement quand on est sur l'écran de jeu actif
        if (!gameOver && !gameWon && !gamePaused) { // Pas affiché si game over, won, ou pause
            returnToLevelSelectButton.style.display = "block";
        }
    } else {
        gameStarted = false;
        cancelAnimationFrame(animationFrameId); // Arrêter l'animation du jeu si elle tournait
        // Détacher les écouteurs de jeu pour éviter les interactions inattendues
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
        document.removeEventListener("keydown", handleSpacePress);
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

    // Appliquer les propriétés du niveau sélectionné
    Object.assign(ball, currentLevel.ball);
    Object.assign(paddle, currentLevel.paddle);
    Object.assign(brickInfo, currentLevel.brick);

    showScreen(gameScreen); // Cela va aussi définir gameStarted à true et attacher les écouteurs
    initGame(); // Initialise le jeu avec les propriétés du niveau
    startGameLoop();
}

function generateLevelButtons() {
    levelButtonsContainer.innerHTML = ''; // Nettoie les anciens boutons
    gameLevels.forEach(level => {
        const button = document.createElement('button');
        button.classList.add('level-button');
        button.textContent = level.name;
        button.addEventListener('click', () => startGame(level.id));
        levelButtonsContainer.appendChild(button);
    });
}

function initGame() {
    ball.x = canvasDom.width / 2;
    ball.y = canvasDom.height - 30;
    
    // Réinitialise la direction de la balle pour un nouveau départ à chaque partie
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * currentLevel.ball.dx; // Direction X aléatoire
    ball.dy = -Math.abs(currentLevel.ball.dy); // Toujours vers le haut au début

    paddle.x = (canvasDom.width - paddle.width) / 2;
    paddle.y = canvasDom.height - paddle.height - 20;

    gameOver = false;
    gameWon = false;
    gamePaused = false;

    // Initialisation des briques avec leur état de vie (hitsLeft)
    bricks = [];
    for (let c = 0; c < brickInfo.columnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickInfo.rowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1, hitsLeft: brickInfo.hitsToBreak };
        }
    }
    // S'assurer que le bouton retour est visible au début d'une partie
    if (gameStarted) { // Vérifie qu'on est bien en jeu
        returnToLevelSelectButton.style.display = "block";
    }
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
    ctx.shadowBlur = 10;
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
    ctx.shadowBlur = 15;
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
                // Assombrir la brique si elle a été touchée mais n'est pas détruite
                if (b.hitsLeft < brickInfo.hitsToBreak) {
                    const originalColor = currentBrickColor;
                    const colorValue = parseInt(originalColor.substring(1), 16);
                    // Diminuer la luminosité pour donner un aspect "endommagé"
                    const darkerColorValue = Math.max(0, colorValue - 0x202020); // Diminue de 0x20 pour chaque composante RGB
                    currentBrickColor = '#' + darkerColorValue.toString(16).padStart(6, '0');
                }


                ctx.beginPath();
                ctx.rect(brickX, brickY, brickInfo.width, brickInfo.height);
                ctx.fillStyle = currentBrickColor;
                ctx.fill();
                ctx.closePath();

                ctx.fillStyle = brickInfo.topHighlight;
                ctx.fillRect(brickX, brickY, brickInfo.width, 2);

                ctx.fillStyle = brickInfo.sideShadow;
                ctx.fillRect(brickX + brickInfo.width - 2, brickY, 2, brickInfo.height);

                ctx.fillStyle = brickInfo.bottomShadow;
                ctx.fillRect(brickX, brickY + brickInfo.height - 2, brickInfo.width, 2);
                
                ctx.strokeStyle = "rgba(0,0,0,0.5)";
                ctx.lineWidth = 1;
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
    ctx.font = "20px 'Press Start 2P', cursive";
    ctx.fillStyle = "#FFF";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 20, 30);
    ctx.fillText("Niveau: " + currentLevel.id, canvasDom.width - 150, 30);
    return score;
}

function drawAll() {
    ctx.clearRect(0, 0, canvasDom.width, canvasDom.height);

    // Le fond du canvas dépend du niveau sélectionné et si le jeu est actif ou terminé
    if (currentLevel && (gameStarted || gameOver || gameWon)) {
        let gradient = ctx.createLinearGradient(0, 0, 0, canvasDom.height);
        gradient.addColorStop(0, currentLevel.background.gradientStart);
        gradient.addColorStop(1, currentLevel.background.gradientEnd);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasDom.width, canvasDom.height);
    } else {
        // Fond neutre pour les menus si aucun niveau n'est chargé ou jeu non démarré
        ctx.fillStyle = "#222";
        ctx.fillRect(0, 0, canvasDom.width, canvasDom.height);
    }

    // Dessine les éléments du jeu si le jeu est en cours OU s'il vient de se terminer (pour afficher la dernière image)
    if (gameStarted || gameOver || gameWon) {
        drawBricks();
        drawBall();
        drawPaddle();
        drawScore();
    }
    
    // Affichage des écrans d'état (pause, game over, game won)
    // Ces écrans sont dessinés par-dessus les éléments du jeu si leurs conditions sont remplies
    if (gamePaused) {
        drawPauseScreen();
        returnToLevelSelectButton.style.display = "none"; // Cache le bouton retour pendant la pause
    } else if (gameOver) {
        drawGameOverScreen();
        returnToLevelSelectButton.style.display = "none"; // Cache le bouton retour à game over
    } else if (gameWon) {
        drawGameWonScreen();
        returnToLevelSelectButton.style.display = "none"; // Cache le bouton retour à game won
    } else if (gameStarted) { // Si le jeu est actif, on affiche le bouton retour
        returnToLevelSelectButton.style.display = "block";
    }
}

function drawGameOverScreen() {
    ctx.font = "bold 3rem 'Press Start 2P', cursive";
    ctx.fillStyle = "#FF4500";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvasDom.width / 2, canvasDom.height / 2 - 20);
    ctx.font = "1.2rem 'Press Start 2P', cursive";
    ctx.fillStyle = "#FFF";
    ctx.fillText("Appuyez sur ESPACE pour rejouer", canvasDom.width / 2, canvasDom.height / 2 + 20);
    ctx.textAlign = "start"; // Réinitialiser pour éviter d'affecter d'autres dessins
}

function drawGameWonScreen() {
    ctx.font = "bold 3rem 'Press Start 2P', cursive";
    ctx.fillStyle = "#32CD32";
    ctx.textAlign = "center";
    ctx.fillText("VOUS AVEZ GAGNÉ !", canvasDom.width / 2, canvasDom.height / 2 - 20);
    ctx.font = "1.2rem 'Press Start 2P', cursive";
    ctx.fillStyle = "#FFF";
    ctx.fillText("Appuyez sur ESPACE pour rejouer", canvasDom.width / 2, canvasDom.height / 2 + 20);
    ctx.textAlign = "start"; // Réinitialiser
}

function drawPauseScreen() {
    ctx.font = "bold 3rem 'Press Start 2P', cursive";
    ctx.fillStyle = "#FFFF00";
    ctx.textAlign = "center";
    ctx.fillText("PAUSE", canvasDom.width / 2, canvasDom.height / 2 - 20);
    ctx.font = "1.2rem 'Press Start 2P', cursive";
    ctx.fillStyle = "#FFF";
    ctx.fillText("Appuyez sur ESPACE pour continuer", canvasDom.width / 2, canvasDom.height / 2 + 20);
    ctx.textAlign = "start"; // Réinitialiser
}

function detectCollisions() {
    if (!gameStarted || gamePaused || gameOver || gameWon) return;

    if (ball.x + ball.dx > canvasDom.width - ball.radius || ball.x + ball.dx < ball.radius) {
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
            ball.dx = hitPoint * 0.2;
            ball.dx = Math.max(-6, Math.min(6, ball.dx));
        } else {
            gameOver = true;
            cancelAnimationFrame(animationFrameId);
            drawAll(); // Appelle drawAll pour afficher l'écran Game Over immédiatement
            returnToLevelSelectButton.style.display = "none"; // S'assurer qu'il est caché
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
                        drawAll(); // Appelle drawAll pour afficher l'écran Game Won immédiatement
                        returnToLevelSelectButton.style.display = "none"; // S'assurer qu'il est caché
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
    // Cette fonction est appelée pour démarrer la boucle d'animation.
    // Elle ne doit démarrer que si le jeu n'est pas déjà en cours de fin/pause.
    if (!gameOver && !gameWon && !gamePaused && gameStarted) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}