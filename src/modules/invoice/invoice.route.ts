import { InvoiceCreateComponent } from './components/create.component';
import { InvoiceListComponent } from './components/list.component';
import { PrintComponent } from './components/print.component';
import { PaymentListComponent } from './components/payment.list.component';

import { Routes, RouterModule } from '@angular/router';

import { CanActivateService } from '../../services/security/can.active.service';
import { TemplateComponent } from '../utils/components/template.component'

const routes: Routes = [
    {
        path: '',
        component: TemplateComponent,
        children: [{ 
            path: 'list', 
            component: InvoiceListComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: 'create/:_id', 
            component: InvoiceCreateComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: 'print/:_id/a4', 
            component: PrintComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: ':_id/payments', 
            component: PaymentListComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        }
        ]
    }
];

export const InvoiceRouting = RouterModule.forChild(routes);