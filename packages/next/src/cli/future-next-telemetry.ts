import { bold, cyan, green, red, yellow } from '../lib/picocolors'
import { Telemetry } from '../telemetry/storage'

type NextTelemetryOptions = {
  enable?: Boolean | undefined
  disable?: Boolean | undefined
}

const telemetry = new Telemetry({ distDir: process.cwd() })
let isEnabled = telemetry.isEnabled

const nextTelemetry = (options: NextTelemetryOptions) => {
  if (options.enable) {
    telemetry.setEnabled(true)
    isEnabled = true

    console.log(cyan('Success!'))
  } else if (options.disable) {
    const path = telemetry.setEnabled(false)

    if (isEnabled) {
      console.log(
        cyan(`Your preference has been saved${path ? ` to ${path}` : ''}.`)
      )
    } else {
      console.log(yellow(`Next.js' telemetry collection is already disabled.`))
    }

    isEnabled = false
  } else {
    console.log(bold('Next.js Telemetry'))
  }

  console.log(
    `\nStatus: ${isEnabled ? bold(green('Enabled')) : bold(red('Disabled'))}`
  )

  if (isEnabled) {
    console.log(
      '\nNext.js telemetry is completely anonymous. Thank you for participating!'
    )
  } else {
    console.log(
      `\nYou have opted-out of Next.js' anonymous telemetry program.\nNo data will be collected from your machine.`
    )
  }

  console.log(`\nLearn more: ${cyan('https://nextjs.org/telemetry')}`)
}

export { nextTelemetry }
