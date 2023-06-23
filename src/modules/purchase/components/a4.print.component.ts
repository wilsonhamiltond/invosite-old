import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseService } from '../../../services/administration/purchase.service';
import { IPurchase } from '../../../models/administration/purchase.model';
import { IProduct } from '../../../models/inventory/product.model'
import { GetCurrentModule, UtilService } from '../../../services/utils/util.service';

import { NotifyService } from '../../../services/utils/notify.service';
import { IPayment } from '../../../models/administration/payment.model';
import { hiddenHeaderTrigger } from '../../../services/administration/setting.service';


@Component({
    styles: [`
        .print{
            font-size: 10pt;
            font-family: sans-serif;
        }
        .print p{
            margin: 0;
            font-size: 10pt;
        }
        .number_column{
            width: 128px;
            text-align: right;
        }
        table.table tfoot tr.no-border th{
            border: none
        }
        table.table tfoot.total tr th {
            padding: 1px !important;
        }
    `],
    selector: 'a4-print',
    template: `
    <mat-card class="col-md-12 col-lg-12 col-sm-12 col-xs-12 no-padding print">
        <loading></loading>
        <mat-card-content *ngIf="purchase">
            <div class="col-md-12 col-lg-12 col-sm-12 col-xs-12 no-print">
                <div class="col-md-6 col-lg-6 col-sm-6 col-xs-6 no-padding">
                    <button  mat-button (click)="go_back()">
                    <mat-icon class="md-16">keyboard_return</mat-icon> Ir a listado de prestamos</button>
                </div>
                <div class="col-md-6 col-lg-6 col-sm-6 col-xs-6 no-padding text-right">
                    <button *ngIf="module.print" mat-raised-button (click)="print()">
                    <mat-icon class="md-16">print</mat-icon> Imprimir</button>
                </div>
            </div>
            <div class="margin-bottom-xs col-md-12 col-lg-12 col-sm-12 col-xs-12 no-padding">
                <div class="col-md-col-md-12 col-lg-12 col-sm-12 col-xs-12 no-padding text-center">
                    <img src="{{purchase.setting.logo}}" style="height: 64px; width: 64px" />
                </div>
                <h3 style="margin: 0;" class="col-md-12 col-lg-12 col-sm-12 col-xs-12 no-padding m-0 text-center">{{purchase.setting.name}}</h3>
                <p class="text-center col-md-12 col-lg-12 col-sm-12 col-xs-12 no-padding m-0">{{purchase.setting.description}}</p>
                <div class="col-md-12 col-lg-12 col-sm-12 col-xs-12 no-padding text-center margin-bottom-xs">
                    <p *ngIf="purchase.setting.rnc">RNC:{{purchase.setting.rnc}}</p>
                    <p *ngIf="purchase.setting.phone">Tel.: {{purchase.setting.phone}}</p>
                    <p *ngIf="purchase.setting.email">Email: {{purchase.setting.email}}</p>
                    <p *ngIf="purchase.setting.address">Dirección: {{purchase.setting.address}}</p>
                </div>
                <div class="col-md-12 col-lg-12 col-sm-12 col-xs-12 no-padding margin-bottom-sm" >
                    <div class="col-md-6 col-lg-6 col-sm-12 col-xs-12 no-padding">
                        <p>Providere: {{purchase.provider.name}} {{purchase.provider.last_name}}</p>
                        <div *ngFor="let cf of provider_fields">
                            <p *ngIf="purchase.provider[cf]" class="col-xs-12 no-padding">
                                {{cf}}: {{purchase.provider[cf]}}
                            </p>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-6 col-sm-12 col-xs-12 no-padding text-right">
                        <p>Fecha: {{purchase.purchase_date | date:'dd/MM/yyyy'}}</p>
                        <p>Factura no.: {{purchase.number}}</p>
                    </div>
                </div>
                <div class="col-md-12 col-lg-12 col-sm-12 col-xs-12 no-padding" *ngFor="let group of productGroup">  
                    <h4 style="margin-bottom: 5px; margin-top: 0px;" *ngIf="productGroup.length > 1">{{group.name}}</h4>      
                    <table class="table"  style="margin-bottom: 0px;">
                        <thead>
                            <tr>
                                <th style="min-width: 40% !important;width: 40% !important;" colspan="(max_fields - group.fields.length)" >Producto</th>
                                <th class="hidden-xs" *ngFor="let field of group.fields">{{field}}</th>
                                <th class="number_column" >Cantidad</th>
                                <th class="number_column" >Precio</th>
                                <th class="number_column" >Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr *ngFor="let product of group.products">
                                <td style="min-width: 40%;" colspan="(max_fields - group.fields.length)" >{{product.name}}</td>
                                <td class="hidden-xs" *ngFor="let field of group.fields">{{product[field] || ''}}</td>
                                <td class="number_column">{{product.quantity | number}}</td>
                                <td class="number_column">{{product.value | currency:'':'$':'1.2-2'}}</td>
                                <td class="number_column">{{(product.quantity * product.value) | currency:'':'$':'1.2-2'}}</td>
                            </tr>
                        </tbody>
                        <tfoot style="display:none" *ngIf="productGroup.length > 1">
                            <tr>
                                <td colspan="(max_fields - group.fields.length)"></td>
                                <td  class="hidden-xs" *ngFor="let field of group.fields"></td>
                                <td class="number_column">{{group.quantity | number}}</td>
                                <td class="number_column">Total</td>
                                <td class="number_column">{{group.total | currency:'':'$':'1.2-2'}}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div class="col-md-12 col-lg-12 col-sm-12 col-xs-12 no-padding">
                    <table class="table">
                        <tfoot class="total">
                            <tr>
                                <th colspan="max_fields"></th>
                                <th class="number_column" colspan="2">Sub total</th>
                                <th class="number_column">{{total_value | currency:'':'$':'1.2-2'}}</th>
                            </tr>
                            <tr class="no-border">
                                <th colspan="max_fields"></th>
                                <th class="number_column"  colspan="2">Itbis</th>
                                <th class="number_column">{{ total_itbis | currency:'':'$':'1.2-2'}}</th>
                            </tr>
                            <tr class="no-border">
                                <th colspan="max_fields"></th>
                                <th class="number_column" colspan="2">Total</th>
                                <th class="number_column">{{(total_value + total_itbis) | currency:'':'$':'1.2-2'}}</th>
                            </tr>
                            <tr class="no-border" *ngIf="purchase.payments.length > 0 && total_restant > 0">
                                <th colspan="max_fields"></th>
                                <th class="number_column" colspan="2">Pagado</th>
                                <th class="number_column">{{(total_payment) | currency:'':'$':'1.2-2'}}</th>
                            </tr>
                            <tr class="no-border" *ngIf="purchase.payments.length > 0 && total_restant > 0">
                                <th colspan="max_fields"></th>
                                <th class="number_column" colspan="2">Pendiente</th>
                                <th class="number_column">{{(total_restant) | currency:'':'$':'1.2-2'}}</th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            <div class="col-md-12 col-lg-12 col-sm-12 col-xs-12 no-padding margin-bottom-xs" >
                <div class="col-md-12 col-lg-12 col-sm-12 col-xs-12 no-padding">
                    <p class="col-md-12 col-lg-12 col-sm-6 col-xs-12 no-padding" *ngIf="purchase.note || purchase.setting.purchase_message">Nota: {{purchase.note}}
                        <b *ngIf="purchase.setting.purchase_message"> <br/> {{purchase.setting.purchase_message}}</b>
                    </p>
                    <p class="col-md-12 col-lg-12 col-sm-6 col-xs-12 no-padding" >
                        Entregado Por: <b>{{purchase.create_user.account.name}} {{purchase.create_user.account.last_name}}</b>
                    </p>
                </div>
            </div>
            <div class="margin-bottom-xs col-md-12 col-lg-12 col-sm-12 col-xs-12 no-print">
                <div class="col-md-6 no-padding">
                    <button  mat-button (click)="go_back()">
                        <mat-icon class="md-16">keyboard_return</mat-icon> 
                        Ir a listado de prestamos
                    </button>
                </div>
                <div class="col-md-6 no-padding text-right">
                    <button *ngIf="module.print" mat-raised-button (click)="print()">
                    <mat-icon class="md-16">print</mat-icon> Imprimir</button>
                </div>
            </div>
        </mat-card-content>
    </mat-card>
    `,
    providers: [ PurchaseService]
})
export class A4PrintComponent implements AfterViewInit {
    public purchase: IPurchase | any;

