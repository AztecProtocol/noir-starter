

export class Noir {
  async init() {

  }

  async generateWitness(input: any): Promise<Uint8Array> {
    return Promise.resolve(Uint8Array.from([]));
  }

  async generateProof(witness: Uint8Array) {
    return Promise.resolve(Uint8Array.from([]));
  }

  async verifyProof(proof: Uint8Array) {
    return Promise.resolve(true);
  }

  async destroy() {
    return Promise.resolve();
  }
}
