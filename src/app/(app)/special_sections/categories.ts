// app/special/categories.ts
import { route } from '@/config';
export const CATEGORY_CONFIG: Record<
  string,
  { title: string; modalTitle: string; geojsonPath: string; jsonReportPath: string }
> = {
  "test": {
      title: "Test",
      geojsonPath: `special_sections/test/excel_files/active_crack_control_info.geojson`,
      jsonReportPath: `special_sections/test/reports/reports_info.json`,
      modalTitle: "Test"
  },
  "active_crack_control_sections": {
      title: "Active Crack Control Sections",
      geojsonPath: `/special_sections/active_crack_control_sections/excel_files/active_crack_control_info.geojson`,
      jsonReportPath: `/special_sections/active_crack_control_sections/reports/reports_info.json`,
      modalTitle: "Active Crack Control Sections"
  },
  "bonded_concrete_overlay": {
      title: "Bonded Concrete Overlay Sections",
      geojsonPath: `/special_sections/bonded_concrete_overlay/excel_files/bonded_overlay_info.geojson`,
      jsonReportPath: `/special_sections/bonded_concrete_overlay/reports/reports_info.json`,
      modalTitle: "(BCO) Bonded Concrete Overlay"
  },
  "cast-in-place_prestressed_pavement": {
      title: "CPPP",
      geojsonPath:`/special_sections/cast-in-place_prestressed_pavement/excel_files/cast-in-place_prestressed_pavement_info.geojson`,
      jsonReportPath:`/special_sections/cast-in-place_prestressed_pavement/reports/reports_info.json`,
      modalTitle: "Cast-in-Place Prestressed Pavement"
  },
  "fast_track_CRCP": {     
      title: "Fast Track CRCP Sections",
      geojsonPath: `/special_sections/fast_track_CRCP/excel_files/fast_track_pavement_info.geojson`,
      jsonReportPath: `/special_sections/fast_track_CRCP/reports/reports_info.json`,
      modalTitle: "Fast Track CRCP"
  },
  "LTPP_sections": {
      title: "LTPP Sections",
      geojsonPath: `/special_sections/LTPP_sections/excel_files/ltpp_sections_info.geojson`,
      jsonReportPath: `/special_sections/LTPP_sections/reports/reports_info.json`,
      modalTitle: "LTPP"
  },
  "next_generation_concrete_surfacing": {
      title: "NGCS",
      geojsonPath: `/special_sections/next_generation_concrete_surfacing/excel_files/ngcs_info.geojson`,
      jsonReportPath: `/special_sections/next_generation_concrete_surfacing/reports/reports_info.json`,
      modalTitle: "Next Generation Concrete Surfacing Sections"
  },
  "precast_pavement": {
      title: "PCP",
      geojsonPath: `/special_sections/precast_pavement/excel_files/precast_pavement_info.geojson`,
      jsonReportPath: `/special_sections/precast_pavement/reports/reports_info.json`,
      modalTitle: "(PCP) Precast Concrete Pavement"
    },
  "recycled_concrete_aggregate_pavement": {
      title: "RCA",
      geojsonPath: `/special_sections/recycled_concrete_aggregate_pavement/excel_files/recycled_concrete_pavement_info.geojson`,
      jsonReportPath: `/special_sections/recycled_concrete_aggregate_pavement/reports/reports_info.json`,
      modalTitle: "(RCA) Recycled Concrete Aggregate"
    },
  "roller_compacted_concrete_pavement": {
      title: "RCCP",
      geojsonPath: `/special_sections/roller_compacted_concrete_pavement/excel_files/rccp_info.geojson`,
      jsonReportPath: `/special_sections/roller_compacted_concrete_pavement/reports/reports_info.json`,
      modalTitle: "(RCCP) Roller-Compacted Concrete Pavement"
    },
  "two_lift_CRCP": {
      title: "Two-Lift CRCP Sections",
      geojsonPath: `/special_sections/two_lift_CRCP/excel_files/two_lift_section_info.geojson`,
      jsonReportPath: `/special_sections/two_lift_CRCP/reports/reports_info.json`,
      modalTitle: "Two-Lift CRCP"
    },
  "unbonded_concrete_overlay": {
      title: "UBCO",
      geojsonPath: `/special_sections/unbonded_concrete_overlay/excel_files/unbonded_overlay_info.geojson`,
      jsonReportPath: `/special_sections/unbonded_concrete_overlay/reports/reports_info.json`,
      modalTitle: "UBCO (Unbonded Concrete Overlay)"
    },
  "whitetopping": {
      title: "Whitetopping Sections",
      geojsonPath: `/special_sections/whitetopping/excel_files/whitetopping_info.geojson`,
      jsonReportPath: `/special_sections/whitetopping/reports/reports_info.json`,
      modalTitle: "Whitetopping"
  }
};
