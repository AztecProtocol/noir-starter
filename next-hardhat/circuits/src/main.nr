use dep::std;

fn main(pub_x : [u8; 32], pub_y : [u8; 32], signature : [u8; 64], hashed_message : [u8; 32]) {
    assert(true == std::ecdsa_secp256k1::verify_signature(pub_x, pub_y, signature, hashed_message));
}
