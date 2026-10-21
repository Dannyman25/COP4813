"use strict";

const canvas = document.getElementById("animation-canvas");
const ctx = canvas.getContext("2d");

const startButton = document.getElementById("start-button");
const pauseButton = document.getElementById("pause-button");
const resetButton = document.getElementById("reset-button");
const statusMessage = document.getElementById("animation-status");
const clickCount = document.getElementById("click-count");

const colors = ["#1f4e79", "#b83232", "#21804a", "#7941a0"];

const ball = {
    x: 100,
    y: 100,
    radius: 30,
    dx: 3,
    dy: 2,
    colorIndex: 0
};

let timer = null;
let clicks = 0;

// Clear the previous frame and draw the ball.
function drawBall() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = colors[ball.colorIndex];
    ctx.fill();
}

// Move the ball and bounce it off the canvas edges.
function animate() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x + ball.radius >= canvas.width) {
        ball.x = canvas.width - ball.radius;
        ball.dx = -Math.abs(ball.dx);
    } else if (ball.x - ball.radius <= 0) {
        ball.x = ball.radius;
        ball.dx = Math.abs(ball.dx);
    }

    if (ball.y + ball.radius >= canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.dy = -Math.abs(ball.dy);
    } else if (ball.y - ball.radius <= 0) {
        ball.y = ball.radius;
        ball.dy = Math.abs(ball.dy);
    }

    drawBall();
}

function startAnimation() {
    if (timer !== null) {
        return;
    }

    timer = window.setInterval(animate, 20);
    startButton.disabled = true;
    pauseButton.disabled = false;
    statusMessage.textContent = "Moving. Click the ball to change it!";
}

function pauseAnimation() {
    window.clearInterval(timer);
    timer = null;

    startButton.disabled = false;
    pauseButton.disabled = true;
    statusMessage.textContent = "Paused. Select Start to continue.";
}

function resetAnimation() {
    pauseAnimation();

    ball.x = 100;
    ball.y = 100;
    ball.dx = 3;
    ball.dy = 2;
    ball.colorIndex = 0;

    clicks = 0;
    clickCount.textContent = clicks;
    statusMessage.textContent = "Reset. Select Start to begin.";

    drawBall();
}

// Convert the mouse position into canvas coordinates.
function handleCanvasClick(event) {
    const bounds = canvas.getBoundingClientRect();
    const mouseX =
        (event.clientX - bounds.left) * (canvas.width / bounds.width);
    const mouseY =
        (event.clientY - bounds.top) * (canvas.height / bounds.height);

    const distanceX = mouseX - ball.x;
    const distanceY = mouseY - ball.y;

    // A click hits the ball when it is within the ball's radius.
    if (
        distanceX * distanceX + distanceY * distanceY
        <= ball.radius * ball.radius
    ) {
        ball.colorIndex = (ball.colorIndex + 1) % colors.length;
        ball.dx = -ball.dx;
        ball.dy = -ball.dy;

        clicks += 1;
        clickCount.textContent = clicks;

        statusMessage.textContent =
            "Ball clicked! Color changed and direction reversed.";

        drawBall();
    }
}

startButton.addEventListener("click", startAnimation);
pauseButton.addEventListener("click", pauseAnimation);
resetButton.addEventListener("click", resetAnimation);
canvas.addEventListener("click", handleCanvasClick);

// Display the ball before the animation starts.
drawBall();