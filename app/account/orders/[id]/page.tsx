import { OrderDetailScreen } from "@/components/account-ui";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetailScreen id={id} />;
}
