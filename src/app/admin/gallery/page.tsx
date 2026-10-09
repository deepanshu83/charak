import AdminLayout from "@/components/admin/AdminLayout";
import GalleryManager from "@/components/admin/GalleryManager";

export const metadata = {
  title: "Manage Gallery | Admin | Charak Ayurveda",
  description: "Sanctuary and treatment photo gallery administration.",
};

export default function AdminGalleryPage() {
  return (
    <AdminLayout>
      <GalleryManager />
    </AdminLayout>
  );
}
