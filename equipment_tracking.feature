# ============================================================
# PROJECT: Heavy Equipment Tracking System
# FIRM: Construction Equipment Management Platform
# VERSION: 1.0.0
# ============================================================
# Modules:
#   1. Equipment Logging
#   2. Site Assignment
#   3. Map Visualization
#   4. Key Checkout Audit Log
# ============================================================


# ──────────────────────────────────────────────────────────────
# FEATURE 1: Equipment Logging
# ──────────────────────────────────────────────────────────────

Feature: Equipment Logging
  As a fleet manager
  I want to register and manage heavy equipment records
  So that the firm has a centralized and up-to-date equipment inventory

  Background:
    Given the fleet manager is authenticated
    And the equipment registry is accessible

  Scenario: Register a new piece of equipment
    Given the fleet manager is on the Equipment Registry page
    When they submit the following equipment details:
      | Field            | Value              |
      | Equipment Name   | Caterpillar 320    |
      | Type             | Excavator          |
      | Serial Number    | CAT-2024-00142     |
      | Status           | Available          |
      | Acquisition Date | 2024-03-15         |
    Then the equipment "Caterpillar 320" should appear in the registry
    And its status should be "Available"
    And a system log entry should be created for the registration

  Scenario: Prevent duplicate equipment registration
    Given equipment with serial number "CAT-2024-00142" already exists
    When the fleet manager attempts to register another equipment with serial number "CAT-2024-00142"
    Then the system should display an error "Equipment with this serial number already exists"
    And no duplicate record should be created

  Scenario: Update equipment details
    Given equipment "Caterpillar 320" exists in the registry
    When the fleet manager updates the status to "Under Maintenance"
    Then the equipment record should reflect the updated status "Under Maintenance"
    And a log entry should record the change with a timestamp

  Scenario: Decommission a piece of equipment
    Given equipment "Caterpillar 320" is currently "Available"
    And it is not assigned to any active site
    When the fleet manager marks it as "Decommissioned"
    Then the equipment should be removed from active assignment eligibility
    And its status should show "Decommissioned" in the registry

  Scenario: Attempt to decommission equipment currently on-site
    Given equipment "Komatsu PC200" is currently assigned to site "Damosa Gateway Phase 2"
    When the fleet manager attempts to decommission it
    Then the system should display a warning "Equipment is currently deployed. Unassign it before decommissioning."
    And the equipment status should remain unchanged

  Scenario Outline: Filter equipment by status
    Given there are equipment records in the registry
    When the fleet manager filters by status "<Status>"
    Then only equipment with status "<Status>" should be displayed

    Examples:
      | Status            |
      | Available         |
      | Deployed          |
      | Under Maintenance |
      | Decommissioned    |


# ──────────────────────────────────────────────────────────────
# FEATURE 2: Site Assignment
# ──────────────────────────────────────────────────────────────

