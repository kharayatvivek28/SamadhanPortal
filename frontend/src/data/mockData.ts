export interface Complaint {
  id: string;
  title: string;
  description: string;
  department: string;
  assignedOfficer: string;
  status: "submitted" | "assigned_dept" | "assigned_officer" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  filedBy: string;
  filedDate: string;
  lastUpdated: string;
  timeline: TimelineEntry[];
}

export interface TimelineEntry {
  step: string;
  timestamp: string;
  updatedBy: string;
  remarks: string;
  completed: boolean;
}

export interface Department {
  id: string;
  name: string;
  head: string;
  employeeCount: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  activeComplaints: number;
}

export const departments: Department[] = [
  { id: "D001", name: "Public Works", head: "Rajesh Kumar", employeeCount: 12 },
  { id: "D002", name: "Water Supply", head: "Priya Sharma", employeeCount: 8 },
  { id: "D003", name: "Sanitation", head: "Amit Patel", employeeCount: 15 },
  { id: "D004", name: "Electricity", head: "Sunita Devi", employeeCount: 10 },
  { id: "D005", name: "Roads & Transport", head: "Vikram Singh", employeeCount: 20 },
];

export const employees: Employee[] = [
  { id: "E001", name: "Rahul Verma", email: "rahul@gov.in", department: "Public Works", role: "Officer", activeComplaints: 3 },
  { id: "E002", name: "Sneha Gupta", email: "sneha@gov.in", department: "Water Supply", role: "Officer", activeComplaints: 2 },
  { id: "E003", name: "Manoj Tiwari", email: "manoj@gov.in", department: "Sanitation", role: "Officer", activeComplaints: 5 },
  { id: "E004", name: "Anita Rao", email: "anita@gov.in", department: "Electricity", role: "Senior Officer", activeComplaints: 1 },
  { id: "E005", name: "Deepak Joshi", email: "deepak@gov.in", department: "Roads & Transport", role: "Officer", activeComplaints: 4 },
];

