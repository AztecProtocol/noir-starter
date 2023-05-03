// @ts-ignore
import { NoirBrowser } from '../utils/noir/noirBrowser';

// // Add an event listener for the message event
onmessage = async event => {
  try {
    const { proof } = event.data;

    console.log(proof)
    const noir = new NoirBrowser();
    await noir.compile();
    const verification = await noir.verifyProof({ proof });
    postMessage(verification);
  } catch (er) {
    postMessage(er);
  } finally {
    close();
  }
};
