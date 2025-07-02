'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function checkUserAndProfile() {
const supabase = createClientComponentClient();

const {
data: { user },
} = await supabase.auth.getUser();

if (!user) {
return { redirectTo: '/login' };
}

const { data: profile, error } = await supabase
.from('profiles')
.select('*')
.eq('id', user.id)
.single();

if (error || !profile || !profile.full_name || !profile.contact) {
return { redirectTo: '/complete-profile' };
}

return { user, profile };
}