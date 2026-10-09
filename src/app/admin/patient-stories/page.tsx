import AdminLayout from "@/components/admin/AdminLayout";
import StoryManager from "@/components/admin/StoryManager";

export const metadata = {
  title: "Manage Patient Stories | Admin | Charak Ayurveda",
  description: "Testimonials and clinical recovery stories management.",
};

export default function AdminStoriesPage() {
  return (
    <AdminLayout>
      <StoryManager />
    </AdminLayout>
  );
}
