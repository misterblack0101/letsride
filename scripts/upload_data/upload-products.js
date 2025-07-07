const { db } = require('./firebase.js');
const { collection, setDoc, doc } = require('firebase/firestore');
const dummyProducts = require('./products-backup.json');

async function uploadProducts() {
    const productsCollection = collection(db, 'products');

    for (const product of dummyProducts) {
        const productDoc = doc(productsCollection, product.id);
        await setDoc(productDoc, product);
    }

    console.log('Products uploaded successfully');
}

uploadProducts().catch(console.error);
