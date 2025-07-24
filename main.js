'use strict';

// Propriétés de la balle
let ball = {
    color: "#FFD700", // Or vif pour la balle
    radius: 8, // Rayon légèrement plus petit
    x: 0,
    y: 0,
    dx: 3, // Vitesse et direction en X
    dy: -3, // Vitesse et direction en Y (commence par monter)
};

// Propriétés de la raquette
let paddle = {
    height: 12, // Hauteur légèrement augmentée
    width: 90, // Largeur légèrement augmentée
    x: 0,
    y: 0,
    speed: 7, // Vitesse de déplacement de la raquette légèrement augmentée
    borderRadius: 8, // Rayon de bordure pour arrondir la raquette
};

// Propriétés des briques
let brickInfo = {
    rowCount: 5, // Augmenté le nombre de rangées
    columnCount: 7, // Augmenté le nombre de colonnes
    width: 60, // Largeur des briques
    height: 20,
    padding: 10, // Espace entre les briques
    offsetTop: 40, // Offset du haut du canvas (plus d'espace en haut)
    offsetLeft: 30, // Offset de gauche du canvas
    colors: ["#FF6347", "#FF8C00", "#FFD700", "#ADFF2F", "#6A5ACD"] // Couleurs pour les rangées de briques
};

let bricks = []; // Tableau pour stocker l'état de chaque brique (existante ou non)

// Variables globales pour le Canvas et le Contexte
let canvasDom;
let ctx;

let gameOver = false;
let gameWon = false;
let gamePaused = false;
let gameStarted = false; // Nouvelle variable pour suivre l'état de démarrage du jeu
let animationFrameId; // Stocke l'ID de requestAnimationFrame pour le contrôle de la pause/arrêt

document.addEventListener('DOMContentLoaded', function () {
    canvasDom = document.getElementById("canvas");
    ctx = canvasDom.getContext('2d');

    // Récupérer le bouton Play
    const playButton = document.getElementById("playButton");
    playButton.addEventListener('click', startGame);

    // Dessine l'écran de démarrage au début
    drawSplashScreen();
});

// État des touches (pour un mouvement plus fluide de la raquette)
let rightPressed = false;
let leftPressed = false;

function handleKeyDown(e) {
    if (gameStarted && !gamePaused && !gameOver && !gameWon) { // N'écoute les touches que si le jeu est en cours
        if (e.key === "ArrowRight") {
            rightPressed = true;
        } else if (e.key === "ArrowLeft") {
            leftPressed = true;
        }
    }
}

function handleKeyUp(e) {
    if (gameStarted && !gamePaused && !gameOver && !gameWon) { // N'écoute les touches que si le jeu est en cours
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
        if (!gameStarted) { // Si le jeu n'a pas encore commencé, Espace ne fait rien
            return;
        }
        if (gameOver || gameWon) {
            initGame();
            startGameLoop();
        } else {
            gamePaused = !gamePaused;
            if (!gamePaused) {
                startGameLoop();
            } else {
                cancelAnimationFrame(animationFrameId);
                drawPauseScreen();
            }
        }
    }
}

function startGame() {
    gameStarted = true;
    // Cacher le bouton Play et le texte de l'écran de démarrage
    document.getElementById("splashScreen").style.display = "none";
    
    // Initialisation du jeu
    initGame();
    // Lancer la boucle de jeu
    startGameLoop();

    // Attacher les écouteurs de clavier seulement après le démarrage du jeu
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("keydown", handleSpacePress);
}

