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
    puppetLintOnFly:
      default: true
      title: 'Enable lint on fly'
      type: 'boolean'

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
    @subscriptions.add atom.config.observe  \
     'linter-puppet-lint.puppetLintOnFly',
      (puppetLintOnFly) =>
        @puppetLintOnFly = puppetLintOnFly

  deactivate: ->
    @subscriptions.dispose()

  puppetLinter: ->
    helpers = require 'atom-linter'
    provider =
      grammarScopes: ['source.puppet']
      scope: 'file'
      lintOnFly: @puppetLintOnFly
      lint: (textEditor) =>
        console.log(textEditor.buffer.getPath())
        return helpers.tempFile textEditor.buffer.getBaseName(), textEditor.getText(), (tmpFilename) =>
          args = @args[..]
          args.push tmpFilename
          return helpers.exec(@executablePath, args).then (output) ->
            regex = /(warning|error): (.+?) on line (\d+) col (\d+)/g
            messages = []
            while((match = regex.exec(output)) isnt null)
              messages.push
                type: match[1]
                filePath: textEditor.getPath()
                range: helpers.rangeFromLineNumber(textEditor, match[3] - 1, match[4] - 1)
                text: match[2]
            return messages
