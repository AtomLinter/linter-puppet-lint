linterPath = atom.packages.getLoadedPackage("linter").path
Linter = require "#{linterPath}/lib/linter"

class LinterPuppetLint extends Linter
  # The syntax that the linter handles. May be a string or
  # list/tuple of strings. Names should be all lowercase.
  @syntax: ['source.puppet']

  # A string, list, tuple or callable that returns a string, list or tuple,
  # containing the command line (with arguments) used to lint.
  cmd: 'puppet-lint --no-autoloader_layout-check'

  executablePath: null

  linterName: 'puppet-lint'

  # A regex pattern used to extract information from the executable's output.
  regex: '((?<warning>WARNING)|(?<error>ERROR)): (?<message>.+) on line (?<line>\\d+)'

  constructor: (editor) ->
    super(editor)

    atom.config.observe 'linter-puppet-lint.puppetLintExecutablePath', =>
      @executablePath = atom.config.get 'linter-puppet-lint.puppetLintExecutablePath'

  destroy: ->
    atom.config.unobserve 'linter-puppet-lint.puppetLintExecutablePath'

module.exports = LinterPuppetLint
