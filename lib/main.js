"use babel";

export default {
  config: {
    executablePath: {
      title: 'Executable path',
      type: 'string',
      description: 'Path to puppet-lint executable',
      default: 'puppet-lint'
    },
    automaticFix: {
      title: 'Attempt to automatically fix warnings and errors',
      type: 'boolean',
      default: false
    },
    errorLevel: {
      title: 'Error level',
      type: 'string',
      description: 'The level of error to return (warning, error, or all).',
      default: 'all'
    },
    skipRightToLeftRelationship: {
      title: 'Skip the right_to_left_relationship check',
      type: 'boolean',
      default: false
    },
    skipAutoloaderLayout: {
      title: 'Skip the autoloader_layout check',
      type: 'boolean',
      default: false
    },
    skipNamesContainingDash: {
      title: 'Skip the names_containing_dash check',
      type: 'boolean',
      default: false
    },
    skipClassInherithsFromParamClass: {
      title: 'Skip the class_inherits_from_params_class check',
      type: 'boolean',
      default: false
    },
    skipParameterOrder: {
      title: 'Skip the parameter_order check',
      type: 'boolean',
      default: false
    },
    skipInheritsAcrossNamespaces: {
      title: 'Skip the inherits_across_namespaces check',
      type: 'boolean',
      default: false
    },
    skipNestedClassesOrDefines: {
      title: 'Skip the nested_classes_or_defines check',
      type: 'boolean',
      default: false
    },
    skipVariableScope: {
      title: 'Skip the variable_scope check',
      type: 'boolean',
      default: false
    },
    skipSlashComments: {
      title: 'Skip the slash_comments check',
      type: 'boolean',
      default: false
    },
    skipStarComments: {
      title: 'Skip the star_comments check',
      type: 'boolean',
      default: false
    },
    skipSelectorInsideResource: {
      title: 'Skip the selector_inside_resource check',
      type: 'boolean',
      default: false
    },
    skipCaseWithoutDefault: {
      title: 'Skip the case_without_default check',
      type: 'boolean',
      default: false
    },
    skipDocumentation: {
      title: 'Skip the documentation check',
      type: 'boolean',
      default: false
    },
    skipDoubleQuotedStrings: {
      title: 'Skip the double_quoted_strings check',
      type: 'boolean',
      default: false
    },
    skipOnlyVariableString: {
      title: 'Skip the only_variable_string check',
      type: 'boolean',
      default: false
    },
    skipVariablesNotEnclosed: {
      title: 'Skip the variables_not_enclosed check',
      type: 'boolean',
      default: false
    },
    skipSingleQuoteStringWithVariables: {
      title: 'Skip the single_quote_string_with_variables check',
      type: 'boolean',
      default: false
    },
    skipQuotedBooleans: {
      title: 'Skip the quoted_booleans check',
      type: 'boolean',
      default: false
    },
    skipPuppetUrlWhitoutModules: {
      title: 'Skip the puppet_url_without_modules check',
      type: 'boolean',
      default: false
    },
    skipVariableContainsDash: {
      title: 'Skip the variable_contains_dash check',
      type: 'boolean',
      default: false
    },
    skipHardTabs: {
      title: 'Skip the hard_tabs check',
      type: 'boolean',
      default: false
    },
    skipTrailingWhitespace: {
      title: 'Skip the trailing_whitespace check',
      type: 'boolean',
      default: false
    },
    skip80Chars: {
      title: 'Skip the 80chars check (puppet-lint <= 1.1.0)',
      type: 'boolean',
      default: false
    },
    skip140Chars: {
      title: 'Skip the 140chars check (puppet-lint >= 2.0.0)',
      type: 'boolean',
      default: false
    },
    skip2spSoftTabs: {
      title: 'Skip the 2sp_soft_tabs check',
      type: 'boolean',
      default: false
    },
    skipArrowAlignment: {
      title: 'Skip the arrow_alignment check',
      type: 'boolean',
      default: false
    },
    skipUnquotedResourceTitle: {
      title: 'Skip the unquoted_resource_title check',
      type: 'boolean',
      default: false
    },
    skipEnsureFirstParam: {
      title: 'Skip the ensure_first_param check',
      type: 'boolean',
      default: false
    },
    skipDuplicateParams: {
      title: 'Skip the duplicate_params check',
      type: 'boolean',
      default: false
    },
    skipUnquotedFileMode: {
      title: 'Skip the unquoted_file_mode check',
      type: 'boolean',
      default: false
    },
    skipFileMode: {
      title: 'Skip the file_mode check',
      type: 'boolean',
      default: false
    },
    skipEnsureNotSymlinkTarget: {
      title: 'Skip the ensure_not_symlink_target check',
      type: 'boolean',
      default: false
    },
    skipUnquotedNodeName: {
      title: 'Skip the unquoted_node_name check',
      type: 'boolean',
      default: false
    },
  },

  activate: () => {
    const helpers = require('atom-linter');
    const command = atom.config.get('linter-puppet-lint.executablePath');
    const args    = ['--help'];

    require('atom-package-deps').install('linter-puppet-lint');

    // Check if puppet-lint has support for the %{column} placeholder
    helpers.exec(command, args).then(output => {
      var regexColumn = /%{column}/;

      if (regexColumn.exec(output) === null) {
        atom.config.set('linter-puppet-lint.oldVersion', true);
        atom.notifications.addError(
          'You are using an old version of puppet-lint!',
          {
            detail: "Please upgrade your version of puppet-lint.\n"
            + 'Check the README for further information.'
          }
        );
      } else {
        atom.config.set('linter-puppet-lint.oldVersion', false);
      }
    });
  },

  provideLinter: () => {
    // With the custom format the puppet-int ouput looks like this:
    // error mongodb::service not in autoload module layout 3 7
    const helpers   = require('atom-linter');
    const path      = require('path');
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
              detail: "Please upgrade your version of puppet-lint.\n"
              + 'Check the README for further information.'
            }
          );
          return[];
        }

        const command = atom.config.get('linter-puppet-lint.executablePath');
        const file    = activeEditor.getPath();
        const cwd     = path.dirname(file);
        const args    = ['--log-format', '%{kind} %{message} %{line} %{column}', '--error-level', atom.config.get('linter-puppet-lint.errorLevel')]

        var optionsMap = require('./flags.js');
        var config     = atom.config.getAll('linter-puppet-lint')
        var flags      = config[0]['value']

        // Add the flags to the command options
        for(var flag in flags) {
          if (flags[flag] === true) {
            args.push(optionsMap[flag])
          }
        }

        args.push(file)

        return helpers.exec(command, args, {cwd: cwd}).then(output => {
          // If puppet-lint errors to stdout then redirect the message to stderr so it is caught
          if (/puppet-lint:/.exec(output)) {
            throw output
            return
          }
          const toReturn = [];
          output.split(/\r?\n/).forEach(function (line) {
            const matches = regexLine.exec(line);
            if (matches != null) {
              errLine = Number.parseInt(matches[3]) - 1;
              errCol  = Number.parseInt(matches[4]) - 1;
              toReturn.push({
                range: [[errLine, errCol], [errLine, errCol + 1]],
                type: matches[1],
                text: matches[2],
                filePath: file
              });
            }
          });
          return toReturn;
        });
      }
    };
  }
};
