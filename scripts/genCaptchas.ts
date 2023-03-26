import { convertSolutionToArrayBytes, getSolutionHash } from "../utils/captcha";
const Captcha = require('node-captcha-generator');

export default async function generateCaptcha () {
    var c = new Captcha({
        length:5, // number length
        size:{    // output size
            width: 450,
            height: 200
        }
    });

    // const c = {value: 400}

    // const solution = convertSolutionToArrayBytes(c.value);

    const solutionHash = getSolutionHash(c.value)
    await c.save();

    return { key: c.value, solutionHash }
}

