use dep::std;

// TODO have this in circuits/src (check foundry voting example)
fn main(
  pub_key: [u8; 64], // first part of public key
  signature: [u8; 64], // signature of the public message (signThis in the contract)

  hashed_message: pub [u8; 32], // signThis, in the contract
  nullifier: pub [u8; 32], // calculated nullifier, this should be h(signature) FOR NOW BECAUSE IT'S UNSAFE ECDSA IS MALLEABLE
  
  merkle_path: [Field; 4], // merkle path from the leaf to the root (root is in the contract)
  index: Field,
  merkle_root: pub Field, // merkle root, in the contract

  claimer_priv: Field,
  claimer_pub: pub Field
) {
  // step 1, verify the signature of the known hash corresponds to the public key
  // of the original address
  let mut pubKeyX : [u8; 32] = [0; 32];
  let mut pubKeyY : [u8; 32] = [0; 32];
  for i in 0..32 {
    pubKeyX[i] = pub_key[i];
    pubKeyY[i] = pub_key[i+32];
  }
  let isValid = std::ecdsa_secp256k1::verify_signature(pubKeyX, pubKeyY, signature, hashed_message);
  assert(isValid == true);

  // step 2, verify the nullifier is correctly calculated as h(signature)
  let calculatedNullifier = std::hash::blake2s(signature);
  assert(calculatedNullifier == nullifier);

  // step 3, check leaf belongs to the merkle tree
  let hashOfPubKey = std::hash::keccak256(pub_key);
  let mut address : Field = 0;
  let mut v : Field = 1;

  for i in 0..20 {
      let index = (20 - i);
      address += hashOfPubKey[index + 11] as Field * v;
      v *= 256;
  }

  let new_root = std::merkle::compute_merkle_root(address, index, merkle_path);
  assert(new_root == merkle_root);

  // step 4, check claimer pub === claimer priv
  assert(claimer_priv == claimer_pub);
}
