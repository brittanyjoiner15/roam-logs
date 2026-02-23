import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'


export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden"
        style={{
          background:
            'linear-gradient(to bottom, #0f1f0f 0%, #1e3220 25%, #4a2e10 60%, #c04a1a 80%, #e8773e 100%)',
        }}
      >
        {/* Layered landscape silhouette */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg
            viewBox="0 0 1200 220"
            preserveAspectRatio="none"
            className="w-full h-28 md:h-44"
            aria-hidden="true"
          >
            {/* Back mountains */}
            <path
              d="M0,220 L0,120 L120,60 L240,100 L380,35 L500,85 L640,25 L760,75 L900,40 L1020,80 L1140,50 L1200,90 L1200,220 Z"
              fill="#2a4a2a"
              opacity="0.55"
            />
            {/* Mid mountains */}
            <path
              d="M0,220 L0,150 L90,100 L180,135 L310,80 L430,120 L570,65 L700,110 L830,75 L960,105 L1080,80 L1200,115 L1200,220 Z"
              fill="#1a3015"
              opacity="0.8"
            />
            {/* Foreground treeline */}
            <path
              d="M0,220 L0,175 L35,155 L55,175 L80,145 L105,165 L135,140 L160,162 L188,140 L215,165 L245,145 L272,168 L300,148 L328,168 L358,148 L385,168 L415,148 L445,132 L472,155 L500,138 L530,158 L558,142 L588,168 L618,148 L648,132 L675,155 L703,138 L730,158 L760,142 L790,168 L820,148 L848,132 L876,155 L904,138 L932,158 L960,142 L990,168 L1018,148 L1048,132 L1075,155 L1103,138 L1132,158 L1162,142 L1200,162 L1200,220 Z"
              fill="#0d1f08"
            />
          </svg>
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-brand font-semibold tracking-widest text-sm uppercase mb-5 opacity-90">
            RoamLogs
          </p>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Every campsite<br />has a story.
            <br />
            <span className="text-brand">Start telling yours.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/75 mb-10 max-w-xl mx-auto leading-relaxed">
            A camping journal built for the open road — log your stays, discover
            new campgrounds, and share your adventures with fellow travelers.
          </p>

          {user ? (
            <Link
              href="/feed"
              className="inline-block bg-brand text-white text-lg font-semibold px-10 py-4 rounded-button hover:bg-brand/90 transition-colors shadow-lg"
            >
              Go to my feed →
            </Link>
          ) : (
            <Link
              href="/signup"
              className="inline-block bg-brand text-white text-lg font-semibold px-10 py-4 rounded-button hover:bg-brand/90 transition-colors shadow-lg"
            >
              Join early access
            </Link>
          )}
        </div>
      </section>

      {/* ── SOCIAL PROOF STRIP ──────────────────────────────────────── */}
      <section className="bg-sand/25 border-y border-sand/50 py-7 px-6 text-center">
        <p className="text-ink text-lg font-medium">
          Built for full-timers, weekenders, and everyone in between.&nbsp;&nbsp;🏕️
        </p>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-ink text-center mb-3">
            Everything you need on the road
          </h2>
          <p className="text-gray-500 text-center mb-14 text-lg">
            Simple tools that respect how you actually camp.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Search */}
            <div className="bg-sand/20 rounded-card p-7 border border-sand/40">
              <div className="w-14 h-14 bg-pine/10 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-8 h-8 text-pine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" strokeWidth="2" />
                  <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                  <path d="M8.5 11 Q11 7.5 13.5 11" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">Discover Campgrounds</h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Search thousands of campgrounds across the country. Find your
                next spot before you hit the road.
              </p>
            </div>

            {/* Log stays */}
            <div className="bg-brand/5 rounded-card p-7 border border-brand/15">
              <div className="w-14 h-14 bg-brand/10 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="4" y="3" width="16" height="18" rx="2" strokeWidth="2" />
                  <path d="M8 8h8M8 12h8M8 16h5" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">Log Every Stay</h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Photos, notes, and dates. Build a record of every place you've
                called home for a night — or a month.
              </p>
            </div>

            {/* Map */}
            <div className="bg-pine/5 rounded-card p-7 border border-pine/15">
              <div className="w-14 h-14 bg-pine/10 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-8 h-8 text-pine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polygon
                    points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path d="M8 2v16M16 6v16" strokeWidth="1.5" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">
                See Your Journey{' '}
                <span className="text-sm font-medium text-pine/70">· coming soon</span>
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Watch your travels come alive on a map. Every logged campsite
                becomes a pin in your personal adventure atlas.
              </p>
            </div>

            {/* Passport stamps */}
            <div className="bg-amber-50 rounded-card p-7 border border-amber-100">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2l2.9 5.87L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.4L12 2z"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">
                Earn Passport Stamps{' '}
                <span className="text-sm font-medium text-amber-500">· coming soon</span>
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Hit milestones and collect stamps like a National Parks passport.
                Log your 10th site. Camp in all 50 states. You earn it.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── APP PREVIEW ─────────────────────────────────────────────── */}
      <section className="bg-sand/20 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-ink mb-3">Built for the way you travel</h2>
          <p className="text-gray-500 text-lg mb-14">
            Clean, simple, and easy on the eyes — whether you&apos;re at a campground
            or on a mountain pass.
          </p>

          <div className="flex flex-col md:flex-row gap-8 justify-center items-start">

            {/* Mock: feed card */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 w-full max-w-[260px] mx-auto text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-pine text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  S
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">SandyRoamer</p>
                  <p className="text-xs text-gray-400">Sequoia NF, CA</p>
                </div>
              </div>
              <div className="bg-sand/30 rounded-lg h-36 mb-3 flex items-center justify-center">
                <span className="text-4xl">🌲</span>
              </div>
              <p className="text-sm font-bold text-ink mb-1">Big Meadows Campground</p>
              <p className="text-xs text-gray-400 mb-2">📅 Jun 12 – Jun 15, 2024</p>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                Best three days we&apos;ve had all year. Woke up to deer grazing right
                outside the van window...
              </p>
            </div>

            {/* Mock: profile card */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 w-full max-w-[260px] mx-auto md:mt-10 text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                  R
                </div>
                <div>
                  <p className="font-bold text-ink">RiverBendRV</p>
                  <p className="text-xs text-gray-400">@riverbend</p>
                </div>
              </div>
              <div className="flex gap-5 mb-4 text-center">
                <div>
                  <p className="font-bold text-ink text-sm">47</p>
                  <p className="text-xs text-gray-400">Trips</p>
                </div>
                <div>
                  <p className="font-bold text-ink text-sm">214</p>
                  <p className="text-xs text-gray-400">Followers</p>
                </div>
                <div>
                  <p className="font-bold text-ink text-sm">38</p>
                  <p className="text-xs text-gray-400">Sites</p>
                </div>
              </div>
              <div className="space-y-2">
                {['Yosemite Valley', 'Crater Lake NP', 'Acadia NP'].map((name) => (
                  <div key={name} className="bg-sand/25 rounded-lg px-3 py-2">
                    <p className="text-xs font-medium text-ink">{name}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────── */}
      <section className="bg-ink py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Your next adventure<br />deserves to be remembered.
          </h2>
          <p className="text-white/55 text-lg mb-10">
            Be among the first to get access. No spam — just your next great
            campsite.
          </p>
          {user ? (
            <Link
              href="/feed"
              className="inline-block bg-brand text-white text-lg font-semibold px-10 py-4 rounded-button hover:bg-brand/90 transition-colors"
            >
              Go to my feed →
            </Link>
          ) : (
            <Link
              href="/signup"
              className="inline-block bg-brand text-white text-lg font-semibold px-10 py-4 rounded-button hover:bg-brand/90 transition-colors"
            >
              Join early access
            </Link>
          )}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="bg-ink border-t border-white/10 py-6 px-6 text-center">
        <p className="text-white/30 text-sm">
          © 2025 RoamLogs · Made with ♥ for the open road
        </p>
      </footer>

    </div>
  )
}
