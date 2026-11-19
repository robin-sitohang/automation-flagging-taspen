@flagging-home
Feature: Flagging Taspen

  Background:
    Given I open the Flagging Taspen login page
    When I log in to Flagging Taspen with credentials from environment
    Then the Google Authenticator verification modal is displayed

  Scenario: Verify home page, checking data, and booking from Excel
    # Enter the 6-digit OTP manually in the browser, then click "Verifikasi OTP"
    Then the Flagging Taspen home page is displayed
    When I open the Checking Data menu
    Then the Checking Data page is displayed
    When I process the NOPEN list from the Excel file
    Then the booking result is saved to the Excel file