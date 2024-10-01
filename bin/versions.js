import axios from 'axios';
export async function getBbVersion(noirVersion) {
    const url = `https://raw.githubusercontent.com/noir-lang/noir/v${noirVersion}/scripts/install_bb.sh`;
    try {
        const { data } = await axios.get(url);
        const versionMatch = data.match(/VERSION="([\d.]+)"/);
        const version = versionMatch ? versionMatch[1] : null;
        return version;
    }
    catch (e) {
        throw new Error(e);
    }
}
