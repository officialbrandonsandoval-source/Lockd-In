export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0A0A0A',
        color: '#F5F0E8',
        fontFamily: '"DM Sans", system-ui, sans-serif',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          backgroundColor: '#1A1A1A',
          border: '2px solid #2A2A2A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2.5rem',
        }}
      >
        <span
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#C9A84C',
            letterSpacing: '-0.02em',
          }}
        >
          LI
        </span>
      </div>

      {/* Status indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#8A8578',
          }}
        />
        <span
          style={{
            fontSize: '0.875rem',
            color: '#8A8578',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 500,
          }}
        >
          Offline
        </span>
      </div>

      {/* Main heading */}
      <h1
        style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: '2rem',
          fontWeight: 700,
          color: '#F5F0E8',
          marginBottom: '1rem',
          lineHeight: 1.2,
        }}
      >
        You&apos;re offline
      </h1>

      {/* Message */}
      <p
        style={{
          fontSize: '1.125rem',
          color: '#C9A84C',
          maxWidth: '400px',
          lineHeight: 1.6,
          marginBottom: '2.5rem',
        }}
      >
        Your purpose doesn&apos;t change when the signal drops. You&apos;ll be
        back online soon.
      </p>

      {/* Divider */}
      <div
        style={{
          width: '60px',
          height: '2px',
          backgroundColor: '#2A2A2A',
          marginBottom: '2.5rem',
        }}
      />

      {/* Retry button */}
      <button
        onClick={() => window.location.reload()}
        style={{
          backgroundColor: 'transparent',
          border: '1px solid #2A2A2A',
          color: '#F5F0E8',
          padding: '0.75rem 2rem',
          borderRadius: '0.5rem',
          fontSize: '0.9375rem',
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: '"DM Sans", system-ui, sans-serif',
          transition: 'border-color 0.2s ease',
        }}
      >
        Try again
      </button>
    </div>
  );
}
