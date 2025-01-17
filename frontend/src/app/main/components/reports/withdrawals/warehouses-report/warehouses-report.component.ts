import { Component, OnInit, ViewEncapsulation, ViewChild, ChangeDetectorRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { GenericService } from 'app/main/services/generic.service';
import { environment } from 'environments/environment';
import { MatSnackBar, MatTableDataSource, MatPaginator, MatPaginatorIntl } from '@angular/material';
import { Warehouse } from 'app/main/models/warehouse.model';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
import { FormControl, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Product } from 'app/main/models/product.model';
import { MatTableExporterDirective } from 'mat-table-exporter';
import { Trip } from 'app/main/models/trip.model';
const moment = _moment;


export const MY_FORMATS = {
    parse: {
        dateInput: 'DD/MM/YYYY',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
    selector: 'warehouses-report',
    templateUrl: './warehouses-report.component.html',
    styleUrls: ['./warehouses-report.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
        },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ],
})

export class WarehousesReportComponent implements OnInit {
    startdate = new FormControl(moment());
    enddate = new FormControl(moment());
    trips: Trip[] = [];
    warehouses: Warehouse[];
    products: Product[];

    dataSource: MatTableDataSource<{}>;
    originalColumns = [];
    displayedColumns = [];
    startdateForm: FormGroup;
    enddateForm: FormGroup;

    minEndDate: _moment.Moment
    maxEndDate: _moment.Moment

    total: (string | number)[] = [];

    @ViewChild(MatPaginator)
    paginator: MatPaginator;

    @ViewChild('exporter')
    exporter: MatTableExporterDirective

    constructor(
        private _formBuilder: FormBuilder,
        private genericService: GenericService,
        private snackbar: MatSnackBar,
        private cdr: ChangeDetectorRef,
        private paginatorLabel: MatPaginatorIntl,
    ) { }

    ngOnInit() {
        this.startdateForm = this._formBuilder.group({
            startdate: [null, Validators.required]
        });
        this.startdateForm.get('startdate').disable();
        this.enddateForm = this._formBuilder.group({
            enddate: [null, Validators.required]
        });
        this.enddateForm.get('enddate').disable();
        this.warehouses = [];
        this.dataSource = new MatTableDataSource([]);
        this.genericService.retrieveShownEntities(environment.entities.Warehouse).subscribe(warehouses => {
            this.warehouses = warehouses;
            this.warehouses.sort((a, b) => {
                if ([a.companyName, a.warehouseName].join(' - ') > [b.companyName, b.warehouseName].join(' - ')) {
                    return 1;
                }
                else if ([a.companyName, a.warehouseName].join(' - ') > [b.companyName, b.warehouseName].join(' - ')) {
                    return 0;
                }
                else {
                    return -1
                }
            });
            this.originalColumns = ['warehouse'];
            this.displayedColumns = ['الشركه - المستودع'];
            this.genericService.retrieveShownEntities(environment.entities.Product).subscribe(products => {
                this.products = products;
                this.products.forEach(product => {
                    if (product.productName !== "إجمالى المبالغ الإضافيه") {
                        this.displayedColumns.push(product.productName);
                    }
                })
                this.displayedColumns.sort();
            })
            this.retrieveCurrentTrips();
            this.dataSource = new MatTableDataSource(this.warehouses);
            this.cdr.detectChanges();
            this.dataSource.paginator = this.paginator;
            this.paginatorLabel.itemsPerPageLabel = "مواد لكل صفحه:"
            this.paginatorLabel.nextPageLabel = "الصفحة التاليه"
            this.paginatorLabel.previousPageLabel = "الصفحة السابقة"
        })
    }

    adjustWarehousesDisplay(rowIndex: number, columnIndex: number) {
        let warehousesAccumulator = { isUpdated: false, value: 0 };
        for (let tripsIndex = 0; tripsIndex < this.trips.length; tripsIndex++) {
            for (let transferIndex = 0; transferIndex < this.trips[tripsIndex].transfers.length; transferIndex++) {
                if (this.trips[tripsIndex].outboundDistance.warehouse.companyName === this.warehouses[rowIndex].companyName && this.trips[tripsIndex].outboundDistance.warehouse.warehouseName === this.warehouses[rowIndex].warehouseName && this.trips[tripsIndex].transfers[transferIndex].product.productName === this.displayedColumns[columnIndex]) {
                    warehousesAccumulator.value += this.trips[tripsIndex].transfers[transferIndex].transferredAmount;
                    warehousesAccumulator.isUpdated = true;
                }

            }
        }
        if (warehousesAccumulator.isUpdated) {
            return warehousesAccumulator.value;
        }
        else {
            return "";
        }
    }

    checkProductInWarehouse(rowIndex: number, columnIndex: number) {
        for (let productIndex = 0; productIndex < (this.warehouses[rowIndex] as Warehouse).products.length; productIndex++) {
            if ((this.warehouses[rowIndex] as Warehouse).products[productIndex].productName === this.displayedColumns[columnIndex]) {
                return true;
            }
        }
        return false;
    }

    updateEndDatePicker() {
        this.enddate.setValue(this.startdate.value)
        this.retrieveCurrentTrips()
    }

    retrieveCurrentTrips() {
        this.minEndDate = moment(`${this.startdate.value.year()}-${this.startdate.value.month() + 1}-${this.startdate.value.date()}`, "YYYY-MM-DD")
        this.maxEndDate = moment(`${this.startdate.value.year()}-${this.startdate.value.month() + 1}-${this.startdate.value.daysInMonth()}`, "YYYY-MM-DD")
        this.genericService.retrieveEntitiesbyYearandMonth(environment.entities.Trip, this.enddate.value.year(), this.enddate.value.month() + 1).subscribe(data => {
            this.trips = (data as Trip[]).filter(trip => {
                return moment(`${trip.year}-${trip.month}-${trip.day}`, "YYYY-MM-DD").isBetween(
                    moment(`${this.startdate.value.year()}-${this.startdate.value.month() + 1}-${this.startdate.value.date()}`, "YYYY-MM-DD"),
                    moment(`${this.enddate.value.year()}-${this.enddate.value.month() + 1}-${this.enddate.value.date()}`, "YYYY-MM-DD"),
                    null, "[]")
            })
            this.calculateTotal();
        })
    }

    calculateTotal() {
        this.total = [];
        this.total.push('الإجمالى')
        for (let columnIndex = 1; columnIndex < this.displayedColumns.length; columnIndex++) {
            let warehousesAccumulator = { isUpdated: false, value: 0 };
            for (let tripsIndex = 0; tripsIndex < this.trips.length; tripsIndex++) {
                for (let transferIndex = 0; transferIndex < this.trips[tripsIndex].transfers.length; transferIndex++) {
                    if (this.trips[tripsIndex].transfers[transferIndex].product.productName === this.displayedColumns[columnIndex]) {
                        warehousesAccumulator.value += this.trips[tripsIndex].transfers[transferIndex].transferredAmount;
                        warehousesAccumulator.isUpdated = true;
                    }

                }
            }
            if (warehousesAccumulator.isUpdated) {
                this.total.push(warehousesAccumulator.value);
            }
            else{
                this.total.push(0);
            }
        }
    }

    exportTable() {
        this.exporter.exportTable('xlsx', { fileName: `المستودعات-${this.startdate.value.date()}_${this.startdate.value.month() + 1}_${this.startdate.value.year()}-${this.enddate.value.date()}_${this.enddate.value.month() + 1}_${this.enddate.value.year()}` })
    }
}
