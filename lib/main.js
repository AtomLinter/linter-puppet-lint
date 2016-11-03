'use babel';

// eslint-disable-next-line import/no-extraneous-dependencies, import/extensions
import { CompositeDisposable } from 'atom';

// Some internal variables
let subscriptions;
let executablePath;
let errorLevel;
let allSettings;

export default {
  activate: () => {
    const helpers = require('atom-linter');

    subscriptions = new CompositeDisposable();

    subscriptions.add(atom.config.observe('linter-puppet-lint', (settings) => {
      allSettings = settings;
      executablePath = settings.executablePath;
      errorLevel = settings.errorLevel;
    }));

    require('atom-package-deps').install('linter-puppet-lint');

    // Check if puppet-lint has support for the %{column} placeholder
    helpers.exec(executablePath, ['--help']).then((output) => {
      const regexColumn = /%{column}/;

      if (regexColumn.exec(output) === null) {
        atom.config.set('linter-puppet-lint.oldVersion', true);
        atom.notifications.addError(
          'You are using an old version of puppet-lint!',
          {
            detail: 'Please upgrade your version of puppet-lint.\n' +
              'Check the README for further information.',
          }
        );
      } else {
        atom.config.set('linter-puppet-lint.oldVersion', false);
      }
    });
  },

  deactivate: () => {
    subscriptions.dispose();
  },

  provideLinter: () => {
    // With the custom format the puppet-int ouput looks like this:
    // error mongodb::service not in autoload module layout 3 7
    const helpers = require('atom-linter');
    const path = require('path');

    const regexLine = /^(warning|error)\s(.*)\s(\d+)\s(\d+)$/;

    return {
      name: 'Puppet-Lint',
      grammarScopes: ['source.puppet'],
      scope: 'file',
      lintOnFly: false,
      lint: (activeEditor) => {
        if (atom.config.get('linter-puppet-lint.oldVersion') === true) {
          atom.notifications.addError(
            'You are using an old version of puppet-lint!',
            {
              detail: 'Please upgrade your version of puppet-lint.\n' +
                'Check the README for further information.',
            }
          );
          return [];
        }

        const file = activeEditor.getPath();
        const cwd = path.dirname(file);
        const args = ['--log-format', '%{kind} %{message} %{line} %{column}', '--error-level', errorLevel];

        const optionsMap = require('./flags.js');

        // Add the flags to the command options
        Object.keys(allSettings).forEach((flag) => {
          if (Object.hasOwnProperty.call(optionsMap, flag) && allSettings[flag] === true) {
            args.push(optionsMap[flag]);
          }
        });

        args.push(file);

        return helpers.exec(executablePath, args, { cwd, ignoreExitCode: true }).then((output) => {
          // If puppet-lint errors to stdout then redirect the message to stderr so it is caught
          if (/puppet-lint:/.exec(output)) {
            throw output;
          }
          const toReturn = [];
          output.split(/\r?\n/).forEach((line) => {
            const matches = regexLine.exec(line);
            if (matches != null) {
              const errLine = Number.parseInt(matches[3], 10) - 1;
              const errCol = Number.parseInt(matches[4], 10) - 1;
              toReturn.push({
                range: helpers.rangeFromLineNumber(activeEditor, errLine, errCol),
                type: matches[1],
                severity: matches[1],
                text: matches[2],
                filePath: file,
              });
            }
          });
          return toReturn;
        });
      },
    };
  },
};
