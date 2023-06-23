import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { IInvoice } from '../../../models/administration/invoice.model';
import { IClient, ClientModel } from '../../../models/administration/client.model';
import { IOffice, OfficeModel } from '../../../models/administration/office.model';
import { OfficeService } from '../../../services/administration/office.service';
import { IEmployee, EmployeeModel } from '../../../models/administration/employee.model';
import { EmployeeService } from '../../../services/administration/employee.service';
import { ClientService } from '../../../services/administration/client.service';

import { exlude_fields } from '../../../services/utils/util.service';
import { Observable, forkJoin } from 'rxjs';
import { ClientCreateDialog } from '../../utils/components/client.create.dialog'

import { LoadingComponent } from '../../utils/components/loading.component';
import { NcfService } from '../../../services/administration/ncf.service';
import { TaxService } from '../../../services/administration/tax.service';
import { ITax, TaxModel } from '../../../models/administration/tax.model';
import { MatDialogRef } from '@angular/material/dialog';
@Component({
    selector: 'invoice-create-dialog',
    templateUrl: './create.dialog.html',
    providers: [ClientService, OfficeService, NcfService, EmployeeService, TaxService]
})
export class InvoiceCreateDialog {
    public invoice: IInvoice | any;
    public offices: Array<IOffice> = [];
    public employees: Array<IEmployee> = [];
    public filterEmployees: Array<IEmployee> = [];
    public employee: IEmployee;
    public filteredClients: Array<IClient> = [];
    public clients: Array<IClient>;
    public selectedCliente?: string;
    public types: Array<any> = [];
    tax:any;
    taxes: ITax[];

    @ViewChild(LoadingComponent)
    public loadingComponent: LoadingComponent;

    constructor(
        public clientService: ClientService,
        public ncfService: NcfService,
        public officeService: OfficeService,
        public employeeService: EmployeeService,
        public taxService: TaxService,
        public dialogRef: MatDialogRef<ClientCreateDialog>,
    ) {
    }

    load(invoice: IInvoice) {
        this.invoice = invoice;
        this.loadingComponent.showLoading('Cargando datos de factura...')
        const requests: Array<Observable<any>> = [];
        requests.push(this.clientService.filter({
            fields: exlude_fields(new ClientModel().keys)
        }));
        requests.push(this.officeService.filter({
            fields: exlude_fields(new OfficeModel().keys)
        }))
        requests.push(this.employeeService.filter({
            fields: exlude_fields(new EmployeeModel().keys)
        }))
        requests.push(this.taxService.filter({
            params: {},
            fields: exlude_fields(new TaxModel().keys)
        }))

        forkJoin(requests).subscribe((responses: any) => {
            this.offices = <Array<IOffice>>responses[1].docs;
            this.clients = responses[0].docs;
            this.employees = responses[2].docs;
            this.taxes = <Array<ITax>>responses[3].docs;
            
            this.invoice.invoice_date = new Date(this.invoice.invoice_date);
            if(!this.invoice.client)
                this.selectedCliente = `${this.invoice.client.name} ${this.invoice.client.last_name}`;
            else
                this.filterClient({target:{ value: ''}});
            this.filterEmployee({target:{ value: ''}});
            this.loadingComponent.hiddenLoading();
        })
        if(!this.invoice.ncf_type)
            this.invoice.ncf_type = '02';
        
        this.types = this.ncfService.get_ncf_type()
        this.invoice.payment_type = 'Contado';
    }

    removeEmployee(emp: IEmployee) {
        this.invoice.employees = this.invoice.employees.filter((employee: IEmployee) => {
            return emp._id != employee._id;
        })
    }

    addEmployee(event: any) {
        if (!event.isUserInput)
            return;
        if (event.source.value) {
            if (!this.invoice.employees.some((e: IEmployee) => { return e._id == event.source.value._id }))
                this.invoice.employees.push(event.source.value);
            delete event.source.value
            this.employee = new EmployeeModel();
        }
    }

    changeClient(event: any) {
        if (!event.isUserInput)
            return;
        this.selectedCliente = `${this.invoice.client.name} ${this.invoice.client.last_name}`;
    }

    displayFn(client: IClient): string {
        if (client) {
            if (!client.name && !client.last_name)
                return '';
        }
        return client ? `${client.name || ''} ${client.last_name || ''}` : '';
    }

    displayEmployee(employee: IEmployee) {
        if (!employee || !employee.name)
            return ''
        return `${employee.name} ${employee.last_name}`;
    }

    displayOffice(office: IOffice): string {
        if (!office || !office.name)
            return ''
        return office.name.toString();
    }

    filterClient(event: any) {
        this.filteredClients = event.target.value ? this.clients.filter(c => (`${c.name} ${c.last_name}`)
            .toLowerCase().indexOf(event.target.value.toLowerCase()) >= 0) : this.clients;
        delete this.selectedCliente;
    }

    filterEmployee(event: any) {
        this.filterEmployees = event.target.value ? this.employees.filter(c => (`${c.name} ${c.last_name}`)
            .toLowerCase().indexOf(event.target.value.toLowerCase()) >= 0) : this.employees;
    }

    addTax(event: any) {
        if (event.value)
            this.invoice.taxes.push(event.value)
    }

    deleteTax(index: number) {
        this.invoice.taxes.splice(index, 1)
    }

    save() {
        this.dialogRef.close(this.invoice)  
    }
    
    close(){
        this.dialogRef.close();
    }
}