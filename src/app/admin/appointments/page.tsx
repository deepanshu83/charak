import AdminLayout from "@/components/admin/AdminLayout";
import AppointmentManager from "@/components/admin/AppointmentManager";

export const metadata = {
  title: "Manage Appointments | Admin | Charak Ayurveda",
  description: "Consultation schedule and patient bookings management.",
};

export default function AdminAppointmentsPage() {
  return (
    <AdminLayout>
      <AppointmentManager />
    </AdminLayout>
  );
}
