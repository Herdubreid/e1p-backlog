import * as storage from 'store2';
import { createStore, createEvent } from 'effector';
import { IState } from './state';

/** App Store  */

export const StoreKeys = {
    view: 'view',
    Backlog: 'backlog',
    e1: 'e1'
};

export const Actions = {
    KeySave: createEvent<[string, any]>()
};

const db = storage.session.namespace('io-celin-e1p-backlog');

export const KeyStore = createStore<IState>(
    {
        data: new Map(Object.entries(db.size() > 0
            ? db.getAll()
            : {}))
    })
    .on(Actions.KeySave, (_: IState, value: [string, any]) => {
        KeyStore.getState().data.set(value[0], value[1]);
        db.set(value[0], value[1]);
    });
