const { db } = require('./firebase.js');
const { collection, setDoc, doc } = require('firebase/firestore');
const dummyProducts = require('./dummy_products2.json');
const { exit } = require('process');

async function uploadProducts() {
    const productsCollection = collection(db, 'products');

    for (const product of dummyProducts) {
        const productDoc = doc(productsCollection);
        await setDoc(productDoc, product);
    }

    console.log('Products uploaded successfully');
    exit(0);
}

uploadProducts().catch(console.error);
