Feature: Demo app login

  Scenario: Log in and dismiss the success alert
    Given the demo app tab bar is visible
    When I open the Login tab
    And I open the login form
    And I log in with configured demo credentials
    Then I should see the success message on the native alert
    When I confirm the native alert
