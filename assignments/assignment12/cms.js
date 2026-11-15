"use strict";

const tableBody = document.getElementById("cms-table-body");
const statusMessage = document.getElementById("cms-status");

/*
    Load the CMS information from the external JSON file.
*/
fetch("cms-data.json")
    .then(function (response) {
        if (!response.ok) {
            throw new Error("The CMS data could not be loaded.");
        }

        return response.json();
    })
    .then(function (data) {
        createCmsTable(data.systems);

        statusMessage.textContent =
            data.systems.length + " content management systems loaded.";
    })
    .catch(function (error) {
        statusMessage.textContent =
            "The CMS information could not be loaded. Open this page with Live Server.";

        statusMessage.classList.add("error-message");
        console.error(error);
    });

/*
    Create an unordered list from an array of information.
*/
function createList(items) {
    const list = document.createElement("ul");

    items.forEach(function (item) {
        const listItem = document.createElement("li");
        listItem.textContent = item;
        list.appendChild(listItem);
    });

    return list;
}

/*
    Create the system name and its research-source links.
*/
function createSystemInformation(system) {
    const container = document.createElement("div");

    const systemName = document.createElement("strong");
    systemName.className = "cms-name";
    systemName.textContent = system.name;

    const sourceHeading = document.createElement("span");
    sourceHeading.className = "source-heading";
    sourceHeading.textContent = "Research Sources";

    const sourceList = document.createElement("ul");
    sourceList.className = "source-list";

    system.sources.forEach(function (source) {
        const listItem = document.createElement("li");
        const link = document.createElement("a");

        link.href = source.url;
        link.textContent = source.name;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        listItem.appendChild(link);
        sourceList.appendChild(listItem);
    });

    container.append(systemName, sourceHeading, sourceList);

    return container;
}

/*
    Create a link to the example website.
*/
function createExampleLink(example) {
    const link = document.createElement("a");

    link.href = example.url;
    link.textContent = example.name;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    return link;
}

/*
    Create one table row for a CMS.
*/
function createCmsRow(system) {
    const row = document.createElement("tr");

    const systemCell = document.createElement("th");
    systemCell.scope = "row";
    systemCell.appendChild(createSystemInformation(system));

    const supportCell = document.createElement("td");
    supportCell.textContent = system.support;

    const technologyCell = document.createElement("td");
    technologyCell.appendChild(createList(system.technology));

    const capabilitiesCell = document.createElement("td");
    capabilitiesCell.appendChild(createList(system.capabilities));

    const limitationsCell = document.createElement("td");
    limitationsCell.appendChild(createList(system.limitations));

    const exampleCell = document.createElement("td");
    exampleCell.appendChild(createExampleLink(system.example));

    row.append(
        systemCell,
        supportCell,
        technologyCell,
        capabilitiesCell,
        limitationsCell,
        exampleCell
    );

    return row;
}

/*
    Generate the entire table from the JSON data.
*/
function createCmsTable(systems) {
    tableBody.replaceChildren();

    systems.forEach(function (system) {
        const row = createCmsRow(system);
        tableBody.appendChild(row);
    });
}