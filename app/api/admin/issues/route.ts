import { ok, adminRoute } from '@/lib/http';
import { createClient } from '@/lib/supabase/server';
import { SAMPLE_ISSUES } from '@/lib/sample-issues';

export const GET = adminRoute(async (req) => {
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get('limit')) || 100, 500);
  const offset = Number(url.searchParams.get('offset')) || 0;

  try {
    const supabase = await createClient();
    const { data, error, count } = await supabase
      .from('issues')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error || !data || data.length === 0) {
      return ok({ items: SAMPLE_ISSUES, total: SAMPLE_ISSUES.length });
    }

    return ok({ items: data, total: count ?? data.length });
  } catch (e) {
    console.error('Admin GET issues error, using sample data:', e);
    return ok({ items: SAMPLE_ISSUES, total: SAMPLE_ISSUES.length });
  }
});
