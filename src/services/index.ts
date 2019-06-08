/** Services */
import { BacklogService } from './backlog';
import { E1Service } from './e1';

export class Services {
    backlog: BacklogService;
    e1: E1Service;
    init(): Promise<any[]> {
        return Promise.all([
            this.backlog.init(),
            this.e1.init()]);
    }
    constructor(data: Map<string, any>) {
        this.backlog = new BacklogService(data);
        this.e1 = new E1Service(data);
    }
}