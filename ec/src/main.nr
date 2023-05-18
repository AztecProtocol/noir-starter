use dep::std::ecdsa_secp256k1;

fn main(
  pub_key_x: [u8; 32],
  pub_key_y: [u8; 32],
  signature: [u8; 64],
  hashed_message: pub [u8; 32],
) {
  let isValid = ecdsa_secp256k1::verify_signature(pub_key_x, pub_key_y, signature, hashed_message);
  assert(isValid == 1);
}
