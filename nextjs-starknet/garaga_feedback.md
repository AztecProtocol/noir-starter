# Feedback for the garaga team

- garaga should be npm executable so we don't have to install the python cli package as well
- Empty build/frobenius_cache folder
- `garaga calldata --system ultra_keccak_honk --vk vk.bin --proof proof.bin --format array` expects you to be in the "target" directory. I suggest `garaga calldata --system ultra_keccak_honk --vk target/vk.bin --proof target/proof.bin --format array >> target/full_proof_with_hints` so we write the output to a file too
