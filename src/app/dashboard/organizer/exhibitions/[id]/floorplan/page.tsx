import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import FloorplanEditor from '@/components/FloorplanEditor';
import { getExhibitionFloorplanData } from '@/app/actions/floorplan';
import { ArrowRight } from 'lucide-react';

export default async function OrganizerFloorplanPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const data = await getExhibitionFloorplanData(id);

  if (!data || !data.exhibition) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <FloorplanEditor
        exhibitionId={data.exhibition.id}
        exhibitionTitle={data.exhibition.title}
        initialHall={data.hall}
        initialBooths={data.booths}
        bookedBoothIds={data.bookedBoothIds}
      />
    </div>
  );
}
