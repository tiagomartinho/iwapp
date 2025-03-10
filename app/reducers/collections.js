import {Map} from "immutable";

import {COLLECTIONS_CHANGE} from "../actions/collections";

export default function collections (state = Map(), {type, payload}) {
    switch (type) {
        case COLLECTIONS_CHANGE:
            return payload;
        default:
            return state;
    }
}