export const complaints: Complaint[] = [
  {
    id: "CMP-2024-001",
    title: "Broken street light on MG Road",
    description: "The street light near MG Road junction has been non-functional for 2 weeks. This poses a safety risk for pedestrians and commuters during night hours. Multiple residents have raised concerns.",
    department: "Electricity",
    assignedOfficer: "Anita Rao",
    status: "resolved",
    priority: "high",
    filedBy: "Citizen User",
    filedDate: "2024-01-15",
    lastUpdated: "2024-01-28",
    timeline: [
      { step: "Complaint Submitted", timestamp: "2024-01-15 09:30", updatedBy: "Citizen User", remarks: "Filed online via portal", completed: true },
      { step: "Assigned to Department", timestamp: "2024-01-15 14:00", updatedBy: "System", remarks: "Routed to Electricity Department", completed: true },
      { step: "Assigned to Officer", timestamp: "2024-01-16 10:00", updatedBy: "Sunita Devi", remarks: "Assigned to Anita Rao for resolution", completed: true },
      { step: "In Progress", timestamp: "2024-01-20 11:30", updatedBy: "Anita Rao", remarks: "Technician dispatched for inspection", completed: true },
      { step: "Resolved", timestamp: "2024-01-28 16:00", updatedBy: "Anita Rao", remarks: "Street light replaced and tested", completed: true },
    ],
  },
  {
    id: "CMP-2024-002",
    title: "Water supply disruption in Sector 5",
    description: "Residents of Sector 5 have been experiencing irregular water supply for the past week. Water pressure is very low during morning hours.",
    department: "Water Supply",
    assignedOfficer: "Sneha Gupta",
    status: "in_progress",
    priority: "high",
    filedBy: "Citizen User",
    filedDate: "2024-02-01",
    lastUpdated: "2024-02-08",
    timeline: [
      { step: "Complaint Submitted", timestamp: "2024-02-01 08:00", updatedBy: "Citizen User", remarks: "Filed via portal", completed: true },
      { step: "Assigned to Department", timestamp: "2024-02-01 12:00", updatedBy: "System", remarks: "Routed to Water Supply Department", completed: true },
      { step: "Assigned to Officer", timestamp: "2024-02-02 09:00", updatedBy: "Priya Sharma", remarks: "Assigned to Sneha Gupta", completed: true },
      { step: "In Progress", timestamp: "2024-02-05 10:00", updatedBy: "Sneha Gupta", remarks: "Pipeline inspection underway", completed: true },
      { step: "Resolved", timestamp: "", updatedBy: "", remarks: "", completed: false },
    ],
  },
  {
    id: "CMP-2024-003",
    title: "Pothole on NH-48 near toll plaza",
    description: "Large pothole on the main highway near the toll plaza causing traffic disruption and accidents. Needs immediate attention.",
    department: "Roads & Transport",
    assignedOfficer: "Deepak Joshi",
    status: "assigned_officer",
    priority: "high",
    filedBy: "Citizen User",
    filedDate: "2024-02-10",
    lastUpdated: "2024-02-12",
    timeline: [
      { step: "Complaint Submitted", timestamp: "2024-02-10 07:00", updatedBy: "Citizen User", remarks: "Filed via portal", completed: true },
      { step: "Assigned to Department", timestamp: "2024-02-10 11:00", updatedBy: "System", remarks: "Routed to Roads & Transport", completed: true },
      { step: "Assigned to Officer", timestamp: "2024-02-12 09:00", updatedBy: "Vikram Singh", remarks: "Assigned to Deepak Joshi", completed: true },
      { step: "In Progress", timestamp: "", updatedBy: "", remarks: "", completed: false },
      { step: "Resolved", timestamp: "", updatedBy: "", remarks: "", completed: false },
    ],
  },
  {
    id: "CMP-2024-004",
    title: "Garbage not collected for 5 days",
    description: "Municipal garbage collection has not happened in Ward 12 for the past 5 days. Garbage is piling up and causing health hazards.",
    department: "Sanitation",
    assignedOfficer: "Manoj Tiwari",
    status: "in_progress",
    priority: "medium",
    filedBy: "Citizen User",
    filedDate: "2024-02-14",
    lastUpdated: "2024-02-18",
    timeline: [
      { step: "Complaint Submitted", timestamp: "2024-02-14 06:30", updatedBy: "Citizen User", remarks: "Filed via portal", completed: true },
      { step: "Assigned to Department", timestamp: "2024-02-14 10:00", updatedBy: "System", remarks: "Routed to Sanitation Department", completed: true },
      { step: "Assigned to Officer", timestamp: "2024-02-15 09:00", updatedBy: "Amit Patel", remarks: "Assigned to Manoj Tiwari", completed: true },
      { step: "In Progress", timestamp: "2024-02-18 08:00", updatedBy: "Manoj Tiwari", remarks: "Cleanup crew dispatched", completed: true },
      { step: "Resolved", timestamp: "", updatedBy: "", remarks: "", completed: false },
    ],
  },
  {
    id: "CMP-2024-005",
    title: "Park maintenance required in Green Colony",
    description: "The public park in Green Colony needs maintenance. Broken benches, overgrown grass, and damaged playground equipment.",
    department: "Public Works",
    assignedOfficer: "Rahul Verma",
    status: "assigned_dept",
    priority: "low",
    filedBy: "Citizen User",
    filedDate: "2024-02-20",
    lastUpdated: "2024-02-20",
    timeline: [
      { step: "Complaint Submitted", timestamp: "2024-02-20 10:00", updatedBy: "Citizen User", remarks: "Filed via portal", completed: true },
      { step: "Assigned to Department", timestamp: "2024-02-20 15:00", updatedBy: "System", remarks: "Routed to Public Works Department", completed: true },
      { step: "Assigned to Officer", timestamp: "", updatedBy: "", remarks: "", completed: false },
      { step: "In Progress", timestamp: "", updatedBy: "", remarks: "", completed: false },
      { step: "Resolved", timestamp: "", updatedBy: "", remarks: "", completed: false },
    ],
  },
];

export const stats = {
  totalComplaints: 1247,
  resolved: 892,
  pending: 203,
  inProgress: 152,
  activeDepartments: 5,
};