function initGame() {
    ball.x = canvasDom.width / 2;
    ball.y = canvasDom.height - 30;
    ball.dx = 3;
    ball.dy = -3;
    paddle.x = (canvasDom.width - paddle.width) / 2;
    paddle.y = canvasDom.height - paddle.height - 20;

    gameOver = false;
    gameWon = false;
    gamePaused = false;

    bricks = [];
    for (let c = 0; c < brickInfo.columnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickInfo.rowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
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

    ctx.fillStyle = "#4682B4";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawBricks() {
    for (let c = 0; c < brickInfo.columnCount; c++) {
        for (let r = 0; r < brickInfo.rowCount; r++) {
            if (bricks[c][r].status === 1) {
                let brickX = (c * (brickInfo.width + brickInfo.padding)) + brickInfo.offsetLeft;
                let brickY = (r * (brickInfo.height + brickInfo.padding)) + brickInfo.offsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickInfo.width, brickInfo.height);
                ctx.fillStyle = brickInfo.colors[r % brickInfo.colors.length];
                ctx.strokeStyle = "#333";
                ctx.lineWidth = 1;
                ctx.fill();
                ctx.stroke();
                ctx.closePath();
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
    return score;
}

function drawAll() {
    ctx.clearRect(0, 0, canvasDom.width, canvasDom.height);

    let gradient = ctx.createLinearGradient(0, 0, 0, canvasDom.height);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(1, "#4682B4");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasDom.width, canvasDom.height);

    if (gameStarted) { // Ne dessine les éléments du jeu que si le jeu a commencé
        drawBricks();
        drawBall();
        drawPaddle();
        drawScore();
    }
    
    // Affichage des écrans d'état (pause, game over, game won)
    if (gamePaused) {
        drawPauseScreen();
    } else if (gameOver) {
        drawGameOverScreen();
    } else if (gameWon) {
        drawGameWonScreen();
    }
}

function drawSplashScreen() {
    ctx.clearRect(0, 0, canvasDom.width, canvasDom.height);

    // Fond du canvas avec un dégradé pour l'écran de démarrage
    let gradient = ctx.createLinearGradient(0, 0, 0, canvasDom.height);
    gradient.addColorStop(0, "#4CAF50"); // Vert
    gradient.addColorStop(1, "#2E8B57"); // Vert Mer
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasDom.width, canvasDom.height);

    ctx.font = "bold 4rem 'Press Start 2P', cursive";
    ctx.fillStyle = "#FFF";
    ctx.textAlign = "center";
    ctx.fillText("BREAKOUT", canvasDom.width / 2, canvasDom.height / 2 - 50);

    ctx.font = "1.5rem 'Press Start 2P', cursive";
    ctx.fillStyle = "#EEE";
    ctx.fillText("Le Jeu", canvasDom.width / 2, canvasDom.height / 2);

    ctx.textAlign = "start"; // Réinitialise l'alignement
}


function drawGameOverScreen() {
    ctx.font = "bold 3rem 'Press Start 2P', cursive";
    ctx.fillStyle = "#FF4500";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvasDom.width / 2, canvasDom.height / 2 - 20);
    ctx.font = "1.2rem 'Press Start 2P', cursive";
    ctx.fillStyle = "#FFF";
    ctx.fillText("Appuyez sur ESPACE pour rejouer", canvasDom.width / 2, canvasDom.height / 2 + 20);
    ctx.textAlign = "start";
}

function drawGameWonScreen() {
    ctx.font = "bold 3rem 'Press Start 2P', cursive";
    ctx.fillStyle = "#32CD32";
    ctx.textAlign = "center";
    ctx.fillText("VOUS AVEZ GAGNÉ !", canvasDom.width / 2, canvasDom.height / 2 - 20);
    ctx.font = "1.2rem 'Press Start 2P', cursive";
    ctx.fillStyle = "#FFF";
    ctx.fillText("Appuyez sur ESPACE pour rejouer", canvasDom.width / 2, canvasDom.height / 2 + 20);
    ctx.textAlign = "start";
}

function drawPauseScreen() {
    ctx.font = "bold 3rem 'Press Start 2P', cursive";
    ctx.fillStyle = "#FFFF00";
    ctx.textAlign = "center";
    ctx.fillText("PAUSE", canvasDom.width / 2, canvasDom.height / 2 - 20);
    ctx.font = "1.2rem 'Press Start 2P', cursive";
    ctx.fillStyle = "#FFF";
    ctx.fillText("Appuyez sur ESPACE pour continuer", canvasDom.width / 2, canvasDom.height / 2 + 20);
    ctx.textAlign = "start";
}

function detectCollisions() {
    if (!gameStarted || gamePaused || gameOver || gameWon) return; // Pas de collisions si le jeu n'est pas actif

    // Collision balle avec les murs
    if (ball.x + ball.dx > canvasDom.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    }
    else if (ball.y + ball.radius > paddle.y) {
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.y = paddle.y - ball.radius; // Repositionne la balle
            ball.dy = -ball.dy;

            let hitPoint = ball.x - (paddle.x + paddle.width / 2);
            ball.dx = hitPoint * 0.2;
            ball.dx = Math.max(-6, Math.min(6, ball.dx));
        } else {
            gameOver = true;
            cancelAnimationFrame(animationFrameId);
            // On peut appeler drawAll() ici pour afficher l'écran Game Over immédiatement
            drawAll();
        }
    }

    // Collision balle avec les briques
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

                    b.status = 0;

                    let prevBallX = ball.x - ball.dx;
                    let prevBallY = ball.y - ball.dy;

                    if (prevBallY + ball.radius <= brickTop || prevBallY - ball.radius >= brickBottom) {
                        ball.dy = -ball.dy;
                    }
                    else {
                        ball.dx = -ball.dx;
                    }

                    let allBricksDestroyed = true;
                    for (let col = 0; col < brickInfo.columnCount; col++) {
                        for (let row = 0; row < brickInfo.rowCount; row++) {
                            if (bricks[col][row].status === 1) {
                                allBricksDestroyed = false;
                                break;
                            }
                        }
                        if (!allBricksDestroyed) break;
                    }

                    if (allBricksDestroyed) {
                        gameWon = true;
                        cancelAnimationFrame(animationFrameId);
                        // On peut appeler drawAll() ici pour afficher l'écran Game Won immédiatement
                        drawAll();
                    }
                }
            }
        }
    }
}

function updateGameLogic() {
    if (gameOver || gameWon || gamePaused || !gameStarted) return; // Ajout de !gameStarted ici

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

    if (!gameOver && !gameWon && !gamePaused && gameStarted) { // Vérifie gameStarted
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

function startGameLoop() {
    if (!gameOver && !gameWon && !gamePaused && gameStarted) { // Vérifie gameStarted
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}