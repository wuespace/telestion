Feature: User Authentication System

  Scenario: User logs in
    Given I am logged out
    When I log in
    Then I see a dashboard

  Scenario: User tries to log in with invalid credentials
    Given I am logged out
    When I log in with invalid credentials
    Then I see the login page
    And I see an error message

  Scenario: User logs out
    Given I am logged in
    When I log out
    Then I see the login page

  Scenario: User tries to access a page that requires authentication
    Given I am logged out
    When I visit a page that requires authentication
    Then I see the login page
    And I see an error message

  Scenario: User tries to access the login page when logged in
    Given I am logged in
    When I visit the login page
    Then I see a dashboard
