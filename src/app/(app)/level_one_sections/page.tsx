"use client"

import { useEffect, useState } from 'react';
import SectionClientWrapper from '@/components/section/SectionClientWrapper';
import { useGlobalLoading } from '@/context/GlobalLoadingContext';

export default function LevelOneSectionPage() {
  // Access the global loading context
  const { setLoading } = useGlobalLoading();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Set loading when component mounts
  useEffect(() => {
    // Show loading indicator when page loads
    setLoading(true);
    
    // Simulate resource loading completion
    const timer = setTimeout(() => {
      setIsLoaded(true);
      setLoading(false);
    }, 1000);
    
    // Clean up on unmount
    return () => {
      clearTimeout(timer);
      setLoading(false);
    };
  }, [setLoading]);

  return (
    <SectionClientWrapper
      title="Level One Sections"
      geojsonPath={`/level_one_sections/excel_files/level_1_sections_info.geojson`}
      jsonReportPath={`/level_one_sections/reports/reports_info.json`}
      modalTitle="Level One Sections"
    />
  );
}