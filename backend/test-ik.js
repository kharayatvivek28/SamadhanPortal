import ImageKit from "@imagekit/nodejs";
console.log("Default Import:", typeof ImageKit);
if (typeof ImageKit === 'object') {
    console.log("Keys:", Object.keys(ImageKit));
} 
try {
    const ik = new ImageKit({ publicKey: '1', privateKey: '1', urlEndpoint: 'https://test.com' });
    console.log("Instance:", ik);
    console.log("Has upload?", typeof ik.upload === 'function');
} catch (e) {
    console.error("Error Instantiating default", e.message);
}
