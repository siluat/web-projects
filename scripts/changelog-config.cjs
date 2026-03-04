const github = require('@changesets/changelog-github');

const owner = 'siluat';
const pattern = new RegExp(
  `\\s*Thanks \\[@${owner}\\]\\(https://github\\.com/${owner}\\)!`,
);

async function getReleaseLine(changeset, type, options) {
  const line = await github.default.getReleaseLine(changeset, type, options);
  return line.replace(pattern, '');
}

module.exports = {
  getReleaseLine,
  getDependencyReleaseLine: github.default.getDependencyReleaseLine,
};
