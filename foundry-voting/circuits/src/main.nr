use dep::std;

fn main(root : pub Field, index : Field, hash_path : [Field; 2], secret: Field, priv_key: Field, proposalId: pub Field, vote: pub Field) -> pub Field {
    constrain index == index;

    let pubkey = std::scalar_mul::fixed_base(priv_key);
    let pubkey_x = pubkey[0];
    let pubkey_y = pubkey[1];
    let note_commitment = std::hash::pedersen([pubkey_x, pubkey_y, secret]);
    let nullifier = std::hash::pedersen([root, priv_key, proposalId, vote]);

    let is_member = std::merkle::check_membership(root, note_commitment[0], index, hash_path);
    constrain is_member == 1;

    nullifier[0]
}

fn member_commitment(priv_key : Field, secret : Field) {
    let pubkey = std::scalar_mul::fixed_base(priv_key);
    let pubkey_x = pubkey[0];
    let pubkey_y = pubkey[1];
    let note_commitment = std::hash::pedersen([pubkey_x, pubkey_y, secret]);

    std::println("Public leaf:");
    std::println(note_commitment);
}