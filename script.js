
/* ============================================
   CUSTOMIZATION AND ADJUSTMENT — JAVASCRIPT
   Modify the values below to customize
   images, positions, sizes, and gameplay.
   ============================================ */

const CONFIG = {

    // ========================================
    // A. IMAGE ASSETS
    // ========================================

    assets: {

        // Optional PNG image paths.
        // If an image is unavailable, Canvas graphics are used.

        runner: "assets/runner.png",

        obstacle1: "assets/obstacle1.png",

        obstacle2: "assets/obstacle2.png",

        background: "assets/background.png",

        doodad1: "assets/doodad1.png",

        doodad2: "assets/doodad2.png"

    },


    // ========================================
    // B. RUNNER
    // ========================================

    runner: {

        // Horizontal position of the runner.
        x: 145,

        // Vertical adjustment relative to the ground.
        yOffset: 5,

        // Maximum display dimensions.
        maxWidth: 175,
        maxHeight: 80,

        // Image positioning adjustments.
        imageOffsetX: 0,
        imageOffsetY: 10,

        // Jumping strength and gravity.
        jumpStrength: -590,
        gravity: 1330,

        // Smaller hitbox for fair collision detection.
        hitboxPaddingX: 23,
        hitboxPaddingY: 25

    },


    // ========================================
    // C. OBSTACLE 1
    // ========================================

    obstacle1: {

        // Large underwater sea rocks.
        maxWidth: 145,
        maxHeight: 72,

        imageOffsetX: 0,
        imageOffsetY: 20,

        // Position relative to the ground.
        groundOffset: 0,

        // Collision adjustments.
        hitboxPaddingX: 23,
        hitboxPaddingY: 25

    },


    // ========================================
    // D. OBSTACLE 2
    // ========================================

    obstacle2: {

        // Purple and pink glowing jellyfish.
        maxWidth: 165,
        maxHeight: 95,

        imageOffsetX: 0,
        imageOffsetY: 10,

        // Slightly elevated above the ground.
        groundOffset: 5,

        // Collision adjustments.
        hitboxPaddingX: 35,
        hitboxPaddingY: 40

    },


    // ========================================
    // E. BACKGROUND
    // ========================================

    background: {

        // Image positioning adjustments.
        offsetX: 0,
        offsetY: 0,

        // Background image scale.
        scale: 1,

        // Background scrolling speed.
        scrollSpeed: 0.18,

        // Fallback background color.
        fallbackColor: "#087EAA",

        // Image alignment: center, top, or bottom.
        alignment: "center"

    },


    // ========================================
    // F. DOODAD 1
    // ========================================

    doodad1: {

        // Golden pearls.
        x: 210,
        y: 170,

        maxWidth: 27,
        maxHeight: 27,

        imageOffsetX: 0,
        imageOffsetY: 0,

        // Repeat golden pearls across the screen.
        repeat: true,

        // Space between pearls.
        spacing: 125,

        // Move more slowly than obstacles.
        scrollSpeed: 0.16

    },


    // ========================================
    // G. DOODAD 2
    // ========================================

    doodad2: {

        // Small floating bubbles.
        x: 90,
        y: 95,

        maxWidth: 35,
        maxHeight: 55,

        imageOffsetX: 0,
        imageOffsetY: 0,

        // Repeat bubbles across the screen.
        repeat: true,

        // Independent spacing.
        spacing: 65,

        // Very slow background movement.
        scrollSpeed: 0.07

    },


    // ========================================
    // H. GAMEPLAY
    // ========================================

    gameplay: {

        // Initial movement speed.
        startingSpeed: 300,

        // Maximum movement speed.
        maxSpeed: 530,

        // Speed increase per second.
        difficultyIncrease: 8,

        // Minimum distance between obstacles.
        minObstacleSpacing: 340,

        // Maximum distance between obstacles.
        maxObstacleSpacing: 530

    },


    // ========================================
    // I. DEBUG — HITBOX VISUALIZATION
    // ========================================

    debug: {

        // Set true to show collision boundaries.
        showHitboxes: false,

        // Runner collision outline.
        runnerHitboxColor: "#00FF00",

        // Obstacle collision outlines.
        obstacleHitboxColor: "#FF0000",

        // Hitbox outline thickness.
        hitboxLineWidth: 2

    }

};


/* ============================================
   END OF CUSTOMIZATION AND ADJUSTMENT
   GAME LOGIC BELOW
   ============================================ */


