"use strict";

let advisorData = null;

const completedCourses = new Set();
const plannedCourses = new Set();

const completedCount = document.getElementById("completed-count");
const availableCount = document.getElementById("available-count");
const plannedCount = document.getElementById("planned-count");

const choiceGroupsContainer = document.getElementById("choice-groups");
const courseListContainer = document.getElementById("course-list");
const availableCoursesContainer = document.getElementById("available-courses");
const coursePlanContainer = document.getElementById("course-plan");
const advisorMessage = document.getElementById("advisor-message");
const resetButton = document.getElementById("reset-button");

/*
    Load the course information from courses.json.
*/
fetch("courses.json")
    .then(function (response) {
        if (!response.ok) {
            throw new Error("The course data could not be loaded.");
        }

        return response.json();
    })
    .then(function (data) {
        advisorData = data;
        renderAdvisor();
    })
    .catch(function (error) {
        advisorMessage.textContent =
            "Course information could not be loaded. Open this page with Live Server.";

        advisorMessage.classList.add("error-message");
        console.error(error);
    });

/*
    Determine whether a prerequisite rule has been completed.

    A rule can contain:
    - A course code
    - An "all" list for AND requirements
    - An "any" list for OR requirements
*/
function prerequisitesMet(rule) {
    if (!rule) {
        return true;
    }

    if (typeof rule === "string") {
        return completedCourses.has(rule);
    }

    if (Array.isArray(rule)) {
        return rule.every(prerequisitesMet);
    }

    if (rule.all) {
        return rule.all.every(prerequisitesMet);
    }

    if (rule.any) {
        return rule.any.some(prerequisitesMet);
    }

    return true;
}

/*
    Convert a prerequisite rule into readable text.
*/
function describePrerequisites(rule) {
    if (!rule) {
        return "No prerequisites";
    }

    if (typeof rule === "string") {
        return rule;
    }

    if (Array.isArray(rule)) {
        return rule.map(describePrerequisites).join(" AND ");
    }

    if (rule.all) {
        return rule.all
            .map(function (requirement) {
                const description = describePrerequisites(requirement);

                if (requirement.any) {
                    return "(" + description + ")";
                }

                return description;
            })
            .join(" AND ");
    }

    if (rule.any) {
        return rule.any
            .map(describePrerequisites)
            .join(" OR ");
    }

    return "No prerequisites";
}

/*
    Find a choice group using its ID.
*/
function getChoiceGroup(groupId) {
    return advisorData.choiceGroups.find(function (group) {
        return group.id === groupId;
    });
}

/*
    Determine whether another course in an exclusive choice group
    has already been completed or planned.
*/
function choiceIsBlocked(course, includePlan) {
    if (!course.choiceGroup) {
        return false;
    }

    const group = getChoiceGroup(course.choiceGroup);

    if (!group || !group.exclusive) {
        return false;
    }

    return group.courses.some(function (courseCode) {
        if (courseCode === course.code) {
            return false;
        }

        if (completedCourses.has(courseCode)) {
            return true;
        }

        return includePlan && plannedCourses.has(courseCode);
    });
}

/*
    Return all courses currently available to the student.
*/
function getAvailableCourses() {
    return advisorData.courses.filter(function (course) {
        const alreadyCompleted = completedCourses.has(course.code);
        const alreadyPlanned = plannedCourses.has(course.code);
        const meetsRequirements = prerequisitesMet(course.prerequisites);
        const blockedChoice = choiceIsBlocked(course, true);

        return (
            !alreadyCompleted &&
            !alreadyPlanned &&
            meetsRequirements &&
            !blockedChoice
        );
    });
}

/*
    Render information about the program's choice groups.
*/
function renderChoiceGroups() {
    choiceGroupsContainer.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = "Course Choice Rules";
    choiceGroupsContainer.appendChild(heading);

    advisorData.choiceGroups.forEach(function (group) {
        const groupCard = document.createElement("article");
        groupCard.className = "choice-group-card";

        const groupTitle = document.createElement("h4");
        groupTitle.textContent = group.name;

        const groupNote = document.createElement("p");
        groupNote.textContent = group.note;

        const groupCourses = document.createElement("p");
        groupCourses.className = "choice-course-codes";
        groupCourses.textContent = group.courses.join(" or ");

        groupCard.append(groupTitle, groupNote, groupCourses);
        choiceGroupsContainer.appendChild(groupCard);
    });
}

/*
    Create the details area shared by the course cards.
*/
function createCourseDetails(course) {
    const details = document.createElement("div");
    details.className = "course-details";
    details.hidden = true;

    const credits = document.createElement("p");
    credits.textContent = "Credits: " + course.credits;

    const offered = document.createElement("p");
    offered.textContent = "Usually offered: " + course.offered.join(", ");

    const prerequisites = document.createElement("p");
    prerequisites.textContent =
        "Prerequisites: " +
        describePrerequisites(course.prerequisites);

    const note = document.createElement("p");
    note.textContent = "Note: " + course.note;

    details.append(credits, offered, prerequisites, note);

    return details;
}

/*
    Create a button that shows or hides a course's details.
*/
function createDetailsButton(details) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "details-button";
    button.textContent = "View Details";
    button.setAttribute("aria-expanded", "false");

    button.addEventListener("click", function () {
        details.hidden = !details.hidden;

        const isOpen = !details.hidden;
        button.textContent = isOpen ? "Hide Details" : "View Details";
        button.setAttribute("aria-expanded", String(isOpen));
    });

    return button;
}

