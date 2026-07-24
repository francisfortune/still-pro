import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { storage } from '../lib/storage';
import { isInstallable, promptInstall, onInstallabilityChange } from '../lib/pwa';
import { Moon, Sun, Monitor, Target, CheckCircle2, XCircle, LayoutTemplate, Coffee, BarChart, Activity } from 'lucide-react';

function FadeIn({ children, delay = 0, className = "", stagger = false }: { children: React.ReactNode, delay?: number, className?: string, stagger?: boolean }) {
  if (stagger) {
    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
          visible: { transition: { staggerChildren: 0.1, delayChildren: delay } },
          hidden: {}
        }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } }
};

export default function Landing() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [intention, setIntention] = useState('');
  const [hasData, setHasData] = useState(false);
  const [installable, setInstallable] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHasData(storage.getSessions().length > 0);
    setInstallable(isInstallable());
    const unsub = onInstallabilityChange(setInstallable);
    return unsub;
  }, []);

  const handleStart = (e: React.FormEvent, value: string) => {
    e.preventDefault();
    if (!value.trim()) return;
    storage.setActiveSession({
      intention: value.trim(),
      startedAt: Date.now(),
      pausedDuration: 0,
      isPaused: false
    });
    setLocation('/session');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-extrabold text-[#2563EB] tracking-widest text-lg">STILL</div>
          <div className="flex items-center gap-6">
            {hasData && (
              <Link href="/today" className="text-sm font-medium hover:text-[#2563EB] transition-colors hidden sm:block">
                Today
              </Link>
            )}
            {installable && (
              <button onClick={promptInstall} className="text-sm font-medium hover:text-[#2563EB] transition-colors hidden sm:block">
                Install App
              </button>
            )}
            {mounted && (
              <button onClick={toggleTheme} className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors" aria-label="Toggle theme">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center p-6 bg-[#060812] text-white overflow-hidden pt-16">
        {/* Ambient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-[#2563EB] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-[#3b82f6] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>

        <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="px-4 py-1.5 rounded-full border border-white/20 bg-white/5 text-xs font-semibold tracking-wider uppercase mb-8"
          >
            Focus, one intention at a time
          </motion.div>

          <h1 className="text-[clamp(52px,8vw,120px)] font-extrabold leading-[1.05] tracking-tight mb-8">
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="block">Stay with</motion.span>
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="block">what you're</motion.span>
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="block text-[#3b82f6]">doing.</motion.span>
          </h1>

          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="text-white/60 text-[clamp(18px,2.5vw,24px)] mb-12 max-w-xl"
          >
            Not another productivity app. Just you and what matters.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
            className="w-full max-w-xl"
          >
            <form onSubmit={(e) => handleStart(e, intention)} className="relative flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="What are you doing right now?"
                className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-2xl py-5 px-6 text-lg outline-none focus:border-[#3b82f6] focus:bg-white/15 transition-all"
                value={intention}
                onChange={e => setIntention(e.target.value)}
                data-testid="input-hero-intention"
              />
              <button 
                type="submit" 
                className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-2xl px-8 py-5 text-lg font-bold transition-colors shrink-0 whitespace-nowrap"
                data-testid="btn-hero-start"
              >
                Start
              </button>
            </form>
            <p className="text-white/40 text-sm mt-4">No account needed. Works offline.</p>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-32 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-20">
              <h2 className="still-h2 mb-4">A simpler way to work</h2>
              <p className="text-muted-foreground text-xl">Three steps to presence.</p>
            </div>
          </FadeIn>

          <FadeIn stagger className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { num: '01', title: 'Declare', desc: "You name one intention. Just one. That's your anchor." },
              { num: '02', title: 'Stay', desc: "A calm timer runs. No noise. Just you and the work." },
              { num: '03', title: 'Reflect', desc: "When you finish, you see where your time went. No judgement." }
            ].map((step) => (
              <motion.div key={step.num} variants={staggerItem} className="flex flex-col items-center text-center">
                <div className="text-6xl font-extrabold text-blue-500/20 dark:text-[#2563EB]/40 mb-6">{step.num}</div>
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-32 px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="mb-20">
            <h2 className="still-h2 mb-4">Built differently.</h2>
            <p className="text-muted-foreground text-xl max-w-2xl">Everything else screams for attention. STILL gets out of the way.</p>
          </FadeIn>

          <FadeIn stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Target, title: 'One Intention', desc: 'No task lists. One thing at a time, by design.' },
              { icon: Activity, title: 'Calm Timer', desc: 'Full-screen. Your work, front and center.' },
              { icon: Monitor, title: 'Distraction Overlay', desc: 'The browser extension gently asks: "Why are you here?"' },
              { icon: Coffee, title: 'Break Mode', desc: 'Rest intentionally. STILL never makes you feel guilty.' },
              { icon: LayoutTemplate, title: 'Daily Timeline', desc: 'See exactly where your day went.' },
              { icon: BarChart, title: 'Weekly Insights', desc: 'Patterns, not pressure.' },
            ].map((feature, i) => (
              <motion.div key={i} variants={staggerItem} className="still-card bg-background border-border/50 hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-[#2563EB]/20 text-[#2563EB] flex items-center justify-center mb-6">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="py-32 px-6 bg-[#060812] text-white border-y border-white/10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <FadeIn>
            <h2 className="text-[clamp(40px,5vw,64px)] font-bold leading-tight">
              "Most apps say 'do more.' <br/><span className="text-[#3b82f6]">STILL says 'be here.'</span>"
            </h2>
          </FadeIn>
          
          <FadeIn stagger className="space-y-8">
            {[
              ['Track 50 tasks', 'Hold one intention'],
              ['Celebrate streaks', 'Come back when you can'],
              ['Measure productivity', 'Reflect on presence'],
            ].map(([bad, good], i) => (
              <motion.div key={i} variants={staggerItem} className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start sm:items-center">
                <div className="flex-1 flex items-center gap-3 text-white/50 text-lg">
                  <XCircle className="text-red-400 shrink-0" size={24} />
                  <span>{bad}</span>
                </div>
                <div className="flex-1 flex items-center gap-3 text-white font-semibold text-xl">
                  <CheckCircle2 className="text-[#3b82f6] shrink-0" size={24} />
                  <span>{good}</span>
                </div>
              </motion.div>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* EXTENSION PREVIEW */}
      <section className="py-32 px-6 bg-background overflow-hidden relative">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn className="mb-16">
            <h2 className="still-h2 mb-4">The browser companion.</h2>
            <p className="text-muted-foreground text-xl">Always watching. Never judging.</p>
          </FadeIn>
          
          <FadeIn className="relative mx-auto max-w-3xl aspect-[16/9] rounded-2xl overflow-hidden border border-border shadow-2xl">
            {/* Fake Youtube BG */}
            <div className="absolute inset-0 bg-secondary flex flex-wrap gap-4 p-4 opacity-50 blur-[2px]">
              {Array.from({length: 12}).map((_, i) => (
                <div key={i} className="w-[30%] h-32 bg-border rounded-lg animate-pulse" style={{animationDelay: `${i*0.2}s`}}></div>
              ))}
            </div>
            {/* The Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xl flex items-center justify-center p-6">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ margin: "-100px" }}
                transition={{ delay: 0.4, type: "spring" }}
                className="bg-[#060812] border border-white/10 rounded-2xl p-8 max-w-md w-full text-left shadow-2xl"
              >
                <div className="text-[#3b82f6] text-xs font-bold tracking-widest uppercase mb-4">STILL Overlay</div>
                <p className="text-white text-xl font-medium mb-6">
                  You said you were:<br/>
                  <span className="font-bold text-2xl mt-2 block">"Writing the landing page copy"</span>
                </p>
                <p className="text-white/60 mb-8">Why are you opening YouTube?</p>
                <div className="flex gap-3">
                  <button className="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-lg py-3 font-medium transition-colors">I need it</button>
                  <button className="flex-1 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg py-3 font-medium transition-colors">Close tab</button>
                </div>
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-40 px-6 bg-[#060812] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <FadeIn>
            <h2 className="text-[clamp(40px,6vw,64px)] font-bold mb-6">Start your first session.</h2>
            <p className="text-white/60 text-xl mb-12">Type what you're doing. Press start. That's it.</p>
            
            <form onSubmit={(e) => handleStart(e, intention)} className="relative flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <input
                type="text"
                placeholder="What are you doing right now?"
                className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-2xl py-5 px-6 text-lg outline-none focus:border-[#3b82f6] focus:bg-white/15 transition-all"
                value={intention}
                onChange={e => setIntention(e.target.value)}
              />
              <button 
                type="submit" 
                className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-2xl px-8 py-5 text-lg font-bold transition-colors shrink-0 whitespace-nowrap"
              >
                Start
              </button>
            </form>
            <p className="text-white/40 text-sm mt-6">Works on all devices. Free forever.</p>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0a0a0f] text-white/50 py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-widest text-white">STILL</span>
            <span className="hidden sm:inline">— Stay with what you're doing.</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/today" className="hover:text-white transition-colors">Today</Link>
            <Link href="/week" className="hover:text-white transition-colors">Week</Link>
            <Link href="/building" className="hover:text-white transition-colors">Building</Link>
            <Link href="/settings" className="hover:text-white transition-colors">Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
