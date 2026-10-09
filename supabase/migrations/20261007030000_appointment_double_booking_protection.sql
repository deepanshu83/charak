-- Migration: Add double-booking protection partial unique index on appointments
-- Ensures two appointments cannot simultaneously reserve the same doctor, date, and start time
-- while status is in active booking states ('PENDING', 'CONFIRMED').
-- Cancelled, completed, and no-show appointments do not block future slot reuse.

CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_no_double_booking
ON public.appointments (doctor_id, appointment_date, start_time)
WHERE status IN ('PENDING', 'CONFIRMED');
