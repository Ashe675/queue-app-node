import { v4 as uuiv4 } from 'uuid';

export class UuidAdapter {

    public static v4() {
        return uuiv4();
    }

}