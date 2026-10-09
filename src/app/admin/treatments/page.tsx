import AdminLayout from "@/components/admin/AdminLayout";
import TreatmentManager from "@/components/admin/TreatmentManager";

export const metadata = {
  title: "Manage Treatments | Admin | Charak Ayurveda",
  description: "Therapy menu and Panchakarma pricing management.",
};

export default function AdminTreatmentsPage() {
  return (
    <AdminLayout>
      <TreatmentManager />
    </AdminLayout>
  );
}
