// @ts-ignore
import { NoirBrowser } from '../utils/noir/noirBrowser';

// // Add an event listener for the message event
onmessage = async event => {
  try {
    const { input } = event.data;
    const hexInputObj = Object.entries(input).reduce((newObj, [key, value]) => {
      newObj[key] = (value as number).toString(16).padStart(2, '0');
      return newObj;
    }, {});


    const noir = new NoirBrowser();
    await noir.compile();
    const proof = await noir.createProof({ input: hexInputObj })
    postMessage(proof);
  } catch (er) {
    console.log(er);
    postMessage(er);
  } finally {
    close();
  }
};