/*
    Create a course card for the complete course list.
*/
function createCompletionCard(course) {
    const card = document.createElement("article");
    card.className = "course-card";

    const isCompleted = completedCourses.has(course.code);
    const isBlocked = choiceIsBlocked(course, false);

    if (isCompleted) {
        card.classList.add("completed-course");
    }

    if (isBlocked) {
        card.classList.add("blocked-course");
    }

    const title = document.createElement("h3");
    title.textContent = course.code + " - " + course.title;

    const status = document.createElement("p");
    status.className = "course-status";

    if (isCompleted) {
        status.textContent = "Completed";
    } else if (isBlocked) {
        status.textContent = "Alternative requirement already completed";
    } else if (prerequisitesMet(course.prerequisites)) {
        status.textContent = "Available";
    } else {
        status.textContent = "Prerequisites not yet completed";
    }

    const selectionLabel = document.createElement("label");
    selectionLabel.className = "completion-label";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isCompleted;
    checkbox.disabled = isBlocked;

    const labelText = document.createElement("span");
    labelText.textContent = " I have completed this course";

    checkbox.addEventListener("change", function () {
        if (checkbox.checked) {
            completedCourses.add(course.code);
            plannedCourses.delete(course.code);

            advisorMessage.textContent =
                course.code + " was marked as completed.";
        } else {
            completedCourses.delete(course.code);

            advisorMessage.textContent =
                course.code + " was removed from completed courses.";
        }

        removeInvalidPlannedCourses();
        renderAdvisor();
    });

    selectionLabel.append(checkbox, labelText);

    const details = createCourseDetails(course);
    const detailsButton = createDetailsButton(details);

    card.append(
        title,
        status,
        selectionLabel,
        detailsButton,
        details
    );

    return card;
}

/*
    Render every course from the JSON data.
*/
function renderCourseList() {
    courseListContainer.replaceChildren();

    const sortedCourses = [...advisorData.courses].sort(function (a, b) {
        return a.code.localeCompare(b.code);
    });

    sortedCourses.forEach(function (course) {
        const card = createCompletionCard(course);
        courseListContainer.appendChild(card);
    });
}

/*
    Create a card for a course that can be added to the plan.
*/
function createAvailableCourseCard(course) {
    const card = document.createElement("article");
    card.className = "course-card available-course";

    const title = document.createElement("h3");
    title.textContent = course.code + " - " + course.title;

    const prerequisiteText = document.createElement("p");
    prerequisiteText.textContent =
        "Prerequisites: " +
        describePrerequisites(course.prerequisites);

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "primary-button";
    addButton.textContent = "Add to Plan";

    addButton.addEventListener("click", function () {
        plannedCourses.add(course.code);

        advisorMessage.textContent =
            course.code + " was added to your course plan.";

        renderAdvisor();
    });

    const details = createCourseDetails(course);
    const detailsButton = createDetailsButton(details);

    card.append(
        title,
        prerequisiteText,
        addButton,
        detailsButton,
        details
    );

    return card;
}

/*
    Render courses for which all prerequisites have been met.
*/
function renderAvailableCourses() {
    availableCoursesContainer.replaceChildren();

    const availableCourses = getAvailableCourses();

    if (availableCourses.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent =
            "No additional courses are currently available.";

        availableCoursesContainer.appendChild(message);
        return;
    }

    availableCourses.forEach(function (course) {
        const card = createAvailableCourseCard(course);
        availableCoursesContainer.appendChild(card);
    });
}

/*
    Render courses that the student added to the plan.
*/
function renderCoursePlan() {
    coursePlanContainer.replaceChildren();

    if (plannedCourses.size === 0) {
        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent =
            "No courses have been added to your plan.";

        coursePlanContainer.appendChild(message);
        return;
    }

    plannedCourses.forEach(function (courseCode) {
        const course = advisorData.courses.find(function (item) {
            return item.code === courseCode;
        });

        if (!course) {
            return;
        }

        const planItem = document.createElement("article");
        planItem.className = "plan-item";

        const courseInformation = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = course.code + " - " + course.title;

        const details = document.createElement("p");
        details.textContent =
            course.credits +
            " credits | Offered: " +
            course.offered.join(", ");

        courseInformation.append(title, details);

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "remove-button";
        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", function () {
            plannedCourses.delete(course.code);

            advisorMessage.textContent =
                course.code + " was removed from your course plan.";

            renderAdvisor();
        });

        planItem.append(courseInformation, removeButton);
        coursePlanContainer.appendChild(planItem);
    });
}

/*
    Remove planned courses if changing completed courses causes
    their prerequisites or choice rules to become invalid.
*/
function removeInvalidPlannedCourses() {
    plannedCourses.forEach(function (courseCode) {
        const course = advisorData.courses.find(function (item) {
            return item.code === courseCode;
        });

        if (
            !course ||
            !prerequisitesMet(course.prerequisites) ||
            choiceIsBlocked(course, false)
        ) {
            plannedCourses.delete(courseCode);
        }
    });
}

/*
    Update the numbers shown near the top of the page.
*/
function updateSummary() {
    completedCount.textContent = completedCourses.size;
    availableCount.textContent = getAvailableCourses().length;
    plannedCount.textContent = plannedCourses.size;
}

/*
    Rebuild the interface whenever the user's selections change.
*/
function renderAdvisor() {
    renderChoiceGroups();
    renderCourseList();
    renderAvailableCourses();
    renderCoursePlan();
    updateSummary();
}

/*
    Clear all completed and planned courses.
*/
resetButton.addEventListener("click", function () {
    completedCourses.clear();
    plannedCourses.clear();

    advisorMessage.textContent =
        "All completed courses and planned courses were cleared.";

    renderAdvisor();
});