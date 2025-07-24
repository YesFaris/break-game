'use strict';

// --- Définition des niveaux ---
// Chaque objet dans ce tableau représente un niveau avec ses propriétés spécifiques
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
            // Nouvelles propriétés pour la "dureté" des briques
            hitsToBreak: 1, // Une brique se casse en 1 coup
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
            gradientStart: "#87CEEB", // Bleu ciel
            gradientEnd: "#4682B4" // Bleu acier
        }
    },
    {
        id: 2,
        name: "Niveau 2: Moyen",
        brick: {
            rowCount: 6, // Plus de rangées
            columnCount: 8, // Plus de colonnes
            width: 50, // Briques plus petites
            height: 18,
            padding: 8,
            offsetTop: 35,
            offsetLeft: 25,
            colors: ["#FF4500", "#FFD700", "#DAA520", "#BDB76B", "#6B8E23", "#800000"], // Nouvelles couleurs
            hitsToBreak: 1, // Certaines briques pourraient être plus dures ici
            topHighlight: "#FFFFFF",
            sideShadow: "#444444",
            bottomShadow: "#2A2A2A"
        },
        ball: {
            radius: 7, // Balle légèrement plus petite
            dx: 4, // Balle plus rapide
            dy: -4,
            color: "#FFD700", // Balle dorée
            gradientStart: "#FFFF00",
            gradientEnd: "#B8860B"
        },
        paddle: {
            height: 10, // Raquette plus petite
            width: 80,
            speed: 8, // Raquette plus rapide
            borderRadius: 6,
            baseColor: "#800080", // Violet
            highlightColor: "#BA55D3",
            shadowColor: "#4B0082",
        },
        background: {
            gradientStart: "#ADD8E6", // Bleu clair
            gradientEnd: "#483D8B" // Bleu ardoise foncé
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
            colors: ["#DC143C", "#FF4500", "#FF8C00", "#FFD700", "#ADFF2F", "#00FF7F", "#4169E1"], // Plus de couleurs
            hitsToBreak: 2, // Les briques nécessitent 2 coups !
            topHighlight: "#FFFFFF",
            sideShadow: "#666666",
            bottomShadow: "#3A3A3A"
        },
        ball: {
            radius: 6, // Balle encore plus petite
            dx: 5, // Balle encore plus rapide
            dy: -5,
            color: "#FF0000", // Balle rouge intense
            gradientStart: "#FF6347",
            gradientEnd: "#8B0000"
        },
        paddle: {
            height: 8, // Raquette très petite
            width: 70,
            speed: 9, // Raquette très rapide
            borderRadius: 5,
            baseColor: "#8B0000", // Rouge foncé
            highlightColor: "#CD5C5C",
            shadowColor: "#4B0000",
        },
        background: {
            gradientStart: "#FFDAB9", // Pêche
            gradientEnd: "#CD5C5C" // Rouge indien
        }
    }
    // Ajoutez plus de niveaux ici !
];

// --- Variables globales du jeu ---
let currentLevel = null; // Stocke le niveau actuellement sélectionné
let ball = {}; // Sera initialisé avec les propriétés du niveau
let paddle = {}; // Sera initialisé avec les propriétés du niveau
let brickInfo = {}; // Sera initialisé avec les propriétés du niveau

let bricks = [];
let canvasDom;
let ctx;

let gameOver = false;
let gameWon = false;
let gamePaused = false;
let gameStarted = false; // False signifie que nous sommes sur l'écran de démarrage ou de sélection
let animationFrameId;

