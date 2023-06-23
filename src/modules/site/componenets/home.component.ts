import { Component, ComponentFactoryResolver, ViewChild, ViewContainerRef, Type} from '@angular/core';
import { OnLoadedChange } from '../../../services/utils/util.service';
import { ShippingInfoComponent } from './shipping.info.component'
import { Meta } from '@angular/platform-browser';

@Component({
    styles: [``],
    selector: 'home',
    templateUrl: './home.component.html'
})
export class HomeComponent {
    @ViewChild('container', {read: ViewContainerRef}) container: ViewContainerRef;
    shippingInfoComponent: Type<any> = ShippingInfoComponent
    constructor( 
        private meta: Meta,
        private componentFactoryResolver: ComponentFactoryResolver
    ) {
        if((OnLoadedChange as any)['completed'])
            this.load();
        else
            OnLoadedChange.subscribe( () =>{
                this.load();
            })
    }

    load(){
        
        this.meta.updateTag({ name: 'title', content: 'Invosite'});
        this.meta.updateTag({ name: 'description', content: 'Sistema de facturación y venta en linea' });
        this.meta.updateTag({ name: 'keywords', content: 'facturación, venta, venta en linea, promocion, compra y venta, inventario, facturación en linea' });
        this.meta.updateTag({ name: 'author', content: 'Ing. Wilson Hamilton' });
    }
}