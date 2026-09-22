"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const spirographForm =
        document.getElementById("spirograph-form");

    spirographForm.addEventListener(
        "submit",
        function (event) {
            event.preventDefault();
            startSpirograph();
        }
    );

    spirographForm.addEventListener(
        "input",
        clearError
    );
});

let drawingTimer = null;

function startSpirograph() {
    const canvas =
        document.getElementById("spirograph-canvas");

    const context = canvas.getContext("2d");

    const outerRadius = Number(
        document.getElementById("outer-radius").value
    );

    const innerRadius = Number(
        document.getElementById("inner-radius").value
    );

    const penOffset = Number(
        document.getElementById("pen-offset").value
    );

    const drawButton = document.querySelector(
        ".spirograph-button"
    );

    const drawingStatus = document.getElementById(
        "drawing-status"
    );

    clearError();

    if (
        !validateValues(
            outerRadius,
            innerRadius,
            penOffset
        )
    ) {
        return;
    }

    if (drawingTimer !== null) {
        window.clearInterval(drawingTimer);
    }

    context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const maximumDistance =
        Math.abs(outerRadius + innerRadius) +
        Math.abs(innerRadius + penOffset);

    const drawingScale =
        (Math.min(canvas.width, canvas.height) / 2 - 25) /
        maximumDistance;

    const greatestCommonDivisor = findGreatestCommonDivisor(
        outerRadius,
        innerRadius
    );

    const endingValue =
        2 * Math.PI *
        (innerRadius / greatestCommonDivisor);

    const timeIncrement = 0.02;

    let time = 0;

    let previousPosition = getPosition(
        time,
        outerRadius,
        innerRadius,
        penOffset,
        centerX,
        centerY,
        drawingScale
    );

    context.strokeStyle = "#1f4e79";
    context.lineWidth = 1.6;
    context.lineCap = "round";
    context.lineJoin = "round";

    drawButton.disabled = true;
    drawButton.textContent = "Drawing...";

    drawingStatus.textContent =
        "The Spirograph pattern is being drawn.";

    drawingTimer = window.setInterval(
        function () {
            time += timeIncrement;

            const currentPosition = getPosition(
                time,
                outerRadius,
                innerRadius,
                penOffset,
                centerX,
                centerY,
                drawingScale
            );

            context.beginPath();

            context.moveTo(
                previousPosition.x,
                previousPosition.y
            );

            context.lineTo(
                currentPosition.x,
                currentPosition.y
            );

            context.stroke();

            previousPosition = currentPosition;

            if (time >= endingValue) {
                window.clearInterval(drawingTimer);
                drawingTimer = null;

                drawButton.disabled = false;
                drawButton.textContent =
                    "Draw Spirograph";

                drawingStatus.textContent =
                    "The Spirograph pattern is complete.";
            }
        },
        5
    );
}

function getPosition(
    time,
    outerRadius,
    innerRadius,
    penOffset,
    centerX,
    centerY,
    drawingScale
) {
    const angleRatio =
        (outerRadius + innerRadius) / innerRadius;

    const horizontalPosition =
        (outerRadius + innerRadius) *
            Math.cos(time) -
        (innerRadius + penOffset) *
            Math.cos(angleRatio * time);

    const verticalPosition =
        (outerRadius + innerRadius) *
            Math.sin(time) -
        (innerRadius + penOffset) *
            Math.sin(angleRatio * time);

    return {
        x:
            centerX +
            horizontalPosition * drawingScale,

        y:
            centerY -
            verticalPosition * drawingScale
    };
}

function validateValues(
    outerRadius,
    innerRadius,
    penOffset
) {
    const values = [
        outerRadius,
        innerRadius,
        penOffset
    ];

    if (!values.every(Number.isFinite)) {
        showError(
            "Please enter a valid number in every field."
        );

        return false;
    }

    if (
        outerRadius < 40 ||
        outerRadius > 180
    ) {
        showError(
            "The outer radius must be between 40 and 180."
        );

        return false;
    }

    if (
        innerRadius < 10 ||
        innerRadius > 150
    ) {
        showError(
            "The inner radius must be between 10 and 150."
        );

        return false;
    }

    if (innerRadius > outerRadius) {
        showError(
            "The inner radius cannot be greater than the outer radius."
        );

        return false;
    }

    if (
        penOffset < 0 ||
        penOffset > 150
    ) {
        showError(
            "The pen offset must be between 0 and 150."
        );

        return false;
    }

    return true;
}

function findGreatestCommonDivisor(
    firstNumber,
    secondNumber
) {
    let firstValue = Math.round(
        Math.abs(firstNumber)
    );

    let secondValue = Math.round(
        Math.abs(secondNumber)
    );

    while (secondValue !== 0) {
        const remainder =
            firstValue % secondValue;

        firstValue = secondValue;
        secondValue = remainder;
    }

    return firstValue;
}

function showError(message) {
    document.getElementById(
        "spirograph-error"
    ).textContent = message;
}

function clearError() {
    document.getElementById(
        "spirograph-error"
    ).textContent = "";
}