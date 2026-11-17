import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BellRing, Check, ChevronLeft, ChevronRight, Film, Play, Sparkles, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import onboardingCinema from '@/assets/onboarding-cinematic.jpg';

interface WelcomeScreenProps {
  onComplete: (preferences: { movies: boolean; series: boolean }) => void;
}

const steps = [
  { label: 'Welcome', title: 'Your next favorite starts here.', description: 'A world of films and series, brought together in one place.' },
  { label: 'Your taste', title: 'What are you into?', description: 'Choose what you want to see more of. You can change this anytime.' },
  { label: 'Stay in the loop', title: 'Only the updates you want.', description: 'Choose your release alerts. You can fine-tune notifications later in Settings.' },
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [selectedPreferences, setSelectedPreferences] = useState({ movies: true, series: true });
  const [releaseAlerts, setReleaseAlerts] = useState(true);
  const reduceMotion = useReducedMotion();
  const current = steps[step];

  const complete = () => {
    localStorage.setItem('hypestream_welcome_completed', 'true');
    localStorage.setItem('hypestream_notification_prefs', JSON.stringify({ ...selectedPreferences, newReleases: releaseAlerts }));
    onComplete(selectedPreferences);
  };

  const advance = () => {
    if (step < steps.length - 1) setStep(value => value + 1);
    else complete();
  };

  const togglePreference = (type: 'movies' | 'series') => {
    setSelectedPreferences(previous => ({ ...previous, [type]: !previous[type] }));
  };

  return (
    <motion.main
      className="fixed inset-0 z-[100] flex min-h-[100dvh] items-center justify-center overflow-y-auto bg-background px-5 py-8 text-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.25 }}
      aria-label="HypeStream welcome"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(var(--primary)/0.18),transparent_58%)]" />
      <section className="relative z-10 mx-auto w-full max-w-xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/lovable-uploads/7ea3104a-6d4d-4bbd-b3c1-0aac01fc7026.png" alt="" className="h-10 w-10 rounded-lg object-cover" />
            <span className="font-display text-xl tracking-wide">HYPE<span className="text-primary">STREAM</span></span>
          </div>
          <span className="text-sm text-muted-foreground">{step + 1} of {steps.length}</span>
        </header>

        <div className="mb-9 flex gap-2" role="progressbar" aria-label="Onboarding progress" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={step + 1}>
          {steps.map((item, index) => (
            <div key={item.label} className="h-1 flex-1 overflow-hidden rounded-full bg-muted" aria-current={step === index ? 'step' : undefined}>
              <motion.div className="h-full bg-primary" initial={false} animate={{ width: index <= step ? '100%' : '0%' }} transition={{ duration: reduceMotion ? 0 : 0.25 }} />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: reduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduceMotion ? 0 : -12 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            <p className="mb-3 text-xs font-semibold uppercase text-primary">{current.label}</p>
            <h1 id="welcome-step-title" className="mb-3 font-display text-4xl leading-tight sm:text-5xl">{current.title}</h1>
            <p id="welcome-step-description" className="mb-8 max-w-lg text-base leading-relaxed text-muted-foreground">{current.description}</p>

            {step === 0 && (
              <div className="relative mb-8 flex aspect-[16/8] items-end overflow-hidden rounded-lg border border-border bg-card p-6 sm:p-8">
                <img src={onboardingCinema} alt="" aria-hidden="true" width={1600} height={900} className="absolute inset-0 h-full w-full object-cover object-center" />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/35 to-transparent" />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                <div className="relative flex max-w-sm items-end gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Play className="ml-0.5 h-5 w-5 fill-current" /></div>
                  <div><p className="mb-1 text-xs uppercase text-muted-foreground">Made for your next watch</p><p className="font-display text-2xl">Press play on something great.</p></div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {([
                  { key: 'movies', title: 'Movies', detail: 'From new releases to all-time favorites', Icon: Film },
                  { key: 'series', title: 'TV series', detail: 'Find a story worth staying for', Icon: Tv },
                ] as const).map(({ key, title, detail, Icon }) => {
                  const selected = selectedPreferences[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => togglePreference(key)}
                      className={`relative flex min-h-28 items-center gap-4 rounded-md border p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-muted-foreground'}`}
                    >
                      <Icon className={`h-8 w-8 shrink-0 ${selected ? 'text-primary' : 'text-muted-foreground'}`} aria-hidden="true" />
                      <span className="min-w-0"><span className="block font-semibold">{title}</span><span className="mt-1 block text-sm leading-snug text-muted-foreground">{detail}</span></span>
                      {selected && <Check className="absolute right-3 top-3 h-4 w-4 text-primary" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            )}

            {step === 2 && (
              <button
                type="button"
                aria-pressed={releaseAlerts}
                onClick={() => setReleaseAlerts(value => !value)}
                className={`mb-8 flex w-full items-start gap-4 rounded-md border p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${releaseAlerts ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-muted-foreground'}`}
              >
                <BellRing className={`mt-0.5 h-6 w-6 shrink-0 ${releaseAlerts ? 'text-primary' : 'text-muted-foreground'}`} aria-hidden="true" />
                <span className="min-w-0 flex-1"><span className="block font-semibold">New movie & series releases</span><span className="mt-1 block text-sm leading-relaxed text-muted-foreground">Get a heads-up when something new arrives. Device alerts can be enabled later in Settings.</span></span>
                {releaseAlerts && <Check className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />}
              </button>
            )}
          </motion.div>
        </AnimatePresence>

        <footer className="flex items-center justify-between gap-3 border-t border-border pt-5">
          {step > 0 ? (
            <Button type="button" variant="ghost" onClick={() => setStep(value => value - 1)} className="min-h-11 px-3">
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={complete} className="min-h-11 px-3">Skip</Button>
          )}
          <Button
            type="button"
            onClick={advance}
            disabled={step === 1 && !selectedPreferences.movies && !selectedPreferences.series}
            className="min-h-11 px-6"
          >
            {step === steps.length - 1 ? 'Start watching' : 'Continue'}
            {step === steps.length - 1 ? <Sparkles className="ml-2 h-4 w-4" /> : <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </footer>
      </section>
    </motion.main>
  );
};

export default WelcomeScreen;