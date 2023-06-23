import { Component } from '@angular/core';
import { SettingService } from '../../../services/administration/setting.service';
import { ISetting } from '../../../models/administration/setting.model';

import { PaymentMethodService } from '../../../services/administration/payment.method.service';
import { OnLoadedChange } from '../../../services/utils/util.service';
import { forkJoin } from 'rxjs';
@Component({
    styles: [``],
    selector: 'shipping-info',
    template: `<section class="shipping-info" *ngIf="setting && setting.free_shipping_order_value">
    <div class="container">
        <ul>
            <!-- Free Shipping -->
            <li>
                <div class="media-left">
                    <i class="flaticon-delivery-truck-1"></i>
                </div>
                <div class="media-body">
                    <h5>Envio Gratis</h5>
                    <span >En orden mayor a {{setting.free_shipping_order_value | currency:'':'$':'1.2-2'}}</span>
                </div>
            </li>
            <!-- Money Return -->
            <li>
                <div class="media-left">
                    <i class="flaticon-arrows"></i>
                </div>
                <div class="media-body">
                    <h5>Devoluciones</h5>
                    <span *ngIf="setting.returned_arrare_days">{{setting.returned_arrare_days}} Dias</span>
                    <span *ngIf="!setting.returned_arrare_days">No aceptamos devoluciones</span>
                </div>
            </li>
            <!-- Support 24/7 -->
            <li>
                <div class="media-left">
                    <i class="flaticon-operator"></i>
                </div>
                <div class="media-body">
                    <h5>Información 24/7</h5>
                    <span>Linea: {{setting.phone}}</span>
                </div>
            </li>
            <!-- Safe Payment -->
            <li>
                <div class="media-left">
                    <i class="flaticon-business"></i>
                </div>
                <div class="media-body">
                    <h5>Pagos</h5>
                    <span *ngFor="let pm of payment_methods; let i = index">{{pm}}<span *ngIf="i < payment_methods.length">, </span></span>
                    <span *ngIf="payment_methods.length == 0">Contactenos</span>
                </div>
            </li>
        </ul>
    </div>
</section>`,
    providers: [ SettingService, PaymentMethodService]
})
export class ShippingInfoComponent {
    public setting: ISetting;
    public payment_methods: Array<string> = [];
    constructor(
        public settingService: SettingService,
        public paymentMethodService: PaymentMethodService
    ) {
        if (OnLoadedChange as any['completed'])
            this.load();
        else
            OnLoadedChange.subscribe(() => {
                this.load();
            })
    }

    load() {
        const requests = [];
        requests.push(this.settingService.current())
        requests.push(this.paymentMethodService.unauthorizad_filter({
            params: {},
            fields: {
                'name': true
            }
        }))
        forkJoin(requests).subscribe((responses: any) => {
            this.payment_methods = responses[1].docs.map((pm: any) => {
                return pm.name;
            })
            this.setting = <ISetting>responses[0].setting;
        })
    }
}