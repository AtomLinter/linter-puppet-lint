# linter-puppet-lint

This package provides linter support to your Puppet manifests through Atom-Linter
using Puppet-Lint.

![Preview](https://raw.githubusercontent.com/AtomLinter/linter-puppet-lint/master/linter_puppet_lint.png)

## Installation

The `puppet-lint` gem must be installed. If you don't have `puppet-lint`
installed, please follow the instructions [here](http://puppet-lint.com/).

Basically, you should execute `gem install puppet-lint` or `bundle install puppet-lint`.

### Compatibility

__Since the 0.5.0 version this package is no longer compatible with old
versions of puppet-lint__ because we are now using a custom log format with
`%{line}` and `%{column}` placeholders. If you have an old version of Puppet-Lint
installed, then please follow the instructions for the `puppet-lint` gem installation
to ensure that you have the latest version of Puppet-Lint.

### Plugin installation

*   `$ apm install linter-puppet-lint`

## Settings

You can configure Linter-Puppet-Lint by going to the settings menu in Atom or
by editing ``~/.atom/config.cson` (choose Open Your Config in Atom menu):

```coffeescript
'linter-puppet-lint':
  'executablePath': '/usr/bin/puppet-lint' # puppet-lint path.
```
