import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const BUCKET = "resumes";

export const uploadResumeFile = async (
  key: string,
  buffer: Buffer,
  contentType: string,
) => {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(key, buffer, { contentType, upsert: false });
  if (error) throw new Error(`Resume upload failed: ${error.message}`);
};

export const downloadResumeFile = async (key: string) => {
  const { data, error } = await supabase.storage.from(BUCKET).download(key);
  if (error || !data) return null;
  return Buffer.from(await data.arrayBuffer());
};
