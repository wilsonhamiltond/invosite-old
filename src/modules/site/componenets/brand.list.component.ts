import { Component } from '@angular/core';
import { IBrand } from '../../../models/inventory/brand.model';
import { BrandService } from '../../../services/inventory/brand.service';
import { OnLoadedChange } from '../../../services/utils/util.service';

@Component({
    selector: 'brand-list',
    template: `
    <section class="light-gry-bg clients-img" style="padding: 0" *ngIf="brands.length">
        <div class="container">
            <ul>
                <li *ngFor="let brand of brands">
                    <img [src]="brand.logo" alt="">
                </li>
            </ul>
        </div>
    </section>`,
    providers: [BrandService]
})

export class BrandListComponent {
    public brands: IBrand[] = [];
    constructor(
        public brandService: BrandService
    ) {
        if ((OnLoadedChange as any)['completed'])
            this.load();
        else
            OnLoadedChange.subscribe(() => {
                this.load();
            })
     }

    load() { 
        this.brandService.unauthorizad_filter({
        }).subscribe( (response:any)=>{
            this.brands = <Array<IBrand>>response.docs;
        })
    }
}