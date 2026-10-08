type FigureKind =
  | 'representation'
  | 'lexisnexis'
  | 'lexisnexis-ml'
  | 'typeforge'

const labels: Record<FigureKind, string> = {
  representation: 'Shared representations',
  lexisnexis: 'Human-reviewed workflows',
  'lexisnexis-ml': 'Features into representations',
  typeforge: 'Adaptive practice',
}

const captions: Record<FigureKind, string> = {
  representation:
    'Different signals, a shared representation. Conceptual illustration; not employer data or measured results.',
  lexisnexis:
    'Notebook → recoverable workflow → human review. Conceptual summary, not an internal architecture diagram.',
  'lexisnexis-ml':
    'Features → representation → evaluation. Conceptual process illustration; not employer data or measured results.',
  typeforge:
    'Keystrokes → areas to practise → adaptive drills. Conceptual view of adaptive practice, not a product screenshot.',
}

export function ProjectFigure({
  kind = 'representation',
  compact = false,
}: {
  kind?: string
  compact?: boolean
}) {
  if (!Object.hasOwn(captions, kind)) {
    throw new Error(`Unsupported project figure: ${kind}`)
  }
  const variant = kind as FigureKind
  const representation = variant === 'representation'
  return (
    <figure
      className={`project-figure figure-${variant}${compact ? ' figure-compact' : ''}`}
    >
      <div className="figure-topline">
        <span>{labels[variant]}</span>
        <span aria-hidden="true">↗</span>
      </div>
      <svg
        viewBox="0 0 480 350"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        {representation ? (
          <>
            <path
              d="M40 170H116M82 88L153 127M82 252L153 213"
              className="diagram-faint"
              strokeDasharray="3 5"
            />
            <circle cx="250" cy="172" r="139" className="diagram-faint" />
            <circle cx="250" cy="172" r="106" className="diagram-stroke" />
            <ellipse
              cx="250"
              cy="172"
              rx="62"
              ry="106"
              className="diagram-faint"
            />
            <ellipse
              cx="250"
              cy="172"
              rx="106"
              ry="49"
              className="diagram-faint"
            />
            <path
              d="M148 140L231 85L314 135L338 205L259 252L179 217Z M148 140L259 252L314 135L179 217L231 85L338 205Z"
              className="diagram-stroke"
            />
            {[
              [148, 140],
              [231, 85],
              [314, 135],
              [338, 205],
              [259, 252],
              [179, 217],
            ].map(([x, y], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={i === 1 ? 7 : 5}
                className="diagram-dot"
              />
            ))}
            <circle cx="250" cy="172" r="18" className="diagram-fill" />
            <path
              d="M243 172H257M250 165V179"
              stroke="var(--bg)"
              strokeWidth="1.5"
            />
            <path
              d="M24 84h20v20H24zM20 163h28M20 170h20M20 177h25M24 243l10-9 10 9-10 10z"
              className="diagram-stroke"
            />
            <text x="137" y="323">
              SIGNALS → REPRESENTATION
            </text>
          </>
        ) : variant === 'typeforge' ? (
          <>
            <path
              d="M65 112H415M65 180H415M65 248H415"
              className="diagram-faint"
            />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((v) => (
              <g key={v}>
                <rect
                  x={66 + v * 44}
                  y={98}
                  width="33"
                  height="33"
                  rx="2"
                  className="diagram-stroke"
                />
                <text x={77 + v * 44} y="120">
                  {'PRACTISE'[v]}
                </text>
              </g>
            ))}
            <path
              d="M75 200L115 166L152 192L189 156L230 203L269 175L307 189L349 152L397 178"
              className="diagram-stroke"
            />
            <circle cx="230" cy="203" r="14" className="diagram-stroke" />
            <path
              d="M230 218V269H331"
              className="diagram-stroke"
              strokeDasharray="3 4"
            />
            <text x="66" y="292">
              NOTICE. ADAPT. PRACTISE.
            </text>
          </>
        ) : variant === 'lexisnexis' ? (
          <>
            <path d="M80 174H400" className="diagram-stroke" />
            {[90, 240, 390].map((x, i) => (
              <g key={x}>
                <circle cx={x} cy="174" r="46" className="diagram-paper" />
                <circle cx={x} cy="174" r="46" className="diagram-stroke" />
                <text x={x - 11} y="180">
                  0{i + 1}
                </text>
              </g>
            ))}
            <path
              d="M240 221V263H90V221"
              className="diagram-stroke"
              strokeDasharray="3 5"
            />
            <text x="54" y="98">
              NOTEBOOK
            </text>
            <text x="208" y="98">
              RECOVER
            </text>
            <text x="358" y="98">
              REVIEW
            </text>
            <text x="153" y="302">
              PEOPLE STAY IN CONTROL
            </text>
          </>
        ) : (
          <>
            <text x="75" y="95" textAnchor="middle">
              FEATURES
            </text>
            <text x="244" y="95" textAnchor="middle">
              REPRESENTATION
            </text>
            <text x="404" y="95" textAnchor="middle">
              EVALUATION
            </text>
            <rect
              x="30"
              y="128"
              width="90"
              height="98"
              rx="3"
              className="diagram-stroke"
            />
            {[150, 177, 204].map((y) => (
              <g key={y}>
                <circle cx="47" cy={y} r="3" className="diagram-dot" />
                <path d={`M59 ${y}H103`} className="diagram-stroke" />
              </g>
            ))}
            <path
              d="M130 177H156L150 171M156 177L150 183M330 177H348L342 171M348 177L342 183"
              className="diagram-stroke"
            />
            <rect
              x="176"
              y="118"
              width="136"
              height="118"
              rx="3"
              className="diagram-faint"
            />
            <path
              d="M197 151L244 135L289 166L267 214L214 208ZM197 151L267 214M244 135L214 208M289 166L214 208"
              className="diagram-stroke"
            />
            {[
              [197, 151],
              [244, 135],
              [289, 166],
              [267, 214],
              [214, 208],
            ].map(([x, y]) => (
              <circle
                key={`${x}-${y}`}
                cx={x}
                cy={y}
                r="4"
                className="diagram-dot"
              />
            ))}
            <rect
              x="358"
              y="128"
              width="92"
              height="98"
              rx="3"
              className="diagram-stroke"
            />
            {[150, 177, 204].map((y) => (
              <g key={y}>
                <rect
                  x="373"
                  y={y - 5}
                  width="10"
                  height="10"
                  className="diagram-stroke"
                />
                <path d={`M395 ${y}H434`} className="diagram-faint" />
              </g>
            ))}
            <text x="240" y="294" textAnchor="middle">
              A CONCEPTUAL MODELLING PROCESS
            </text>
          </>
        )}
      </svg>
      <figcaption>{captions[variant]}</figcaption>
    </figure>
  )
}
