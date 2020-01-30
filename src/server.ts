console.log("Hello World!");

type Optional<T> = T | null;

interface StringCache {
    get<T>(key: string): Optional<T>
    set<T>(key: string, value: T): void
}


class LocalCache implements StringCache {
    data: Map<string, any> = new Map<string, any>();

    get<T>(key: string): Optional<T> {
        return this.data.get(key)
    }

    set<T>(key: string, value: T) {
        this.data.set(key, value);
    }
}

type CloudCacheSource = (key: string) => ((value: any) => void)

interface CloudSource {

}

class CloudCache implements StringCache {
    subCache: StringCache
    source: CloudSource

    constructor(subCache: StringCache, source: CloudCacheSource) {
        this.subCache = subCache
        this.source = source
    }

    get<T>(key: string): Optional<T> {
        throw new Error("Method not implemented.");
    }

    set<T>(key: string, value: T): void {
        throw new Error("Method not implemented.");
    }
}

type Listener = (key: string, value: any) => void

type ListenerID = number

class ListeningCache implements StringCache {
    subCache: StringCache
    listenerID: ListenerID = 0
    listener: Map<ListenerID, Listener> = new Map<ListenerID, Listener>()

    constructor(subCache: StringCache) {
        this.subCache = subCache
    }

    addListener(listener: Listener): ListenerID {
        this.listenerID += 1;
        this.listener.set(this.listenerID, listener)
        return this.listenerID;
    }

    removeListener(id: ListenerID): void {
        this.listener.delete(id);
    }

    get<T>(key: string): Optional<T> {
        return this.subCache.get(key);
    }

    set<T>(key: string, value: T): void {
        this.subCache.set(key, value);
        this.listener.forEach(listener => {
            listener(key, value);
        });
    }
}
