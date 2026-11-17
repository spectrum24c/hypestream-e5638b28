import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Bell, Check, Sparkles } from 'lucide-react';
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

type StepId = 'welcome' | 'genres' | 'format' | 'goal' | 'alerts' | 'done';

const STEPS: StepId[] = ['welcome', 'genres', 'format', 'goal', 'alerts', 'done'];

const BRAND_LOGO = '/lovable-uploads/7ea3104a-6d4d-4bbd-b3c1-0aac01fc7026.png';

const STORAGE = {
  completed: 'hypestream_welcome_completed',
  notification: 'hypestream_notification_prefs',
  profile: 'hypestream_onboarding',
  draft: 'hypestream_onboarding_draft',
  userPreferences: 'userPreferences',
};

/* TMDB genre ids, so this plugs into the rest of the app's preferences */
const GENRES = [
  { id: 28, label: 'Action', glyph: '💥' },
  { id: 35, label: 'Comedy', glyph: '😄' },
  { id: 18, label: 'Drama', glyph: '🎭' },
  { id: 878, label: 'Sci-Fi', glyph: '🚀' },
  { id: 53, label: 'Thriller', glyph: '🕵️' },
  { id: 27, label: 'Horror', glyph: '🩸' },
  { id: 16, label: 'Animation', glyph: '🎨' },
  { id: 9648, label: 'Mystery', glyph: '🔍' },
  { id: 10749, label: 'Romance', glyph: '💞' },
  { id: 10765, label: 'Fantasy', glyph: '🐉' },
  { id: 99, label: 'Docs', glyph: '🎥' },
  { id: 80, label: 'Crime', glyph: '🚔' },
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
    animate={
      mood === 'party'
        ? { y: [0, -10, 0], rotate: [0, -4, 4, 0] }
        : mood === 'happy'
          ? { y: [0, -6, 0], scale: [1, 1.06, 1] }
          : { y: [0, -3, 0] }
    }
    transition={{ duration: mood === 'party' ? 1.1 : 2.4, repeat: Infinity, ease: 'easeInOut' }}
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

  const step = STEPS[stepIndex];
  const headingRef = useRef<HTMLHeadingElement>(null);
  const advanceTimer = useRef<number | null>(null);

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
    window.setTimeout(() => setMood((current) => (current === 'happy' ? 'idle' : current)), 420);
  }, []);

  const canAdvance = step === 'genres' ? genres.length > 0 : true;

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
      advanceTimer.current = window.setTimeout(next, reduceMotion ? 60 : 260);
    },
    [next, reduceMotion, tap],
  );

  useEffect(() => () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
  }, []);

  const finish = useCallback(
    (skipped = false) => {
      const finalProfile: OnboardingProfile = skipped
        ? { genres: [], format: 'both', dailyGoal: 'episode', notifyMovies: true, notifySeries: true }
        : draft;

      try {
        localStorage.setItem(STORAGE.completed, 'true');
        localStorage.setItem(
          STORAGE.notification,
          JSON.stringify({ movies: finalProfile.notifyMovies, series: finalProfile.notifySeries }),
        );
        localStorage.setItem(STORAGE.profile, JSON.stringify({ ...finalProfile, completedAt: new Date().toISOString() }));
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
    [draft, onComplete],
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
            transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.32, 0.72, 0, 1] }}
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
            transition={{ duration: reduceMotion ? 0 : 0.26, ease: [0.32, 0.72, 0, 1] }}
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
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: reduceMotion ? 0 : index * 0.025, duration: 0.22 }}
                      className={`onb-tile ${skipFocusRing} ${selected ? 'is-selected' : ''}`}
                    >
                      <span className="onb-tile-glyph" aria-hidden="true">
                        {genre.glyph}
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
            else next();
          }}
          disabled={!canAdvance && step === 'genres'}
          className={`onb-cta ${skipFocusRing}`}
        >
          {step === 'welcome' && (
            <>
              Let&rsquo;s go <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </>
          )}
          {step === 'genres' && (genres.length ? `Continue · ${genres.length} picked` : 'Pick at least one')}
          {(step === 'format' || step === 'goal') && (
            <>
              Continue <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </>
          )}
          {step === 'alerts' && (notifyMovies || notifySeries ? 'Turn on alerts' : 'Skip alerts')}
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
            {step === 'done' ? 'Change any of this later in your profile.' : 'Takes about 30 seconds.'}
          </p>
        )}
      </footer>
    </div>
  );
};

export default WelcomeScreen;
