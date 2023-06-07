use dep::std;
use dep::ecrecover;
fn main(
  pub_key: [u8; 64],
  signature: [u8; 64],
  hashed_message: pub [u8; 32],
  nullifier: pub [u8; 32],
  merkle_path: [Field; 4],
  index: Field,
  merkle_root: pub Field,
  claimer_priv: Field,
  claimer_pub: pub Field
) {
  let key = ecrecover::secp256k1::PubKey::from_unified(pub_key);
  let address = ecrecover::ecrecover(key.pub_x, key.pub_y, signature, hashed_message);

  let calculatedNullifier = std::hash::blake2s(signature);
  assert(calculatedNullifier == nullifier);

  let new_root = std::merkle::compute_merkle_root(address, index, merkle_path);
  assert(new_root == merkle_root);
  
  assert(claimer_priv == claimer_pub);
}
