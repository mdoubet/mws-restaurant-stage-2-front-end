import idb from 'idb';

// function openDatabase initializes current version of restaurant-reviews-idb indexedDB

const dbPromise = () => {
    if(!navigator.serviceWorker){
        return Promise.resolve();
    }
    return idb.open('restaurant-reviews-idb',1, upgradeDb => {
        switch (upgradeDb.oldVersion) {
            case 0:
                upgradeDb.createObjectStore('restaurants', {
                    keyPath: 'id'
                });
        }
    });
};

dbPromise.then(db=>{
    console.log(db);
});