/* ============================================
   1. HTML ELEMENTS
   ============================================ */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const elements = {

    gameTitle: document.getElementById("gameTitle"),

    gameDescription: document.getElementById("gameDescription"),

    gameInstructions: document.getElementById("gameInstructions"),

    scoreDisplay: document.getElementById("scoreDisplay"),

    highScoreDisplay: document.getElementById("highScoreDisplay"),

    gameOverlay: document.getElementById("gameOverlay"),

    overlayTitle: document.getElementById("overlayTitle"),

    overlayMessage: document.getElementById("overlayMessage"),

    startButton: document.getElementById("startButton"),

    assetStatus: document.getElementById("assetStatus")

};


// Check required HTML elements.

for (const [name, element] of Object.entries(elements)) {

    if (!element) {

        throw new Error("Missing HTML element: " + name);

    }

}

if (!canvas || !ctx) {

    throw new Error("Game Canvas could not be initialized.");

}


/* ============================================
   2. GAME CONSTANTS
   ============================================ */

const GAME_WIDTH = 960;
const GAME_HEIGHT = 450;

const GROUND_Y = 385;

const STORAGE_KEY = "endlessRunnerHighScore";

const START_TEXT =
    startButtonText();

const RESTART_TEXT =
    restartButtonText();


function startButtonText() {

    return elements.startButton.getAttribute("data-start-text")
        || elements.startButton.textContent.trim();

}


function restartButtonText() {

    return elements.startButton.getAttribute("data-restart-text")
        || "Restart Game";

}


// Keep the logical Canvas resolution fixed.

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;


/* ============================================
   3. IMAGE LOADING
   ============================================ */

// Generic asset identifiers are used throughout.

const imageAssets = {

    runner: null,

    obstacle1: null,

    obstacle2: null,

    background: null,

    doodad1: null,

    doodad2: null

};


const assetNames = [
    "runner",
    "obstacle1",
    "obstacle2",
    "background",
    "doodad1",
    "doodad2"
];


let loadedAssets = 0;
let failedAssets = 0;


function loadImage(key) {

    return new Promise((resolve) => {

        const image = new Image();

        image.onload = function () {

            imageAssets[key] = image;

            loadedAssets++;

            resolve();

        };

        image.onerror = function () {

            imageAssets[key] = null;

            failedAssets++;

            resolve();

        };

        image.src = CONFIG.assets[key];

    });

}


async function loadAllImages() {

    await Promise.all(

        assetNames.map(key => loadImage(key))

    );

    if (failedAssets === 0) {

        elements.assetStatus.textContent =
            "🌊 All game images loaded successfully!";

    } else {

        elements.assetStatus.textContent =
            "🌊 Using Canvas fallback graphics for missing images.";

    }

}


// Start loading images.

loadAllImages();


/* ============================================
   4. GAME STATE
   ============================================ */

let gameState = "ready";

let score = 0;

let highScore = loadHighScore();

let gameSpeed = CONFIG.gameplay.startingSpeed;

let lastFrameTime = 0;

let animationFrameId = null;

let gameTime = 0;


// Background movement.

let backgroundScroll = 0;


// Decorative movement.

let doodad1Scroll = 0;
let doodad2Scroll = 0;


// Obstacle generation.

let obstacles = [];

let spawnDistance = 0;

let nextObstacleSpacing = 400;


// Runner physics.

const runner = {

    x: CONFIG.runner.x,

    jumpY: 0,

    velocityY: 0,

    onGround: true

};


/* ============================================
   5. HIGH SCORE STORAGE
   ============================================ */

function loadHighScore() {

    try {

        const savedScore =
            localStorage.getItem(STORAGE_KEY);

        const value = Number(savedScore);

        return Number.isFinite(value) && value >= 0
            ? value
            : 0;

    } catch (error) {

        return 0;

    }

}


function saveHighScore() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            String(highScore)
        );

    } catch (error) {

        // Game continues if storage is unavailable.

    }

}


function updateScoreDisplay() {

    elements.scoreDisplay.textContent =
        Math.floor(score).toString();

    elements.highScoreDisplay.textContent =
        Math.floor(highScore).toString();

}


/* ============================================
   6. IMAGE DIMENSION CALCULATION
   ============================================ */

// Fallback aspect ratios.
// These keep Canvas drawings proportional to PNG assets.

