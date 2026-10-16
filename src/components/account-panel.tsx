"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { TbUser, TbX } from "react-icons/tb";
import { loadBest } from "@/components/games/shared";
import { GAME_ORDER, bestText, gameIcons } from "@/components/mini-games";
import { PASSWORD_MIN, USERNAME_RE, signIn, signOut, signUp, type AuthFailure } from "@/lib/account";

const copy = {
  en: {
    title: "Player account",
    close: "Close account",
    signinTab: "Sign in",
    signupTab: "Sign up",
    intro: "Save your best scores to an account and pick them up on any device.",
    username: "Username",
    usernameHint: "3 to 20 letters, numbers or underscores",
    email: "Email",
    password: "Password",
    passwordHint: `At least ${PASSWORD_MIN} characters`,
    show: "Show password",
    hide: "Hide password",
    showShort: "Show",
    hideShort: "Hide",
    submitIn: "Sign in",
    submitUp: "Create account",
    busy: "One moment...",
    checkEmail: "Almost there. Open the link I just emailed you to confirm your address, then sign in.",
    signedInAs: "Signed in as",
    saved: "Your best scores are saved to this account.",
    signOut: "Sign out",
    errors: {
      "username-taken": "That username is taken. Try another.",
      "username-invalid": "Usernames are 3 to 20 letters, numbers or underscores.",
      "email-taken": "That email already has an account. Try signing in.",
      "invalid-login": "Wrong email or password.",
      unconfirmed: "Confirm your email first. The link is in the message I sent you.",
      "weak-password": `Pick a stronger password of at least ${PASSWORD_MIN} characters.`,
      "rate-limit": "Too many attempts. Wait a minute and try again.",
      offline: "Could not reach the server. Check your connection.",
      unknown: "Something went wrong. Please try again.",
    } as Record<AuthFailure, string>,
    badEmail: "Enter a valid email address.",
    shortPassword: `Use at least ${PASSWORD_MIN} characters.`,
    required: "Fill in every field.",
  },
  ms: {
    title: "Akaun pemain",
    close: "Tutup akaun",
    signinTab: "Log masuk",
    signupTab: "Daftar",
    intro: "Simpan skor terbaik anda dalam akaun dan sambung main di mana-mana peranti.",
    username: "Nama pengguna",
    usernameHint: "3 hingga 20 huruf, nombor atau garis bawah",
    email: "E-mel",
    password: "Kata laluan",
    passwordHint: `Sekurang-kurangnya ${PASSWORD_MIN} aksara`,
    show: "Tunjuk kata laluan",
    hide: "Sembunyi kata laluan",
    showShort: "Tunjuk",
    hideShort: "Sembunyi",
    submitIn: "Log masuk",
    submitUp: "Cipta akaun",
    busy: "Sebentar...",
    checkEmail: "Hampir siap. Buka pautan yang saya e-mel tadi untuk sahkan alamat anda, kemudian log masuk.",
    signedInAs: "Log masuk sebagai",
    saved: "Skor terbaik anda disimpan dalam akaun ini.",
    signOut: "Log keluar",
    errors: {
      "username-taken": "Nama pengguna itu sudah diambil. Cuba yang lain.",
      "username-invalid": "Nama pengguna ialah 3 hingga 20 huruf, nombor atau garis bawah.",
      "email-taken": "E-mel itu sudah ada akaun. Cuba log masuk.",
      "invalid-login": "E-mel atau kata laluan salah.",
      unconfirmed: "Sahkan e-mel anda dahulu. Pautannya ada dalam mesej yang saya hantar.",
      "weak-password": `Pilih kata laluan yang lebih kuat, sekurang-kurangnya ${PASSWORD_MIN} aksara.`,
      "rate-limit": "Terlalu banyak percubaan. Tunggu seminit dan cuba lagi.",
      offline: "Tidak dapat hubungi pelayan. Semak sambungan anda.",
      unknown: "Ada masalah berlaku. Sila cuba lagi.",
    } as Record<AuthFailure, string>,
    badEmail: "Masukkan alamat e-mel yang sah.",
    shortPassword: `Gunakan sekurang-kurangnya ${PASSWORD_MIN} aksara.`,
    required: "Isi semua ruangan.",
  },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const input =
  "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-[16px] text-navy placeholder:text-neutral-400 focus-visible:border-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400";
const label = "flex flex-col gap-1 text-[12.5px] font-bold text-navy";
const hintClass = "text-[11.5px] font-normal text-neutral-500";

/* Sign-up, sign-in and the signed-in summary, in the same glass panel the games
   use. The password goes from this form straight to Supabase Auth over HTTPS;
   nothing here stores or logs it. */
export function AccountPanel({
  lang,
  username,
  onClose,
}: {
  lang: "en" | "ms";
  username: string | null;
  onClose: () => void;
}) {
  const t = copy[lang];
  const uid = useId();
  const [tab, setTab] = useState<"signin" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmSent, setConfirmSent] = useState(false);
  const [bests, setBests] = useState<number[]>([]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* Shown once signed in, and refreshed when the merge with saved scores lands. */
  useEffect(() => {
    if (!username) return;
    const read = () => setBests(GAME_ORDER.map((id) => loadBest(id)));
    const first = setTimeout(read, 0);
    window.addEventListener("game-scores-changed", read);
    return () => {
      clearTimeout(first);
      window.removeEventListener("game-scores-changed", read);
    };
  }, [username]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const signup = tab === "signup";

    if (!email.trim() || !password || (signup && !name.trim())) return setError(t.required);
    if (signup && !USERNAME_RE.test(name.trim().toLowerCase())) return setError(t.errors["username-invalid"]);
    if (!EMAIL_RE.test(email.trim())) return setError(t.badEmail);
    if (signup && password.length < PASSWORD_MIN) return setError(t.shortPassword);

    setError("");
    setBusy(true);
    const redirectTo = `${window.location.origin}${lang === "ms" ? "/ms" : "/"}`;
    const result = signup
      ? await signUp({ username: name, email, password, redirectTo })
      : await signIn(email, password);
    setBusy(false);

    if (!result.ok) return setError(t.errors[result.reason]);
    setPassword("");
    if (result.needsConfirm) setConfirmSent(true);
    /* Signed in: the dock hears about it from the auth listener, and this panel
       switches to the summary through the username prop. */
  }

  return (
    <div role="dialog" aria-label={t.title} className="rise-in liquid-glass pointer-events-auto flex w-full max-w-sm flex-col gap-2 rounded-3xl p-2.5">
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-navy">
          <TbUser className="h-4 w-4" />
        </span>
        <h2 className="flex-1 font-display text-[15px] font-bold text-navy">{t.title}</h2>
        <button
          type="button"
          aria-label={t.close}
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-navy transition-colors hover:bg-navy hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
        >
          <TbX aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-2xl bg-white p-3">
        {username ? (
          <div className="flex flex-col gap-3">
            <p className="text-[13px] text-navy">
              {t.signedInAs} <strong className="font-bold">@{username}</strong>
            </p>
            <ul className="flex flex-col gap-1.5">
              {GAME_ORDER.map((id, i) => {
                const Icon = gameIcons[id];
                return (
                  <li key={id} className="flex items-center gap-2 text-[13px] text-navy">
                    <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-[#8b5cf6]" />
                    <span>{bestText(lang, id, bests[i] ?? 0)}</span>
                  </li>
                );
              })}
            </ul>
            <p className="text-[12px] text-neutral-500">{t.saved}</p>
            <button
              type="button"
              onClick={() => void signOut()}
              className="self-start rounded-full bg-navy px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
            >
              {t.signOut}
            </button>
          </div>
        ) : confirmSent ? (
          <p role="status" className="text-[13.5px] leading-snug text-navy">
            {t.checkEmail}
          </p>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col gap-3">
            <div role="tablist" aria-label={t.title} className="flex gap-1 rounded-full bg-neutral-100 p-1">
              {(["signup", "signin"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => {
                    setTab(key);
                    setError("");
                  }}
                  className={`flex-1 rounded-full px-3 py-1.5 text-[13px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy ${
                    tab === key ? "bg-amber-400 text-navy" : "text-neutral-600 hover:text-navy"
                  }`}
                >
                  {key === "signup" ? t.signupTab : t.signinTab}
                </button>
              ))}
            </div>

            {tab === "signup" && <p className="text-[12.5px] leading-snug text-neutral-600">{t.intro}</p>}

            {tab === "signup" && (
              <label className={label} htmlFor={`${uid}-name`}>
                {t.username}
                <input
                  id={`${uid}-name`}
                  className={input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={20}
                  aria-describedby={`${uid}-name-hint`}
                />
                <span id={`${uid}-name-hint`} className={hintClass}>
                  {t.usernameHint}
                </span>
              </label>
            )}

            <label className={label} htmlFor={`${uid}-email`}>
              {t.email}
              <input
                id={`${uid}-email`}
                type="email"
                className={input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={254}
              />
            </label>

            <label className={label} htmlFor={`${uid}-password`}>
              {t.password}
              <span className="relative block">
                <input
                  id={`${uid}-password`}
                  type={reveal ? "text" : "password"}
                  className={`${input} pr-16`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={tab === "signup" ? "new-password" : "current-password"}
                  maxLength={72}
                  aria-describedby={tab === "signup" ? `${uid}-pw-hint` : undefined}
                />
                <button
                  type="button"
                  onClick={() => setReveal((v) => !v)}
                  aria-label={reveal ? t.hide : t.show}
                  aria-pressed={reveal}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full px-2.5 py-1 text-[11.5px] font-bold text-neutral-600 hover:bg-neutral-100 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
                >
                  {reveal ? t.hideShort : t.showShort}
                </button>
              </span>
              {tab === "signup" && (
                <span id={`${uid}-pw-hint`} className={hintClass}>
                  {t.passwordHint}
                </span>
              )}
            </label>

            {error && (
              <p role="alert" className="rounded-xl bg-amber-100 px-3 py-2 text-[12.5px] font-medium leading-snug text-navy">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-amber-400 px-4 py-2.5 text-[14px] font-bold text-navy transition-colors hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 disabled:opacity-60"
            >
              {busy ? t.busy : tab === "signup" ? t.submitUp : t.submitIn}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
