import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { QuotationModel } from '../../../models/administration/quotation.model';
import { IClient, ClientModel } from '../../../models/administration/client.model';
import { IOffice, OfficeModel } from '../../../models/administration/office.model';
import { QuotationService } from '../../../services/administration/quotation.service';
import { OfficeService } from '../../../services/administration/office.service';
import { ClientService } from '../../../services/administration/client.service';

import { titleTrigger, exlude_fields, activeBoxTrigger } from '../../../services/utils/util.service';
import { UtilService, GetCurrentModule } from '../../../services/utils/util.service';
import { MatDialog } from '@angular/material/dialog';
import { Observable, forkJoin } from 'rxjs';
import { IProduct, ProductModel } from '../../../models/inventory/product.model';
import { ClientCreateDialog} from '../../utils/components/client.create.dialog'
import { ProductCreateDialog} from '../../utils/components/product.create.dialog'

import { LoadingComponent } from '../../utils/components/loading.component';
import { ProductService } from '../../../services/inventory/product.service';
import { TaxService } from '../../../services/administration/tax.service';
import { TaxModel, ITax } from '../../../models/administration/tax.model';
import { NotifyService } from '../../../services/utils/notify.service';

@Component({
    selector: 'quotation-create',
    templateUrl: './create.component.html',
    providers: [ClientService, QuotationService, OfficeService, ProductService, TaxService]
})
export class QuotationCreateComponent implements AfterViewInit {
    taxes: ITax[];
    tax: ITax
    public quotation:QuotationModel | any;
    public offices:Array<IOffice> = [];
    public totalProduct: number = 0;
    public totalValue: number = 0;
    public total_general:number = 0;
    public total_itbis:number = 0;
    public module:any;
    public products:Array<IProduct> = [];
    public filteredClients: Array<IClient> = [];
    public clients:Array<IClient>;
    public field_names:Array<string> = [];
    public selectedCliente?: string;
    @ViewChild(LoadingComponent)
    public loadingComponent: LoadingComponent;

    constructor(
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public clientService: ClientService,
        public productService: ProductService,
        public quotationService: QuotationService,
        public notify: NotifyService,
        public dialog: MatDialog,
        public officeService: OfficeService,
        public taxService: TaxService
    ) { 
        titleTrigger.next('CREACIÓN DE COTIZACIONES')
        this.module = GetCurrentModule();
        this.quotation = new QuotationModel()
    }
    
    ngAfterViewInit() {
        this.loadingComponent.showLoading('Cargando datos de cotización...')
        this.activatedRoute.params.subscribe( (paramns:any) =>{
            const _id = paramns['_id'],
                requests:Array<Observable<any>> = [];
            requests.push(this.clientService.filter({
                fields: exlude_fields(new ClientModel().keys)
             }));
            requests.push(this.officeService.filter({
                fields: exlude_fields(new OfficeModel().keys)
            }))
            requests.push(this.productService.filter({ params: 
                { "category.unlimited": { $ne: true} },
                fields: exlude_fields(new ProductModel().keys)
            }))
            requests.push(this.taxService.filter({ 
                params: {},
                fields: exlude_fields(new TaxModel().keys)
            }))
            if( _id != '0'){ 
                requests.push(this.quotationService.get(_id));
            }else{
                this.quotation = new QuotationModel();
            }
            forkJoin(requests).subscribe( (responses:any) =>{
                this.clients = responses[0].docs;
                this.offices = <Array<IOffice>>responses[1].docs;
                this.products = responses[2].docs;
                this.taxes = <Array<ITax>>responses[3].docs;
                if( _id != '0'){
                    this.quotation = <QuotationModel>responses[4].doc;
                    if(this.quotation.quotation_date)
                        this.quotation.quotation_date = new Date(this.quotation.quotation_date);
                    this.add_propertys()
                    this.selectedCliente = `${this.quotation.client.name} ${this.quotation.client.last_name}`; 
                }else{
                    if(this.offices.length == 1)
                        this.quotation.office = this.offices[0];
                        
                    this.filterClient({target:{ value: ''}});
                    this.quotation.taxes = this.taxes.filter((tax:ITax) =>{
                        return tax.default;
                    })
                }
                activeBoxTrigger.next({success_cb : () => true, error_cb: () => false})
                this.loadingComponent.hiddenLoading();
            })
        })
        
    }