function getFallbackAspect(key) {

    const ratios = {

        runner: 1.5,

        obstacle1: 1.15,

        obstacle2: 0.75,

        background: 960 / 450,

        doodad1: 1,

        doodad2: 0.65

    };

    return ratios[key];

}


// Fit images inside configured maximum dimensions.

function getDisplaySize(key) {

    const image = imageAssets[key];

    const settings = CONFIG[key];

    let originalWidth;
    let originalHeight;

    if (
        image &&
        image.naturalWidth > 0 &&
        image.naturalHeight > 0
    ) {

        originalWidth = image.naturalWidth;
        originalHeight = image.naturalHeight;

    } else {

        originalWidth = 100;

        originalHeight =
            100 / getFallbackAspect(key);

    }


    const scale = Math.min(

        settings.maxWidth / originalWidth,

        settings.maxHeight / originalHeight

    );


    return {

        width: originalWidth * scale,

        height: originalHeight * scale

    };

}


/* ============================================
   7. DRAWING POSITIONS AND HITBOXES
   ============================================ */

// All runner and obstacle images use bottom-center anchors.

function getDrawRect(key, anchorX, anchorBottomY) {

    const size = getDisplaySize(key);

    const settings = CONFIG[key];

    const x =
        anchorX -
        size.width / 2 +
        settings.imageOffsetX;

    const y =
        anchorBottomY -
        size.height +
        settings.imageOffsetY;


    return {

        x: x,

        y: y,

        width: size.width,

        height: size.height

    };

}


// Reusable actual collision rectangle.

function getObjectRect(key, anchorX, anchorBottomY) {

    const rect =
        getDrawRect(key, anchorX, anchorBottomY);

    const settings = CONFIG[key];

    const paddingX = Math.min(
        settings.hitboxPaddingX,
        rect.width * 0.45
    );

    const paddingY = Math.min(
        settings.hitboxPaddingY,
        rect.height * 0.45
    );


    return {

        x: rect.x + paddingX,

        y: rect.y + paddingY,

        width: rect.width - paddingX * 2,

        height: rect.height - paddingY * 2

    };

}


/* ============================================
   8. FALLBACK GRAPHICS — RUNNER
   ============================================ */

