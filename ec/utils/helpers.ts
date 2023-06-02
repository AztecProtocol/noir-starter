import { Fr } from '@aztec/bb.js/dest/types';

export function generateHashPathInput(hash_path: Fr[]) {
  let hash_path_input = [];
  for (var i = 0; i < hash_path.length; i++) {
    hash_path_input.push(Fr.fromString(`"0x${hash_path[i]}"`));
  }
  return hash_path_input.toString();
}
