import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Bell, Check, Clapperboard, Eye, EyeOff, Gavel, Ghost, Heart,
  Laugh, Loader2, Lock, Mail, Palette, Rocket, Search, Sparkles, Theater, Zap,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import onboardingCinematic from '@/assets/onboarding-cinematic.jpg';

/* ------------------------------------------------------------------ *
 * Onboarding
 *
 * Six short screens instead of two long ones. The rules it follows:
 *   1. One question per screen, one decision each.
 *   2. Every answer is a tap, never typing.
 *   3. Single-choice questions advance themselves; multi-choice waits.
 *   4. The mascot reacts, so a tap has a consequence you can see.
 *   5. Progress is always visible and never resets.
 *   6. Answers are written as they are given, so a reload resumes.
 * ------------------------------------------------------------------ */

export interface OnboardingProfile {
  genres: number[];
  format: 'movies' | 'series' | 'both';
  dailyGoal: 'quick' | 'episode' | 'movie' | 'all-in';
  notifyMovies: boolean;
  notifySeries: boolean;
}

interface WelcomeScreenProps {
  onComplete: (preferences: { movies: boolean; series: boolean }) => void;
}

type StepId = 'welcome' | 'genres' | 'format' | 'goal' | 'alerts' | 'account' | 'done';

const STEPS: StepId[] = ['welcome', 'genres', 'format', 'goal', 'alerts', 'account', 'done'];

const BRAND_LOGO = '/lovable-uploads/7ea3104a-6d4d-4bbd-b3c1-0aac01fc7026.png';

export const ONBOARDING_VERSION = '2';

const STORAGE = {
  version: 'hypestream_onboarding_version',
  completed: 'hypestream_welcome_completed',
  notification: 'hypestream_notification_prefs',
  profile: 'hypestream_onboarding',
  draft: 'hypestream_onboarding_draft',
  userPreferences: 'userPreferences',
};

/* TMDB genre ids, so this plugs into the rest of the app's preferences.
   Icons are stroke SVGs, not emoji: a missing emoji font turns a picker
   into a grid of empty boxes. */
const GENRES = [
  { id: 28, label: 'Action', Icon: Zap },
  { id: 35, label: 'Comedy', Icon: Laugh },
  { id: 18, label: 'Drama', Icon: Theater },
  { id: 878, label: 'Sci-Fi', Icon: Rocket },
  { id: 53, label: 'Thriller', Icon: Eye },
  { id: 27, label: 'Horror', Icon: Ghost },
  { id: 16, label: 'Animation', Icon: Palette },
  { id: 9648, label: 'Mystery', Icon: Search },
  { id: 10749, label: 'Romance', Icon: Heart },
  { id: 10765, label: 'Fantasy', Icon: Sparkles },
  { id: 99, label: 'Docs', Icon: Clapperboard },
  { id: 80, label: 'Crime', Icon: Gavel },
];

const FORMATS: { value: OnboardingProfile['format']; title: string; blurb: string }[] = [
  { value: 'movies', title: 'Movies', blurb: 'One sitting, one story' },
  { value: 'series', title: 'Series', blurb: 'Episodes, night after night' },
  { value: 'both', title: 'A bit of both', blurb: 'Whatever the mood is' },
];

const GOALS: { value: OnboardingProfile['dailyGoal']; title: string; blurb: string }[] = [
  { value: 'quick', title: 'A quick one', blurb: '15 minutes' },
  { value: 'episode', title: 'An episode', blurb: 'About 30 minutes' },
  { value: 'movie', title: 'Movie night', blurb: 'Around an hour' },
  { value: 'all-in', title: 'All in', blurb: 'As long as it takes' },
];

const copy: Record<StepId, { title: string; sub: string; quip: string }> = {
  welcome: {
    title: 'Your next favourite is in here',
    sub: 'A few quick taps and we can line up films and shows that actually fit you.',
    quip: "Hey! I'm Poppy. Six screens, then you're watching.",
  },
  genres: {
    title: 'What are you into?',
    sub: 'Pick a few. This shapes your home screen.',
    quip: 'Three or four is the sweet spot.',
  },
  format: {
    title: 'Movies or series?',
    sub: 'How you like to watch.',
    quip: 'No wrong answer here.',
  },
  goal: {
    title: 'How much do you watch?',
    sub: "We'll keep recommendations in your range.",
    quip: "Pick what sounds like a normal week.",
  },
  alerts: {
    title: "Don't miss the good ones",
    sub: 'We can ping you when something lands you would want.',
    quip: "I'll only speak up when it matters.",
  },
  account: {
    title: 'Keep your picks',
    sub: 'An account saves your taste profile and syncs it to your other devices.',
    quip: 'Last bit, then the fun starts.',
  },
  done: {
    title: "You're all set",
    sub: 'Your profile is ready. Dive in whenever you like.',
    quip: "That's a great taste profile. Go on then.",
  },
};

