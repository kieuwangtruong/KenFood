"use client"

import type { ReactNode } from "react"

// Simulates a mobile device frame for Driver & Customer apps on desktop,
// while staying full-width on actual mobile screens.
export function PhoneFrame({
  children,
  header,
  bottomBar,
}: {
  children: ReactNode
  header?: ReactNode
  bottomBar?: ReactNode
}) {
  return (
    <div className="flex w-full h-full justify-center items-center bg-muted/20 dark:bg-gray-950/40 lg:p-6 lg:overflow-y-auto lg:h-[calc(100vh-4rem)]">
      <div className="relative flex w-full h-full flex-col overflow-hidden bg-background dark:bg-gray-900 text-foreground dark:text-white shadow-xl lg:w-[400px] lg:h-[800px] lg:border-[10px] lg:border-slate-800 lg:rounded-[2.5rem] lg:shadow-2xl">
        {/* Simulated Speaker/Notch for PC mockup */}
        <div className="hidden lg:flex absolute top-1.5 inset-x-0 mx-auto w-24 h-4 rounded-full bg-slate-800 z-50 items-center justify-center">
          <div className="w-8 h-1 rounded-full bg-slate-600" />
        </div>
        
        {/* Static Header if provided */}
        {header && (
          <div className="pt-0 lg:pt-5 shrink-0 z-20 border-b border-border dark:border-gray-800 bg-card dark:bg-gray-800">
            {header}
          </div>
        )}

        <div className="flex-1 overflow-y-auto pt-0 lg:pt-2">{children}</div>
        {bottomBar}
      </div>
    </div>
  )
}
