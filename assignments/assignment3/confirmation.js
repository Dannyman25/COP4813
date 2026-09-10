"use strict";

document.addEventListener("DOMContentLoaded", function () {
    displayFormInformation();

    document.getElementById("edit-button")
        .addEventListener("click", returnToForm);
});

function displayFormInformation() {
    const parameters = new URLSearchParams(window.location.search);

    const firstName = getParameter(parameters, "firstname");
    const lastName = getParameter(parameters, "lastname");
    const address = getParameter(parameters, "address");
    const city = getParameter(parameters, "city");
    const state = getParameter(parameters, "state");
    const zip = getParameter(parameters, "zip");
    const phone = getParameter(parameters, "phone");
    const email = getParameter(parameters, "email");
    const birthDate = getParameter(parameters, "birthdate");
    const message = getParameter(parameters, "message");

    const requiredValues = [
        firstName,
        lastName,
        address,
        city,
        state,
        zip,
        phone,
        email,
        birthDate,
        message
    ];

    const informationIsMissing = requiredValues.some(function (value) {
        return value === "";
    });

    if (informationIsMissing) {
        showMissingInformation();
        return;
    }

    const fullName = `${firstName} ${lastName}`;
    const fullLocation = `${city}, ${state} ${zip}`;
    const formattedBirthDate = formatBirthDate(birthDate);

    // Display the information on the confirmation page.
    setText("display-name", fullName);
    setText("display-address", address);
    setText("display-location", fullLocation);
    setText("display-phone", phone);
    setText("display-email", email);
    setText("display-birthdate", formattedBirthDate);
    setText("display-message", message);

    // Add the same information to the hidden email form.
    setValue("email-name", fullName);
    setValue("email-address", address);
    setValue("email-location", fullLocation);
    setValue("email-phone", phone);
    setValue("email-contact", email);
    setValue("email-birthdate", formattedBirthDate);
    setValue("email-message", message);
}

function getParameter(parameters, name) {
    const value = parameters.get(name);

    if (value === null) {
        return "";
    }

    return value.trim();
}

function setText(elementId, value) {
    document.getElementById(elementId).textContent = value;
}

function setValue(elementId, value) {
    document.getElementById(elementId).value = value;
}

function formatBirthDate(dateValue) {
    const dateParts = dateValue.split("-");

    if (dateParts.length !== 3) {
        return dateValue;
    }

    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];

    return `${month}/${day}/${year}`;
}

function showMissingInformation() {
    const errorBox = document.getElementById("missing-information");
    const confirmationDetails =
        document.getElementById("confirmation-details");
    const emailButton = document.getElementById("email-button");
    const errorMessage = document.createElement("p");

    errorMessage.textContent =
        "Form information is missing. Please return to the form and complete every field.";

    errorBox.replaceChildren(errorMessage);
    confirmationDetails.hidden = true;
    emailButton.disabled = true;
}

function returnToForm() {
    // Browser history preserves the user's entries in most browsers.
    window.history.back();
}