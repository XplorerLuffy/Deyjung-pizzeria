import MenuPage from '../../../components/MenuPage';

export const dynamic = 'force-dynamic';

export default function TablePage({ params }) {
  const tableId = params.id;
  return <MenuPage tableId={tableId} />;
}

export async function generateMetadata({ params }) {
  const tableId = params.id;
  return {
    title: tableId === 'takeaway'
      ? 'Order Takeaway — DEYJUNG'
      : `Table ${tableId} — DEYJUNG`,
  };
}
