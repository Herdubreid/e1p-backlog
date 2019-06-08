//** OMW User Stats Component */
import './style.scss';
import 'bootstrap';
import * as ko from 'knockout';
import * as CalHeatMap from 'cal-heatmap';
import 'datatables.net-bs4';
import moment from 'moment';
import { IPage, IUserMap, DATE_FORMAT } from '../../state';

const COMPONENT = 'e1p-omw-user-stats';

class ViewModel {
    visible$: ko.Observable<boolean>;
    page: IPage;
    data: IUserMap[];
    date$ = ko.observable<string>();
    count$ = ko.observable<number>();
    user$ = ko.observable<string>();
    table: DataTables.Api;
    getDetail(user: string, date: string) {
        const rq = {
            outputType: 'GRID_DATA',
            dataServiceType: 'BROWSE',
            targetName: 'F98210',
            targetType: 'table',
            returnControlIDs: 'OMWPRJID|OMWOT|OMWOBJID|OMWAC|USER|UPMT',
            maxPageSize: 500,
            query: {
                condition: [
                    {
                        value: [
                            {
                                content: user,
                                specialValueId: 'LITERAL'
                            }
                        ],
                        controlId: 'F98210.USER',
                        operator: 'EQUAL'
                    },
                    {
                        value: [
                            {
                                content: '02',
                                specialValueId: 'LITERAL'
                            },
                            {
                                content: '38',
                                specialValueId: 'LITERAL'
                            }
                        ],
                        controlId: 'F98210.OMWAC',
                        operator: 'LIST'
                    },
                    {
                        value: [
                            {
                                content: date,
                                specialValueId: 'LITERAL'
                            }
                        ],
                        controlId: 'F98210.UPMJ',
                        operator: 'EQUAL'
                    }
                ],
                matchType: 'MATCH_ALL'
            }
        };
        callAISService(rq, DATA_SERVICE, response => {
            this.table
                .clear()
                .rows.add(response.fs_DATABROWSE_F98210.data.gridData.rowset)
                .draw();
        });
    }
    descendantsComplete = () => {
        const today = new Date();
        const offset = today.getDay() === 0 ? 6 : today.getDay() - 1;
        const start = moment().subtract(4, 'weeks').subtract(offset, 'days').toDate();
        this.data.forEach(m => {
            const checkIns = new CalHeatMap();
            checkIns.init({
                itemSelector: `#${m.user}`,
                data: m.map,
                domain: 'week',
                domainLabelFormat: '',
                start,
                range: 5,
                cellSize: 10,
                displayLegend: false,
                onClick: (date, nb) => {
                    if (nb > 0) {
                        this.user$(m.user);
                        this.date$(moment(date).format('dddd, MMMM Do'));
                        this.count$(nb);
                        this.getDetail(m.user, moment(date).format(DATE_FORMAT));
                        $(`#modal-${this.page.id}`).modal();
                    }
                }
            });
        });
        // Table
        this.table = $(`#table-${this.page.id}`).DataTable({
            dom: 't',
            scrollY: '30vh',
            paging: false,
            data: [],
            columns: [
                {
                    title: 'Project',
                    data: 'F98210_OMWPRJID'
                },
                {
                    title: 'Object',
                    data: 'F98210_OMWOBJID',
                },
                {
                    title: 'Type',
                    data: 'F98210_OMWOT'
                },
                {
                    title: 'Action',
                    data: 'F98210_OMWAC'
                },
                {
                    title: 'Time',
                    data: 'F98210_UPMT',
                    render: data => {
                        const tm = data.toString().padStart(6, '0');
                        return `${tm.slice(0, 2)}:${tm.slice(2, 4)}`;
                    }
                }
            ]
        });
    }
    constructor(params: { page: IPage }) {
        this.visible$ = params.page.visible$;
        this.data = params.page.data;
        this.page = params.page;
    }
}

ko.components.register(COMPONENT, {
    viewModel: {
        createViewModel: (params, componentInfo) => {
            const vm = new ViewModel(params);
            const sub = (ko as any).bindingEvent
                .subscribe(componentInfo.element, 'descendantsComplete', vm.descendantsComplete);
            (vm as any).dispose = () => sub.dispose();
            return vm;
        }
    },
    template: require('./template.html')
});
