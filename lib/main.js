'use babel';

// eslint-disable-next-line import/no-extraneous-dependencies, import/extensions
import { CompositeDisposable } from 'atom';

// Some internal variables
let subscriptions;
let executablePath;
let errorLevel;
let allSettings;

export default {
  // Activate linter
  activate() {
    const helpers = require('atom-linter');

    subscriptions = new CompositeDisposable();

    subscriptions.add(atom.config.observe('linter-puppet-lint', (settings) => {
      allSettings = settings;
      ({ executablePath, errorLevel } = settings);
    }));

    require('atom-package-deps').install('linter-puppet-lint');

    // Check if puppet-lint has support for the %{column} placeholder
    helpers.exec(executablePath, ['--help']).then((output) => {
      const regexColumn = /%{column}/;

      if (regexColumn.exec(output) === null) {
        atom.notifications.addError(
          'You are using an old version of puppet-lint!',
          {
            detail: 'Please upgrade your version of puppet-lint.\n' +
              'Check the README for further information.',
          },
        );
      }
    });
  },

  deactivate() {
    subscriptions.dispose();
  },

  provideLinter() {
    const helpers = require('atom-linter');

    return {
      name: 'Puppet-Lint',
      grammarScopes: ['source.puppet'],
      scope: 'file',
      lintsOnChange: false,
      lint: (activeEditor) => {
        // To respect this project's .puppet-lint.rc,
        // execute puppet-lint from the root directory of this file's project
        const filePath = activeEditor.getPath();
        const [projectPath, projectRelativeFilePath] = atom.project.relativizePath(filePath);

        // With the custom format the puppet-int ouput looks like this:
        // error mongodb::service not in autoload module layout 3 7
        const regexLine = /^(warning|error)\s(.*)\s(\d+)\s(\d+)$/;
        const args = ['--log-format', '%{kind} %{message} %{line} %{column}', '--error-level', errorLevel];

        const optionsMap = require('./flags.js');

        // Add the flags to the command options
        Object.keys(allSettings).forEach((flag) => {
          if (Object.hasOwnProperty.call(optionsMap, flag) && allSettings[flag] === true) {
            args.push(optionsMap[flag]);
          }
        });

        // Add the file to be checked to the arguments
        args.push(projectRelativeFilePath);

        return helpers.exec(executablePath, args, { cwd: projectPath, ignoreExitCode: true })
          .then((output) => {
            // If puppet-lint errors to stdout then redirect the message to stderr so it is caught
            if (/puppet-lint:/.exec(output)) {
              throw output;
            }
            const toReturn = [];

            // Check for proper warnings and errors from stdout
            output.split(/\r?\n/).forEach((line) => {
              const matches = regexLine.exec(line);
              if (matches != null) {
                const errLine = Number.parseInt(matches[3], 10) - 1;
                const errCol = Number.parseInt(matches[4], 10) - 1;

                toReturn.push({
                  severity: matches[1],
                  excerpt: matches[2],
                  location: {
                    file: filePath,
                    position: helpers.generateRange(activeEditor, errLine, errCol),
                  },
                });
              }
            });
            return toReturn;
          });
      },
    };
  },
};
