use dep::std::ecdsa_secp256k1;

fn main(
  pub_key_x: [u8; 32], // first part of public key
  pub_key_y: [u8; 32], // second part of public key
  signature: [u8; 64], // signature of the public message (signThis in the contract)
  // merkle_path: [u8; 32], // merkle path from the leaf to the root (root is in the contract)

  hashed_message: pub [u8; 32], // signThis, in the contract
  // nullifier: pub [u8; 32], // calculated nullifier, this should be h(signature) FOR NOW BECAUSE IT'S UNSAFE ECDSA IS MALLEABLE
  // merkle_root: pub [u8; 32], // merkle root, in the contract
) {
  // step 1, verify the signature of the known hash corresponds to the public key
  let isValid = ecdsa_secp256k1::verify_signature(pub_key_x, pub_key_y, signature, hashed_message);
  assert(isValid == 1);

  // step 2, verify the nullifier is correctly calculated as h(signature)

}
