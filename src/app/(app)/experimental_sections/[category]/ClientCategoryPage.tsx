"use client";
import { useEffect, useState } from "react";
import { useGlobalLoading } from "@/context/GlobalLoadingContext";
import SectionClientWrapper from "@/components/section/SectionClientWrapper";
import { route } from "@/config";
import { CATEGORY_CONFIG } from "@/app/(app)/experimental_sections/categories";

export default function ClientCategoryPage({ category }: { category: string }) {
  const cfg = CATEGORY_CONFIG[category]!;
  const { setLoading } = useGlobalLoading();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setIsLoaded(true);
      setLoading(false);
    }, 1000);
    return () => {
      clearTimeout(t);
      setLoading(false);
    };
  }, [setLoading]);

  return (
    <SectionClientWrapper
      title={cfg.title}
      geojsonPath={cfg.geojsonPath}
      jsonReportPath={cfg.jsonReportPath}
      modalTitle={cfg.modalTitle}
    />
  );
}
