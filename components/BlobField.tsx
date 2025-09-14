export default function BlobField() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div
        className="absolute -z-10 left-[-6rem] top-[-4rem] h-80 w-80 blur-3xl opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(closest-side, #7aa2ff 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute -z-10 right-[-4rem] top-20 h-96 w-96 blur-3xl opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(closest-side, #59e0ff 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute -z-10 left-1/2 bottom-[-6rem] h-[28rem] w-[28rem] -translate-x-1/2 blur-3xl opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(closest-side, #8bb0ff 0%, transparent 70%)',
        }}
      />
    </div>
  )
}

