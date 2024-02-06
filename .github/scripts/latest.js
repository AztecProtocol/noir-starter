const GITHUB_PAGES = 3;

async function main() {
  const fetchOpts = {
    params: { per_page: 100 },
    headers: {},
  };

  if (process.env.GITHUB_TOKEN)
    fetchOpts.headers = { Authorization: `token ${process.env.GITHUB_TOKEN}` };

  const versions = [];
  for (let i = 0; i < GITHUB_PAGES; i++) {
    const res = await fetch(
      `https://api.github.com/repos/noir-lang/noir/releases?page=${i + 1}`,
      fetchOpts,
    );

    const data = await res.json();

    const filtered = data.filter(
      release => !release.tag_name.includes('aztec') && !release.tag_name.includes('nightly'),
    );
    versions.push(...filtered);
  }

  const latestStable = versions.find(release => !release.prerelease).tag_name.substring(1);

  /**
   * TODO: test the prerelease!
   *
   * The problem with the prerelease is that if the test runs for both the stable and the prerelease,
   * and the prerelease has a breaking change, then the stable will fail.
   *
   * If we update the the starter to match the prerelease, then the stable will fail.
   *
   * This means that if there is a breaking change in a prerelease, we will ALWAYS get a warning 😄, which defeats the purpose.
   *
   * A solution would be to have a separate "prerelease" branch that is updated with the prerelease. And the CI runs on that branch.
   * However, Noir hasn't yet reached a state where, for example, there is ALWAYS a prerelease newer than the stable.
   * Sometimes the stable is the last one, and there is a prerelease buried somewhere that never got the honor of being promoted to stable.
   *
   * So for now, we will just ignore the prerelease.
   */

  // const latestPreRelease = versions.find(release => release.prerelease).tag_name.substring(1);

  const workflowOutput = JSON.stringify({
    stable: latestStable,
    // prerelease: latestPreRelease,
  });
  console.log(workflowOutput); // DON'T REMOVE, GITHUB WILL CAPTURE THIS OUTPUT
}

main();
