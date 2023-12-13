Feature: Migration

  Scenario: The user data exists and is up to date
    Given I am an existing user
    And My user data is up to date
    And I have a dashboard
    When I log in
    Then I see a dashboard

  Scenario: The user data exists, but is out of date
    Given I am an existing user
    And My user data is out of date
    And I have a dashboard
    When I log in
    Then I see the migration page
    And I can migrate my data
    When I migrate my data
    Then I see a dashboard

  Scenario: A new user signs in, and the developer has provided default user data
    Given I am a new user
    And Default user data exists
    When I log in
    Then I see the new user page
    And I have the option to import my data
    And I have the option to create a new dashboard
    And I have the option to use the default user data

  Scenario: A new user signs in, and the developer has not provided default user data
    Given I am a new user
    And No default user data exists
    When I log in
    Then I see the new user page
    And I have the option to import my data
    And I have the option to create a new dashboard
    But I do not have the option to use the default user data

  Scenario: A new user imports their user data from a local file
    Given I am a new user
    And I have the option to import my data
    When I log in
    Then I see the new user page
    And I have the option to import my data
    When I start by importing my data
    Then I see a dashboard

  Scenario: A new user starts by creating a new dashboard
    Given I am a new user
    When I log in
    Then I see the new user page
    And I have the option to create a new dashboard
    When I create a new dashboard
    Then I see the dashboard editor

  Scenario: A new user starts by using the default user data provided by the developer
    Given I am a new user
    And Default user data exists
    When I log in
    Then I see the new user page
    And I have the option to use the default user data
    When I start from the default user data
    Then I see a dashboard

  Scenario: A user logs in and has user data, but no dashboard
    Given I am an existing user
    And My user data is up to date
    And I do not have a dashboard
    When I log in
    Then I see the message "No Dashboard Available"
    And I have the option to create a new dashboard