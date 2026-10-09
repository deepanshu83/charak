import BrandHeader from "@/components/ui/BrandHeader";
import CheckoutPage from "@/components/cart/CheckoutPage";

export const metadata = { title: "Checkout | Charak Ayurveda" };

export default function CheckoutRoute() {
  return <BrandHeader><CheckoutPage /></BrandHeader>;
}
