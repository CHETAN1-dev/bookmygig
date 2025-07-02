import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const checkUserRole = async () => {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role || null;
};
