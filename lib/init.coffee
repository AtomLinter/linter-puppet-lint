{BufferedProcess, CompositeDisposable} = require 'atom'

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
    @subscriptions.add atom.config.observe 'linter-puppet-lint.puppetLintExecutablePath',
      (executablePath) =>
        @executablePath = executablePath
    @subscriptions.add atom.config.observe 'linter-puppet-lint.puppetLintArguments',
      (args) =>
        @args = args
  deactivate: ->
    @subscriptions.dispose()

  puppetLinter: ->
    provider =
      grammarScopes: ['source.puppet']
      scope: 'file'
      lintOnFly: true
      lint: (textEditor) =>
        return new Promise (resolve, reject) =>
          filePath = textEditor.getPath()
          regex = /(WARNING|ERROR): (.+?) on line (\d+)/
          msg = ''
          process = new BufferedProcess
            command: @executablePath
            args: [@args, filePath]
            stdout: (data) ->
              msg = data
            exit: (code) ->
              console.log(code)
              if msg is ''
                return resolve []
              msgA = msg.split('\n').filter (m) -> m isnt ''
              resolve msgA.map (err) ->
                [_, mType, mText, mLine] = err.match regex
                type: mType.toLowerCase()
                text: mText
                filePath: filePath
                range: [
                  [parseInt(mLine) - 1, 0],
                  [parseInt(mLine) - 1, 1]
                ]

          process.onWillThrowError ({error, handle}) ->
            atom.notifications.addError "Failed to run #{@executablePath}",
              detail: "#{error.messages}"
              dismissable: true
            handle()
            resolve []
