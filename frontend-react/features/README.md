# Cucumber / Gherkin based tests

## Introduction

This directory contains the Cucumber / Gherkin based tests for the project.

## Writing tests

The tests are written in the [Gherkin](https://cucumber.io/docs/gherkin/) language. The tests are located in
the `features` directory.

- Write in First Person: The Gherkin scenarios in the example are written from the first-person perspective. Phrases
  like "I am a new user" and "I see the new user page" are used, referring to the actor (user or system) performing the
  action.
- Clear Titles: Each Gherkin feature and scenario should have a clear, concise, and descriptive title. For example, "
  Migration" is the title of the feature, and it's clear what this feature is about. Scenarios like "The user data
  exists, but is out of date" gives a clear context of the situation being tested.
- Use Given, When, Then, And, But Structure: Gherkin follows a simple 'Given-When-Then' structure for scenarios. The
  Given part describes the preconditions, the When part describes an action, and the Then part describes the expected
  result.
- Be Specific in Then Statements: When writing the expected outcome (Then), be specific about what you 'see'. For
  example, rather than saying "Then I am logged in", specify what this looks like to the user: "Then I see a dashboard".
- Use And for Additional Statements: If you need to add additional context, events, or outcomes in the Gherkin script,
  use And. For example, "And I have the option to import my data".
- Use But to Contrast a Statement: Use But to represent a negative statement. For example, "But I do not have the option
  to use the default user data".
- Focus on User's Intent: Gherkin scripts should focus on what the user is trying to achieve, not on the detailed steps.
  Group user behaviors into meaningful actions when possible. For example, instead of scripting every click to reach a
  page, just write "When I log in".
- Make Assertions: Assert the outcomes with Then to ensure that the system behaves as expected. For example, "Then I see
  a dashboard".
