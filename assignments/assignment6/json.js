document.addEventListener("DOMContentLoaded", loadGameData);

function loadGameData() {
    fetch("data.json")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("The JSON file could not be loaded.");
            }

            return response.json();
        })
        .then(function (data) {
            displayGameData(data);
        })
        .catch(function (error) {
            document.getElementById("json-status").textContent =
                "There was a problem loading the video game data.";

            console.error(error);
        });
}

function displayGameData(data) {
    const title = document.getElementById("collection-title");
    const description = document.getElementById("collection-description");
    const tableBody = document.getElementById("game-table-body");
    const status = document.getElementById("json-status");

    title.textContent = data.title;
    description.textContent = data.description;
    tableBody.textContent = "";

    data.games.forEach(function (game) {
        const row = document.createElement("tr");

        addTableCell(row, game.title);
        addTableCell(row, game.genre);
        addTableCell(row, game.platform);
        addTableCell(row, game.releaseYear);
        addTableCell(row, game.rating + "/10");

        tableBody.appendChild(row);
    });

    status.textContent =
        data.games.length + " video games were loaded from data.json.";
}

function addTableCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.appendChild(cell);
}