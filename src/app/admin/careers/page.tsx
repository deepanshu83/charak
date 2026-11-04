import AdminLayout from "@/components/admin/AdminLayout";
import CareersManager from "@/components/admin/CareersManager";

export const metadata = {
  title: "Manage Job Vacancies | Admin | Charak Ayurveda",
  description: "Post and manage hospital job vacancies shown on the public Careers page.",
};

export default function AdminCareersPage() {
  return (
    <AdminLayout>
      <CareersManager />
    </AdminLayout>
  );
}
