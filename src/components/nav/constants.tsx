import { Icon } from '@iconify/react';

import { SideNavItem } from "./types";

export const SIDENAV_ITEMS: SideNavItem[] = [
  
  {
    title: "Home",
    name: "home",
    path: "/",
    icon: <Icon icon="mdi:home" />,
    content: "Home page with latest updates and announcements",
    submenu: false,
    allowedRoles: ["admin", "user"],
  },
  {
    title: "General",
    name: "general",
    path: "/general/",
    submenu: true,
    icon: <Icon icon="mdi:chart-box-outline" />,
    allowedRoles: ["admin", "user"],
    subMenuItems: [
      { 
        title: "Lane Miles", 
        name: "lane-miles",
        path: "/general/lane-miles/", 
        content: "Lane miles vs Year chart for specific combinations of filter",
        size: `13px`
      },
      {
        // New nested PMIS Data item with two submenu options
        title: "PMIS Data",
        name: "pmis-data",
        // Optionally you may leave the parent path empty (or assign a fallback route)
        path: "/general/pmis/",
        submenu: true,
        size: `13px`,
        subMenuItems: [
          {
            title: "Highway Heatmaps",
            name: "highway-heatmaps",
            path: "/general/pmis/highway-heatmaps/",
            content: "Highway Condition & Traffic Analysis",
            size: `13px`
          },
          {
            title: "Condition Analysis",
            name: "condition-analysis",
            path: "/general/pmis/condition-analysis/",
            content: "Distress Score (DS), Ride Score (RS), and Condition Score (= DS*RS)",
            size: `13px`
          }
        ]
      },
      { 
        title: "Traffic Data", 
        name: "traffic-data",
        path: "/general/traffic-data/", 
        content: "Average Annual Daily Traffic (AADT), Truck Percentage displayed as data points on a map, and Truck Percentage (Plot View)",
        size: `13px`
      },
    ],
  },  
  {
    title: "Level 1 Sections",
    name: "level_one",
    path: "/level_one_sections/",
    submenu: false,
    icon: <Icon icon="mdi:numeric-1-box-outline" />,
    allowedRoles: ["admin", "user", "guest"],
  },
  {
    title: "Special Sections",
    name: "special",
    path: "/special_sections/",
    submenu: true,
    icon: <Icon icon="mdi:star-outline" />,
    allowedRoles: ["admin", "user", "guest"],
    subMenuItems: [
      {
        title: "Active Crack Control",
        name: "active_crack_control_sections",
        path: "/special_sections/active_crack_control_sections",
        content: "Explore active crack control test sections",
        size: `13px`
      },
      {
        title: "Bonded Concrete Overlay",
        name: "bonded_concrete_overlay",
        path: "/special_sections/bonded_concrete_overlay/",
        content: "Manage bonded overlay sections",
        size: `13px`
      },
      {
        title: "Cast-in-Place Prestressed Pavement",
        name: "cast-in-place_prestressed_pavement",
        path: "/special_sections/cast-in-place_prestressed_pavement/",
        content: "Analyze prestressed pavement data",
        size: `13px`
      },
      {
        title: "Fast Track CRCP",
        name: "fast_track_CRCP",
        path: "/special_sections/fast_track_CRCP/",
        content: "View fast track CRCP test data",
        size: `13px`
      },
      {
        title: "LTPP Sections",
        name: "LTPP_sections",
        path: "/special_sections/LTPP_sections/",
        content: "Explore LTPP experimental data",
        size: `13px`
      },
      {
        title: "Next Generation Concrete Surfacing",
        name: "next_generation_concrete_surfacing",
        path: "/special_sections/next_generation_concrete_surfacing/",
        content: "Analyze NGCS performance data",
        size: `13px`
      },
      {
        title: "Precast Concrete Pavement",
        name: "precast_pavement",
        path: "/special_sections/precast_pavement/",
        content: "Explore precast pavement sections",
        size: `13px`
      },
      {
        title: "Recycled Concrete Aggregates",
        name: "recycled_concrete_aggregate_pavement",
        path: "/special_sections/recycled_concrete_aggregate_pavement/",
        content: "View recycled aggregates test sites",
        size: `13px`
      },
      {
        title: "Roller Compacted Concrete Pavement",
        name: "roller_compacted_concrete_pavement",
        path: "/special_sections/roller_compacted_concrete_pavement/",
        content: "Explore RCCP implementation data",
        size: `13px`
      },
      {
        title: "Two-Lift CRCP",
        name: "two_lift_CRCP",
        path: "/special_sections/two_lift_CRCP/",
        content: "Study two-lift CRCP test sections",
        size: `13px`
      },
      {
        title: "Unbonded Concrete Overlay",
        name: "unbonded_concrete_overlay",
        path: "/special_sections/unbonded_concrete_overlay/",
        content: "Review UBCO test and design data",
        size: `13px`
      },
      {
        title: "Whitetopping",
        name: "whitetopping",
        path: "/special_sections/whitetopping/",
        content: "Analyze whitetopping performance",
        size: `13px`
      }
    ],    
  },
  {
    title: "Experimental Sections",
    name: "experimental",
    path: "/experimental_sections/",
    submenu: true,
    icon: <Icon icon="mdi:flask-outline" />,
    allowedRoles: ["admin", "user", "guest"],
    subMenuItems: [
      {
        title: "Aggregate Effects",
        name: "aggregate_effects",
        path: "/experimental_sections/aggregate_effects/",
        content: "View your dashboard and key metrics",
        size: `13px`
      },
      {
        title: "One vs Two Mat",
        name: "one_vs_two_mat",
        path: "/experimental_sections/one_vs_two_mat/",
        content: "Manage your ongoing projects",
        size: `13px`
      },
      {
        title: "Optimized Aggregate gradation",
        name: "optimized_aggregate_gradation",
        path: "/experimental_sections/optimized_aggregate_gradation/",
        content: "View and update your task list",
        size: `13px`
      },
      {
        title: "Steel Depth",
        name: "steel_depth",
        path: "/experimental_sections/steel_depth/",
        content: "View and update your task list",
        size: `13px`
      },
      {
        title: "Steel Percentage Effects",
        name: "steel_percentage_effects",
        path: "/experimental_sections/steel_percentage_effects/",
        content: "View and update your task list",
        size: `13px`
      },
    ],
  },
  {
    title: "Forensic Evaluations",
    name: "forensic-evaluations",
    path: "/forensic-evaluations/",
    icon: <Icon icon="mdi:magnify-scan" />,
    allowedRoles: ["admin", "user", "guest"],
  },
  {
    title: "Specifications",
    name: "specifications",
    path: "/specifications/",
    allowedRoles: ["admin", "user", "guest"],
    icon: <Icon icon="mdi:file-document-outline" />,
    submenu: true,
    subMenuItems: [
      {
        title: "Standard Specifications",
        name: "standard_specifications",
        path: "/specifications/standard_specifications/",
        content: "View your dashboard and key metrics",
        size: `13px`
      },
      {
        title: "Manual & Guidelines",
        name: "manual_and_guidelines",
        path: "/specifications/manual_and_guidelines/",
        content: "Manage your ongoing projects",
        size: `13px`
      },
      {
        title: "Roadway Standards",
        name: "roadway_standards",
        path: "/specifications/roadway_standards/",
        content: "View and update your task list",
        size: `13px`
      },
    ],
  },
];

