const md5 = require("md5");

function isPromise(value) {
    return value instanceof Promise;
}

class CachedStorage {
    constructor(defaultCachingTime = 60000, defaultGCTime = 120000) {
        if (CachedStorage.instance)
            return CachedStorage.instance;

        CachedStorage.instance = this;

        this.storage = {};
        this.defaultCachingTime = defaultCachingTime;
        this.defaultGCTime = defaultGCTime;
    }

    remove(itemName) {
        const hash = md5(itemName);

        delete this.storage[hash];
    }

    delayGC(itemName) {
        const hash = md5(itemName);

        if (!this.storage.hasOwnProperty(hash))
            return;

        clearTimeout(this.storage[hash].gc);
        this.storage[hash].gc = setTimeout(() => {
            this.remove(hash);
        }, this.storage[hash].gcTime);
    }

    async take(itemName, force = false) {
        const hash = md5(itemName);

        if (this.storage.hasOwnProperty(hash)) {
            this.delayGC(hash);
            const { lastUpdate, cachingTime, callback, value } = this.storage[hash];

            if (lastUpdate.getTime() + cachingTime < new Date().getTime() || force) {
                this.storage[hash].value = await callback();
                this.storage[hash].lastUpdate = new Date();
                return this.storage[hash].value;
            } else {
                if (isPromise(value)) {
                    this.storage[hash].value = await value;
                    return this.storage[hash].value;
                } else {
                    return value;
                }
            }
        }

        return undefined;
    }

    cache(itemName, promiseCallBack, cachingTime = this.defaultCachingTime, gcTime = this.defaultGCTime) {
        const hash = md5(itemName);

        if (this.storage.hasOwnProperty(hash)) {
            this.delayGC(hash);
            return;
        }

        const item = {
            lastUpdate: new Date(),
            callback: promiseCallBack,
            cachingTime: cachingTime,
            gcTime: gcTime,
            value: promiseCallBack(),
            gc: setTimeout(() => {
                this.remove(hash);
            }, gcTime)
        };

        this.storage[hash] = item;
    }
}

module.exports = CachedStorage;