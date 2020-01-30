type Optional<T> = T | null;

import {vec2} from "tsm"

export interface StringCache {
    get<T>(key: string): Optional<T>
    set<T>(key: string, value: T): void
}

export class PrefixCache implements StringCache {
    prefix: string
    subCache: StringCache 

    constructor(prefix: string, subCache: StringCache) {
        this.subCache = subCache
        this.prefix = prefix
    }

    get<T>(key: string): Optional<T> {
        return this.subCache.get(this.prefix + key)
    }

    set<T>(key: string, value: T) {
        this.subCache.set(this.prefix + key, value);
    }
}


export class LocalCache implements StringCache {
    data: Map<string, any> = new Map<string, any>();

    get<T>(key: string): Optional<T> {
        return this.data.get(key)
    }

    set<T>(key: string, value: T) {
        this.data.set(key, value);
    }
}

export type CloudCacheSource = (key: string) => ((value: any) => void)

export interface CloudSource {

}

export class CloudCache implements StringCache {
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

export type Listener = (key: string, value: any) => void

export type ListenerID = number

export class ListeningCache implements StringCache {
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
