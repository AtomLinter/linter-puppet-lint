# linter-puppet-lint

This package will lint your `.pp` opened files in Atom through [puppet-lint](http://puppet-lint.com/).

## Installation

* Install [puppet-lint](http://puppet-lint.com/)
* `$ apm install language-puppet` (if you don't have [language-puppet](https://github.com/atom/language-puppet) installed)
* `$ apm install linter` (if you don't have [linter](https://github.com/AtomLinter/Linter) installed)
* `$ apm install linter-puppet-lint`

## Settings
You can configure linter-puppet-lint by editing ~/.atom/config.cson (choose Open Your Config in Atom menu):
```
'linter-puppet-lint':
  'puppetLintExecutablePath': null # puppet-lint path. run 'which puppet-lint' to find the path
```
