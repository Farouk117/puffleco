import type { Metadata } from "next";
import ProductForm from "@/components/admin/ProductForm";

export const metadata: Metadata = {
  title: "Add Product | Admin",
  robots: { index: false, follow: false },
};

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Add product</h1>
      <p className="mt-1 text-sm text-slate-500">Fill in the details below to add it to the menu.</p>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
