use dep::std;
use dep::ecrecover;
// fn verify_signature(_public_key_x : [u8; 32], _public_key_y : [u8; 32], _signature: [u8; 64], _message: [u8]) -> Field

// Voting app:

// - membership inclusion
//     - verifying token ownership requires storage proofs
//     - otherwise there could be a setup phase where a user generates a private key
//     by signing a message with their ethereum account. for this, there would also need
//     to be a secret value added to prevent links between accounts used in multiple

// - signature verification
//     - public key
//     - signature
//     - message_hash
//         - DAO id (contract address or other unique identifier)
//         - proposal id
//         - vote

// - nullifier is a hash of:
//     - DAO_id
//     - proposal id
//     - public_key_x
//     - returned by circuit (must be provided for valid proof)
//     - vote is excluded otherwise people could vote in both directions

fn main(pub_key_x : [u8; 32], pub_key_y : [u8; 32], signature: [u8; 64], message_hash: pub [u8; 32], proposalId: Field, vote: Field) {
    let isValid = std::ecdsa_secp256k1::verify_signature(pub_key_x, pub_key_y, signature, message_hash);
    // https://github.com/colinnielsen/ecrecover-noir/blob/main/src/secp256k1/helpers.nr
    let pub_key_hash = std::hash::pedersen(pub_key_x);
    let nullifier = std::hash::pedersen([proposalId, vote, pub_key_hash[0]]);
    assert(isValid == 1);
}

fn main(x: pub [Field; 3], y: pub Field){
    assert(x[0] == y);
}