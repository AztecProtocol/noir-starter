# EC

- Run nargo codegen-verifier
- Run npx hardhat test
- It should spit out the hashedMessage (public input) and signature
- Check that those are in Prover.toml
- Run nargo prove p
- "unskip" the last test
- Run npx hardhat test
