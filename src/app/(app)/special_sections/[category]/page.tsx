// app/(app)/special/[category]/page.tsx
import { CATEGORY_CONFIG } from "@/app/(app)/special_sections/categories";
import ClientCategoryPage from "./ClientCategoryPage";
import { count } from "console";

// Tell Next which slugs to build at export time:
export async function generateStaticParams() {
  return Object.keys(CATEGORY_CONFIG).map((category) => ({ category }));
}

// This is a server component—even in export mode, it runs at build time:
export default async function Page({
  params,
}: {
  params: any;
}) {
  const { category } = await params;
  if (!CATEGORY_CONFIG[category]) {
    return <p className="p-8">Category “{category}” not found</p>;
  }
  // Render your client component
  return <ClientCategoryPage category={category} />;
}
