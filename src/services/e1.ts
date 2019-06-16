/** E1 Service */
import * as ko from 'knockout';
import { Actions, StoreKeys } from '../store';
import { IE1, IProject } from '../state';

export class E1Service {
    ready$ = ko.observable(false);
    e1$ = ko.observable<IE1>();
    init(force: boolean): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.e1$(this.data.get(StoreKeys.e1));
            if (!force && this.e1$()) {
                resolve(true);
            } else {
                const batchRequest = {
                    outputType: 'GRID_DATA',
                    batchDataRequest: true,
                    dataRequests: [
                        {
                            dataServiceType: 'BROWSE',
                            targetName: 'F0005',
                            targetType: 'table',
                            maxPageSize: '500',
                            returnControlIDs: 'SY|RT|KY|DL01',
                            query: {
                                condition: [
                                    {
                                        value: [
                                            {
                                                content: 'H92',
                                                specialValueId: 'LITERAL'
                                            }
                                        ],
                                        controlId: 'F0005.SY',
                                        operator: 'EQUAL'
                                    },
                                    {
                                        value: [
                                            {
                                                content: 'PS',
                                                specialValueId: 'LITERAL'
                                            },
                                            {
                                                content: 'AC',
                                                specialValueId: 'LITERAL'
                                            }
                                        ],
                                        controlId: 'F0005.RT',
                                        operator: 'LIST'
                                    }
                                ],
                                matchType: 'MATCH_ALL'
                            }
                        },
                        {
                            dataServiceType: 'BROWSE',
                            targetName: 'F98220',
                            targetType: 'table',
                            returnControlIDs: 'OMWPRJID|OMWDESC|OMWPS|OMWTYP|OMWSV|OMCD|OMWSD|OMWPD',
                            maxPageSize: '1000',
                            query: {
                                condition: [
                                    {
                                        value: [
                                            {
                                                content: '11',
                                                specialValueId: 'LITERAL'
                                            },
                                            {
                                                content: '37X',
                                                specialValueId: 'LITERAL'
                                            }
                                        ],
                                        controlId: 'F98220.OMWPS',
                                        operator: 'BETWEEN'
                                    }
                                ],
                                matchType: 'MATCH_ALL'
                            }
                        }
                    ]
                };
                callAISService(batchRequest, DATA_SERVICE, response => {
                    const udcs: any[] = response.fs_0_DATABROWSE_F0005.data.gridData.rowset;
                    const projectStatuses = udcs
                        .filter(r => r.F0005_RT === 'PS')
                        .map(r => {
                            return {
                                id: r.F0005_KY.trim(' '),
                                name: r.F0005_DL01
                            };
                        });
                    const data = response.fs_1_DATABROWSE_F98220.data.gridData.rowset;
                    const ps = data
                        .map(r => r.F98220_OMWPS)
                        .filter((v, i, a) => a.indexOf(v) === i);
                    const projects: IProject[] = ps
                        .map(status => {
                            const name = projectStatuses.find(s => s.id === status).name;
                            const rows = data.filter(r => status === r.F98220_OMWPS);
                            return {
                                status,
                                name,
                                rows
                            };
                        });
                    this.e1$({
                        projectStatuses,
                        projects
                    });
                    Actions.KeySave([StoreKeys.e1, this.e1$()]);
                    resolve(true);
                });
            }
        });
    }
    constructor(public data: Map<string, any>) {
    }
}
