import type { Metadata } from "next";
import ProductForm from "@/components/admin/ProductForm";
import type { Id } from "@convex/_generated/dataModel";

export const metadata: Metadata = {
  title: "Edit Product | Admin",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Edit product</h1>
      <p className="mt-1 text-sm text-slate-500">Changes go live on the site immediately.</p>
      <div className="mt-6">
        <ProductForm productId={id as Id<"products">} />
      </div>
    </div>
  );
}