Feature: Site Assignment
  As a site supervisor
  I want to assign and unassign equipment to construction sites
  So that the firm can track which machines are deployed where

  Background:
    Given the site supervisor is authenticated
    And at least one construction site exists in the system
    And at least one piece of equipment with status "Available" exists

  Scenario: Assign equipment to a construction site
    Given equipment "Volvo EC300E" has status "Available"
    And site "SM Davao Expansion Block C" is active
    When the site supervisor assigns "Volvo EC300E" to "SM Davao Expansion Block C"
    Then the equipment status should change to "Deployed"
    And the site record should list "Volvo EC300E" under its assigned equipment
    And an assignment log entry should be created with the supervisor's name and timestamp

  Scenario: Prevent assigning already-deployed equipment
    Given equipment "Volvo EC300E" has status "Deployed"
    When the site supervisor attempts to assign it to another site
    Then the system should display an error "Equipment is already deployed at another site"
    And the assignment should not proceed

  Scenario: Unassign equipment from a construction site
    Given equipment "Volvo EC300E" is assigned to "SM Davao Expansion Block C"
    When the site supervisor unassigns "Volvo EC300E" from the site
    Then the equipment status should revert to "Available"
    And the site record should no longer list "Volvo EC300E"
    And an unassignment log entry should be created with timestamp and reason

  Scenario: View all equipment assigned to a specific site
    Given site "Samal Island Resort Development" has 3 assigned equipment
    When the site supervisor views the site detail page
    Then a list of all 3 assigned equipment should be displayed with their statuses

  Scenario: Assign multiple equipment to the same site
    Given site "Davao River Bridge Rehab" is active
    And the following equipment are "Available":
      | Equipment Name       |
      | Komatsu GD655        |
      | Liebherr LTM 1090-4  |
      | Terex Powerlift 8000 |
    When the site supervisor assigns all three to "Davao River Bridge Rehab"
    Then all three should appear in the site's equipment list with status "Deployed"

  Scenario Outline: Validate site assignment based on equipment status
    Given equipment "<Equipment>" has status "<Status>"
    When the site supervisor attempts to assign it to a site
    Then the system should "<Outcome>"

    Examples:
      | Equipment          | Status            | Outcome                        |
      | Caterpillar 336    | Available         | allow the assignment           |
      | Hitachi ZX350      | Deployed          | show an error and block        |
      | JCB 3CX            | Under Maintenance | show a warning and block       |
      | Hyundai R480LC     | Decommissioned    | show an error and block        |


# ──────────────────────────────────────────────────────────────
# FEATURE 3: Map Visualization
# ──────────────────────────────────────────────────────────────

Feature: Map Visualization
  As a fleet manager or site supervisor
  I want to see equipment locations plotted on a map
  So that I can quickly understand where all machines are deployed across sites

  Background:
    Given the user is authenticated
    And there is at least one active construction site with coordinates on record

  Scenario: View all deployed equipment on the map
    Given there are 5 equipment units deployed across 3 different sites
    When the user navigates to the Equipment Map view
    Then the map should render with markers for all 3 active sites
    And each marker should display the number of equipment deployed at that site

  Scenario: Click a site marker to view equipment details
    Given the map is displaying a marker for site "Damosa Gateway Phase 2"
    When the user clicks the site marker
    Then a popup or side panel should appear showing:
      | Field          | Example Value            |
      | Site Name      | Damosa Gateway Phase 2   |
      | Location       | Lanang, Davao City       |
      | Equipment List | Caterpillar 320, JCB 3CX |
      | Total Units    | 2                        |

  Scenario: Equipment with no site assignment does not appear on the map
    Given equipment "Unused Bulldozer X" has status "Available"
    And it has no site assignment
    When the user views the Equipment Map
    Then "Unused Bulldozer X" should not appear as a marker on the map

  Scenario: Map updates in near real-time when an assignment changes
    Given the map is open and site "Samal Road Project" shows 1 equipment
    When a second equipment is assigned to "Samal Road Project" by a supervisor
    And the map is refreshed
    Then the marker for "Samal Road Project" should now reflect 2 equipment units

  Scenario: View a specific equipment's location from the equipment detail page
    Given the user is viewing the detail page of "Liebherr LTM 1090-4"
    And it is assigned to site "Davao River Bridge Rehab"
    When the user clicks "View on Map"
    Then the map should center on the coordinates of "Davao River Bridge Rehab"
    And the site marker should be highlighted with the equipment info shown

  Scenario: Display fallback when map API is unavailable
    Given the Map API is unreachable
    When the user navigates to the Equipment Map view
    Then the system should display a static placeholder map or a graceful error message
    And it should still display a tabular list of sites and their deployed equipment


# ──────────────────────────────────────────────────────────────
# FEATURE 4: Key Checkout Audit Log
# ──────────────────────────────────────────────────────────────

