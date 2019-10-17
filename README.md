# linter-puppet-lint

This package provides linter support to your Puppet manifests through Atom-Linter
using Puppet-Lint.

![Preview](https://raw.githubusercontent.com/AtomLinter/linter-puppet-lint/master/linter_puppet_lint.png)

## Installation

The `puppet-lint` gem must be installed. If you don't have `puppet-lint`
installed, please follow the instructions [here](http://puppet-lint.com/).

Basically, you should execute `gem install puppet-lint` or `bundle install puppet-lint`.

The minimum supported version of `puppet-lint` is 2.0.0.

### Plugin installation

*   `$ apm install linter-puppet-lint`

## Settings

You can configure Linter-Puppet-Lint by going to the settings menu in Atom or
by editing ``~/.atom/config.cson` (choose Open Your Config in Atom menu):

```coffeescript
'linter-puppet-lint':
  'executablePath': '/usr/bin/puppet-lint' # puppet-lint path.
```