function drawRunnerFallback(x, y, width, height) {

    ctx.save();

    ctx.translate(x, y);

    ctx.scale(width / 120, height / 80);


    // Dolphin body.

    ctx.fillStyle = "#36D8E8";

    ctx.beginPath();

    ctx.ellipse(
        54, 43,
        39, 23,
        -0.05,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Dolphin belly.

    ctx.fillStyle = "#D8FFFF";

    ctx.beginPath();

    ctx.ellipse(
        56, 54,
        27, 10,
        0,
        0,
        Math.PI
    );

    ctx.fill();


    // Dolphin nose.

    ctx.fillStyle = "#36D8E8";

    ctx.beginPath();

    ctx.moveTo(82, 34);

    ctx.lineTo(116, 41);

    ctx.lineTo(83, 49);

    ctx.closePath();

    ctx.fill();


    // Tail.

    ctx.fillStyle = "#159DBB";

    ctx.beginPath();

    ctx.moveTo(22, 42);

    ctx.lineTo(4, 23);

    ctx.lineTo(9, 48);

    ctx.lineTo(2, 64);

    ctx.lineTo(26, 52);

    ctx.closePath();

    ctx.fill();


    // Dorsal fin.

    ctx.fillStyle = "#159DBB";

    ctx.beginPath();

    ctx.moveTo(48, 23);

    ctx.lineTo(59, 7);

    ctx.lineTo(71, 25);

    ctx.closePath();

    ctx.fill();


    // Side fin.

    ctx.fillStyle = "#159DBB";

    ctx.beginPath();

    ctx.moveTo(53, 49);

    ctx.lineTo(70, 67);

    ctx.lineTo(84, 52);

    ctx.closePath();

    ctx.fill();


    // Eye.

    ctx.fillStyle = "#102F4C";

    ctx.beginPath();

    ctx.arc(82, 30, 3.5, 0, Math.PI * 2);

    ctx.fill();


    // Eye highlight.

    ctx.fillStyle = "#FFFFFF";

    ctx.beginPath();

    ctx.arc(83, 29, 1.3, 0, Math.PI * 2);

    ctx.fill();


    // Smile.

    ctx.strokeStyle = "#15566F";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(87, 45);

    ctx.quadraticCurveTo(99, 51, 106, 44);

    ctx.stroke();


    ctx.restore();

}


/* ============================================
   9. FALLBACK GRAPHICS — OBSTACLE 1
   ============================================ */

function drawObstacle1Fallback(x, y, width, height) {

    ctx.save();

    ctx.translate(x, y);

    ctx.scale(width / 100, height / 85);


    // Main sea rock.

    ctx.fillStyle = "#566F86";

    ctx.beginPath();

    ctx.moveTo(8, 82);

    ctx.lineTo(15, 48);

    ctx.lineTo(35, 30);

    ctx.lineTo(46, 12);

    ctx.lineTo(65, 29);

    ctx.lineTo(87, 37);

    ctx.lineTo(96, 82);

    ctx.closePath();

    ctx.fill();


    // Lighter rock section.

    ctx.fillStyle = "#829AAF";

    ctx.beginPath();

    ctx.moveTo(15, 48);

    ctx.lineTo(35, 30);

    ctx.lineTo(46, 12);

    ctx.lineTo(52, 52);

    ctx.lineTo(34, 68);

    ctx.closePath();

    ctx.fill();


    // Dark details.

    ctx.fillStyle = "#334B62";

    ctx.beginPath();

    ctx.arc(69, 55, 5, 0, Math.PI * 2);

    ctx.fill();

    ctx.beginPath();

    ctx.arc(34, 73, 4, 0, Math.PI * 2);

    ctx.fill();


    // Small sea plants.

    ctx.strokeStyle = "#2BC49B";

    ctx.lineWidth = 4;

    ctx.beginPath();

    ctx.moveTo(8, 82);

    ctx.quadraticCurveTo(0, 58, 12, 51);

    ctx.moveTo(89, 82);

    ctx.quadraticCurveTo(100, 61, 91, 53);

    ctx.stroke();


    ctx.restore();

}


/* ============================================
   10. FALLBACK GRAPHICS — OBSTACLE 2
   ============================================ */

function drawObstacle2Fallback(x, y, width, height) {

    ctx.save();

    ctx.translate(x, y);

    ctx.scale(width / 75, height / 110);


    // Jellyfish bell.

    ctx.fillStyle = "#C66BEE";

    ctx.beginPath();

    ctx.moveTo(7, 48);

    ctx.quadraticCurveTo(7, 7, 37, 7);

    ctx.quadraticCurveTo(68, 7, 68, 48);

    ctx.quadraticCurveTo(37, 61, 7, 48);

    ctx.closePath();

    ctx.fill();


    // Pink lower bell.

    ctx.fillStyle = "#F18BD8";

    ctx.beginPath();

    ctx.quadraticCurveTo(
        37, 62,
        7, 48
    );

    ctx.quadraticCurveTo(
        37, 38,
        68, 48
    );

    ctx.quadraticCurveTo(
        37, 70,
        7, 48
    );

    ctx.fill();


    // Bell highlight.

    ctx.fillStyle = "#F8D4FF";

    ctx.beginPath();

    ctx.ellipse(
        37, 23,
        19, 7,
        0,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();


    // Glowing tentacles.

    ctx.strokeStyle = "#EBA4FF";

    ctx.lineWidth = 4;

    ctx.lineCap = "round";

    ctx.beginPath();

    ctx.moveTo(18, 51);

    ctx.quadraticCurveTo(10, 78, 16, 103);

    ctx.moveTo(31, 55);

    ctx.quadraticCurveTo(23, 81, 30, 106);

    ctx.moveTo(44, 55);

    ctx.quadraticCurveTo(51, 83, 43, 104);

    ctx.moveTo(56, 52);

    ctx.quadraticCurveTo(69, 79, 61, 101);

    ctx.stroke();


    // Eyes.

    ctx.fillStyle = "#FFFFFF";

    ctx.beginPath();

    ctx.arc(27, 36, 4, 0, Math.PI * 2);

    ctx.arc(48, 36, 4, 0, Math.PI * 2);

    ctx.fill();


    ctx.fillStyle = "#552E78";

    ctx.beginPath();

    ctx.arc(28, 37, 2, 0, Math.PI * 2);

    ctx.arc(49, 37, 2, 0, Math.PI * 2);

    ctx.fill();


    ctx.restore();

}


/* ============================================
   11. FALLBACK GRAPHICS — BACKGROUND
   ============================================ */

function drawBackgroundFallback() {

    // Main water color.

    ctx.fillStyle = CONFIG.background.fallbackColor;

    ctx.fillRect(
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT
    );


    // Deep ocean section.

    ctx.fillStyle = "#075C89";

    ctx.fillRect(
        0,
        250,
        GAME_WIDTH,
        135
    );


    // Distant coral and sea plants.

    const shift = backgroundScroll * 0.12;

    for (let i = -1; i < 9; i++) {

        const x =
            i * 145 -
            (shift % 145);

        ctx.fillStyle = "#176E91";

        ctx.beginPath();

        ctx.moveTo(x, 385);

        ctx.lineTo(x + 18, 340);

        ctx.lineTo(x + 33, 385);

        ctx.lineTo(x + 51, 355);

        ctx.lineTo(x + 68, 385);

        ctx.closePath();

        ctx.fill();

    }


    // Ocean floor.

    ctx.fillStyle = "#D9C27A";

    ctx.fillRect(
        0,
        GROUND_Y,
        GAME_WIDTH,
        GAME_HEIGHT - GROUND_Y
    );


    // Sand details.

    ctx.fillStyle = "#B9A15E";

    for (let i = 0; i < 30; i++) {

        const x = (i * 43 - shift * 0.5) % GAME_WIDTH;

        ctx.beginPath();

        ctx.arc(
            x < 0 ? x + GAME_WIDTH : x,
            407 + (i % 4) * 7,
            2,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    // Distant coral shapes.

    for (let i = -1; i < 8; i++) {

        const x =
            i * 165 -
            (shift % 165);

        ctx.fillStyle =
            i % 2 === 0 ? "#EF718F" : "#B46AE5";

        ctx.beginPath();

        ctx.arc(
            x + 25,
            385,
            17,
            Math.PI,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillRect(
            x + 9,
            370,
            32,
            15
        );

    }

}


/* ============================================
   12. DRAWING PNG OR FALLBACK OBJECTS
   ============================================ */

function drawAsset(key, rect, time) {

    const image = imageAssets[key];

    if (image) {

        ctx.drawImage(

            image,

            rect.x,
            rect.y,

            rect.width,
            rect.height

        );

        return;

    }


    // Use Canvas fallback graphics.

    switch (key) {

        case "runner":

            drawRunnerFallback(
                rect.x,
                rect.y,
                rect.width,
                rect.height
            );

            break;


        case "obstacle1":

            drawObstacle1Fallback(
                rect.x,
                rect.y,
                rect.width,
                rect.height
            );

            break;


        case "obstacle2":

            drawObstacle2Fallback(
                rect.x,
                rect.y,
                rect.width,
                rect.height
            );

            break;

    }

}


/* ============================================
   13. BACKGROUND IMAGE RENDERING
   ============================================ */

function drawBackground() {

    const image = imageAssets.background;

    if (!image) {

        drawBackgroundFallback();

        return;

    }


    // Cover-style scaling without stretching.

    const scale = Math.max(

        GAME_WIDTH / image.naturalWidth,

        GAME_HEIGHT / image.naturalHeight

    ) * CONFIG.background.scale;


    const width = image.naturalWidth * scale;

    const height = image.naturalHeight * scale;


    let y = 0;

    if (CONFIG.background.alignment === "top") {

        y = 0;

    } else if (CONFIG.background.alignment === "bottom") {

        y = GAME_HEIGHT - height;

    } else {

        y = (GAME_HEIGHT - height) / 2;

    }

    y += CONFIG.background.offsetY;


    const offset = CONFIG.background.offsetX;

    // Repeat background tiles horizontally without gaps.

    const scroll =
        backgroundScroll % width;

    for (
        let x = -width - scroll + offset;
        x < GAME_WIDTH + width;
        x += width
    ) {

        ctx.drawImage(

            image,

            x,
            y,
            width,
            height

        );

    }

}


/* ============================================
   14. FALLBACK GRAPHICS — DOODAD 1
   ============================================ */

function drawDoodad1Fallback(x, y, width, height, time) {

    ctx.save();

    ctx.translate(x, y);

    ctx.scale(width / 30, height / 30);


    // Golden pearl.

    ctx.fillStyle = "#FFD447";

    ctx.beginPath();

    ctx.arc(
        15,
        15,
        11,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Pearl highlight.

    ctx.fillStyle = "#FFF2A6";

    ctx.beginPath();

    ctx.arc(
        11,
        10,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Outer detail.

    ctx.strokeStyle = "#D99D16";

    ctx.lineWidth = 1.5;

    ctx.beginPath();

    ctx.arc(
        15,
        15,
        11,
        0,
        Math.PI * 2
    );

    ctx.stroke();


    ctx.restore();

}


/* ============================================
   15. FALLBACK GRAPHICS — DOODAD 2
   ============================================ */

function drawDoodad2Fallback(x, y, width, height, time) {

    ctx.save();

    ctx.translate(x, y);

    ctx.scale(width / 35, height / 55);


    // Bubbles gently float within a fixed area.

    const movement = (time * 12) % 20;

    const bubblePositions = [

        [10, 14],

        [24, 31],

        [12, 46]

    ];


    for (let i = 0; i < bubblePositions.length; i++) {

        const bx = bubblePositions[i][0];

        const by =
            ((bubblePositions[i][1] - movement + 55) % 55);


        ctx.strokeStyle = "#B8F6FF";

        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.arc(
            bx,
            by,
            4 + (i % 2),
            0,
            Math.PI * 2
        );

        ctx.stroke();


        // Small bubble highlight.

        ctx.fillStyle = "#FFFFFF";

        ctx.beginPath();

        ctx.arc(
            bx - 1,
            by - 2,
            1.2,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    ctx.restore();

}


/* ============================================
   16. DOODAD RENDERING
   ============================================ */

// Doodads use independent movement and spacing.

function drawDoodad(key, scrollPosition, time) {

    const settings = CONFIG[key];

    const size = getDisplaySize(key);

    const startX =
        settings.x + settings.imageOffsetX;

    const startY =
        settings.y + settings.imageOffsetY;


    const image = imageAssets[key];


    function drawOne(x) {

        const rect = {

            x: x,

            y: startY,

            width: size.width,

            height: size.height

        };


        if (image) {

            ctx.drawImage(

                image,

                rect.x,
                rect.y,
                rect.width,
                rect.height

            );

        } else if (key === "doodad1") {

            drawDoodad1Fallback(
                rect.x,
                rect.y,
                rect.width,
                rect.height,
                time
            );

        } else if (key === "doodad2") {

            drawDoodad2Fallback(
                rect.x,
                rect.y,
                rect.width,
                rect.height,
                time
            );

        }

    }


    if (!settings.repeat) {

        drawOne(
            startX - scrollPosition
        );

        return;

    }


    // A zero spacing value makes repeated tiles touch.

    const step =
        size.width + Math.max(0, settings.spacing);


    if (step <= 0) {

        drawOne(startX);

        return;

    }


    const offset =
        scrollPosition % step;


    // Draw enough instances to fill the visible area.

    for (
        let x = startX - offset - step;
        x < GAME_WIDTH + step;
        x += step
    ) {

        drawOne(x);

    }

}


/* ============================================
   17. RUNNER POSITION
   ============================================ */

function getRunnerBottomY() {

    return (
        GROUND_Y +
        CONFIG.runner.yOffset +
        runner.jumpY
    );

}


function drawRunner() {

    const rect = getDrawRect(

        "runner",

        runner.x,

        getRunnerBottomY()

    );


    drawAsset(
        "runner",
        rect,
        gameTime
    );

}


/* ============================================
   18. OBSTACLE GENERATION
   ============================================ */

function randomSpacing() {

    const min =
        CONFIG.gameplay.minObstacleSpacing;

    const max =
        CONFIG.gameplay.maxObstacleSpacing;

    return min + Math.random() * (max - min);

}


function spawnObstacle() {

    const key =
        Math.random() < 0.5
            ? "obstacle1"
            : "obstacle2";


    const size = getDisplaySize(key);


    obstacles.push({

        key: key,

        x: GAME_WIDTH + size.width / 2,

        passed: false

    });


    nextObstacleSpacing = randomSpacing();

}


function updateObstacles(deltaTime) {

    spawnDistance += gameSpeed * deltaTime;


    if (spawnDistance >= nextObstacleSpacing) {

        spawnObstacle();

        spawnDistance = 0;

    }


    for (const obstacle of obstacles) {

        obstacle.x -= gameSpeed * deltaTime;

    }


    // Remove objects after they leave the screen.

    obstacles = obstacles.filter(obstacle => {

        const size = getDisplaySize(obstacle.key);

        return obstacle.x + size.width / 2 > -20;

    });

}


/* ============================================
   19. DRAW OBSTACLES
   ============================================ */

function getObstacleBottomY(key) {

    return (
        GROUND_Y -
        CONFIG[key].groundOffset
    );

}


function drawObstacles() {

    for (const obstacle of obstacles) {

        const rect = getDrawRect(

            obstacle.key,

            obstacle.x,

            getObstacleBottomY(obstacle.key)

        );


        drawAsset(
            obstacle.key,
            rect,
            gameTime
        );

    }

}


/* ============================================
   20. JUMPING PHYSICS
   ============================================ */

function jump() {

    if (gameState !== "playing") {

        return;

    }


    // Prevent double jumping.

    if (!runner.onGround) {

        return;

    }


    runner.velocityY =
        CONFIG.runner.jumpStrength;

    runner.onGround = false;

}


function updateRunner(deltaTime) {

    if (runner.onGround) {

        return;

    }


    runner.velocityY +=
        CONFIG.runner.gravity * deltaTime;


    runner.jumpY +=
        runner.velocityY * deltaTime;


    // Return to the ground.

    if (runner.jumpY >= 0) {

        runner.jumpY = 0;

        runner.velocityY = 0;

        runner.onGround = true;

    }

}


/* ============================================
   21. COLLISION DETECTION
   ============================================ */

function isColliding(rect1, rect2) {

    return (

        rect1.x < rect2.x + rect2.width &&

        rect1.x + rect1.width > rect2.x &&

        rect1.y < rect2.y + rect2.height &&

        rect1.y + rect1.height > rect2.y

    );

}


function checkCollisions() {

    const runnerRect = getObjectRect(

        "runner",

        runner.x,

        getRunnerBottomY()

    );


    for (const obstacle of obstacles) {

        const obstacleRect = getObjectRect(

            obstacle.key,

            obstacle.x,

            getObstacleBottomY(obstacle.key)

        );


        if (isColliding(runnerRect, obstacleRect)) {

            endGame();

            return;

        }

    }

}


/* ============================================
   22. HITBOX VISUALIZATION
   ============================================ */

function drawHitboxes() {

    if (!CONFIG.debug.showHitboxes) {

        return;

    }


    ctx.save();

    ctx.lineWidth =
        CONFIG.debug.hitboxLineWidth;


    // Runner's actual collision rectangle.

    const runnerRect = getObjectRect(

        "runner",

        runner.x,

        getRunnerBottomY()

    );


    ctx.strokeStyle =
        CONFIG.debug.runnerHitboxColor;

    ctx.strokeRect(

        runnerRect.x,
        runnerRect.y,
        runnerRect.width,
        runnerRect.height

    );


    // Actual collision rectangles for obstacles.

    ctx.strokeStyle =
        CONFIG.debug.obstacleHitboxColor;


    for (const obstacle of obstacles) {

        const obstacleRect = getObjectRect(

            obstacle.key,

            obstacle.x,

            getObstacleBottomY(obstacle.key)

        );


        ctx.strokeRect(

            obstacleRect.x,
            obstacleRect.y,
            obstacleRect.width,
            obstacleRect.height

        );

    }


    ctx.restore();

}


/* ============================================
   23. SCORING
   ============================================ */

function updateScore(deltaTime) {

    score += deltaTime * 10;


    if (score > highScore) {

        highScore = score;

        saveHighScore();

    }


    updateScoreDisplay();

}


/* ============================================
   24. RESET GAME
   ============================================ */

function resetGame() {

    score = 0;

    gameSpeed =
        CONFIG.gameplay.startingSpeed;


    obstacles = [];

    spawnDistance = 0;

    nextObstacleSpacing = randomSpacing();


    // Reset runner physics.

    runner.x = CONFIG.runner.x;

    runner.jumpY = 0;

    runner.velocityY = 0;

    runner.onGround = true;


    // Reset movement.

    backgroundScroll = 0;

    doodad1Scroll = 0;

    doodad2Scroll = 0;

    gameTime = 0;


    updateScoreDisplay();

}


/* ============================================
   25. START GAME
   ============================================ */

function startGame() {

    if (gameState === "playing") {

        return;

    }


    resetGame();


    gameState = "playing";


    elements.gameOverlay.style.display = "none";


    elements.startButton.textContent =
        RESTART_TEXT;


    elements.overlayTitle.textContent =
        "🐬 Ocean Splash Runner";


    elements.overlayMessage.textContent =
        "Ready to explore the underwater world?";


    lastFrameTime = performance.now();

}


/* ============================================
   26. GAME OVER
   ============================================ */

function endGame() {

    if (gameState !== "playing") {

        return;

    }


    gameState = "gameover";


    // Save the latest high score.

    if (score > highScore) {

        highScore = score;

        saveHighScore();

    }


    updateScoreDisplay();


    elements.gameOverlay.style.display = "flex";


    elements.overlayTitle.textContent =
        "💥 Game Over!";


    elements.overlayMessage.textContent =

        "Your final score: " +
        Math.floor(score) +
        " | High score: " +
        Math.floor(highScore) +
        ". Try again and collect more golden pearls!";


    elements.startButton.textContent =
        RESTART_TEXT;

}


/* ============================================
   27. UPDATE GAME
   ============================================ */

function updateGame(deltaTime) {

    if (gameState !== "playing") {

        return;

    }


    gameTime += deltaTime;


    // Gradually increase movement speed.

    gameSpeed = Math.min(

        CONFIG.gameplay.maxSpeed,

        gameSpeed +
        CONFIG.gameplay.difficultyIncrease * deltaTime

    );


    // Update runner movement.

    updateRunner(deltaTime);


    // Move obstacles.

    updateObstacles(deltaTime);


    // Move background and decorative elements.

    backgroundScroll +=

        gameSpeed *
        CONFIG.background.scrollSpeed *
        deltaTime;


    doodad1Scroll +=

        gameSpeed *
        CONFIG.doodad1.scrollSpeed *
        deltaTime;


    doodad2Scroll +=

        gameSpeed *
        CONFIG.doodad2.scrollSpeed *
        deltaTime;


    // Update score.

    updateScore(deltaTime);


    // Check collisions.

    checkCollisions();

}


/* ============================================
   28. DRAW GAME
   ============================================ */

function drawGame() {

    ctx.clearRect(

        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT

    );


    // Background scenery.

    drawBackground();


    // Distant decorative elements.

    drawDoodad(

        "doodad2",

        doodad2Scroll,

        gameTime

    );


    // Golden pearls.

    drawDoodad(

        "doodad1",

        doodad1Scroll,

        gameTime

    );


    // Obstacles.

    drawObstacles();


    // Runner.

    drawRunner();


    // Draw debug outlines last.

    drawHitboxes();

}


/* ============================================
   29. MAIN ANIMATION LOOP
   ============================================ */

function gameLoop(timestamp) {

    if (!lastFrameTime) {

        lastFrameTime = timestamp;

    }


    // Delta time in seconds.
    // Limit large jumps after switching browser tabs.

    const deltaTime = Math.min(

        (timestamp - lastFrameTime) / 1000,

        0.033

    );


    lastFrameTime = timestamp;


    // Update game mechanics.

    updateGame(deltaTime);


    // Render everything.

    drawGame();


    // Schedule exactly one next animation frame.

    animationFrameId =
        requestAnimationFrame(gameLoop);

}


/* ============================================
   30. KEYBOARD CONTROLS
   ============================================ */

function handleKeyDown(event) {

    if (
        event.code === "Space" ||
        event.code === "ArrowUp"
    ) {

        event.preventDefault();

        jump();

    }

}


document.addEventListener(
    "keydown",
    handleKeyDown
);


/* ============================================
   31. MOUSE AND TOUCH CONTROLS
   ============================================ */

// Clicking or tapping the game screen makes the runner jump.

canvas.addEventListener("pointerdown", function(event) {

    event.preventDefault();

    jump();

});


/* ============================================
   32. START / RESTART BUTTON
   ============================================ */

elements.startButton.addEventListener(
    "click",
    function() {

        if (
            gameState === "ready" ||
            gameState === "gameover"
        ) {

            startGame();

        }

    }
);


/* ============================================
   33. INITIAL GAME SETUP
   ============================================ */

// Display initial scores.

updateScoreDisplay();


// Keep the original HTML start message visible.

elements.startButton.textContent =
    START_TEXT;


// Prepare the game overlay.

elements.gameOverlay.style.display = "flex";


// Start the animation loop only once.

if (animationFrameId === null) {

    animationFrameId =
        requestAnimationFrame(gameLoop);

}
