use dep::std;

// fn verify_signature(_public_key_x : [u8; 32], _public_key_y : [u8; 32], _signature: [u8; 64], _message: [u8]) -> Field


fn main(pub_key_x : [u8; 32], pub_key_y : [u8; 32], signature: [u8; 64], message_hash: pub [u8; 32]) {
    let isValid = std::ecdsa_secp256k1::verify_signature(pub_key_x, pub_key_y, signature, message_hash);
    assert(isValid == 1);
}
