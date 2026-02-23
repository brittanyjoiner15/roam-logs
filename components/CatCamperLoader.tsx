"use client"

interface CatCamperLoaderProps {
  message?: string
}


export default function CatCamperLoader({ message = "Loading..." }: CatCamperLoaderProps) {
  return (
    <>
      <style>{`
        @keyframes van-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes wheel-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes road-dash {
          from { transform: translateX(0); }
          to { transform: translateX(-80px); }
        }
        @keyframes cloud-drift {
          from { transform: translateX(430px); }
          to { transform: translateX(-220px); }
        }
        @keyframes tree-scroll {
          from { transform: translateX(450px); }
          to { transform: translateX(-90px); }
        }
        @keyframes cat-blink {
          0%, 85%, 97%, 100% { transform: scaleY(1); }
          91% { transform: scaleY(0.07); }
        }
        @keyframes text-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .ccl-wheel {
          transform-box: fill-box;
          transform-origin: center;
          animation: wheel-spin 0.5s linear infinite;
        }
        .ccl-eye {
          transform-box: fill-box;
          transform-origin: center;
          animation: cat-blink 3.8s ease-in-out infinite;
        }
      `}</style>

      <div className="flex flex-col items-center justify-center gap-5 py-16 px-8">

        {/* Scene */}
        <div
          className="relative rounded-2xl overflow-hidden flex-shrink-0"
          style={{
            width: 400,
            height: 180,
            background: 'linear-gradient(to bottom, #5eb8e8 0%, #a8dcf5 52%, #3A9270 52%, #2a6e4a 100%)',
          }}
        >
          {/* Road */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{ height: 54, background: '#374151', borderRadius: '0 0 16px 16px' }}
          >
            {/* Road dashes */}
            <div
              className="absolute flex"
              style={{
                top: '44%',
                transform: 'translateY(-50%)',
                animation: 'road-dash 0.55s linear infinite',
              }}
            >
              {Array.from({ length: 13 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 44,
                    height: 5,
                    background: '#FCD34D',
                    marginRight: 36,
                    borderRadius: 3,
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Cloud 1 */}
          <div className="absolute" style={{ top: 10, animation: 'cloud-drift 9s linear infinite' }}>
            <svg width="88" height="36" viewBox="0 0 88 36" fill="white">
              <ellipse cx="44" cy="26" rx="40" ry="12" opacity="0.93"/>
              <ellipse cx="30" cy="20" rx="24" ry="17" opacity="0.93"/>
              <ellipse cx="60" cy="17" rx="21" ry="16" opacity="0.93"/>
            </svg>
          </div>

          {/* Cloud 2 */}
          <div className="absolute" style={{ top: 24, animation: 'cloud-drift 14s linear infinite 5s' }}>
            <svg width="62" height="28" viewBox="0 0 62 28" fill="white">
              <ellipse cx="31" cy="19" rx="28" ry="10" opacity="0.78"/>
              <ellipse cx="20" cy="14" rx="18" ry="13" opacity="0.78"/>
              <ellipse cx="44" cy="12" rx="15" ry="12" opacity="0.78"/>
            </svg>
          </div>

          {/* Trees (3 staggered) */}
          {[
            { delay: '0s', h: 65, w: 55 },
            { delay: '1.2s', h: 52, w: 44 },
            { delay: '2.6s', h: 60, w: 50 },
          ].map(({ delay, h, w }, i) => (
            <div
              key={i}
              className="absolute"
              style={{ bottom: 52, animation: `tree-scroll 3.4s linear infinite ${delay}` }}
            >
              <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
                <rect x={w / 2 - 5} y={h * 0.65} width="10" height={h * 0.35} fill="#8B6914"/>
                <polygon points={`${w/2},0 3,${h*0.7} ${w-3},${h*0.7}`} fill="#3A9270"/>
                <polygon points={`${w/2},${h*0.22} 4,${h*0.76} ${w-4},${h*0.76}`} fill="#236645"/>
              </svg>
            </div>
          ))}

          {/* Van */}
          <div
            className="absolute"
            style={{
              bottom: 48,
              left: 68,
              animation: 'van-bounce 0.36s ease-in-out infinite',
            }}
          >
            <svg
              width="232"
              height="88"
              viewBox="0 0 232 88"
              style={{ overflow: 'visible' }}
            >
              {/* Shadow */}
              <ellipse cx="116" cy="87" rx="108" ry="5" fill="rgba(0,0,0,0.16)"/>

              {/* ── Camper body (rear/left) ── */}
              <rect x="2" y="13" width="148" height="56" rx="8" fill="#F25C2A"/>

              {/* Roof rack */}
              <rect x="8" y="9" width="136" height="8" rx="3" fill="#c84a1e"/>
              {[22, 52, 82, 112].map(x => (
                <rect key={x} x={x} y="8" width="3" height="9" fill="#a33510"/>
              ))}
              {/* Gear strapped to rack */}
              <rect x="30" y="3" width="44" height="7" rx="2" fill="#4a5e32"/>
              <rect x="32" y="2" width="6" height="3" rx="1" fill="#3a4e24"/>
              <rect x="64" y="2" width="6" height="3" rx="1" fill="#3a4e24"/>

              {/* Big camper window */}
              <rect x="14" y="21" width="54" height="34" rx="5" fill="#b5dcf0"/>
              {/* Curtains */}
              <rect x="14" y="21" width="14" height="34" rx="3" fill="#df6e38" opacity="0.88"/>
              <rect x="54" y="21" width="14" height="34" rx="3" fill="#df6e38" opacity="0.88"/>
              {/* Curtain rings */}
              <circle cx="28" cy="37" r="3.5" fill="#b84e18"/>
              <circle cx="54" cy="37" r="3.5" fill="#b84e18"/>
              {/* Sill */}
              <rect x="14" y="53" width="54" height="3" rx="1" fill="#c85828"/>

              {/* Pine tree sticker */}
              <polygon points="89,27 81,47 97,47" fill="#3A9270"/>
              <rect x="85" y="46" width="8" height="7" rx="1" fill="#7a5a10"/>
              <circle cx="89" cy="23" r="4.5" fill="#52b028" opacity="0.55"/>

              {/* Door */}
              <rect x="104" y="28" width="30" height="39" rx="4" fill="#d44d1e" stroke="#a83810" strokeWidth="1.5"/>
              <rect x="109" y="32" width="20" height="14" rx="3" fill="#b5dcf0"/>
              <rect x="109" y="49" width="20" height="4" rx="1" fill="#c03a14"/>
              <circle cx="131" cy="52" r="3" fill="#8B6914"/>

              {/* Cab join strip */}
              <rect x="147" y="15" width="6" height="54" fill="#d44d1e"/>

              {/* ── Cab (front/right) ── */}
              <path d="M151 69 L151 19 Q154 9 166 7 L200 7 Q218 7 224 20 L224 69 Z" fill="#e05020"/>

              {/* Windshield */}
              <path d="M159 19 Q163 11 171 10 L200 10 Q215 10 220 20 L220 55 L159 55 Z" fill="#bde8f5" opacity="0.9"/>
              {/* Glare */}
              <path d="M164 15 Q170 11 178 11 L188 11 L180 31 L164 31 Z" fill="white" opacity="0.22"/>

              {/* ── The cat ── */}
              {/* Torso */}
              <ellipse cx="190" cy="59" rx="13" ry="8.5" fill="#f5a040"/>

              {/* Head */}
              <circle cx="190" cy="37" r="18" fill="#f5a040"/>

              {/* Ears */}
              <polygon points="177,27 172,12 184,25" fill="#f5a040"/>
              <polygon points="178,26 173,16 182,25" fill="#ffb6c1"/>
              <polygon points="195,27 203,12 192,25" fill="#f5a040"/>
              <polygon points="194,26 201,16 193,25" fill="#ffb6c1"/>

              {/* Eyes */}
              <ellipse cx="183" cy="35" rx="4" ry="5.5" fill="#2d2821" className="ccl-eye"/>
              <ellipse cx="197" cy="35" rx="4" ry="5.5" fill="#2d2821" className="ccl-eye"/>
              {/* Pupils */}
              <ellipse cx="183" cy="36" rx="2.2" ry="3.2" fill="#140e08" className="ccl-eye"/>
              <ellipse cx="197" cy="36" rx="2.2" ry="3.2" fill="#140e08" className="ccl-eye"/>
              {/* Shine dots */}
              <circle cx="185" cy="33" r="1.6" fill="white"/>
              <circle cx="199" cy="33" r="1.6" fill="white"/>

              {/* Nose */}
              <path d="M188,41 L190,43.5 L192,41 Z" fill="#ff9999"/>
              {/* Mouth */}
              <path d="M187,43.5 Q190,47 193,43.5" fill="none" stroke="#cc6677" strokeWidth="1.4"/>

              {/* Whiskers */}
              <line x1="167" y1="39" x2="179" y2="40.5" stroke="#e5cfa0" strokeWidth="1"/>
              <line x1="167" y1="43.5" x2="179" y2="43.5" stroke="#e5cfa0" strokeWidth="1"/>
              <line x1="201" y1="40.5" x2="213" y2="39" stroke="#e5cfa0" strokeWidth="1"/>
              <line x1="201" y1="43.5" x2="213" y2="43.5" stroke="#e5cfa0" strokeWidth="1"/>

              {/* Steering wheel */}
              <circle cx="178" cy="58" r="11" fill="none" stroke="#5a3a1a" strokeWidth="3"/>
              <line x1="178" y1="47" x2="178" y2="69" stroke="#5a3a1a" strokeWidth="2"/>
              <line x1="167" y1="58" x2="189" y2="58" stroke="#5a3a1a" strokeWidth="2"/>

              {/* Paws */}
              <ellipse cx="169" cy="57" rx="7.5" ry="5.5" fill="#f5a040"/>
              <ellipse cx="186" cy="57" rx="7.5" ry="5.5" fill="#f5a040"/>
              <path d="M166,55 Q169,52 172,55" fill="none" stroke="#d8882a" strokeWidth="0.9"/>
              <path d="M183,55 Q186,52 189,55" fill="none" stroke="#d8882a" strokeWidth="0.9"/>

              {/* Undercarriage */}
              <rect x="10" y="66" width="210" height="5" rx="2" fill="#a83810"/>

              {/* Exhaust pipe */}
              <rect x="219" y="60" width="12" height="5" rx="2.5" fill="#888"/>
              {/* Exhaust smoke puffs */}
              <circle cx="234" cy="60" r="4" fill="#aaa" opacity="0.5" style={{ animation: 'text-pulse 0.8s ease-in-out infinite' }}/>
              <circle cx="242" cy="57" r="3" fill="#bbb" opacity="0.35" style={{ animation: 'text-pulse 0.8s ease-in-out infinite 0.3s' }}/>

              {/* ── Wheels ── */}
              <g className="ccl-wheel">
                <circle cx="52" cy="76" r="20" fill="#1c1c1c"/>
                <circle cx="52" cy="76" r="13" fill="#3a3a3a"/>
                <circle cx="52" cy="76" r="5" fill="#777"/>
                <line x1="52" y1="56" x2="52" y2="96" stroke="#666" strokeWidth="2.5"/>
                <line x1="32" y1="76" x2="72" y2="76" stroke="#666" strokeWidth="2.5"/>
                <line x1="38" y1="62" x2="66" y2="90" stroke="#666" strokeWidth="2"/>
                <line x1="66" y1="62" x2="38" y2="90" stroke="#666" strokeWidth="2"/>
              </g>

              <g className="ccl-wheel">
                <circle cx="181" cy="76" r="20" fill="#1c1c1c"/>
                <circle cx="181" cy="76" r="13" fill="#3a3a3a"/>
                <circle cx="181" cy="76" r="5" fill="#777"/>
                <line x1="181" y1="56" x2="181" y2="96" stroke="#666" strokeWidth="2.5"/>
                <line x1="161" y1="76" x2="201" y2="76" stroke="#666" strokeWidth="2.5"/>
                <line x1="167" y1="62" x2="195" y2="90" stroke="#666" strokeWidth="2"/>
                <line x1="195" y1="62" x2="167" y2="90" stroke="#666" strokeWidth="2"/>
              </g>
            </svg>
          </div>
        </div>

        {/* Loading message */}
        <p
          className="text-ink font-display text-base font-medium"
          style={{ animation: 'text-pulse 2s ease-in-out infinite' }}
        >
          {message}
        </p>

      </div>
    </>
  )
}