/* ----------------------------- mascot ----------------------------- */

const Poppy: React.FC<{ mood: 'idle' | 'happy' | 'party' }> = ({ mood }) => (
  <motion.div
    className="onb-poppy"
    /* hops travel along an arc, never straight up: x drifts while y rises */
    animate={
      mood === 'party'
        ? { y: [0, -12, 0], x: [0, 6, 0], rotate: [0, -5, 5, 0], scaleY: [1, 1.04, 0.97, 1] }
        : mood === 'happy'
          ? { y: [0, -7, 0], x: [0, 4, 0], rotate: [0, -3, 2, 0], scaleY: [1, 1.05, 0.96, 1] }
          : { y: [0, -4, 0], x: [0, 2, 0], rotate: [0, 1.5, 0] }
    }
    transition={{
      duration: mood === 'party' ? 1.1 : mood === 'happy' ? 0.72 : 2.6,
      repeat: Infinity,
      ease: 'easeInOut',
      times: mood === 'idle' ? undefined : [0, 0.42, 0.72, 1],
    }}
    aria-hidden="true"
  >
    <svg viewBox="0 0 120 120" width="100%" height="100%" role="presentation">
      {/* popcorn puffs */}
      <g fill="#FFF3DC">
        <circle cx="44" cy="40" r="13" />
        <circle cx="62" cy="32" r="15" />
        <circle cx="79" cy="40" r="12" />
        <circle cx="54" cy="52" r="10" fill="#FFE7C2" />
        <circle cx="70" cy="53" r="9" fill="#FFE7C2" />
      </g>
      {/* bucket */}
      <path d="M32 52 L88 52 L82 104 A6 6 0 0 1 76 109 L44 109 A6 6 0 0 1 38 104 Z" fill="hsl(var(--primary))" />
      {/* stripes */}
      <g fill="#FFFFFF" opacity="0.9">
        <path d="M45 52 L58 52 L54 109 L43 109 Z" />
        <path d="M63 52 L76 52 L77 109 L66 109 Z" />
      </g>
      {/* eyes */}
      <g className="onb-blink">
        <circle cx="50" cy="74" r="7.5" fill="#1A1A1A" />
        <circle cx="70" cy="74" r="7.5" fill="#1A1A1A" />
        <circle cx="52.4" cy="71.4" r="2.4" fill="#FFFFFF" />
        <circle cx="72.4" cy="71.4" r="2.4" fill="#FFFFFF" />
      </g>
      {/* smile */}
      <path
        d={mood === 'idle' ? 'M52 89 Q60 95 68 89' : 'M51 87 Q60 97 69 87'}
        stroke="#1A1A1A"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  </motion.div>
);

/* --------------------------- confetti ----------------------------- */

const Confetti: React.FC<{ pieces: { left: number; delay: number; hue: string; tilt: number; drift: number }[] }> = ({
  pieces,
}) => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    {pieces.map((piece, index) => (
      <span
        key={index}
        className="onb-confetti"
        style={{
          left: `${piece.left}%`,
          animationDelay: `${piece.delay}s`,
          background: piece.hue,
          ['--onb-tilt' as string]: `${piece.tilt}deg`,
          ['--onb-drift' as string]: `${piece.drift}px`,
        }}
      />
    ))}
  </div>
);

