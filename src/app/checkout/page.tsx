import BrandHeader from "@/components/ui/BrandHeader";
import CheckoutPage from "@/components/cart/CheckoutPage";

export const metadata = {
  title: "Checkout | Charak Ayurveda Pilani",
  description: "Complete order placement and delivery details for Charak Ayurveda.",
};

export default function Page() {
  return (
    <BrandHeader>
      <CheckoutPage />
    </BrandHeader>
  );
}
