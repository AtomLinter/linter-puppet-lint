{CompositeDisposable} = require 'atom'

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
    @subscriptions = new CompositeDisposable
    @subscriptions.add atom.config.observe  \
     'linter-puppet-lint.puppetLintExecutablePath',
      (executablePath) =>
        @executablePath = executablePath
    @subscriptions.add atom.config.observe \
     'linter-puppet-lint.puppetLintArguments',
      (args) =>
        @args = [ "--log-format",\
                  "'%{kind}: %{message} on line %{line} col %{column}'" ]
        @args = @args.concat args.split(' ')

  deactivate: ->
    @subscriptions.dispose()

  puppetLinter: ->
    helpers = require 'atom-linter'
    provider =
      grammarScopes: ['source.puppet']
      scope: 'file'
      lintOnFly: false
      lint: (textEditor) =>
        filePath = textEditor.getPath()
        args = @args[..]
        args.push textEditor.getPath()
        return helpers.exec(@executablePath, args).then (output) ->
          regex = /(warning|error): (.+?) on line (\d+) col (\d+)/g
          messages = []
          while((match = regex.exec(output)) isnt null)
            lineStart = match[3] - 1
            colStart = match[4] - 1
            lineEnd = match[3] - 1
            colEnd = textEditor.getBuffer().lineLengthForRow(lineStart)
            messages.push
              type: match[1]
              filePath: filePath
              range: [ [lineStart, colStart], [lineEnd, colEnd] ]
              text: match[2]
          return messages
