// Draw canvas
let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

// Variables
let paddleWidth = 100;
let paddleHeight = 20;
let paddleMarginBottom = 0;
let leftArrow = false;
let rightArrow = false;
let ballRad = 8;
let lives = 3;
let score = 0;
let scoreIncrease = 10;
let level = 1;
let totalLevels = 3;
let game_over = false;

// Create paddle
let paddle = {
    x: canvas.width / 2 - paddleWidth / 2,
    y: canvas.height - paddleMarginBottom - paddleHeight,
    width: paddleWidth,
    height: paddleHeight,
    dx: 5
}

// Draw paddle
function drawPaddle() {
    ctx.fillStyle = "Blue";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.strokeStyle = "Red"
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// Control paddle
document.addEventListener("keydown", function (event) {
    if (event.keyCode === 37) {
        leftArrow = true;
    } else if (event.keyCode === 39) {
        rightArrow = true;
    }
});
document.addEventListener("keyup", function (event) {
    if (event.keyCode === 37) {
        leftArrow = false;
    } else if (event.keyCode === 39) {
        rightArrow = false;
    }
});

// Move paddle
function movePaddle() {
    if (rightArrow && paddle.x + paddle.width < canvas.width) {
        paddle.x += paddle.dx;
    } else if (leftArrow && paddle.x > 0) {
        paddle.x -= paddle.dx;
    }
}

// Create the ball
let ball = {
    x: canvas.width / 2,
    y: paddle.y - ballRad,
    radius: ballRad,
    speed: 4,
    dx: 3 * (Math.random() * 2 - 1),
    dy: -3
}

// Draw the ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffcd05";
    ctx.fill();
    ctx.strokeStyle = "#2e3548";
    ctx.stroke();
    ctx.closePath();
}

// Move the ball
function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
}

// Ball-Wall collision check
function ballWallCollision() {
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
        //WALL_HIT.play();
    }

    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
        //WALL_HIT.play();

    }

    if (ball.y + ball.radius > canvas.height) {
        lives--;
        LIFE_LOST.play();
        resetBall();
    }
}

// Reset ball
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = paddle.y - ballRad;
    ball.dx = 3 * (Math.random() * 2 - 1);
    ball.dy = -3;
}

// Ball-Paddle collision check
function ballPaddleCollision() {
    if (ball.x < paddle.x + paddle.width && ball.x > paddle.x && paddle.y < paddle.y + paddle.height && ball.y > paddle.y) {
        PADDLE_HIT.play();
        // CHECK WHERE THE BALL HIT THE PADDLE
        let collidePoint = ball.x - (paddle.x + paddle.width / 2);

        // NORMALIZE THE VALUES
        collidePoint = collidePoint / (paddle.width / 2);

        // CALCULATE THE ANGLE OF THE BALL
        let angle = collidePoint * Math.PI / 3;

        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = -ball.speed * Math.cos(angle);

    }
}

// Create bricks
let brick = {
    row: 1,
    column: 5,
    width: 55,
    height: 20,
    offSetLeft: 20,
    offSetTop: 20,
    marginTop: 40,
    fillColor: "Green",
    strokeColor: "#FFF"
}

let bricks = [];

function createBricks() {
    for (let r = 0; r < brick.row; r++) {
        bricks[r] = [];
        for (let c = 0; c < brick.column; c++) {
            bricks[r][c] = {
                x: c * (brick.offSetLeft + brick.width) + brick.offSetLeft,
                y: r * (brick.offSetTop + brick.height) + brick.offSetTop + brick.marginTop,
                status: true
            }
        }
    }
}

createBricks();

// Draw the bricks
function drawBricks() {
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.column; c++) {
            let b = bricks[r][c];
            // if the brick isn't broken
            if (b.status) {
                ctx.fillStyle = brick.fillColor;
                ctx.fillRect(b.x, b.y, brick.width, brick.height);

                ctx.strokeStyle = brick.strokeColor;
                ctx.strokeRect(b.x, b.y, brick.width, brick.height);
            }
        }
    }
}

