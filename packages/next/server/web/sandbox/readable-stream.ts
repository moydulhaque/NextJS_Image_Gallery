class ReadableStreamPolyfill<T> {
  constructor(opts: UnderlyingSource = {}) {
    let closed = false
    let pullPromise: any

    let transformController: TransformStreamDefaultController
    const { readable, writable } = new TransformStream(
      {
        start: (controller: TransformStreamDefaultController) => {
          transformController = controller
        },
      },
      undefined,
      {
        highWaterMark: 1,
      }
    )

    const writer = writable.getWriter()
    const encoder = new TextEncoder()
    const controller: ReadableStreamController<T> = {
      get desiredSize() {
        return transformController.desiredSize
      },
      close: () => {
        if (!closed) {
          closed = true
          writer.close()
        }
      },
      enqueue: (chunk: T) => {
        writer.write(typeof chunk === 'string' ? encoder.encode(chunk) : chunk)
        pull()
      },
      error: (reason: any) => {
        transformController.error(reason)
      },
    }

    const pull = () => {
      if (opts.pull) {
        const shouldPull =
          controller.desiredSize !== null && controller.desiredSize > 0
        if (!pullPromise && shouldPull) {
          pullPromise = Promise.resolve().then(() => {
            pullPromise = 0
            opts.pull!(controller)
          })
          return pullPromise
        }
      }
      return Promise.resolve()
    }

    if (opts.cancel) {
      readable.cancel = (reason: any) => {
        opts.cancel!(reason)
        return readable.cancel(reason)
      }
    }

    function registerPull() {
      const getReader = readable.getReader.bind(readable)
      readable.getReader = () => {
        pull()
        return getReader()
      }
    }

    const started = opts.start && opts.start(controller)
    if (started && typeof started.then === 'function') {
      started.then(() => registerPull())
    } else {
      registerPull()
    }

    readable.pipeTo = (
      writable: WritableStream,
      options: { preventClose: boolean }
    ) => {
      return pipeTo(readable, writable, options)
    }

    readable.pipeThrough = (transform: TransformStream) => {
      pipeTo(readable, transform.writable)
      return transform.readable
    }

    return readable
  }
}

function pipeTo<T>(
  readable: ReadableStream<T>,
  writable: WritableStream<T>,
  options?: { preventClose: boolean }
) {
  let resolver: () => void
  const promise = new Promise<void>((resolve) => (resolver = resolve))

  const reader = readable.getReader()
  const writer = writable.getWriter()

  function process() {
    reader.read().then(({ done, value }) => {
      if (done) {
        if (options?.preventClose) {
          writer.releaseLock()
        } else {
          writer.close()
        }
        resolver()
      } else {
        writer.write(value)
        process()
      }
    })
  }
  process()
  return promise
}

export { ReadableStreamPolyfill as ReadableStream }
