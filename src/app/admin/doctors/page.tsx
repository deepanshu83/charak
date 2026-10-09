import AdminLayout from "@/components/admin/AdminLayout";
import DoctorManager from "@/components/admin/DoctorManager";

export const metadata = {
  title: "Manage Doctors | Admin | Charak Ayurveda",
  description: "Senior physician directory and schedule management.",
};

export default function AdminDoctorsPage() {
  return (
    <AdminLayout>
      <DoctorManager />
    </AdminLayout>
  );
}