/* --------------------------- component ---------------------------- */

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const reduceMotion = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const [mood, setMood] = useState<'idle' | 'happy' | 'party'>('idle');
  const [genres, setGenres] = useState<number[]>([]);
  const [format, setFormat] = useState<OnboardingProfile['format'] | null>(null);
  const [goal, setGoal] = useState<OnboardingProfile['dailyGoal'] | null>(null);
  const [notifyMovies, setNotifyMovies] = useState(true);
  const [notifySeries, setNotifySeries] = useState(true);

  /* account step */
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  const step = STEPS[stepIndex];
  const headingRef = useRef<HTMLHeadingElement>(null);
  const advanceTimer = useRef<number | null>(null);

  /* a signed-in visitor should never be asked to sign up again */
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session?.user?.email) setSessionEmail(data.session.user.email);
    }).catch(() => {
      /* offline: the step still offers sign-up and skip */
    });
    return () => {
      active = false;
    };
  }, []);

  /* resume a half-finished run instead of starting over */
  useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem(STORAGE.draft) || 'null') as Partial<OnboardingProfile> | null;
      if (!draft) return;
      if (Array.isArray(draft.genres)) setGenres(draft.genres);
      if (draft.format) setFormat(draft.format);
      if (draft.dailyGoal) setGoal(draft.dailyGoal);
      if (typeof draft.notifyMovies === 'boolean') setNotifyMovies(draft.notifyMovies);
      if (typeof draft.notifySeries === 'boolean') setNotifySeries(draft.notifySeries);
    } catch {
      /* a corrupt draft should never block onboarding */
    }
  }, []);

  const draft: OnboardingProfile = useMemo(
    () => ({
      genres,
      format: format ?? 'both',
      dailyGoal: goal ?? 'episode',
      notifyMovies,
      notifySeries,
    }),
    [genres, format, goal, notifyMovies, notifySeries],
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE.draft, JSON.stringify(draft));
    } catch {
      /* storage full or blocked: onboarding still works */
    }
  }, [draft]);

  /* mood follows the step; focus is moved once the entrance settles */
  useEffect(() => {
    setMood(step === 'done' ? 'party' : 'idle');
  }, [step]);

  const focusHeading = useCallback(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  const tap = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(6);
    setMood('happy');
    window.setTimeout(() => setMood((current) => (current === 'happy' ? 'idle' : current)), 380);
  }, []);

  /* Postel's law: accept whatever the person gives. Zero genres is a valid
     answer, so the CTA offers to skip instead of refusing to move. */

  const next = useCallback(() => {
    setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
  }, []);

  const back = useCallback(() => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    setStepIndex((index) => Math.max(index - 1, 0));
  }, []);

  /* single-choice waits a beat so the selection is visible before moving */
  const chooseAndAdvance = useCallback(
    (apply: () => void) => {
      apply();
      tap();
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
      advanceTimer.current = window.setTimeout(next, reduceMotion ? 60 : 150);
    },
    [next, reduceMotion, tap],
  );

  useEffect(() => () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
  }, []);

  /* Account creation is a step, not a wall: it can be done here, or later. */
  const submitAccount = useCallback(async () => {
    if (sessionEmail || authNotice) {
      next();
      return;
    }
    setAuthError(null);
    const cleanEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      setAuthError('That email looks incomplete. Check it and try again.');
      return;
    }
    if (authMode === 'signup' && password.length < 8) {
      setAuthError('Use at least 8 characters for your password.');
      return;
    }
    if (authMode === 'login' && password.length === 0) {
      setAuthError('Enter your password to sign in.');
      return;
    }

    setAuthBusy(true);
    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email: cleanEmail, password });
        if (error) {
          setAuthError(error.message);
          return;
        }
        if (data.session?.user?.email) {
          setSessionEmail(data.session.user.email);
          tap();
          next();
          return;
        }
        setAuthNotice(`We sent a confirmation link to ${cleanEmail}. Confirm it whenever you like.`);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error) {
        setAuthError(error.message);
        return;
      }
      if (data.session?.user?.email) {
        setSessionEmail(data.session.user.email);
        tap();
        next();
      }
    } catch {
      setAuthError('We could not reach the server. Check your connection and try again.');
    } finally {
      setAuthBusy(false);
    }
  }, [authMode, authNotice, email, next, password, sessionEmail, tap]);

  const finish = useCallback(
    (skipped = false) => {
      const finalProfile: OnboardingProfile = skipped
        ? { genres: [], format: 'both', dailyGoal: 'episode', notifyMovies: true, notifySeries: true }
        : draft;

      try {
        localStorage.setItem(STORAGE.version, ONBOARDING_VERSION);
        localStorage.setItem(STORAGE.completed, 'true');
        localStorage.setItem(
          STORAGE.notification,
          JSON.stringify({ movies: finalProfile.notifyMovies, series: finalProfile.notifySeries }),
        );
        localStorage.setItem(
          STORAGE.profile,
          JSON.stringify({ ...finalProfile, signedIn: Boolean(sessionEmail), completedAt: new Date().toISOString() }),
        );
        localStorage.removeItem(STORAGE.draft);

        /* merge into the preferences the rest of the app already reads */
        const existing = JSON.parse(localStorage.getItem(STORAGE.userPreferences) || '{}');
        localStorage.setItem(
          STORAGE.userPreferences,
          JSON.stringify({
            ...existing,
            preferredGenres: finalProfile.genres,
            enableNotifications: finalProfile.notifyMovies || finalProfile.notifySeries,
            preferredFormat: finalProfile.format,
            dailyGoal: finalProfile.dailyGoal,
          }),
        );
      } catch {
        /* never let storage stop someone from getting into the app */
      }

      onComplete({
        movies: finalProfile.format !== 'series',
        series: finalProfile.format !== 'movies',
      });
    },
    [draft, onComplete, sessionEmail],
  );

  const toggleGenre = (id: number) => {
    const already = genres.includes(id);
    setGenres((current) => (already ? current.filter((genre) => genre !== id) : [...current, id]));
    tap();
  };

  const progress = stepIndex / (STEPS.length - 1);
  const genreNames = GENRES.filter((genre) => genres.includes(genre.id)).map((genre) => genre.label);
  const skipFocusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-bright focus-visible:ring-offset-2 focus-visible:ring-offset-background';

  const confetti = useMemo(
    () =>
      Array.from({ length: 26 }, (_, index) => ({
        left: (index * 37) % 100,
        delay: (index % 9) * 0.12,
        tilt: (index % 2 ? 1 : -1) * (18 + (index % 5) * 9),
        drift: (index % 2 ? 1 : -1) * (10 + (index % 7) * 6),
        hue: ['hsl(var(--primary))', 'hsl(var(--primary-bright))', '#FFFFFF', 'hsl(var(--rating))'][index % 4],
      })),
    [],
  );

  const slide = {
    enter: { opacity: 0, x: reduceMotion ? 0 : 28 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: reduceMotion ? 0 : -22 },
  };

  return (
    <div className="onboarding fixed inset-0 z-[100] flex flex-col bg-background text-foreground">
      <div className="onb-glow pointer-events-none absolute inset-x-0 top-0 h-72" aria-hidden="true" />
      {step === 'done' && <Confetti pieces={confetti} />}

      {/* header: back, progress, count */}
      <header className="relative mx-auto flex w-full max-w-[560px] items-center gap-3 px-5 pt-5">
        {stepIndex === 0 ? (
          <div className="flex items-center gap-2.5">
            <img src={BRAND_LOGO} alt="" aria-hidden="true" className="h-9 w-9 rounded-lg object-cover" />
            <span className="font-display text-base tracking-wide">
              HYPE<span className="text-primary">STREAM</span>
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={back}
            className={`onb-back ${skipFocusRing}`}
            aria-label="Go back one step"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
        )}

        <div
          className="onb-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-label="Onboarding progress"
        >
          <motion.div
            className="onb-fill"
            initial={false}
            animate={{ width: `${Math.max(progress * 100, 4)}%` }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 320, damping: 30, restDelta: 0.5 }
            }
          />
        </div>

        <span className="w-9 text-right text-xs font-medium tabular-nums text-muted-foreground">
          {stepIndex + 1}/{STEPS.length}
        </span>
      </header>

      <p className="sr-only" aria-live="polite">
        {`Step ${stepIndex + 1} of ${STEPS.length}: ${copy[step].title}`}
      </p>

      {/* body */}
      <main className="onb-body relative mx-auto flex w-full max-w-[560px] flex-1 flex-col overflow-y-auto px-5 pb-2 pt-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            key={step}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.32, 0.72, 0, 1] }}
            onAnimationComplete={focusHeading}
            className="flex flex-1 flex-col"
          >
            <div className="onb-head">
              <Poppy mood={mood} />
              <div className="onb-quip">
                <span>{copy[step].quip}</span>
              </div>
            </div>

            <h1 ref={headingRef} tabIndex={-1} className="onb-title font-display" data-step={step}>
              {copy[step].title}
            </h1>
            <p className="onb-sub">{copy[step].sub}</p>

            {step === 'welcome' && (
              <motion.div
                className="onb-art"
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1], delay: reduceMotion ? 0 : 0.08 }}
              >
                <img src={onboardingCinematic} alt="" aria-hidden="true" width={1600} height={900} />
                <div className="onb-art-scrim" aria-hidden="true" />
              </motion.div>
            )}

            {/* ---------------- step bodies ---------------- */}
            {step === 'genres' && (
              <div className="onb-grid" role="group" aria-label="Choose the genres you enjoy">
                {GENRES.map((genre, index) => {
                  const selected = genres.includes(genre.id);
                  return (
                    <motion.button
                      key={genre.id}
                      type="button"
                      onClick={() => toggleGenre(genre.id)}
                      aria-pressed={selected}
                      whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: reduceMotion ? 0 : index * 0.025, duration: 0.22 }}
                      className={`onb-tile ${skipFocusRing} ${selected ? 'is-selected' : ''}`}
                    >
                      <span className={`onb-tile-glyph ${selected ? 'is-on' : ''}`} aria-hidden="true">
                        <genre.Icon className="h-5 w-5" strokeWidth={1.9} />
                      </span>
                      <span className="onb-tile-label">{genre.label}</span>
                      {selected && (
                        <motion.span
                          className="onb-tile-check"
                          initial={reduceMotion ? false : { scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 520, damping: 22 }}
                        >
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {step === 'format' && (
              <div className="onb-list" role="radiogroup" aria-label="Movies or series">
                {FORMATS.map((option) => {
                  const selected = format === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => chooseAndAdvance(() => setFormat(option.value))}
                      className={`onb-row ${skipFocusRing} ${selected ? 'is-selected' : ''}`}
                    >
                      <span className="onb-row-text">
                        <span className="onb-row-title">{option.title}</span>
                        <span className="onb-row-blurb">{option.blurb}</span>
                      </span>
                      <span className={`onb-radio ${selected ? 'is-on' : ''}`} aria-hidden="true">
                        {selected && <Check className="h-3.5 w-3.5" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 'goal' && (
              <div className="onb-list" role="radiogroup" aria-label="How much do you watch">
                {GOALS.map((option) => {
                  const selected = goal === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => chooseAndAdvance(() => setGoal(option.value))}
                      className={`onb-row ${skipFocusRing} ${selected ? 'is-selected' : ''}`}
                    >
                      <span className="onb-row-text">
                        <span className="onb-row-title">{option.title}</span>
                        <span className="onb-row-blurb">{option.blurb}</span>
                      </span>
                      <span className={`onb-radio ${selected ? 'is-on' : ''}`} aria-hidden="true">
                        {selected && <Check className="h-3.5 w-3.5" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 'alerts' && (
              <div className="onb-list">
                {[
                  { label: 'New episodes of shows I follow', value: notifySeries, set: setNotifySeries },
                  { label: 'New films worth my time', value: notifyMovies, set: setNotifyMovies },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      item.set(!item.value);
                      tap();
                    }}
                    aria-pressed={item.value}
                    className={`onb-row ${skipFocusRing} ${item.value ? 'is-selected' : ''}`}
                  >
                    <span className="onb-row-text">
                      <span className="onb-row-title">{item.label}</span>
                    </span>
                    <span className={`onb-switch ${item.value ? 'is-on' : ''}`} aria-hidden="true">
                      <span className="onb-switch-knob" />
                    </span>
                  </button>
                ))}
                <p className="onb-hint">
                  <Bell className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
                  You can turn these off any time in settings.
                </p>
              </div>
            )}

            {step === 'account' && (
              <div className="onb-form">
                {sessionEmail ? (
                  <div className="onb-notice">
                    <Check className="h-4 w-4 shrink-0 text-primary-bright" aria-hidden="true" />
                    <span>
                      You are signed in as <strong className="text-foreground">{sessionEmail}</strong>. Your picks are already
                      saved.
                    </span>
                  </div>
                ) : authNotice ? (
                  <div className="onb-notice" role="status">
                    <Mail className="h-4 w-4 shrink-0 text-primary-bright" aria-hidden="true" />
                    <span>{authNotice}</span>
                  </div>
                ) : (
                  <>
                    <label className="onb-field">
                      <span className="onb-field-label">Email</span>
                      <span className="onb-input-wrap">
                        <Mail className="onb-input-icon" aria-hidden="true" />
                        <input
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          spellCheck={false}
                          value={email}
                          onChange={(event) => {
                            setEmail(event.target.value);
                            if (authError) setAuthError(null);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') void submitAccount();
                          }}
                          placeholder="you@example.com"
                          className="onb-input"
                          aria-invalid={Boolean(authError)}
                        />
                      </span>
                    </label>

                    <label className="onb-field">
                      <span className="onb-field-label">Password</span>
                      <span className="onb-input-wrap">
                        <Lock className="onb-input-icon" aria-hidden="true" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                          value={password}
                          onChange={(event) => {
                            setPassword(event.target.value);
                            if (authError) setAuthError(null);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') void submitAccount();
                          }}
                          placeholder={authMode === 'signup' ? 'At least 8 characters' : 'Your password'}
                          className="onb-input onb-input-pw"
                          aria-invalid={Boolean(authError)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((value) => !value)}
                          className="onb-eye"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          aria-pressed={showPassword}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </span>
                    </label>

                    {authError && (
                      <p className="onb-error" role="alert">
                        {authError}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode((mode) => (mode === 'signup' ? 'login' : 'signup'));
                        setAuthError(null);
                      }}
                      className="onb-alt"
                    >
                      {authMode === 'signup' ? 'I already have an account' : 'Create a new account instead'}
                    </button>
                  </>
                )}

                {!sessionEmail && (
                  <button type="button" onClick={next} className="onb-skip">
                    {authNotice ? 'Continue' : 'Not now, let me look around first'}
                  </button>
                )}
              </div>
            )}

            {step === 'done' && (
              <div className="onb-summary">
                {[
                  { label: 'You like', value: genreNames.length ? genreNames.slice(0, 4).join(' · ') : 'Everything' },
                  {
                    label: 'You watch',
                    value: FORMATS.find((option) => option.value === format)?.title ?? 'A bit of both',
                  },
                  {
                    label: 'Typical night',
                    value: GOALS.find((option) => option.value === goal)?.blurb ?? 'About 30 minutes',
                  },
                  {
                    label: 'Saved to',
                    value: sessionEmail ?? (authNotice ? 'Confirm your email' : 'This device only'),
                  },
                ].map((row) => (
                  <div key={row.label} className="onb-summary-row">
                    <span className="onb-summary-label">{row.label}</span>
                    <span className="onb-summary-value">{row.value}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.section>
        </AnimatePresence>
      </main>

      {/* footer */}
      <footer className="onb-footer relative mx-auto w-full max-w-[560px] px-5">
        <button
          type="button"
          onClick={() => {
            if (step === 'done') finish();
            else if (step === 'account') void submitAccount();
            else next();
          }}
          disabled={step === 'account' && authBusy && !sessionEmail && !authNotice}
          className={`onb-cta ${skipFocusRing}`}
        >
          {step === 'welcome' && (
            <>
              Let&rsquo;s go <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </>
          )}
          {step === 'genres' &&
            (genres.length ? (
              <>
                Continue ·{' '}
                <motion.span
                  key={genres.length}
                  className="inline-block tabular-nums"
                  initial={reduceMotion ? false : { scale: 0.6, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 620, damping: 20 }}
                >
                  {genres.length}
                </motion.span>{' '}
                picked
              </>
            ) : (
              'Skip this step'
            ))}
          {(step === 'format' || step === 'goal') && (
            <>
              Continue <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </>
          )}
          {step === 'alerts' && (notifyMovies || notifySeries ? 'Turn on alerts' : 'Skip alerts')}
          {step === 'account' &&
            (sessionEmail || authNotice ? (
              'Continue'
            ) : authBusy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Working
              </>
            ) : authMode === 'signup' ? (
              'Create my account'
            ) : (
              'Sign in'
            ))}
          {step === 'done' && (
            <>
              Start watching <Sparkles className="ml-2 h-5 w-5" aria-hidden="true" />
            </>
          )}
        </button>

        {step === 'welcome' ? (
          <button
            type="button"
            onClick={() => finish(true)}
            className={`onb-skip ${skipFocusRing}`}
          >
            Skip for now
          </button>
        ) : (
          <p className="onb-footnote">
            {step === 'done'
              ? 'Change any of this later in your profile.'
              : step === 'account'
                ? 'You can also create one later from your profile.'
                : 'Takes about 30 seconds.'}
          </p>
        )}
      </footer>
    </div>
  );
};

export default WelcomeScreen;
