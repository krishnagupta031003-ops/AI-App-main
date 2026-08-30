/**
 * ProviderIcon Component
 * Shows provider logo/icon for AI models
 */

export default function ProviderIcon({ provider, color, size = 16 }) {
  if (provider === 'gemini') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 12l10 10 10-10L12 2z" fill={color || '#4285F4'} opacity="0.9" />
        <path d="M12 6l-6 6 6 6 6-6-6-6z" fill="white" opacity="0.7" />
      </svg>
    );
  }

  if (provider === 'groq') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill={color || '#F97316'} opacity="0.9" />
        <path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (provider === 'openai') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill={color || '#10A37F'} opacity="0.9" />
        <path d="M8 12l4 4 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // Default fallback
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color || '#6366F1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <span style={{ color: 'white', fontSize: size * 0.45, fontWeight: 700 }}>
        {provider ? provider[0].toUpperCase() : 'A'}
      </span>
    </div>
  );
}
