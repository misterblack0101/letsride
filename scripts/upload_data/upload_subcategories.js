const { db } = require('./firebase.js');
const { setDoc, doc } = require('firebase/firestore');



const data = {
    "categories": {
        "Accessories": {
            "subcategories": {

                "Phone Case/Mount": {
                    "brands": ["Giro", "Bell", "Specialized"]
                },
                "Fenders": {
                    "brands": ["SKS", "Planet Bike", "Topeak"]
                },
                "Lights": {
                    "brands": ["Bontrager", "Light & Motion", "NiteRider"]
                },
                "Bags": {
                    "brands": ["Ortlieb", "Topeak", "Revelate Designs"]
                },
            }
        },
        "Apparel": {
            "subcategories": {
                "Topwear": {
                    "brands": ["Pearl Izumi", "Castelli", "Gore Wear"]
                },
                "Bottomwear": {
                    "brands": ["Assos", "Endura", "Sugoi"]
                },
                "Footwear": {
                    "brands": ["Sidi", "Shimano", "Giro"]
                },
                "Helmet": {
                    "brands": ["Giro", "Bell", "Specialized"]
                },
                "Eyewear": {
                    "brands": ["Oakley", "Smith", "Tifosi"]
                },
                "Gloves": {
                    "brands": ["Giro", "Pearl Izumi", "Castelli"]
                },
            }
        },
        "Bikes": {
            "subcategories": {
                "Mountain Bikes": {
                    "brands": ["Trek", "Specialized", "Giant"]
                },
                "Road Bikes": {
                    "brands": ["Cannondale", "Bianchi", "Cervelo"]
                },
                "Hybrid Bikes": {
                    "brands": ["Trek", "Giant", "Specialized"]
                },
                "Gravel Bikes": {
                    "brands": ["Specialized", "Canyon", "Giant"]
                },
            }
        },
        "Kids": {
            "subcategories": {
                "Tricycles": {
                    "brands": ["Radio Flyer", "Fisher-Price", "Little Tikes"]
                },
                "Electric Car/Bike": {
                    "brands": ["Power Wheels", "Razor", "Best Choice Products"]
                },
                "Ride-Ons": {
                    "brands": ["Step2", "Little Tikes", "Fisher-Price"]
                },
                "Prams": {
                    "brands": ["UPPAbaby", "Bugaboo", "Chicco"]
                },
                "Baby Swing": {
                    "brands": ["Fisher-Price", "Graco", "4moms"]
                },
                "Baby Essentials": {
                    "brands": ["Pampers", "Huggies", "Johnson's"]
                },
            }
        },
        "Spares": {
            "subcategories": {
                "Braking System": {
                    "brands": ["Shimano", "SRAM", "Avid"]
                },
                "Tyres & Tubes": {
                    "brands": ["Continental", "Schwalbe", "Maxxis"]
                },
                "Pedals": {
                    "brands": ["Shimano", "Crankbrothers", "Time"]
                },
                "Saddles": {
                    "brands": ["Brooks", "Selle Italia", "Fizik"]
                },
                "Grips": {
                    "brands": ["Ergon", "ODI", "Lizard Skins"]
                },
                "Gear systems": {
                    "brands": ["Shimano", "SRAM", "Campagnolo"]
                },
            }
        }
    }
};


async function uploadCategories() {
    const categoriesDocRef = doc(db, 'categories', 'all');
    await setDoc(categoriesDocRef, data.categories);
    console.log('All categories and subcategories uploaded to a single document.');
}

uploadCategories()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('Error uploading data:', err);
        process.exit(1);
    });