    public productGroup: Array<any> = [];
    public total_value: number = 0;
    public total_product: number = 0;
    public total_itbis: number = 0;
    public total_payment: number = 0;
    public total_restant: number = 0;
    public max_fields: number = 0;
    public provider_fields: Array<string> = [];

    module: any;

    constructor(
        public activatedRoute: ActivatedRoute,
        public purchaseService: PurchaseService,
        public router: Router,
        public notify: NotifyService
    ) {
        this.module = GetCurrentModule();
        hiddenHeaderTrigger.next(true);
    }

    ngAfterViewInit() {

        this.activatedRoute.params.subscribe((params: any) => {
            const id: string = params._id;
            this.purchaseService.get(id).subscribe((response: any) => {
                hiddenHeaderTrigger.next(true);
                if (response.result == true) {
                    this.purchase = response.doc;

                    this.purchase.provider = UtilService.add_fields(this.purchase.provider, this.purchase.provider.type, true);
                    this.provider_fields = UtilService.field_names([this.purchase.provider], this.purchase.provider.type, true);
                    this.purchase.products.forEach((product: IProduct) => {
                        const itbis: number = product.category.itbis || 0;
                        product = UtilService.add_fields(product, product.category, true);
                        const value: number = (product.value.valueOf() * (product.quantity || 0));
                        this.total_value += value;
                        this.total_product = (this.total_product + (product.quantity || 0));
                        this.total_itbis += value * (itbis.valueOf() / 100);
                        let index: number = -1;
                        this.productGroup.forEach((group: any, i: number) => {
                            if (group._id == product.category._id)
                                index = i;
                        });
                        if (index >= 0) {
                            this.productGroup[index].products.push(product);
                            this.productGroup[index].quantity += product.quantity;
                            this.productGroup[index].total += ((product.quantity || 0) * product.value.valueOf());

                        } else {
                            const field_names = UtilService.field_names([product], product.category, true);
                            this.productGroup.push({
                                name: product.category.name,
                                _id: product.category._id,
                                fields: field_names,
                                products: [product],
                                quantity: product.quantity,
                                total: ((product.quantity || 0) * product.value.valueOf())
                            })
                            this.max_fields = field_names.length > this.max_fields ? field_names.length : this.max_fields;
                        }
                    })
                    this.purchase.payments.forEach((payment: IPayment) => {
                        this.total_payment += payment.value.valueOf();
                    })
                    this.total_restant = (this.total_value + this.total_itbis) - this.total_payment;
                    this.total_restant = this.total_restant > 0 ? this.total_restant : 0;
                } else {
                    this.notify.error(response.message)
                }
            })
        })
    }

    go_back() {
        this.router.navigate(['/admin/purchase/list'])
    }

    print() {
        window['print']();
    }
}