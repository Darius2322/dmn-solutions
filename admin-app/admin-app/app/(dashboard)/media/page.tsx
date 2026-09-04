import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { MediaUploadForm } from "@/components/admin/media-upload-form";
import { DeleteMediaButton } from "@/components/admin/delete-media-button";

export default async function AdminMediaPage() {
  const supabase = createSupabaseAdminClient();
  const { data: assets } = await supabase.from("media_assets").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Media</h1>
      <div className="mt-6">
        <MediaUploadForm />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {(assets ?? []).map((asset) => {
          const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${asset.bucket}/${asset.storage_path}`;
          return (
            <div key={asset.id} className="overflow-hidden rounded-lg border border-border bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={publicUrl} alt={asset.alt_text ?? asset.file_name} className="h-32 w-full object-cover" />
              <div className="p-2">
                <p className="truncate text-xs text-foreground">{asset.file_name}</p>
                <DeleteMediaButton mediaId={asset.id} storagePath={asset.storage_path} />
              </div>
            </div>
          );
        })}
        {(assets ?? []).length === 0 && <p className="text-sm text-muted-foreground">No media uploaded yet.</p>}
      </div>
    </div>
  );
}
