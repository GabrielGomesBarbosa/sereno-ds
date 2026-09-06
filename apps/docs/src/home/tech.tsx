/** Monochrome React / Next.js marks — paint in `currentColor`, no external assets. */

export function ReactMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label="React" style={{ display: 'block', flex: '0 0 auto' }}>
      <g transform="translate(12 12)" fill="none" stroke="currentColor">
        <circle r="1.9" fill="currentColor" stroke="none" />
        <ellipse rx="10.5" ry="4" strokeWidth="1.1" />
        <ellipse rx="10.5" ry="4" strokeWidth="1.1" transform="rotate(60)" />
        <ellipse rx="10.5" ry="4" strokeWidth="1.1" transform="rotate(120)" />
      </g>
    </svg>
  );
}

export function NextMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label="Next.js" style={{ display: 'block', flex: '0 0 auto' }}>
      <circle cx="12" cy="12" r="10.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8.4 16.4V7.8l7.4 9M15.6 15.6V8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GithubMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label="GitHub" fill="currentColor" style={{ display: 'block', flex: '0 0 auto' }}>
      <path d="M12 1C5.9 1 1 5.9 1 12c0 4.9 3.2 9 7.6 10.5.6.1.8-.2.8-.5v-1.9c-3.1.7-3.7-1.3-3.7-1.3-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.5-.3-5.1-1.2-5.1-5.5 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.5.1-3 0 0 .9-.3 3 1.1.9-.2 1.8-.4 2.7-.4.9 0 1.8.1 2.7.4 2.1-1.4 3-1.1 3-1.1.6 1.5.2 2.7.1 3 .7.8 1.1 1.8 1.1 3 0 4.3-2.6 5.2-5.1 5.5.4.3.8 1 .8 2.1v3.1c0 .3.2.6.8.5C19.8 21 23 16.9 23 12c0-6.1-4.9-11-11-11z" />
    </svg>
  );
}
