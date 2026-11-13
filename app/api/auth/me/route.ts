import { ok, publicRoute } from '@/lib/http';
import { getMember, getVolunteer } from '@/lib/auth';

export const GET = publicRoute(async () => {
  const [member, volunteer] = await Promise.all([getMember(), getVolunteer()]);
  return ok({ member, volunteer });
});
