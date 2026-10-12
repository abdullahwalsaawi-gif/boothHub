import { createClient } from '@/lib/supabase/server';
import { getOrganizerExhibitions } from '@/app/actions/exhibitions';
import { getOrganizerBookings, getOrganizerBooths } from '@/app/actions/bookings';
import OrganizerDashboardClient from '@/components/OrganizerDashboardClient';
import { redirect } from 'next/navigation';

export default async function OrganizerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Strict Organizer Isolation: Fetch ONLY exhibitions, bookings and booths owned by this user
  const [exhibitions, bookings, booths] = await Promise.all([
    getOrganizerExhibitions(),
    getOrganizerBookings(),
    getOrganizerBooths()
  ]);

  return (
    <OrganizerDashboardClient
      initialExhibitions={exhibitions}
      initialBookings={bookings}
      initialBooths={booths}
      profile={profile}
    />
  );
}
