import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Loader2, Smartphone, AlertCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface Prefs {
  new_releases_enabled: boolean;
  new_releases_per_day: number;
  recommendations_enabled: boolean;
  recommendations_per_week: number;
  preferred_day_of_week: number;
  quiet_hours_start: number;
  quiet_hours_end: number;
  min_match_score: number;
  timezone: string;
}

const DEFAULTS: Prefs = {
  new_releases_enabled: true,
  new_releases_per_day: 1,
  recommendations_enabled: true,
  recommendations_per_week: 1,
  preferred_day_of_week: 0,
  quiet_hours_start: 22,
  quiet_hours_end: 8,
  min_match_score: 2,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const NotificationPreferences: React.FC = () => {
  const { toast } = useToast();
  const { status, subscribed, subscribe, unsubscribe, isPreviewHost } = usePushNotifications();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setPrefs({ ...DEFAULTS, ...data });
      setLoading(false);
    })();
  }, []);

  const update = <K extends keyof Prefs>(k: K, v: Prefs[K]) =>
    setPrefs(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({ user_id: user.id, ...prefs }, { onConflict: 'user_id' });
    setSaving(false);
    toast(error
      ? { title: 'Save failed', description: error.message, variant: 'destructive' }
      : { title: 'Saved', description: 'Notification preferences updated' });
  };

  const handleTogglePush = async () => {
    if (subscribed) {
      await unsubscribe();
      toast({ title: 'Push notifications disabled on this device' });
    } else {
      const res = await subscribe();
      toast(res.ok
        ? { title: 'Push notifications enabled', description: 'You\'ll get alerts on this device.' }
        : { title: 'Couldn\'t enable push', description: res.reason, variant: 'destructive' });
    }
  };

  const handleTest = async () => {
    setTesting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setTesting(false); return; }
    const { error } = await supabase.functions.invoke('smart-notify', {
      body: { user_id: user.id },
    });
    setTesting(false);
    toast(error
      ? { title: 'Test failed', description: error.message, variant: 'destructive' }
      : { title: 'Test triggered', description: 'Check your notifications shortly.' });
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Notifications</h2>

      {isPreviewHost && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Device push notifications only work on the live published site (hypestream.lovable.app), not in the editor preview. In-app notifications still work everywhere.
          </AlertDescription>
        </Alert>
      )}

      {/* Device toggle */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Smartphone className="h-5 w-5 mt-1 text-primary" />
          <div className="flex-1">
            <h3 className="font-semibold">Device push notifications</h3>
            <p className="text-sm text-muted-foreground">
              Receive alerts on this device even when HypeStream is closed.
              {status === 'unsupported' && ' Your browser does not support push.'}
              {status === 'denied' && ' Permission denied — enable in your browser settings.'}
            </p>
          </div>
          <Button
            variant={subscribed ? 'outline' : 'default'}
            onClick={handleTogglePush}
            disabled={status === 'unsupported' || status === 'denied'}
          >
            {subscribed ? <><BellOff className="h-4 w-4 mr-2" />Disable</> : <><Bell className="h-4 w-4 mr-2" />Enable</>}
          </Button>
        </div>
      </div>

      {/* New releases */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">New releases</h3>
            <p className="text-sm text-muted-foreground">Get notified when a new movie or series is released today.</p>
          </div>
          <Switch checked={prefs.new_releases_enabled} onCheckedChange={v => update('new_releases_enabled', v)} />
        </div>
        {prefs.new_releases_enabled && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Max per day</span>
              <span className="font-semibold">{prefs.new_releases_per_day}</span>
            </div>
            <Slider
              min={0} max={5} step={1}
              value={[prefs.new_releases_per_day]}
              onValueChange={([v]) => update('new_releases_per_day', v)}
            />
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Personalised recommendations</h3>
            <p className="text-sm text-muted-foreground">Based on what you actually watch — not a random spam.</p>
          </div>
          <Switch checked={prefs.recommendations_enabled} onCheckedChange={v => update('recommendations_enabled', v)} />
        </div>
        {prefs.recommendations_enabled && (
          <>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Max per week</span>
                <span className="font-semibold">{prefs.recommendations_per_week}</span>
              </div>
              <Slider
                min={0} max={7} step={1}
                value={[prefs.recommendations_per_week]}
                onValueChange={([v]) => update('recommendations_per_week', v)}
              />
            </div>
            <div>
              <label className="text-sm block mb-2">Delivery day</label>
              <Select
                value={String(prefs.preferred_day_of_week)}
                onValueChange={v => update('preferred_day_of_week', parseInt(v, 10))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      {/* Quiet hours */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="font-semibold">Quiet hours</h3>
        <p className="text-sm text-muted-foreground">No notifications between these times (24h).</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm block mb-2">From</label>
            <Select value={String(prefs.quiet_hours_start)} onValueChange={v => update('quiet_hours_start', parseInt(v, 10))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>{String(i).padStart(2, '0')}:00</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm block mb-2">To</label>
            <Select value={String(prefs.quiet_hours_end)} onValueChange={v => update('quiet_hours_end', parseInt(v, 10))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>{String(i).padStart(2, '0')}:00</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Match score */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="font-semibold">Recommendation strictness</h3>
        <p className="text-sm text-muted-foreground">
          Higher = only notify when a title strongly matches your taste (fewer but more relevant notifications).
        </p>
        <div className="flex justify-between text-sm mb-2">
          <span>Minimum match</span>
          <span className="font-semibold">{prefs.min_match_score} / 5</span>
        </div>
        <Slider
          min={1} max={5} step={1}
          value={[prefs.min_match_score]}
          onValueChange={([v]) => update('min_match_score', v)}
        />
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save preferences
        </Button>
        <Button variant="outline" onClick={handleTest} disabled={testing}>
          {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Send test
        </Button>
      </div>
    </div>
  );
};

export default NotificationPreferences;
