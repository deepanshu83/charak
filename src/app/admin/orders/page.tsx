import AdminLayout from "@/components/admin/AdminLayout";
import OrderManager from "@/components/admin/OrderManager";

export const metadata = {
  title: "Manage Orders | Admin | Charak Ayurveda",
  description: "Order tracking and status management for Charak Ayurveda.",
};

export default function AdminOrdersPage() {
  return (
    <AdminLayout>
      <OrderManager />
    </AdminLayout>
  );
}
