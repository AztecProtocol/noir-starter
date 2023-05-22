use dep::std;
use dep::ecrecover::ecrecover;
// fn verify_signature(_public_key_x : [u8; 32], _public_key_y : [u8; 32], _signature: [u8; 64], _message: [u8]) -> Field

// Voting app notes: https://hackmd.io/TDreLUKdT32ETDWXxxUhnQ

fn main(pub_key_x : [u8; 32], pub_key_y : [u8; 32], signature: [u8; 64], message_hash: pub [u8; 32], proposalId: Field, vote: Field) {
    let isValid = std::ecdsa_secp256k1::verify_signature(pub_key_x, pub_key_y, signature, message_hash);
    assert(isValid == 1);

    // https://github.com/colinnielsen/ecrecover-noir/blob/main/src/secp256k1/helpers.nr
    let eth_address = ecrecover(pub_key_x, pub_key_y, signature, message_hash);

    // storage proof; TBD
    // storage_proof(block_header, eth_address, token_contract, storage_slot);
    
    let mut new_array: [Field; 33] = [0;33];
    new_array[0] = proposalId;
    for i in 1..new_array.len() {
        new_array[i] = pub_key_x[i] as Field;
    }
    let nullifier = std::hash::pedersen(new_array);
    nullifier;
}
