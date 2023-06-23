import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { PaymentMethodService } from '../../../services/administration/payment.method.service';
import { IPaymentMethod } from '../../../models/administration/payment.method.model';
import { titleTrigger } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';

 import { NotifyService } from '../../../services/utils/notify.service';

@Component({
    selector: 'method-list',
    templateUrl: './list.component.html',
    providers: [PaymentMethodService]
})
export class PaymentMethodListComponent implements AfterViewInit {

    methods: Array<IPaymentMethod> = [];
    visiblePaymentMethods: Array<IPaymentMethod> = [];

    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
    module: any;
    method: string;
    public query: string = '';
    constructor(
        public methodService: PaymentMethodService,
        public notify: NotifyService
    ) {
        this.module = GetCurrentModule();
    }

    ngAfterViewInit() {
      this.load();
      titleTrigger.next(`LISTADO DE FORMA DE PAGO`)
    }
    load() {
        this.loading.showLoading('Cargando listadod de forma de pago.')
        this.methodService.filter({  }).subscribe((response: any) => {
            if (response.result) {
                this.methods = <Array<IPaymentMethod>>response.docs
                this.paginate({
                    pageIndex: 0,
                    pageSize: 10
                })
                this.loading.hiddenLoading()
            }
        })
    }

    search(event: any) {
        if (event.keyCode == 13)
            this.paginate({
                pageIndex: 0,
                pageSize: 10
            })
    }

    paginate(params: any) {
        let current_size = params.pageIndex * params.pageSize
        this.visiblePaymentMethods = this.methods.slice(current_size, current_size + params.pageSize)
    }

    delete(method: IPaymentMethod) {
        let result = confirm('¿Desea borrar esta forma de pago?');
        if (result) {
            this.methodService.delete(method._id).subscribe((response) => {
                if (response['result'] == true) {
                    this.notify.success('Forma de pago borrada correctamente.')
                    this.load();
                } else {
                    this.notify.error('Error borrando forma de pago.');
                    console.log(response.message)
                }
            })
        }
    }
}