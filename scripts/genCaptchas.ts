import path from 'node:path';
import { convertSolutionToArrayBytes, getSolutionHash } from '../utils/captcha';
const Captcha = require('node-captcha-generator');

export default async function generateCaptcha() {
  var c = new Captcha({
    length: 5, // number length
    size: {
      // output size
      width: 450,
      height: 200,
    },
  });

  // const c = {value: 400}

  // const solution = convertSolutionToArrayBytes(c.value);

  const solutionHash = getSolutionHash(c.value);
  //   await c.save();

  c.captcha.write(path.join(__dirname, `../tmp/${c.value}.jpg`), function (err: Error) {
    if (err) console.log(err);
  });

  return { key: c.value, solutionHash };
}
