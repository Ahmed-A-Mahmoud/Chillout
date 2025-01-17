import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Driver } from 'app/main/models/driver.model';
import { GenericService } from 'app/main/services/generic.service';
import { environment } from 'environments/environment';

@Component({
    selector: 'drivers-create',
    templateUrl: './drivers-create.component.html',
    styleUrls: ['./drivers-create.component.scss']
})
export class DriversCreateComponent implements OnInit {
    driverForm: FormGroup;

    constructor(
        private _formBuilder: FormBuilder,
        private snackbar: MatSnackBar,
        private genericService: GenericService
    ) { }

    ngOnInit() {
        this.driverForm = this._formBuilder.group({
            firstName: [null, Validators.required],
            middleName: [null, Validators.required],
            lastName: [null, Validators.required],
            phoneNumber: [null, Validators.required]
        });
    }

    createDriver() {
        const driver = <Driver>{
            firstName: this.driverForm.value.firstName,
            middleName: this.driverForm.value.middleName,
            lastName: this.driverForm.value.lastName,
            phoneNumber: this.driverForm.value.phoneNumber
        }
        this.genericService.updateEntity(environment.entities.Driver, driver).subscribe(
            data => {
                this.snackbar.open(data.message, "Ok");
            },
            error => {
                this.snackbar.open(error.message, "Ok");
            }
        )
    }
}