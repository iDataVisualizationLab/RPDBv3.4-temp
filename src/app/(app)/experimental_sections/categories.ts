// app/special/categories.ts
import { route } from '@/config';
export const CATEGORY_CONFIG: Record<
  string,
  { title: string; modalTitle: string; geojsonPath: string; jsonReportPath: string }
> = {
  "aggregate_effects": {
      title: "Aggregate Effects Sections",
      geojsonPath: `/experimental_sections/aggregate_effects/excel_files/aggregate_effects_info.geojson`,
      jsonReportPath: `/experimental_sections/aggregate_effects/reports/reports_info.json`,
      modalTitle: "Aggregate Effects"
  },
  "one_vs_two_mat": {
      title: "One vs Two Mat Sections",
      geojsonPath: `/experimental_sections/one_vs_two_mat/excel_files/one_vs_two_mat_info.geojson`,
      jsonReportPath: `/experimental_sections/one_vs_two_mat/reports/reports_info.json`,
      modalTitle: "One vs Two Mat"
  },
  "optimized_aggregate_gradation": {
      title: "Optimized Aggregate Gradation Sections",
      geojsonPath: `/experimental_sections/optimized_aggregate_gradation/excel_files/optimized_aggregate_gradation_info.geojson`,
      jsonReportPath: `/experimental_sections/optimized_aggregate_gradation/reports/reports_info.json`,
      modalTitle: "Optimized Aggregate Gradation"
  },
  "steel_depth": {
      title: "Steel Depth Sections",
      geojsonPath: `/experimental_sections/steel_depth/excel_files/steel_depth_info.geojson`,
      jsonReportPath: `/experimental_sections/steel_depth/reports/reports_info.json`,
      modalTitle: "Steel Depth"
  },
  "steel_percentage_effects": {
      title: "Steel Percentage Effects Sections",
      geojsonPath: `/experimental_sections/steel_percentage_effects/excel_files/steel_percentage_effects_info.geojson`,
      jsonReportPath: `/experimental_sections/steel_percentage_effects/reports/reports_info.json`,
      modalTitle: "Steel Percentage Effects"
  },
};
