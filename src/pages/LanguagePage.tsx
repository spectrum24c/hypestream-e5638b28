
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "pt", name: "Portuguese" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "it", name: "Italian" },
  { code: "hi", name: "Hindi" },
  { code: "ko", name: "Korean" },
];

const LanguagePage = () => {
  const [selected, setSelected] = useState<string>(localStorage.getItem("language") || "en");
  const [session, setSession] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, []);

  useEffect(() => {
    if (session && session.user) {
      // Try to load language from user's metadata
      supabase
        .from("profiles")
        .select("language")
        .eq("id", session.user.id)
        .single()
        .then(({ data }) => {
          if (data && data.language) {
            setSelected(data.language);
            localStorage.setItem("language", data.language);
          }
        });
    }
  }, [session]);

  const saveLanguage = async () => {
    setSaving(true);
    localStorage.setItem("language", selected);
    // If logged in, also save in Supabase
    if (session && session.user) {
      await supabase
        .from("profiles")
        .update({ language: selected })
        .eq("id", session.user.id);
    }
    setSaving(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-hype-dark text-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center gap-8">
        <h1 className="text-2xl font-bold mb-2 mt-8">Choose your preferred language</h1>
        <div className="flex flex-col gap-4 mb-6">
          {LANGUAGES.map(({ code, name }) => (
            <label
              key={code}
              className={`flex items-center gap-3 cursor-pointer px-2 py-1 rounded focus-within:ring ${selected === code ? "bg-hype-purple/20 ring-2 ring-hype-purple" : "bg-hype-dark"}`}
            >
              <input
                type="radio"
                value={code}
                checked={selected === code}
                onChange={() => setSelected(code)}
                className="accent-hype-purple"
              />
              {name}
            </label>
          ))}
        </div>
        <Button
          onClick={saveLanguage}
          className="bg-hype-purple px-8"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </main>
      <Footer />
    </div>
  );
};

export default LanguagePage;
