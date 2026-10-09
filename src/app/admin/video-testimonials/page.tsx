import AdminLayout from "@/components/admin/AdminLayout";
import VideoTestimonialManager from "@/components/admin/VideoTestimonialManager";

export const metadata = {
  title: "Manage Video Testimonials | Admin | Charak Ayurveda",
  description: "Patient video recovery stories and testimonial management.",
};

export default function AdminVideoTestimonialsPage() {
  return (
    <AdminLayout>
      <VideoTestimonialManager />
    </AdminLayout>
  );
}
