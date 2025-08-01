/**
 * This file is used to bootstrap the environment for the action.
 *
 * It is added as a --require option to `npx tsx`. The purpose of this file is
 * to handle various configuration options. For example, if an action repository
 * makes use of TypeScript paths for module resolution, this bootstrap script
 * will parse them and register them so that modules can be resolved correctly.
 */

import('fs').then(({ existsSync, readFileSync }) => {
  import('tsconfig-paths').then(({ loadConfig, register }) => {
    import('comment-json').then(({ parse }) => {
      import('path').then(({ dirname }) => {
        import('url').then(({ fileURLToPath }) => {
          if (
            process.env.TARGET_ACTION_PATH &&
            process.env.TARGET_ACTION_PATH !== ''
          ) {
            // Check if the action has a `tsconfig.json` file.
            if (existsSync(`${process.env.TARGET_ACTION_PATH}/tsconfig.json`)) {
              const __dirname = dirname(fileURLToPath(import.meta.url))

              // Load the `tsconfig.json` from the action directory.
              const actionTsConfig = parse(
                readFileSync(
                  `${process.env.TARGET_ACTION_PATH}/tsconfig.json`,
                  'utf-8'
                )
              )

              // Load the current `tsconfig.json` from the root of this directory.
              loadConfig(__dirname)

              // Get the paths from the action's `tsconfig.json`, if any.
              // @ts-expect-error comment-json type mismatch
              const paths = actionTsConfig?.compilerOptions?.paths ?? {}

              // Add any path mappings from the imported action. Replace the base URL with
              // the target action path.
              // @todo Should this take into account the previous `baseUrl` value?
              register({
                baseUrl: process.env.TARGET_ACTION_PATH,
                paths,
                addMatchAll: true
              })
            }
          }
        })
      })
    })
  })
})
