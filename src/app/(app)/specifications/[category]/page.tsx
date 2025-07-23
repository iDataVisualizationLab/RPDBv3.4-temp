// app/specifications/[category]/page.tsx

import { notFound } from "next/navigation";
import SpecList from "../SpecList";
import { fetchProxy } from "@/lib/api";

export async function generateStaticParams() {
  return [
    { category: "standard_specifications" },
    { category: "manual_and_guidelines" },
    { category: "roadway_standards" },
  ];
}

export default async function Page({
  params,
}: {
  params: any;
}) {
  const { category } = await params;

  const proxyPath = `specifications/${category}/specification_list.json`;

  let plainData;
  try {
    plainData = await fetchProxy(proxyPath);
  } catch (err) {
    notFound(); // fallback 404
  }

  return <SpecList data={plainData} />;
}