// Ball-Brick collision check
function ballBrickCollision() {
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.column; c++) {
            let b = bricks[r][c];
            // if the brick isn't broken
            if (b.status) {
                if (ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + brick.width && ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + brick.height) {
                    BRICK_HIT.play();
                    ball.dy = -ball.dy;
                    b.status = false; // the brick is broken
                    score += scoreIncrease;
                }
            }
        }
    }
}

// Show stats
function showGameStats(text, textX, textY, img, imgX, imgY) {
    // draw text
    ctx.fillStyle = "#FFF";
    ctx.font = "25px Hubba";
    ctx.fillText(text, textX, textY);

    // draw image
    ctx.drawImage(img, imgX, imgY, width = 25, height = 25);
}

// Game over
function gameOver() {
    if (lives <= 0) {
        showYouLose();
        game_over = true;
    }
}

// Level up
function levelUp() {
    let levelDone = true;

    // if all bricks are broken
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.column; c++) {
            levelDone = levelDone && !bricks[r][c].status
        }
    }
    if (levelDone) {
        WIN.play();
        if (level >= totalLevels) {
            showYouWin();
            game_over = true;
            return;
        }
        brick.row++;
        createBricks();
        ball.speed += 0.5;
        resetBall();
        level++;
    }
}

// Draw function
function draw() {
    drawPaddle();
    drawBall();
    drawBricks();

    // Show score
    showGameStats(score, 35, 25, SCORE_IMG, 5, 5)

    // Show lives
    showGameStats(lives, canvas.width - 25, 25, LIFE_IMG, canvas.width - 55, 5)

    // Show level
    showGameStats(level, canvas.width / 2, 25, LEVEL_IMG, canvas.width / 2 - 30, 5)
}

// Update game
function update() {
    movePaddle();
    moveBall();
    ballWallCollision();
    ballPaddleCollision();
    ballBrickCollision();
    gameOver();
    levelUp();
}

//Loop
function loop() {
    ctx.drawImage(BG_IMG, 0, 0);
    if (level === 2) {
        ctx.drawImage(BG_IMG2, 0, 0);
    }

    if (level === 3) {
        ctx.drawImage(BG_IMG3, 0, 0);
        //lv3.play();
    }

    draw();
    update();
    if (!game_over) {
        requestAnimationFrame(loop);
    }
}

loop();

// // Select sound element
// let soundElement = document.getElementById("sound");
//
// soundElement.addEventListener("click", audioManager);
//
// function audioManager() {
//     // Sound On/Off
//     let imgSrc = soundElement.getAttribute("src");
//     let SOUND_IMG = imgSrc === "img/SOUND_ON.png" ? "img/SOUND_OFF.png" : "img/SOUND_ON.png";
//
//     soundElement.setAttribute("src", SOUND_IMG);
//
//     // MUTE AND UNMUTE SOUNDS
//     WALL_HIT.muted = !WALL_HIT.muted;
//     PADDLE_HIT.muted = !PADDLE_HIT.muted;
//     BRICK_HIT.muted = !BRICK_HIT.muted;
//     WIN.muted = !WIN.muted;
//     LIFE_LOST.muted = !LIFE_LOST.muted;
// }

// Display messages
/* SELECT ELEMENTS */
let gameover = document.getElementById("gameover");
let youwon = document.getElementById("youwon");
let youlose = document.getElementById("youlose");
let restart = document.getElementById("restart");

// Play again button
restart.addEventListener("click", function () {
    location.reload(); // reload the page
})

// Win
function showYouWin() {
    gameover.style.display = "block";
    youwon.style.display = "block";
    WinGame.play();
    //lv3.pause();
}

// Lose
function showYouLose() {
    gameover.style.display = "block";
    youlose.style.display = "block";
    LoseGame.play();
    //lv3.pause();
}