// --- Références aux éléments DOM ---
let splashScreen;
let levelSelectScreen;
let gameScreen;
let startButton;
let levelButtonsContainer;
let backToSplashButton;

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

    // Attacher les écouteurs d'événements
    startButton.addEventListener('click', showLevelSelectScreen);
    backToSplashButton.addEventListener('click', showSplashScreen);

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
        e.preventDefault();
        if (!gameStarted) {
            return; // Espace ne fait rien si le jeu n'a pas commencé
        }
        if (gameOver || gameWon) {
            // Si le jeu est terminé (gagné ou perdu), on réinitialise et revient à la sélection de niveau
            showLevelSelectScreen(); // Ou showSplashScreen() si vous préférez
        } else {
            gamePaused = !gamePaused;
            if (!gamePaused) {
                startGameLoop();
            } else {
                cancelAnimationFrame(animationFrameId);
                drawAll(); // Pour s'assurer que l'écran de pause est dessiné
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

    // Affiche l'écran désiré
    screenToShow.style.display = "flex"; // Utilisez flex pour centrer le contenu
}

function showSplashScreen() {
    showScreen(splashScreen);
    gameStarted = false; // S'assurer que le jeu n'est pas considéré comme démarré
    cancelAnimationFrame(animationFrameId); // Arrêter l'animation du jeu si elle tournait
    // Détacher les écouteurs de jeu pour éviter les interactions inattendues
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("keyup", handleKeyUp);
    document.removeEventListener("keydown", handleSpacePress);
}

function showLevelSelectScreen() {
    showScreen(levelSelectScreen);
    gameStarted = false; // Le jeu n'est pas encore démarré, juste la sélection
    cancelAnimationFrame(animationFrameId);
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("keyup", handleKeyUp);
    document.removeEventListener("keydown", handleSpacePress);
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

    showScreen(gameScreen);
    gameStarted = true;
    initGame(); // Initialise le jeu avec les propriétés du niveau
    startGameLoop();

    // Attacher les écouteurs de clavier seulement après le démarrage du jeu
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("keydown", handleSpacePress);
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
    // Les propriétés sont déjà copiées depuis currentLevel dans startGame()
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
                b.x = brickX; // S'assurer que les coordonnées de la brique sont à jour
                b.y = brickY;

                // Calcul de la couleur de la brique en fonction de sa "vie" restante (pour les briques multi-coups)
                let currentBrickColor = brickInfo.colors[r % brickInfo.colors.length];
                if (b.hitsLeft < brickInfo.hitsToBreak) {
                    // Si la brique a été touchée, on peut assombrir ou changer sa couleur
                    const originalColor = currentBrickColor;
                    // Assombrir la couleur, par exemple
                    const colorValue = parseInt(originalColor.substring(1), 16);
                    const darkerColor = '#' + (colorValue - 0x111111).toString(16).padStart(6, '0');
                    currentBrickColor = darkerColor;
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
            // Le score est basé sur le nombre de briques qui ont été détruites
            if (bricks[c][r].status === 0) {
                score++;
            }
        }
    }
    ctx.font = "20px 'Press Start 2P', cursive";
    ctx.fillStyle = "#FFF";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 20, 30);
    ctx.fillText("Niveau: " + currentLevel.id, canvasDom.width - 150, 30); // Affiche le niveau actuel
    return score;
}

function drawAll() {
    ctx.clearRect(0, 0, canvasDom.width, canvasDom.height);

    // Le fond du canvas dépend maintenant du niveau sélectionné
    if (currentLevel && gameStarted) {
        let gradient = ctx.createLinearGradient(0, 0, 0, canvasDom.height);
        gradient.addColorStop(0, currentLevel.background.gradientStart);
        gradient.addColorStop(1, currentLevel.background.gradientEnd);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasDom.width, canvasDom.height);
    } else {
        // Dessine un fond neutre si aucun niveau n'est sélectionné ou si le jeu n'a pas commencé
        ctx.fillStyle = "#222";
        ctx.fillRect(0, 0, canvasDom.width, canvasDom.height);
    }

    if (gameStarted) {
        drawBricks();
        drawBall();
        drawPaddle();
        drawScore();
    }
    
    // Les écrans d'état se dessinent toujours par-dessus le canvas
    if (gamePaused) {
        drawPauseScreen();
    } else if (gameOver) {
        drawGameOverScreen();
    } else if (gameWon) {
        drawGameWonScreen();
    }
}

// Les fonctions drawGameOverScreen, drawGameWonScreen, drawPauseScreen
// restent les mêmes que précédemment, elles dessinent sur le canvas.

function detectCollisions() {
    if (!gameStarted || gamePaused || gameOver || gameWon) return;

    // Collision balle avec les murs
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
            drawAll();
        }
    }

    // Collision balle avec les briques (avec gestion des hitsToBreak)
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

                    // La balle a touché une brique
                    b.hitsLeft--; // Diminue le compteur de coups restants
                    
                    if (b.hitsLeft <= 0) {
                        b.status = 0; // La brique est détruite
                    }

                    // Détermine le côté de la collision pour un rebond plus précis
                    let prevBallX = ball.x - ball.dx;
                    let prevBallY = ball.y - ball.dy;

                    if (prevBallY + ball.radius <= brickTop || prevBallY - ball.radius >= brickBottom) {
                        ball.dy = -ball.dy;
                    } else {
                        ball.dx = -ball.dx;
                    }

                    // Vérifie si toutes les briques sont détruites (compte uniquement les briques actives)
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