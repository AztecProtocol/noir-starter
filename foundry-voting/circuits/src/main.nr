use dep::std;

fn main(root : pub Field, index : Field, hash_path : [Field; 2], secret: Field, priv_key: Field, proposalId: pub Field, vote: pub u8) -> pub Field {
    let note_commitment = std::hash::pedersen([priv_key, secret]);
    let nullifier = std::hash::pedersen([root, priv_key, proposalId]);

    let is_member = std::merkle::check_membership(root, note_commitment[0], index, hash_path);
    assert(is_member == 1);
    assert(vote <= 1);

    nullifier[0]
}

// Helpers for getting note_commitments to build the merkle tree.
// To view: nargo test --show-output

#[test]
fn test_build_merkle_tree() {
    let secret = 9;
    let commitment_0 =  std::hash::pedersen([0, secret])[0];
    let commitment_1 =  std::hash::pedersen([1, secret])[0];
    let commitment_2 =  std::hash::pedersen([2, secret])[0];
    let commitment_3 =  std::hash::pedersen([3, secret])[0];

    let left_branch = std::hash::pedersen([commitment_0, commitment_1])[0];
    let right_branch = std::hash::pedersen([commitment_2, commitment_3])[0];

    let root = std::hash::pedersen([left_branch, right_branch])[0];

    std::println("Merkle Tree:");
    std::println([root]);
    std::println([left_branch, right_branch]);
    std::println([commitment_0, commitment_1, commitment_2, commitment_3]);
}
