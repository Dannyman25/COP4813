"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const calculatorForm = document.getElementById("calculator-form");

    calculatorForm.addEventListener("submit", function (event) {
        event.preventDefault();
        calculateAndPlot();
    });

    calculatorForm.addEventListener("input", clearError);

    // Create the first calculation and plot using the seed values.
    calculateAndPlot();
});

function calculateReceivedPower(
    transmitPower,
    transmitGain,
    receiveGain,
    frequencyMHz,
    distanceMeters
) {
    const distanceKilometers = distanceMeters / 1000;

    const freeSpacePathLoss =
        20 * Math.log10(distanceKilometers) +
        20 * Math.log10(frequencyMHz) +
        32.44;

    return (
        transmitPower +
        transmitGain +
        receiveGain -
        freeSpacePathLoss
    );
}

function calculateAndPlot() {
    clearError();

    const transmitPower = Number(
        document.getElementById("transmit-power").value
    );

    const transmitGain = Number(
        document.getElementById("transmit-gain").value
    );

    const receiveGain = Number(
        document.getElementById("receive-gain").value
    );

    const frequency = Number(
        document.getElementById("frequency").value
    );

    const minimumDistance = Number(
        document.getElementById("minimum-distance").value
    );

    const maximumDistance = Number(
        document.getElementById("maximum-distance").value
    );

    const distanceStep = Number(
        document.getElementById("distance-step").value
    );

    if (
        !validateInputs(
            transmitPower,
            transmitGain,
            receiveGain,
            frequency,
            minimumDistance,
            maximumDistance,
            distanceStep
        )
    ) {
        return;
    }

    const distanceValues = [];
    const powerValues = [];

    let currentDistance = minimumDistance;

    while (currentDistance <= maximumDistance) {
        const roundedDistance = Number(currentDistance.toFixed(4));

        const receivedPower = calculateReceivedPower(
            transmitPower,
            transmitGain,
            receiveGain,
            frequency,
            roundedDistance
        );

        distanceValues.push(roundedDistance);
        powerValues.push(receivedPower);

        currentDistance += distanceStep;
    }

    // Include the exact maximum distance when the step does not land on it.
    if (
        distanceValues[distanceValues.length - 1] <
        maximumDistance
    ) {
        distanceValues.push(maximumDistance);

        powerValues.push(
            calculateReceivedPower(
                transmitPower,
                transmitGain,
                receiveGain,
                frequency,
                maximumDistance
            )
        );
    }

    displaySummary(frequency, distanceValues, powerValues);
    displayTable(distanceValues, powerValues);
    createPlot(distanceValues, powerValues, frequency);
}

function validateInputs(
    transmitPower,
    transmitGain,
    receiveGain,
    frequency,
    minimumDistance,
    maximumDistance,
    distanceStep
) {
    const values = [
        transmitPower,
        transmitGain,
        receiveGain,
        frequency,
        minimumDistance,
        maximumDistance,
        distanceStep
    ];

    if (!values.every(Number.isFinite)) {
        showError("Please enter a valid number in every field.");
        return false;
    }

    if (frequency <= 0) {
        showError("Frequency must be greater than zero.");
        return false;
    }

    if (minimumDistance <= 0) {
        showError("Minimum distance must be greater than zero.");
        return false;
    }

    if (maximumDistance <= minimumDistance) {
        showError(
            "Maximum distance must be greater than minimum distance."
        );
        return false;
    }

    if (distanceStep <= 0) {
        showError("Distance step must be greater than zero.");
        return false;
    }

    const estimatedPoints =
        Math.ceil(
            (maximumDistance - minimumDistance) / distanceStep
        ) + 1;

    if (estimatedPoints > 500) {
        showError(
            "This range creates too many plot points. " +
            "Please increase the distance step."
        );
        return false;
    }

    return true;
}

function displaySummary(
    frequency,
    distanceValues,
    powerValues
) {
    const summary = document.getElementById("result-summary");

    const firstPower = powerValues[0].toFixed(2);

    const lastPower =
        powerValues[powerValues.length - 1].toFixed(2);

    const firstDistance = distanceValues[0];

    const lastDistance =
        distanceValues[distanceValues.length - 1];

    summary.textContent =
        `At ${frequency} MHz, received power changes from ` +
        `${firstPower} dBm at ${firstDistance} meters to ` +
        `${lastPower} dBm at ${lastDistance} meters.`;
}

function displayTable(distanceValues, powerValues) {
    const resultsBody =
        document.getElementById("results-body");

    resultsBody.replaceChildren();

    distanceValues.forEach(function (distance, index) {
        const row = document.createElement("tr");
        const distanceCell = document.createElement("td");
        const powerCell = document.createElement("td");

        distanceCell.textContent = distance.toFixed(2);
        powerCell.textContent = powerValues[index].toFixed(2);

        row.appendChild(distanceCell);
        row.appendChild(powerCell);
        resultsBody.appendChild(row);
    });
}

function createPlot(
    distanceValues,
    powerValues,
    frequency
) {
    const plotData = [
        {
            x: distanceValues,
            y: powerValues,
            type: "scatter",
            mode: "lines+markers",
            name: "Received Power",

            line: {
                color: "#1f4e79",
                width: 3
            },

            marker: {
                color: "#ff9f1c",
                size: 7
            },

            hovertemplate:
                "Distance: %{x:.2f} m<br>" +
                "Power: %{y:.2f} dBm" +
                "<extra></extra>"
        }
    ];

    const plotLayout = {
        title: {
            text:
                `Received Signal Power at ${frequency} MHz`
        },

        xaxis: {
            title: {
                text: "Distance (meters)"
            },
            gridcolor: "#d9e1e8"
        },

        yaxis: {
            title: {
                text: "Received Power (dBm)"
            },
            gridcolor: "#d9e1e8"
        },

        paper_bgcolor: "#ffffff",
        plot_bgcolor: "#f7f9fb",

        margin: {
            top: 60,
            right: 30,
            bottom: 70,
            left: 80
        },

        font: {
            family: "Arial, Helvetica, sans-serif",
            color: "#222222"
        }
    };

    const plotOptions = {
        responsive: true,
        displaylogo: false
    };

    Plotly.newPlot(
        "signal-plot",
        plotData,
        plotLayout,
        plotOptions
    );
}

function showError(message) {
    document.getElementById("calculator-error").textContent =
        message;
}

function clearError() {
    document.getElementById("calculator-error").textContent = "";
}