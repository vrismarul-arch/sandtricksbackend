// utils/supabase.js
import { createClient } from "@supabase/supabase-js";

export const getSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or KEY is missing in .env");
  }

  return createClient(supabaseUrl, supabaseKey);
};

// Upload helper
export const uploadToSupabase = async (file) => {
  const supabase = getSupabaseClient();
  const fileName = `${Date.now()}-${file.originalname}`;
  const { error } = await supabase.storage
    .from("tintd")
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) throw error;

  return `${process.env.SUPABASE_URL}/storage/v1/object/public/tintd/${fileName}`;
};
