import { useEffect } from 'react'
import { attachHydrationErrorState } from './attach-hydration-error-state'
import { isNextRouterError } from '../../../is-next-router-error'
import { isKnownHydrationWarning, storeHydrationErrorStateFromConsoleArgs } from './hydration-error-info'
import { formatConsoleArgs } from '../../../../lib/console'
import isError from '../../../../../lib/is-error'
import { createUnhandledError } from './console-error'
import { enqueueConsecutiveDedupedError } from './enqueue-client-error'
import { getReactStitchedError } from './stitched-error'
import { isHydrationError } from '../../../is-hydration-error'

const queueMicroTask =
  globalThis.queueMicrotask || ((cb: () => void) => Promise.resolve().then(cb))

export type ErrorHandler = (error: Error) => void

const errorQueue: Array<Error> = []
const errorHandlers: Array<ErrorHandler> = []
const rejectionQueue: Array<Error> = []
const rejectionHandlers: Array<ErrorHandler> = []

export function handleClientError(
  originError: unknown,
  consoleErrorArgs: any[],
  capturedFromConsole: boolean = false
) {
  let error: Error
  const hydrationErrorState = storeHydrationErrorStateFromConsoleArgs(...consoleErrorArgs)
  if (!originError || !isError(originError)) {
    // If it's not an error, format the args into an error
    const formattedErrorMessage = formatConsoleArgs(consoleErrorArgs)
    error = createUnhandledError(formattedErrorMessage)
    
  } else {
    error = capturedFromConsole
      ? createUnhandledError(originError)
      : originError
  }
  if (isHydrationError(error) || isKnownHydrationWarning(consoleErrorArgs[0])) {
    console.log('isHydrationError', isHydrationError(error), isKnownHydrationWarning(consoleErrorArgs[0]), hydrationErrorState)
    if (hydrationErrorState) {
      attachHydrationErrorState(error, hydrationErrorState)
    }
  }
  console.log('error details', (error as any).details)
  error = getReactStitchedError(error)

  
  // if (isHydrationError(error)) {
  //   attachHydrationErrorState(error)
  // }
  // attachHydrationErrorState(error)

  enqueueConsecutiveDedupedError(errorQueue, error)
  for (const handler of errorHandlers) {
    // Delayed the error being passed to React Dev Overlay,
    // avoid the state being synchronously updated in the component.
    queueMicroTask(() => {
      handler(error)
    })
  }
}

export function useErrorHandler(
  handleOnUnhandledError: ErrorHandler,
  handleOnUnhandledRejection: ErrorHandler
) {
  useEffect(() => {
    // Handle queued errors.
    errorQueue.forEach(handleOnUnhandledError)
    rejectionQueue.forEach(handleOnUnhandledRejection)

    // Listen to new errors.
    errorHandlers.push(handleOnUnhandledError)
    rejectionHandlers.push(handleOnUnhandledRejection)

    return () => {
      // Remove listeners.
      errorHandlers.splice(errorHandlers.indexOf(handleOnUnhandledError), 1)
      rejectionHandlers.splice(
        rejectionHandlers.indexOf(handleOnUnhandledRejection),
        1
      )
    }
  }, [handleOnUnhandledError, handleOnUnhandledRejection])
}

function onUnhandledError(event: WindowEventMap['error']): void | boolean {
  if (isNextRouterError(event.error)) {
    event.preventDefault()
    return false
  }
  handleClientError(event.error, [])
}

function onUnhandledRejection(ev: WindowEventMap['unhandledrejection']): void {
  const reason = ev?.reason
  if (isNextRouterError(reason)) {
    ev.preventDefault()
    return
  }

  let error = reason
  if (error && !isError(error)) {
    error = createUnhandledError(error + '')
  }

  rejectionQueue.push(error)
  for (const handler of rejectionHandlers) {
    handler(error)
  }
}

export function handleGlobalErrors() {
  if (typeof window !== 'undefined') {
    try {
      // Increase the number of stack frames on the client
      Error.stackTraceLimit = 50
    } catch {}

    window.addEventListener('error', onUnhandledError)
    window.addEventListener('unhandledrejection', onUnhandledRejection)
  }
}
