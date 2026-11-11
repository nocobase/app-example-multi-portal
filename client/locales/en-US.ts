import fileUi from '../extensions/nocobase-file-component-ui/locales/en-US.js';
import type { LocaleResource } from '@nocobase/i18n';

import systemEnUS from './system/en-US.js';

const enUS = {
  // The template's own copy: the shell, the sign-in pages, shared components and the homepage. Keep it in
  // `./system/` so a template upgrade can replace it without touching the application's copy below.
  ...systemEnUS,
  ...fileUi,
  servicehub: {
    overview: 'Overview',
    ticketQueue: 'Ticket queue',
    engineerTeam: 'Field team',
    serviceOverview: 'Service overview',
    completedWork: 'Completed work',
    currentPortal: 'Current portal',
    allWorkspaces: 'All workspaces',
    portalNavigation: 'Portal navigation',
    teamHint: 'Workload across your field team',
    activeAssignments: 'active assignments',
    availableForAssignment: 'Ready for the next assignment',
    teamAssignmentHint:
      'Open a ticket to review its progress. Assign new requests from the ticket queue.',
    pipeline: 'Service pipeline',
    pipelineHint: 'A live view of every stage in the service journey.',
    locations: 'Customer locations',
    locationsHint: 'Completed tickets / total tickets, by location.',
    customerPromise: 'CARE THAT KEEPS YOU OPEN',
    customerWelcome: 'Good service starts here.',
    customerWelcomeDescription:
      'Your equipment, your requests, and the people keeping your business moving — all in one place.',
    trackRequests: 'Track my requests',

    equipmentService: 'Equipment service',
    accessPortal: 'Access portal',
    acceptTask: 'Accept task',

    customerPortal: 'Customer portal',
    keepYourEquipmentRunning: 'Keep your equipment running.',
    dispatchConsole: 'Dispatch console',
    keepEveryServiceRequestMoving: 'Keep every service request moving.',
    engineerWorkspace: 'Engineer workspace',
    yourTasksYourNextMove: 'Your tasks. Your next move.',
    serviceInsights: 'Service insights',
    seeHowYourServiceTeamIsPerforming:
      'See how your service team is performing.',
    youDoNotHaveAccessSignIn:
      'You do not have access. Sign in with the appropriate demo account.',
    unableToCompleteThisActionRefreshAnd:
      'Unable to complete this action. Refresh and try again.',
    servicehubEquipmentServices: 'SERVICEHUB / EQUIPMENT SERVICES',
    oneServiceHub: 'One service hub.',
    aWorkspaceForEveryRole: 'A workspace for every role.',
    fromTheFirstRequestToTheFinal:
      'From the first request to the final fix, connect customers and service teams.',
    loadingYourWorkspace: 'Loading your workspace…',
    openPortal: 'Open portal',
    portalManagement: 'Portal management',
    restoreDemoData: 'Restore demo data',
    restoreDemoDataAlt: 'Restore demo data?',
    replaceDemoDevicesTicketsAndServiceHistory:
      'Replace demo devices, tickets, and service history with the original 12 tickets. Accounts, roles, and portal installations will be kept.',
    cancel: 'Cancel',
    restoring: 'Restoring…',
    restoreData: 'Restore data',
    theServiceJourney: 'THE SERVICE JOURNEY',
    reportAFault: 'Report a fault',
    assignAnEngineer: 'Assign an engineer',
    resolveTheIssue: 'Resolve the issue',
    confirmAndRate: 'Confirm and rate',
    oneTicketEachRoleSeesWhatMatters:
      'One ticket. Each role sees what matters to them.',
    assignEngineer: 'Assign engineer',
    acceptAndStart: 'Accept and start',
    submitResolution: 'Submit resolution',
    confirmAndRateAlt: 'Confirm and rate',
    workbench: '/ Workbench',
    switchPortal: 'Switch portal',
    engineer: 'Engineer',
    reportAFaultAlt: 'Report a fault',
    loadingServiceRecords: 'Loading service records…',
    thisPortalIsUnavailable: 'This portal is unavailable',
    checkThatYourAccountHasAccessAnd:
      'Check that your account has access and an administrator has installed this portal.',
    reload: 'Reload',
    myDevices: 'My devices',
    openTickets: 'Open tickets',
    liveServiceRecords: 'Live service records',
    inProgress: 'In progress',
    yourTeamIsOnIt: 'Your team is on it',
    completed: 'Completed',
    everyRequestResolved: 'Every request, resolved',
    keepYourBusinessMoving: 'Keep your business moving',
    covered: 'Covered',
    myServiceTasks: 'My service tasks',
    serviceRecords: 'Service records',
    serviceTickets: 'Service tickets',
    searchTickets: 'Search tickets',
    searchTicketsIssuesOrLocations: 'Search tickets, issues, or locations',
    all: 'All',
    unassigned: 'Unassigned',
    assigned: 'Assigned',
    inProgressAlt: 'In progress',
    awaitingReview: 'Awaiting review',
    completedAlt: 'Completed',
    noTicketsHereYet: 'No tickets here yet',
    tryADifferentSearch: 'Try a different search.',
    chooseAnotherFilterToSeeMoreService:
      'Choose another filter to see more service records.',
    viewTask: 'View task',
    ticket: 'Ticket',
    customerDevice: 'Customer / Device',
    status: 'Status',
    actions: 'Actions',
    urgent: 'Urgent',
    viewDetails: 'View details',
    assignEngineerAlt: 'Assign engineer',
    confirmAndRateAltAlt: 'Confirm and rate',
    device: 'Device',
    serviceEngineer: 'Service engineer',
    unassignedAlt: 'Unassigned',
    issueDescription: 'Issue description',
    resolution: 'Resolution',
    describeTheCauseRepairAndTestResults:
      'Describe the cause, repair, and test results',
    serviceRating: 'Service rating',
    excellent: 'Excellent',
    good: 'Good',
    couldBeBetter: 'Could be better',
    close: 'Close',
    submitting: 'Submitting…',
    reportAnEquipmentIssue: 'Report an equipment issue',
    tellUsWhatHappenedSoWeCan:
      'Tell us what happened so we can arrange the right support.',
    deviceAlt: 'Device',
    issueTitle: 'Issue title',
    forExampleEspressoMachineNotHeating:
      'For example: Espresso machine not heating',
    description: 'Description',
    describeTheIssueAndWhenItStarted: 'Describe the issue and when it started',
    priority: 'Priority',
    normalBusinessCanContinue: 'Normal · Business can continue',
    urgentBusinessIsDisrupted: 'Urgent · Business is disrupted',
    submitRequest: 'Submit request',
    servicehubServiceThatComesFullCircle:
      'ServiceHub · Service that comes full circle',
    greeting: 'Hello, {{name}}',
    recordCount_one: '{{count}} record',
    recordCount_other: '{{count}} records',
    ticketActions: 'Actions for {{id}}',
    ratingResult: 'Service rating: {{rating}}',
  },
  multiPortal: {
    catalog: 'Portal management',
    description:
      "Manage this application's portals and their installation status.",
  },
  // The application's copy goes here, one group per feature. A shared group such as `navigation` is extended by
  // spreading the system one first, `navigation: { ...systemEnUS.navigation, orders: 'Orders' }`, since a group
  // written here replaces the system group of the same name rather than merging with it.
};

/**
 * The shape every locale of this application follows, derived from the English wording above.
 *
 * Anything a plugin does not translate falls back to this namespace, so a term defined here is reused everywhere
 * without each plugin repeating it.
 */
export type AppResource = LocaleResource<typeof enUS>;

export default enUS;
