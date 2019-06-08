//** OMW Log Stats Component */
import './style.scss';
import 'bootstrap';
import * as ko from 'knockout';
import * as CalHeatMap from 'cal-heatmap';
import 'datatables.net-bs4';
import moment from 'moment';
import { Services } from '../../services';
import { IPage, ICalHeatMapData, DATE_FORMAT } from '../../state';

const COMPONENT = 'e1p-omw-log-stats';

class ViewModel {
    visible$: ko.Observable<boolean>;
    data: { type: string, map: ICalHeatMapData };
    page: IPage;
    date$ = ko.observable<string>();
    count$ = ko.observable<number>();
    table: DataTables.Api;
    getDetail(date: string) {
        const rq = {
            outputType: 'GRID_DATA',
            dataServiceType: 'BROWSE',
            targetName: 'F98210',
            targetType: 'table',
            returnControlIDs: 'OMWPRJID|OMWOT|OMWOBJID|OMWFPS|OMWTPS|USER|UPMT',
            maxPageSize: 500,
            query: {
                condition: [
                    {
                        value: [
                            {
                                content: this.page.data.type,
                                specialValueId: 'LITERAL'
                            }
                        ],
                        controlId: 'F98210.OMWAC',
                        operator: 'EQUAL'
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
        const checkIns = new CalHeatMap();
        checkIns.init({
            itemSelector: `#${this.page.id}`,
            data: this.data.map.data,
            domain: 'month',
            start: moment().subtract(5, 'months').toDate(),
            range: 6,
            cellSize: 20,
            onClick: (date, nb) => {
                if (nb > 0) {
                    this.date$(moment(date).format('dddd, MMMM Do'));
                    this.count$(nb);
                    this.getDetail(moment(date).format(DATE_FORMAT));
                    $(`#modal-${this.page.id}`).modal();
                }
            }
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
                    visible: this.page.data.type === '02'
                },
                {
                    title: 'Type',
                    data: 'F98210_OMWOT',
                    visible: this.page.data.type === '02'
                },
                {
                    title: 'From',
                    data: 'F98210_OMWFPS',
                    visible: this.page.data.type === '38'
                },
                {
                    title: 'To',
                    data: 'F98210_OMWTPS',
                    visible: this.page.data.type === '38'
                },
                {
                    title: 'User',
                    data: 'F98210_USER'
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
    constructor(params: { page: IPage, services: Services }) {
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
