const { writeFileSync } = require('fs');

async function main() {
  const fetchOpts = {
    headers: {},
  };

  if (process.env.GITHUB_TOKEN)
    fetchOpts.headers = { Authorization: `token ${process.env.GITHUB_TOKEN}` };

  const res = await fetch('https://api.github.com/repos/noir-lang/noir/releases', fetchOpts);

  const data = await res.json();

  const filtered = data.filter(
    release => !release.tag_name.includes('aztec') && !release.tag_name.includes('nightly'),
  );

  const latestStable = filtered.find(release => !release.prerelease).tag_name;
  const latestPreRelease = filtered.find(release => release.prerelease).tag_name;

  const workflowOutput = JSON.stringify({ stable: latestStable, prerelease: latestPreRelease });
  console.log(workflowOutput); // DON'T REMOVE, GITHUB WILL CAPTURE THIS OUTPUT
}

main();
