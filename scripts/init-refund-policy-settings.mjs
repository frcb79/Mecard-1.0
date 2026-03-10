import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

async function main() {
  const { data: existingSettings, error: settingsError } = await supabase
    .from('platform_settings')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (settingsError) {
    throw settingsError;
  }

  if (!existingSettings) {
    const { error: insertSettingsError } = await supabase
      .from('platform_settings')
      .insert({
        pool_to_points_exchange_rate: 1.0,
        pool_points_expiry_days: 30,
        school_refund_batch_interval_days: 15,
        default_pos_accepts_cash: false,
      });

    if (insertSettingsError) {
      throw insertSettingsError;
    }
  }

  const { data: schools, error: schoolsError } = await supabase
    .from('schools')
    .select('id');

  if (schoolsError) {
    throw schoolsError;
  }

  let created = 0;

  for (const school of schools || []) {
    const { data: existing, error: existingError } = await supabase
      .from('school_settings')
      .select('id')
      .eq('school_id', school.id)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (!existing) {
      const { error: insertSchoolError } = await supabase
        .from('school_settings')
        .insert({ school_id: school.id, pool_points_multiplier: 1.0 });

      if (insertSchoolError) {
        throw insertSchoolError;
      }

      created += 1;
    }
  }

  console.log(`Initialized platform settings and ${created} school settings row(s)`);
}

main().catch((error) => {
  console.error('Refund policy initialization failed');
  console.error(error);
  process.exit(1);
});