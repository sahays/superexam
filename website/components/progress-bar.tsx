"use client"

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'

export function ProgressBarProvider() {
  return (
    <ProgressBar
      height="3px"
      color="#5750F1"
      options={{ showSpinner: false }}
      shallowRouting
    />
  )
}
