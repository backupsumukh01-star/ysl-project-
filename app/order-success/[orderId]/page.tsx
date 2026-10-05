import { OrderSuccess } from "@/components/order-success";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return <OrderSuccess id={orderId} />;
}
