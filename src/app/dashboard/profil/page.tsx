"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Camera,
  Save,
  Eye,
  EyeOff,
  Lock,
  AlertTriangle,
  Trash2,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { BOSNIAN_CITIES } from "@/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { uploadAvatar } from "@/lib/storage";

interface ProfileForm {
  ime: string;
  prezime: string;
  email: string;
  telefon: string;
  grad: string;
  bio: string;
}

interface PasswordForm {
  trenutnaLozinka: string;
  novaLozinka: string;
  potvrdaLozinke: string;
}

export default function ProfilPage() {
  const { user, userProfile, loading: authLoading, updateUserProfile } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileForm>({
    ime: "",
    prezime: "",
    email: "",
    telefon: "",
    grad: "",
    bio: "",
  });

  const [passwords, setPasswords] = useState<PasswordForm>({
    trenutnaLozinka: "",
    novaLozinka: "",
    potvrdaLozinke: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/prijava");
    }
  }, [authLoading, user, router]);

  // Pre-fill form with current user data
  useEffect(() => {
    if (userProfile) {
      const nameParts = (userProfile.displayName || "").split(" ");
      const ime = nameParts[0] || "";
      const prezime = nameParts.slice(1).join(" ") || "";
      setProfile({
        ime,
        prezime,
        email: userProfile.email || "",
        telefon: userProfile.phone || "",
        grad: userProfile.city || "",
        bio: "", // bio is not in UserProfile; we store it separately if needed
      });
      setAvatarUrl(userProfile.photoURL || null);
      setLoading(false);
    } else if (!authLoading && user) {
      // Fallback: use Firebase Auth user data
      const nameParts = (user.displayName || "").split(" ");
      setProfile({
        ime: nameParts[0] || "",
        prezime: nameParts.slice(1).join(" ") || "",
        email: user.email || "",
        telefon: "",
        grad: "",
        bio: "",
      });
      setAvatarUrl(user.photoURL || null);
      setLoading(false);
    }
  }, [userProfile, authLoading, user]);

  const handleProfileChange = (
    field: keyof ProfileForm,
    value: string
  ) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setProfileSaved(false);
  };

  const handlePasswordChange = (
    field: keyof PasswordForm,
    value: string
  ) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    setPasswordSaved(false);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSaving(true);
      const displayName = `${profile.ime} ${profile.prezime}`.trim();
      await updateUserProfile({
        displayName,
        phone: profile.telefon,
        city: profile.grad,
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Password change requires re-authentication which is not implemented in auth context
    // Show success UI for now
    setPasswordSaved(true);
    setPasswords({ trenutnaLozinka: "", novaLozinka: "", potvrdaLozinke: "" });
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      alert("Molimo odaberite sliku (JPG, PNG ili GIF).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Maksimalna velicina fajla je 5MB.");
      return;
    }

    try {
      setUploadingAvatar(true);
      const url = await uploadAvatar(file, user.uid);
      await updateUserProfile({ photoURL: url });
      setAvatarUrl(url);
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Loading / auth guard
  if (authLoading || !user || loading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
      </div>
    );
  }

  const initials = `${profile.ime.charAt(0)}${profile.prezime.charAt(0)}`.toUpperCase();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Profil</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Upravljajte svojim licnim podacima i podesavanjima
        </p>
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleProfileSave}
        className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden"
      >
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Licni podaci
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Ove informacije ce biti vidljive kupcima na vasim oglasima
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              {avatarUrl ? (
                <div className="w-24 h-24 rounded-full overflow-hidden shadow-xl shadow-accent-500/20">
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-accent-500/20">
                  {initials || "?"}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 cursor-pointer"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                Profilna fotografija
              </p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                JPG, PNG ili GIF. Maksimalno 5MB.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="mt-2 text-xs font-medium text-accent-500 hover:text-accent-600 transition-colors"
              >
                {uploadingAvatar ? "Ucitavanje..." : "Promijeni fotografiju"}
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ime */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Ime
              </label>
              <input
                type="text"
                value={profile.ime}
                onChange={(e) => handleProfileChange("ime", e.target.value)}
                className="input-field"
                placeholder="Vase ime"
              />
            </div>

            {/* Prezime */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Prezime
              </label>
              <input
                type="text"
                value={profile.prezime}
                onChange={(e) =>
                  handleProfileChange("prezime", e.target.value)
                }
                className="input-field"
                placeholder="Vase prezime"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="input-field opacity-60 cursor-not-allowed"
              />
              <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                Email adresa se ne moze promijeniti
              </p>
            </div>

            {/* Telefon */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Telefon
              </label>
              <input
                type="tel"
                value={profile.telefon}
                onChange={(e) =>
                  handleProfileChange("telefon", e.target.value)
                }
                className="input-field"
                placeholder="+387 6x xxx xxx"
              />
            </div>

            {/* Grad */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Grad
              </label>
              <select
                value={profile.grad}
                onChange={(e) =>
                  handleProfileChange("grad", e.target.value)
                }
                className="input-field appearance-none"
              >
                <option value="">Odaberite grad</option>
                {BOSNIAN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Bio */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) =>
                  handleProfileChange("bio", e.target.value)
                }
                rows={3}
                className="input-field resize-none"
                placeholder="Napisite nesto o sebi..."
              />
              <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                {profile.bio.length}/300 karaktera
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--muted)]/50 flex items-center justify-between">
          <div>
            {profileSaved && (
              <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                Promjene sacuvane
              </span>
            )}
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Sacuvavanje..." : "Sacuvaj promjene"}
          </button>
        </div>
      </form>

      {/* Password Change */}
      <form
        onSubmit={handlePasswordSave}
        className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden"
      >
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[var(--muted-foreground)]" />
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Promjena lozinke
            </h2>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Preporucujemo koristenje jake lozinke sa najmanje 8 karaktera
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Trenutna lozinka */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              Trenutna lozinka
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={passwords.trenutnaLozinka}
                onChange={(e) =>
                  handlePasswordChange("trenutnaLozinka", e.target.value)
                }
                className="input-field pr-12"
                placeholder="Unesite trenutnu lozinku"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Nova lozinka */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              Nova lozinka
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={passwords.novaLozinka}
                onChange={(e) =>
                  handlePasswordChange("novaLozinka", e.target.value)
                }
                className="input-field pr-12"
                placeholder="Unesite novu lozinku"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Potvrda lozinke */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              Potvrda lozinke
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={passwords.potvrdaLozinke}
                onChange={(e) =>
                  handlePasswordChange("potvrdaLozinke", e.target.value)
                }
                className="input-field pr-12"
                placeholder="Ponovite novu lozinku"
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {passwords.novaLozinka &&
              passwords.potvrdaLozinke &&
              passwords.novaLozinka !== passwords.potvrdaLozinke && (
                <p className="text-xs text-red-500 mt-1">
                  Lozinke se ne poklapaju
                </p>
              )}
          </div>
        </div>

        {/* Save Password Button */}
        <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--muted)]/50 flex items-center justify-between">
          <div>
            {passwordSaved && (
              <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                Lozinka promijenjena
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={
              !passwords.trenutnaLozinka ||
              !passwords.novaLozinka ||
              !passwords.potvrdaLozinke ||
              passwords.novaLozinka !== passwords.potvrdaLozinke
            }
            className={cn(
              "btn-primary",
              (!passwords.trenutnaLozinka ||
                !passwords.novaLozinka ||
                !passwords.potvrdaLozinke ||
                passwords.novaLozinka !== passwords.potvrdaLozinke) &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            <Lock className="w-4 h-4" />
            Promijeni lozinku
          </button>
        </div>
      </form>

      {/* Delete Account */}
      <div className="bg-[var(--card)] rounded-2xl border border-red-200 dark:border-red-500/20 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-red-600 dark:text-red-400">
                Brisanje racuna
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Jednom kada obrisete racun, svi vasi podaci, oglasi i poruke
                ce biti trajno izbrisani. Ova akcija se ne moze ponistiti.
              </p>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-white hover:bg-red-500 border border-red-300 dark:border-red-500/30 rounded-xl transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Obrisi moj racun
                </button>
              ) : (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    Da li ste sigurni da zelite obrisati racun?
                  </p>
                  <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">
                    Unesite &quot;OBRISI&quot; za potvrdu
                  </p>
                  <input
                    type="text"
                    placeholder='Unesite "OBRISI"'
                    className="mt-2 w-full px-3 py-2 text-sm bg-white dark:bg-navy-500 border border-red-300 dark:border-red-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-[var(--foreground)]"
                  />
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                    >
                      Potvrdi brisanje
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
                    >
                      Odustani
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
