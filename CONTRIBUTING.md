# Contributing

When contributing to this repository, please first discuss the change you wish to make via an issue.

## Contributing to an existing example project

If you would like to contribute to an existing example project, please open an issue and tag one of the original
authors or maintainers (@critesjosh, @signorecello) with your suggestion.

## Adding a new example project

If you are interested in adding a new example project, fork this repo and create a new branch for your work. Create a new folder with a descriptive name 
for the project and include the following:

1. Noir circuits. This is a repo for getting started with writing zk programs in Noir, so the project
should include Noir programs.
2. A context in which the Noir programs run. This is not strictly necessary as it can be helpful to 
have a basic Noir project just to show how to write some kind of circuit or use some feature of Noir,
but we often want an interface to generate and verify proofs. In the [hardhat example](next-hardhat), 
this is a Javascript context and the
project shows how to do that using the Noir WASM files. In the [voting example](foundry-voting), you can see how to verify
proofs in an EVM context with the Solidity examples.
3. A README.md that describes what the example is and why it is helpful. Include the process for getting
started with the project (installation instructions, tips, gotchas, etc.). Be as descriptive as possible.
See the other projects for examples.
4. Automated testing. Ideally there are some tests as part of the project that can be used to check
the functionality. See the [voting pproject](foundry-voting) for an example--there are foundry tests
defined in the project and automated testing defined in the [Github workflows](.github/workflows/foundry-voting.yml) that will run the tests
on open PRs. This helps us ensure the reliability of the examples.

When you are ready for your work to be added to this repo, open a PR and request reviews from @critesjosh and @signorecello.
