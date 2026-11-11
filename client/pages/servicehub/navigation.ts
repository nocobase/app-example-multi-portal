import {
  Coffee,
  LayoutDashboard,
  ClipboardList,
  Users,
  Wrench,
  History,
  ChartNoAxesCombined,
} from 'lucide-react';
export const portalTitles = {
  customer: 'customerPortal',
  dispatch: 'dispatchConsole',
  engineer: 'engineerWorkspace',
  insights: 'serviceInsights',
} as const;
export const portalPages = {
  customer: [
    { path: '', title: 'overview', icon: LayoutDashboard },
    { path: '/devices', title: 'myDevices', icon: Coffee },
    { path: '/requests', title: 'serviceTickets', icon: ClipboardList },
  ],
  dispatch: [
    { path: '', title: 'ticketQueue', icon: ClipboardList },
    { path: '/team', title: 'engineerTeam', icon: Users },
    { path: '/overview', title: 'serviceOverview', icon: ChartNoAxesCombined },
  ],
  engineer: [
    { path: '', title: 'myServiceTasks', icon: Wrench },
    { path: '/history', title: 'completedWork', icon: History },
  ],
  insights: [{ path: '', title: 'serviceOverview', icon: ChartNoAxesCombined }],
};
