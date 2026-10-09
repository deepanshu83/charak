import BrandHeader from "@/components/ui/BrandHeader";
import CartPage from "@/components/cart/CartPage";

export const metadata = {
  title: "Cart | Charak Ayurveda Pilani",
  description: "Review items in your cart at Charak Ayurveda.",
};

export default function Page() {
  return (
    <BrandHeader>
      <CartPage />
    </BrandHeader>
  );
}
