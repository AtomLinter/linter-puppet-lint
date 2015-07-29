{CompositeDisposable} = require 'atom'
helpers = require 'atom-linter'

module.exports =
  config:
    puppetLintExecutablePath:
      default: 'puppet-lint'
      title: 'Puppet Lint Executable Path'
      type: 'string'
    puppetLintArguments:
      default: '--no-autoloader_layout-check'
      title: 'Puppet Lint Arguments'
      type: 'string'

  activate: ->
    @regex = '(?<type>(warning|error)): (?<message>.+?) on line (?<line>\\d+) col (?<col>\\d+)'

    @subscriptions = new CompositeDisposable
    @subscriptions.add atom.config.observe 'linter-puppet-lint.puppetLintExecutablePath',
      (executablePath) =>
        @executablePath = executablePath
    @subscriptions.add atom.config.observe 'linter-puppet-lint.puppetLintArguments',
      (args) =>
        @args = [ "--log-format", "'%{kind}: %{message} on line %{line} col %{column}'" ]
        @args = @args.concat args.split(' ')
  deactivate: ->
    @subscriptions.dispose()

  puppetLinter: ->
    provider =
      grammarScopes: ['source.puppet']
      scope: 'file'
      lintOnFly: false
      lint: (textEditor) =>
        args = @args[..]
        args.push textEditor.getPath()

        helpers.exec(@executablePath, args)
          .then (val) =>
            helpers.parse(val, @regex)
          .catch (val) =>
            atom.notifications.addError "An error occured running '#{@executablePath}'",
              detail: val
