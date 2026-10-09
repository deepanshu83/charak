import AdminLayout from "@/components/admin/AdminLayout";
import ProductManager from "@/components/admin/ProductManager";

export const metadata = {
  title: "Manage Products | Admin | Charak Ayurveda",
  description: "Product inventory and catalog management for Charak Ayurveda.",
};

export default function AdminProductsPage() {
  return (
    <AdminLayout>
      <ProductManager />
    </AdminLayout>
  );
}
