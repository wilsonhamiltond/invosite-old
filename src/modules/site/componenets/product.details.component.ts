import { Component, AfterViewInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router'

import { IProduct } from '../../../models/inventory/product.model';
import { ProductService } from '../../../services/inventory/product.service';
import { IField } from '../../../models/administration/field.model';
import { OnLoadedChange, titleTrigger } from '../../../services/utils/util.service';
declare let jQuery: any;

@Component({
    styles: [``],
    selector: 'search',
    templateUrl: './product.details.component.html',
    providers: [ProductService]
})
export class ProductDetailsComponent implements AfterViewInit {    
    public product:IProduct;
    public images:Array<string> = [];
    constructor(
        public productService: ProductService,
        public route: ActivatedRoute,
        private meta: Meta
    ) {
        this.route.params.subscribe( (params:any) =>{
            this.productService.unauthorizad_filter({
                params: {
                    _id: params._id
                },
                limit: 1
            }).subscribe((response: any) => {
                this.product = <IProduct>response.docs[0];
                this.images.push(this.product.image);
                this.load_images();
                const keywords:Array<string> = [this.product.name.toString(), this.product.category.name.toString()];
                this.product.category.fields.forEach( (field:IField) =>{
                    keywords.push(field.value);
                });
                this.meta.updateTag({ name: 'title', content: `Invosite.com: ${this.product.name.toString()}`});
                titleTrigger.next(`Invosite.com: ${this.product.name.toString()}`);
                this.meta.updateTag({ name: 'description', content: this.product.description.toString() });
                this.meta.updateTag({ name: 'keywords', content: keywords.join(',') });
                this.meta.updateTag({ name: 'thumbnail', content:`${location.port}//${location.host}/${this.product.image}`});
            })
        })
    }

    ngAfterViewInit() {
        if ((OnLoadedChange as any)['completed'] ) {
            this.load();
        } else {
            OnLoadedChange.subscribe(() => {
                this.load();
            })
        }
    }

    load() {
        jQuery('.thumb-slider').flexslider({
            animation: "slide",
            controlNav: "thumbnails"
        });
    }
    load_images(){
        this.product.category.fields.forEach( ( f:IField) =>{
            if( f.type == 'file' && f.file_type == 'image/*'){
                if(f.multiple_instance){
                    f.instances.forEach( (fd:IField | any) =>{
                        this.images.push(fd.value);
                    })
                }else{
                    this.images.push(f.value);
                }
            }
        })
    }
}