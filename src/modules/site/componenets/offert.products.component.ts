import { Component } from '@angular/core';
declare let jQuery: any;

import { IProduct } from '../../../models/inventory/product.model';
import { ProductService } from '../../../services/inventory/product.service';

import { OnLoadedChange } from '../../../services/utils/util.service';
@Component({
    styles: [``],
    selector: 'offert-products',
    template: `
    <section class="slid-sec" *ngIf="product_offerts">
        <div class="container">
            <div class="container-fluid">
                <div class="row">
                    <!-- Main Slider  -->
                    <div class="col-md-12 no-padding">
                        <!-- Main Slider Start -->
                        <div class="tp-banner-container">
                            <div class="tp-banner">
                                <ul>
                                    <!-- SLIDE  -->
                                    <li data-transition="random" data-slotamount="7" data-masterspeed="300" data-saveperformance="off" *ngFor="let product of product_offerts">
                                        <!-- MAIN IMAGE -->
                                        <a [routerLink]="['/site/product/'+ product._id + '/details']"><img style="height: 100%" [src]="product.image" onerror="this.src='assest/images/empty.png';" alt="slider" data-bgposition="center bottom" data-bgfit="contain" data-bgrepeat="no-repeat"></a>

                                        <!-- LAYER NR. 1 -->
                                        <div class="tp-caption sfl tp-resizeme" data-x="left" data-hoffset="60" data-y="center" data-voffset="-110" data-speed="800"
                                            data-start="800" data-easing="Power3.easeInOut" data-splitin="chars" data-splitout="none"
                                            data-elementdelay="0.03" data-endelementdelay="0.4" data-endspeed="300" style="z-index: 5; font-size:30px; font-weight:500; color:#888888;  max-width: auto; max-height: auto; white-space: nowrap;">{{product.category.name}} </div>

                                        <!-- LAYER NR. 2 -->
                                        <div class="tp-caption sfr tp-resizeme" data-x="left" data-hoffset="60" data-y="center" data-voffset="-60" data-speed="800"
                                            data-start="1000" data-easing="Power3.easeInOut" data-splitin="chars" data-splitout="none"
                                            data-elementdelay="0.03" data-endelementdelay="0.1" data-endspeed="300" style="z-index: 6; font-size:50px; color:#0088cc; font-weight:800; white-space: nowrap;"><a [routerLink]="['/site/product/'+ product._id + '/details']">{{product.name}}</a></div>

                                        <!-- LAYER NR. 3 -->
                                        <div class="tp-caption sfl tp-resizeme" data-x="left" data-hoffset="60" data-y="center" data-voffset="10" data-speed="800"
                                            data-start="1200" data-easing="Power3.easeInOut" data-splitin="none" data-splitout="none"
                                            data-elementdelay="0.1" data-endelementdelay="0.1" data-endspeed="300" style="z-index: 7;  font-size:24px; color:#888888; font-weight:500; max-width: auto; max-height: auto; white-space: nowrap;">Precio </div>

                                        <!-- LAYER NR. 1 -->
                                        <div class="tp-caption sfr tp-resizeme" data-x="left" data-hoffset="210" data-y="center" data-voffset="5" data-speed="800"
                                            data-start="1300" data-easing="Power3.easeInOut" data-splitin="chars" data-splitout="none"
                                            data-elementdelay="0.03" data-endelementdelay="0.4" data-endspeed="300" style="z-index: 5; font-size:36px; font-weight:800; color:#000;  max-width: auto; max-height: auto; white-space: nowrap;">{{product.value | currency:'':'$':'1.2-2'}} </div>

                                        <!-- LAYER NR. 4 -->
                                        <div class="tp-caption lfb tp-resizeme scroll" data-x="left" data-hoffset="60" data-y="center" data-voffset="80" data-speed="800"
                                            data-start="1300" data-easing="Power3.easeInOut" data-elementdelay="0.1" data-endelementdelay="0.1"
                                            data-endspeed="300" data-scrolloffset="0" style="z-index: 8;">
                                            <a [routerLink]="['/site/product/'+ product._id + '/details']" class="btn-round big">Comprar</a>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>`,
    providers: [ProductService]
})
export class OffertProductsComponent {
    public product_offerts: Array<IProduct>;

    constructor(
        public productService: ProductService
    ) {
        if ((OnLoadedChange as any)['completed'])
            this.load();
        else
            OnLoadedChange.subscribe(() => {
                this.load();
            })
    }

    load() {
        this.productService.unauthorizad_filter({
            params: {
                is_special: true,
                'category.online': true,
                image: { $exists: true }
            },
            fields: {
                'category._id': true,
                'category.name': true,
                'name': true,
                'value': true,
                'image': true
            },
            limit: 5
        }).subscribe((response: any) => {
            this.product_offerts = <Array<IProduct>>response.docs;
            setTimeout(() => {
                if (this.product_offerts.length > 0)
                    this.show_main_slider();
            })
        })
    }

    show_main_slider() {
        jQuery(".tp-banner").revolution({
            sliderType: "standard",
            sliderLayout: "auto",
            delay: 9000,
            minHeight: 500,
            gridwidth: 0,
            navigationType: "bullet",
            navigationArrows: "solo",
            navigationStyle: "preview4",
            gridheight: 500
        });
    }
}