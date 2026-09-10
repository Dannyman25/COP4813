"use strict";

// Wait until the HTML page has completely loaded.
document.addEventListener("DOMContentLoaded", function () {
    const birthDateField = document.getElementById("birthdate");
    const phoneField = document.getElementById("phone");
    const form = document.getElementById("contact-form");

    // Prevent the date picker from allowing future dates.
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    birthDateField.max = `${year}-${month}-${day}`;

    // Apply the phone-number mask while the user types.
    phoneField.addEventListener("input", formatPhoneNumber);

    //Clear errors when the user begins correcting an entry
    form.addEventListener("input", clearError);

    // Clear any displayed error when the form is reset.
    form.addEventListener("reset", clearError);
});

function validateForm() {
    clearError();

    const firstNameField = document.getElementById("first-name");
    const lastNameField = document.getElementById("last-name");
    const birthDateField = document.getElementById("birthdate");
    const addressField = document.getElementById("street-address");
    const cityField = document.getElementById("city");
    const stateField = document.getElementById("state");
    const zipField = document.getElementById("zip");
    const phoneField = document.getElementById("phone");
    const emailField = document.getElementById("email");
    const messageField = document.getElementById("message");
    const confirmationField = document.getElementById("confirm");

    // Each validation function checks one specific requirement.
    if (!validateNotBlank(firstNameField, "First Name")) {
        return false;
    }

    if (!validateName(firstNameField, "First Name")) {
        return false;
    }

    if (!validateNotBlank(lastNameField, "Last Name")) {
        return false;
    }

    if (!validateName(lastNameField, "Last Name")) {
        return false;
    }

    if (!validateBirthDate(birthDateField)) {
        return false;
    }

    if (!validateAddress(addressField)) {
        return false;
    }

    if (!validateCity(cityField)) {
        return false;
    }

    if (!validateState(stateField)) {
        return false;
    }

    if (!validateZip(zipField)) {
        return false;
    }

    if (!validatePhone(phoneField)) {
        return false;
    }

    if (!validateEmail(emailField)) {
        return false;
    }

    if (!validateMessage(messageField)) {
        return false;
    }

    if (!validateConfirmation(confirmationField)) {
        return false;
    }

    // Returning true allows the form to open confirmation.html.
    return true;
}

function validateNotBlank(field, label) {
    if (field.value.trim() === "") {
        showError(`Please enter a value for ${label}.`, field);
        return false;
    }

    return true;
}

function validateName(field, label) {
    const namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;

    if (!namePattern.test(field.value.trim())) {
        showError(
            `${label} may contain only letters, spaces, hyphens, or apostrophes.`,
            field
        );
        return false;
    }

    return true;
}

function validateBirthDate(field) {
    if (!validateNotBlank(field, "Birth Date")) {
        return false;
    }

    const dateParts = field.value.split("-");

    if (dateParts.length !== 3) {
        showError("Please enter a valid birth date.", field);
        return false;
    }

    const birthYear = Number(dateParts[0]);
    const birthMonth = Number(dateParts[1]);
    const birthDay = Number(dateParts[2]);

    const birthDate = new Date(
        birthYear,
        birthMonth - 1,
        birthDay
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const earliestReasonableDate = new Date();
    earliestReasonableDate.setFullYear(today.getFullYear() - 120);

    const dateIsReal =
        birthDate.getFullYear() === birthYear &&
        birthDate.getMonth() === birthMonth - 1 &&
        birthDate.getDate() === birthDay;

    if (!dateIsReal) {
        showError("Please enter a real calendar date.", field);
        return false;
    }

    if (birthDate > today) {
        showError("Birth Date cannot be in the future.", field);
        return false;
    }

    if (birthDate < earliestReasonableDate) {
        showError(
            "Please check the birth date. The entered date appears unreasonable.",
            field
        );
        return false;
    }

    return true;
}

function validateAddress(field) {
    const addressPattern =
        /^\d+\s+[A-Za-z0-9][A-Za-z0-9\s.'#-]*$/;

    if (!validateNotBlank(field, "Street Address")) {
        return false;
    }

    if (!addressPattern.test(field.value.trim())) {
        showError(
            "Please enter a street number followed by a street name.",
            field
        );
        return false;
    }

    return true;
}

function validateCity(field) {
    const cityPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ.' -]+$/;

    if (!validateNotBlank(field, "City")) {
        return false;
    }

    if (!cityPattern.test(field.value.trim())) {
        showError(
            "Please enter a valid city using letters, spaces, hyphens, or apostrophes.",
            field
        );
        return false;
    }

    return true;
}

function validateState(field) {
    const validStates = [
        "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE",
        "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS",
        "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS",
        "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY",
        "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
        "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV",
        "WI", "WY", "DC"
    ];

    const state = field.value.trim().toUpperCase();

    if (!validStates.includes(state)) {
        showError(
            "Please enter a valid two-letter state abbreviation.",
            field
        );
        return false;
    }

    // Store the abbreviation using uppercase letters.
    field.value = state;
    return true;
}

function validateZip(field) {
    const zipPattern = /^\d{5}(-\d{4})?$/;

    if (!zipPattern.test(field.value.trim())) {
        showError(
            "Please enter a five-digit ZIP Code, such as 32114.",
            field
        );
        return false;
    }

    return true;
}

function validatePhone(field) {
    const phonePattern = /^\(\d{3}\)\d{3}-\d{4}$/;

    if (!phonePattern.test(field.value.trim())) {
        showError(
            "Please enter a complete 10-digit phone number in the format (000)000-0000.",
            field
        );
        return false;
    }

    return true;
}

function validateEmail(field) {
    const emailPattern =
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!emailPattern.test(field.value.trim())) {
        showError(
            "Please enter a valid email address in the format name@domain.extension.",
            field
        );
        return false;
    }

    return true;
}

function validateMessage(field) {
    if (!validateNotBlank(field, "Message")) {
        return false;
    }

    if (field.value.trim().length < 5) {
        showError(
            "Please enter a message containing at least five characters.",
            field
        );
        return false;
    }

    return true;
}

function validateConfirmation(field) {
    if (field.value.trim() !== "10") {
        showError(
            "The human-verification answer is incorrect. Please try again.",
            field
        );
        return false;
    }

    return true;
}

function formatPhoneNumber(event) {
    const field = event.target;

    // Remove everything except numbers and retain only 10 digits.
    const digits = field.value.replace(/\D/g, "").slice(0, 10);

    if (digits.length === 0) {
        field.value = "";
    } else if (digits.length <= 3) {
        field.value = `(${digits}`;
    } else if (digits.length <= 6) {
        field.value =
            `(${digits.slice(0, 3)})${digits.slice(3)}`;
    } else {
        field.value =
            `(${digits.slice(0, 3)})` +
            `${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
}

function showError(message, field) {
    const errorBox = document.getElementById("form-errors");
    const errorMessage = document.createElement("p");

    errorMessage.textContent = message;
    errorBox.replaceChildren(errorMessage);

    field.focus();
    field.setAttribute("aria-invalid", "true");

    errorBox.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function clearError() {
    const errorBox = document.getElementById("form-errors");

    errorBox.replaceChildren();

    document.querySelectorAll("[aria-invalid='true']")
        .forEach(function (field) {
            field.removeAttribute("aria-invalid");
        });
}