#!/usr/bin/env node
import * as log from '../build/output/log'
import arg from 'next/dist/compiled/arg/index.js'
import { NON_STANDARD_NODE_ENV } from '../lib/constants'
import { spawn } from 'child_process'
;['react', 'react-dom'].forEach((dependency) => {
  try {
    // When 'npm link' is used it checks the clone location. Not the project.
    require.resolve(dependency)
  } catch (err) {
    // tslint:disable-next-line
    console.warn(
      `The module '${dependency}' was not found. Next.js requires that you include it in 'dependencies' of your 'package.json'. To add it, run 'npm install ${dependency}'`
    )
  }
})

const defaultCommand = 'dev'
export type cliCommand = (argv?: string[]) => void
const commands: { [command: string]: () => Promise<cliCommand> } = {
  build: async () => await import('../cli/next-build').then((i) => i.nextBuild),
  start: async () => await import('../cli/next-start').then((i) => i.nextStart),
  export: async () =>
    await import('../cli/next-export').then((i) => i.nextExport),
  dev: async () => await import('../cli/next-dev').then((i) => i.nextDev),
  telemetry: async () =>
    await import('../cli/next-telemetry').then((i) => i.nextTelemetry),
}

const args = arg(
  {
    // Types
    '--version': Boolean,
    '--help': Boolean,
    '--inspect': Boolean,

    // Aliases
    '-v': '--version',
    '-h': '--help',
  },
  {
    permissive: true,
  }
)

// Version is inlined into the file using taskr build pipeline
if (args['--version']) {
  // tslint:disable-next-line
  console.log(`Next.js v${process.env.__NEXT_VERSION}`)
  process.exit(0)
}

// Check if we are running `next <subcommand>` or `next`
const foundCommand = Boolean(commands[args._[0]])

// Makes sure the `next <subcommand> --help` case is covered
// This help message is only showed for `next --help`
if (!foundCommand && args['--help']) {
  // tslint:disable-next-line
  console.log(`
    Usage
      $ next <command>
    Available commands
      ${Object.keys(commands).join(', ')}
    Options
      --version, -v   Version number
      --help, -h      Displays this message
    For more information run a command with the --help flag
      $ next build --help
  `)
  process.exit(0)
}

const command = foundCommand ? args._[0] : defaultCommand
const forwardedArgs = foundCommand ? args._.slice(1) : args._

if (args['--inspect'])
  throw new Error(
    `--inspect flag is deprecated. Use env variable NODE_OPTIONS instead: NODE_OPTIONS='--inspect' next ${command}`
  )

// Make sure the `next <subcommand> --help` case is covered
if (args['--help']) {
  forwardedArgs.push('--help')
}

const defaultEnv = command === 'dev' ? 'development' : 'production'

const standardEnv = ['production', 'development', 'test']

if (process.env.NODE_ENV && !standardEnv.includes(process.env.NODE_ENV)) {
  log.warn(NON_STANDARD_NODE_ENV)
}

;(process.env as any).NODE_ENV = process.env.NODE_ENV || defaultEnv

// this needs to come after we set the correct NODE_ENV or
// else it might cause SSR to break
const React = require('react')

if (typeof React.Suspense === 'undefined') {
  throw new Error(
    `The version of React you are using is lower than the minimum required version needed for Next.js. Please upgrade "react" and "react-dom": "npm install react react-dom" https://err.sh/vercel/next.js/invalid-react-version`
  )
}

commands[command]().then((exec) => exec(forwardedArgs))

if (command === 'dev') {
  const { CONFIG_FILE } = require('../next-server/lib/constants')
  const { watchFile, readdirSync } = require('fs')
  const config_files = readdirSync(`${process.cwd()}`).filter(
    (file: string) => file === 'jsconfig.json' || file === 'tsconfig.json'
  )
  watchFile(`${process.cwd()}/${CONFIG_FILE}`, (cur: any, prev: any) => {
    if (cur.size > 0 || prev.size > 0) {
      // tslint:disable-next-line
      console.log(
        `\n> Found a change in ${CONFIG_FILE}. Restart the server to see the changes in effect.`
      )
    }
  })
  watchFile(`${process.cwd()}/`, (cur: any, prev: any) => {
    if (cur.size > 0 || prev.size > 0) {
      // tslint:disable-next-line
      console.log(
        `\n> Found a change in ${CONFIG_FILE}. Developer server is rebooting`
      )
      spawn(process.argv[0], process.argv.slice(1), {
        stdio: 'inherit',
        detached: true,
        shell: true,
      }).unref()
      process.exit(0)
    }
  })
  config_files.forEach((config_file: string) =>
    watchFile(`${process.cwd()}/${config_file}`, (cur: any, prev: any) => {
      if (cur.size > 0 || prev.size > 0) {
        // tslint:disable-next-line
        console.log(
          `\n Found a change in ${config_file}. Developer server is rebooting`
        )
        spawn(process.argv[0], process.argv.slice(1), {
          stdio: 'inherit',
          detached: true,
          shell: true,
        }).unref()
        process.exit(0)
      }
    })
  )
}
