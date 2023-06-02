use dep::std;

// TODO have this in circuits/src (check foundry voting example)
fn main(
  pub_key_x: pub [u8; 32], // first part of public key
  pub_key_y: pub [u8; 32], // second part of public key
  signature: [u8; 64], // signature of the public message (signThis in the contract)

  hashed_message: pub [u8; 32], // signThis, in the contract
  nullifier: pub [u8; 32], // calculated nullifier, this should be h(signature) FOR NOW BECAUSE IT'S UNSAFE ECDSA IS MALLEABLE
  
  merkle_path: [Field; 4], // merkle path from the leaf to the root (root is in the contract)
  leaf: Field,
  index: Field,
  merkle_root: pub Field, // merkle root, in the contract
) {
  // step 1, verify the signature of the known hash corresponds to the public key
  let isValid = std::ecdsa_secp256k1::verify_signature(pub_key_x, pub_key_y, signature, hashed_message);
  assert(isValid == true);

  // step 2, verify the nullifier is correctly calculated as h(signature)
  let calculatedNullifier = std::hash::blake2s(signature);
  assert(calculatedNullifier == nullifier);

  // step 3, check leaf belongs to the merkle tree
  let new_root = std::merkle::compute_merkle_root(leaf, index, merkle_path);
  assert(new_root == merkle_root);
}
