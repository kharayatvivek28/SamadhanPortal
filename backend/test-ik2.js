import ImageKit from "@imagekit/nodejs";
const ik = new ImageKit({ publicKey: '1', privateKey: '1', urlEndpoint: 'https://test.com' });
console.log("Keys on ik:", Object.keys(ik));
console.log("ik.files methods:", Object.keys(ik.files));
console.log("ik.assets methods:", Object.keys(ik.assets));
let uploadMethods = [];
for (const key in ik) {
    if (typeof ik[key] === 'object' && ik[key] !== null) {
        for (const sub in ik[key]) {
             if (sub === 'upload') uploadMethods.push(`${key}.upload`);
        }
    }
}
console.log("Locations of upload methods:", uploadMethods);
