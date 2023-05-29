use dep::std;

// Returns the root of the tree from the provided leaf and its hashpath, using pedersen hash
fn compute_root_from_leaf(leaf : Field, index : Field, hash_path: [Field]) -> Field {
    let n = hash_path.len();
    let index_bits = index.to_le_bits(n as u32);
    let mut current = leaf;
    
    for i in 0..n {
        let path_bit = index_bits[i] as bool;
        let (hash_left, hash_right) = if path_bit {
            (hash_path[i], current)
         } else {
            (current, hash_path[i])
         };
      current = std::hash::pedersen([hash_left, hash_right])[0];
      std::println(current);
    };
    current
}

fn main(
  pub_key_x: [u8; 32], // first part of public key
  pub_key_y: [u8; 32], // second part of public key
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
  constrain isValid == 1;

  // step 2, verify the nullifier is correctly calculated as h(signature)
  let calculatedNullifier = std::hash::blake2s(signature);
  constrain calculatedNullifier == nullifier;
  
  // let is_member = std::merkle::check_membership(merkle_root, leaf, index, merkle_path);
  // is_member

  let new_root = compute_root_from_leaf(leaf, index, merkle_path);
  constrain new_root == merkle_root;
  // std::println(new_root);

}
