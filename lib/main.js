'use babel';

// eslint-disable-next-line import/no-extraneous-dependencies, import/extensions
import {
  CompositeDisposable,
} from 'atom';

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
      if (/no-140chars-check/.exec(output) === null) {
        atom.notifications.addError(
          'You are using an unsupported version of puppet-lint!',
          {
            detail: 'Please upgrade your version of puppet-lint to >= 2.0.0.\n'
              + 'Check the README for further information.',
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

        // Setup args
        const args = ['--relative', '--json', '--error-level', errorLevel];

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

            // Parse JSON output and immediately access zeroth element of redundant outer array
            const info = JSON.parse(output)[0];

            // Check for proper warnings and errors from stdout
            if (info.length > 0) {
              info.forEach(function (issue) {
                toReturn.push({
                  severity: issue.kind,
                  excerpt: issue.message,
                  location: {
                    file: issue.path,
                    position: helpers.generateRange(activeEditor, issue.line, issue.column),
                  },
                });
              });
            }
            return toReturn;
          });
      },
    };
  },
};