Feature: Key Checkout Audit Log
  As an operations manager
  I want to record who checks out and returns equipment keys
  So that there is full accountability for equipment access

  Background:
    Given the operations manager or authorized personnel is authenticated
    And the equipment exists in the registry with status "Available" or "Deployed"

  Scenario: Check out a key for a piece of equipment
    Given equipment "Caterpillar 320" is at site "Damosa Gateway Phase 2"
    When worker "Juan dela Cruz" checks out the key for "Caterpillar 320"
    Then an audit log entry should be created with:
      | Field          | Value                     |
      | Equipment      | Caterpillar 320           |
      | Action         | Key Checked Out           |
      | Performed By   | Juan dela Cruz            |
      | Timestamp      | <current datetime>        |
      | Status         | Key Out                   |
    And the equipment key status should be marked as "Key Out"

  Scenario: Return a key for a piece of equipment
    Given the key for "Caterpillar 320" is currently checked out by "Juan dela Cruz"
    When "Juan dela Cruz" returns the key
    Then an audit log entry should be created with:
      | Field          | Value                     |
      | Equipment      | Caterpillar 320           |
      | Action         | Key Returned              |
      | Performed By   | Juan dela Cruz            |
      | Timestamp      | <current datetime>        |
      | Status         | Key In                    |
    And the equipment key status should revert to "Key In"

  Scenario: Prevent double checkout of the same key
    Given the key for "Volvo EC300E" is already checked out by "Maria Santos"
    When "Pedro Reyes" attempts to check out the key for "Volvo EC300E"
    Then the system should display an error "Key is currently checked out by Maria Santos"
    And no new audit log entry should be created for the attempt

  Scenario: View the full audit log for a specific equipment
    Given equipment "Komatsu PC200" has had 5 key checkout events
    When the operations manager views the audit log for "Komatsu PC200"
    Then all 5 entries should be displayed in descending chronological order
    And each entry should include the action, performer, and timestamp

  Scenario: Filter audit log by date range
    Given the audit log contains entries from the past 6 months
    When the operations manager filters the log from "2025-11-01" to "2025-11-30"
    Then only audit entries within that date range should be displayed

  Scenario: Filter audit log by worker name
    Given the audit log contains entries from multiple workers
    When the operations manager searches for entries by "Juan dela Cruz"
    Then only audit entries performed by "Juan dela Cruz" should be displayed

  Scenario: Export audit log as CSV
    Given the audit log has entries for the current month
    When the operations manager clicks "Export to CSV"
    Then a CSV file should be downloaded containing all audit entries with columns:
      | Column       |
      | Equipment    |
      | Action       |
      | Performed By |
      | Timestamp    |
      | Status       |

  Scenario: Unauthorized personnel cannot check out keys
    Given a user with role "Viewer" is authenticated
    When they attempt to check out the key for "Terex Powerlift 8000"
    Then the system should display an error "You do not have permission to perform this action"
    And no audit log entry should be created


# ──────────────────────────────────────────────────────────────
# FEATURE 5: Role-Based Access Control (Cross-Cutting)
# ──────────────────────────────────────────────────────────────

Feature: Role-Based Access Control
  As a system administrator
  I want to enforce role-based permissions across all modules
  So that users can only perform actions appropriate to their role

  Background:
    Given the following roles exist in the system:
      | Role              | Permissions                                          |
      | Admin             | Full access to all modules                           |
      | Fleet Manager     | Equipment logging, map view, audit log read          |
      | Site Supervisor   | Site assignment, map view                            |
      | Operations Manager| Key checkout audit log full access                   |
      | Viewer            | Read-only access to equipment list and map           |

  Scenario Outline: Enforce permissions by role
    Given a user with role "<Role>" is authenticated
    When they attempt to perform "<Action>"
    Then the system should "<Result>"

    Examples:
      | Role              | Action                         | Result                   |
      | Admin             | Register new equipment         | allow the action         |
      | Fleet Manager     | Register new equipment         | allow the action         |
      | Site Supervisor   | Register new equipment         | deny with 403 error      |
      | Viewer            | Register new equipment         | deny with 403 error      |
      | Site Supervisor   | Assign equipment to a site     | allow the action         |
      | Viewer            | Assign equipment to a site     | deny with 403 error      |
      | Operations Manager| Check out an equipment key     | allow the action         |
      | Viewer            | Check out an equipment key     | deny with 403 error      |
      | Viewer            | View the equipment map         | allow the action         |
