'use client'

export function ComingSoon({ children }: { children: React.ReactNode }) {
  // CHANGE THIS TO FALSE WHEN YOU'RE READY TO LAUNCH
  const isLaunched = false

  if (isLaunched) {
    return <>{children}</>
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <img
          src="/icon.png"
          alt="CHIVAL"
          className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6"
        />
        <h1 className="text-3xl sm:text-4xl font-bold text-gold-gradient mb-3">
          Coming Soon
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-sm mx-auto">
          We're working on something amazing. Check back soon!
        </p>
      </div>
    </div>
  )
}