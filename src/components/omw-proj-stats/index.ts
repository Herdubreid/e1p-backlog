//** OMW Project Stats Component */
import './style.scss';
import 'bootstrap';
import * as ko from 'knockout';
import * as CalHeatMap from 'cal-heatmap';
import 'datatables.net-bs4';
import moment from 'moment';
import * as d3 from 'd3';
import { Services } from '../../services';
import {IPage, IProjectStatus, IProject, DATE_FORMAT} from '../../state';

const COMPONENT = 'e1p-omw-proj-stats';

class ViewModel {
    visible$: ko.Observable<boolean>;
    projects: IProjectStatus;
    page: IPage;
    table: DataTables.Api;
    date$ = ko.observable<string>();
    count$ = ko.observable<number>();
    getDetail(date: string) {
        const rq = {
            outputType: 'GRID_DATA',
            dataServiceType: 'BROWSE',
            targetName: 'F98220',
            targetType: 'table',
            returnControlIDs: 'OMWPRJID|OMWDESC|OMWSD|OMWPD|USER|UPMT',
            maxPageSize: '500',
            query: {
                condition: [
                    {
                        value: [
                            {
                                content: date,
                                specialValueId: 'LITERAL'
                            }
                        ],
                        controlId: 'F9860.OMWCD',
                        operator: 'EQUAL'
                    }
                ],
                matchType: 'MATCH_ALL'
            }
        };
        callAISService(rq, DATA_SERVICE, response => {
            console.log('Response: ', response);
            this.table
                .clear()
                .rows.add(response.fs_DATABROWSE_F98220.data.gridData.rowset)
                .draw();
        });
    }
    descendantsComplete = () => {
        const checkIns = new CalHeatMap();
        checkIns.init({
            itemSelector: `#${this.page.id}`,
            data: this.projects.data,
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
        // Graph Parameters
        const margin = { top: 10, right: 30, bottom: 40, left: 200 };
        const width = 800 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;
        // Graph Canvas
        const svg = d3.select<d3.BaseType, IProject>('#chart')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        // Scales
        const x = d3.scaleLinear()
            .domain([0, d3.max(this.projects.current, d => d.count)]).nice()
            .range([0, width]);
        const yLabel = d => `${d.status} (${d.count})`;
        const y = d3.scaleBand()
            .domain(this.projects.current.map(d => yLabel(d)))
            .range([0, height])
            .padding(.1);
        // Bars
        svg.append('g')
            .attr('fill', 'steelblue')
            .selectAll('rect')
            .data(this.projects.current)
            .join('rect')
            .attr('x', 0)
            .attr('y', d => y(yLabel(d)))
            .attr('height', y.bandwidth())
            .attr('width', d => x(d.count));
        // Axis
        const xAxis = g => g
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickSizeOuter(0));
        const yAxis = g => g
            .attr('tranform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));
        svg.append('g')
            .call(xAxis);
        svg.append('g')
            .call(yAxis);
        // Label
        svg.append('text')
            .attr('x', width / 2)
            .style('text-anchor', 'middle')
            .text('Project Status');
        // Table
        this.table = $(`#table-${this.page.id}`).DataTable({
            dom: 't',
            scrollY: '30vh',
            paging: false,
            data: [],
            columns: [
                {
                    title: 'Project',
                    data: 'F98220_OMWPRJID'
                },
                {
                    title: 'Description',
                    data: 'F98220_OMWDESC'
                },
                {
                    title: 'Started',
                    data: 'F98220_OMWSD',
                    render: data => data
                        ? `${data.slice(6, 8)}/${data.slice(4, 6)}/${data.slice(2, 4)}`
                        : ''
                },
                {
                    title: 'Planned',
                    data: 'F98220_OMWPD',
                    render: data => data
                        ? `${data.slice(6, 8)}/${data.slice(4, 6)}/${data.slice(2, 4)}`
                        : ''
                },
                {
                    title: 'User',
                    data: 'F98220_USER'
                },
                {
                    title: 'Time',
                    data: 'F98220_UPMT',
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
        this.projects = params.page.data;
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
