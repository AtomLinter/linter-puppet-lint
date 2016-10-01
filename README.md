# linter-puppet-lint

This package provides linter support to your puppet files through atom-linter
using puppet-lint.

![Preview](http://s16.postimg.org/b84dqyuf9/pup_lin_scrsho.png)

## Installation

The `puppet-lint` gem must be installed. If you don't have puppet-lint
installed, please follow the instructions [here](http://puppet-lint.com/).

Basically, you should execute `gem install puppet-lint`.

### Compatibility

__Since the 0.5.0 version this package is no longer compatible with old
versions of puppet-lint__ because we are using now a custom log format with
`%{line}` and `%{column}` placeholders. If you have an old version of puppet-lint
installed, then please follow the instructions for the puppet-lint gem installation
to ensure that you have the latest version of puppet-lint.

### Plugin installation

*   `$ apm install language-puppet` (if you don't have
    [language-puppet](https://github.com/atom/language-puppet) installed)

*   `$ apm install linter-puppet-lint`

## Settings

You can configure linter-puppet-lint by going to the settings menu in Atom or
by editing ~/.atom/config.cson (choose Open Your Config in Atom menu):

```coffeescript
'linter-puppet-lint':
  'executablePath': '/usr/bin/puppet-lint' # puppet-lint path.
```
