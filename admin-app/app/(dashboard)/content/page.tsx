import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { ContentEditor } from "@/components/admin/content-editor";

const EDITABLE_KEYS = [
  { key: "home_hero", label: "Home — Hero section", fallback: { heading: "", subheading: "" } },
  { key: "about_page", label: "About page", fallback: { intro: "", mission: "", vision: "" } },
  {
    key: "founder",
    label: "About page — Founder",
    fallback: {
      name: "Darius Momanyi",
      title: "Founder & CEO — DMN Solutions",
      bio: "Darius Momanyi is the Founder and CEO of DMN Solutions, a technology and digital solutions company focused on creating practical, reliable and modern solutions for businesses and individuals.",
      phone: "+254110554040",
      email: "dariusmomanyi678@gmail.com",
      whatsapp: "254110554040",
      photo: "/images/founder/founder-3.jpg",
    },
  },
  { key: "contact_info", label: "Contact info", fallback: { phone: "", email: "", whatsapp: "", address: "", hours: "" } },
  { key: "faq_intro", label: "FAQ intro text", fallback: { text: "" } },
];

export default async function AdminContentPage() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("site_content").select("key, value").in("key", EDITABLE_KEYS.map((k) => k.key));
  const byKey = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));

  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground">Content</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Edits here go live on the public site immediately — no code changes or redeploy needed.
      </p>
      <div className="mt-6 space-y-4">
        {EDITABLE_KEYS.map(({ key, label, fallback }) => (
          <ContentEditor key={key} contentKey={key} label={label} value={byKey[key] ?? fallback} />
        ))}
      </div>
    </div>
  );
}
