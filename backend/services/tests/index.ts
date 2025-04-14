// main.ts
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { createTournamentsCLI } from './steps/createTournamentsCLI';
import { createUsersCLI } from './steps/createUsersCLI';
import { runAllTestsCLI } from './steps/runAllTestsCLI';

yargs(hideBin(process.argv))
  .command(
    'create-users',
    'Create and register test users',
    (yargs) =>
      yargs.option('count', {
        alias: 'c',
        type: 'number',
        default: 2,
        describe: 'Number of users to create',
      }),
    (argv) => createUsersCLI(argv.count)
  )
  .command(
    'create-tournaments',
    'Create tournaments (requires users)',
    (yargs) =>
      yargs.option('count', {
        alias: 'c',
        type: 'number',
        default: 1,
        describe: 'Number of tournaments to create',
      }),
    (argv) => createTournamentsCLI(argv.count)
  )
  .command(
    'run-full',
    'Run full test (register, tournament, simulate)',
    (yargs) =>
      yargs
        .option('users', {
          alias: 'u',
          type: 'number',
          default: 8,
          describe: 'Number of users to simulate',
        })
        .option('tournaments', {
          alias: 't',
          type: 'number',
          default: 1,
          describe: 'Number of tournaments to run',
        })
        .option('delay', {
          alias: 'd',
          type: 'number',
          default: 100,
          describe: 'Delay in ms between steps',
        }),
    (argv) => runAllTestsCLI(argv.users, argv.tournaments, argv.delay)
  )
  .demandCommand(1, 'Please specify a command to run')
  .help()
  .parse();
