import BrandHeader from "@/components/ui/BrandHeader";
import CartPage from "@/components/cart/CartPage";

export const metadata = { title: "Your Cart | Charak Ayurveda" };

export default function CartRoute() {
  return <BrandHeader><CartPage /></BrandHeader>;
}