    changeClient(event:any){
        if(!event.isUserInput)
            return;
        if(!event.source.value){
            const dialogRef = this.dialog.open(ClientCreateDialog, {
                width: '512px'
            });
            dialogRef.afterClosed().subscribe((client:IClient) => {
                if(client){
                    this.clients.push(client)
                    this.quotation.client = client;
                    this.selectedCliente = `${client.name} ${client.last_name}`; 
                }
            });
        }else{
            this.selectedCliente = `${event.source.value.name} ${event.source.value.last_name}`; 
        }
    }

    add_propertys(){
        if(this.quotation.products.length <= 0)
            return;
        this.totalValue = 0;
        this.totalProduct = 0;
        this.total_general = 0;
        this.total_itbis = 0;
        this.field_names = UtilService.field_names(this.quotation.products, this.quotation.products[0].category, true);
        this.quotation.products = this.quotation.products.map( (product:IProduct) =>{
            const itbis: number = product.category.itbis || 0;
            product = UtilService.add_fields(product, product.category, true);
            product['total_value'] = (product.value.valueOf() * (product.quantity || 0)); 
            product['total_itbis'] = product['total_value'] * ( itbis.valueOf() / 100)
            this.totalValue += product['total_value'];
            this.total_itbis += product['total_itbis'];
            this.total_general += (product['total_value'] + product['total_itbis']);
            this.totalProduct = ( this.totalProduct + (product.quantity || 0));
            return product;
        })
    }

    edit(index?:number, product?:IProduct){
        const dialogRef = this.dialog.open(ProductCreateDialog, {
            width: '512px'
        });
        dialogRef.componentInstance.office = this.quotation.office;
        if(product)
            dialogRef.componentInstance.setProduct( this.products,
             Object.assign({}, product) )
        else
            dialogRef.componentInstance.setProduct( this.products )
        
        dialogRef.afterClosed().subscribe((p:IProduct) => {
            if(p){
                p.value = Number(p.value.toFixed(2));
                if(!product){
                    if(this.quotation.products.some( (pd:IProduct, i:number) =>{
                        if( pd._id == p._id ){
                            index = i;
                            return true;
                        }else{
                            return false;
                        }
                    }) == true)
                        this.quotation.products[index || 0].quantity = (this.quotation.products[index || 0].quantity || 0) + (p.quantity || 0);
                    else
                        this.quotation.products.push(p);
                }else{
                    this.quotation.products[index || 0] = p;
                }
            }
            this.add_propertys()
        });
    }
    
    delete(index:number){
        const result = confirm('¿Desea borrar este producto?')
        if(result){
            this.quotation.products.splice(index, 1);
        }
    }

    displayFn(client: IClient): string {
        if(client){
            if(!client.name && !client.last_name )
                return '';
        }
        return client ? `${client.name || ''} ${client.last_name || ''}` : '';
    }

    displayOffice(office: IOffice): string {
        if(!office || !office.name)
            return ''
        return office.name.toString();
    }

    filterClient(event:any){
        this.filteredClients = event.target.value ? this.clients.filter(c => (`${c.name} ${c.last_name}`)
        .toLowerCase().indexOf(event.target.value.toLowerCase()) >= 0) : this.clients;
        delete this.selectedCliente;
    }

    addTax(event:any){
        if(event.value)
            this.quotation.taxes.push(event.value)
    }

    deleteTax(index:number){
        this.quotation.taxes.splice(index, 1)
    }

    save(){
        this.loadingComponent.showLoading('Guardando cotización...')
        let request:Observable<any>; 
        if( !this.quotation._id){
            request = this.quotationService.save(this.quotation);
        }else{
            request = this.quotationService.update(this.quotation._id, this.quotation);
        }
        request.subscribe( (response:any) =>{
            this.loadingComponent.hiddenLoading();
            if( response.result == true){
                this.notify.success( 'Cotización guardada correctamente.') 
                const i:QuotationModel = <QuotationModel>response.doc;
                const id = this.quotation._id || i._id;
                this.router.navigate([`/admin/quotation/print/${id}`])
            }else{
                this.notify.error('A ocurrido un error en la cotizaciónción.');
                console.log(response.message)
            }
        })
    }
}