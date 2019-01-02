'use babel';

// eslint-disable-next-line no-unused-vars
import { it, fit, wait, beforeEach, afterEach } from 'jasmine-fix';
import * as path from 'path';

const cleanPath = path.join(__dirname, 'fixtures', 'test_clean.pp');
const errorsPath = path.join(__dirname, 'fixtures', 'test_errors.pp');

describe('The puppet-lint provider for Linter', () => {
  const { lint } = require('../lib/main.js').provideLinter();

  beforeEach(async () => {
    atom.workspace.destroyActivePaneItem();
    await atom.packages.activatePackage('linter-puppet-lint');
    await atom.packages.activatePackage('language-puppet');
  });

  it('finds nothing wrong with a valid file', async () => {
    const editor = await atom.workspace.open(cleanPath);
    const messages = await lint(editor);

    expect(messages.length).toBe(0);
  });

  it('handles messages from puppet-lint', async () => {
    const editor = await atom.workspace.open(errorsPath);
    const messages = await lint(editor);

    expect(messages.length).toBe(2);

    expect(messages[0].html).not.toBeDefined();
    expect(messages[0].location.file).toBe(errorsPath);
    expect(messages[1].html).not.toBeDefined();
    expect(messages[1].location.file).toBe(errorsPath);
  });
});
