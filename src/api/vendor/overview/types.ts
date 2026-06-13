export interface VendorOverviewMetric {
  label: string;
  value: number;
  note?: string;
}

export interface VendorOverviewSeries {
  name: string;
  values: number[];
}

export interface VendorOverviewAuthorizationChart {
  months: string[];
  series: VendorOverviewSeries[];
}

export interface VendorOverviewReminder {
  title: string;
  description?: string;
}

export interface VendorOverviewTodo {
  type: string;
  customer: string;
  description: string;
  action: string;
  path: string;
}

export interface VendorOverviewVO {
  metrics?: VendorOverviewMetric[];
  authorizationChart?: VendorOverviewAuthorizationChart;
  reminders?: VendorOverviewReminder[];
  todos?: VendorOverviewTodo[];
}
