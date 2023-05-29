export function generateHashPathInput(hash_path: string[]) {
  let hash_path_input = [];
  for (var i = 0; i < hash_path.length; i++) {
    hash_path_input.push(`"0x${hash_path[i]}"`);
  }
  return hash_path_input;
}
