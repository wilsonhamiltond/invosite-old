import { PaymentComponent } from './components/payment.component'
import { InvoiceComponent } from './components/invoice.component';
import { InventoryComponent} from './components/invcentory.component';
import { CommisionComponent} from './components/commission.component';
import { DGII606Component } from './components/606.component';
import { DGII607Component } from './components/607.component';

import { Routes, RouterModule } from '@angular/router';

import { CanActivateService } from '../../services/security/can.active.service';
import { TemplateComponent } from '../utils/components/template.component';
import { AcknowledgmentComponent } from './components/acknowlegment.component';
import { PaymentDetailsComponent } from './components/payment.details.component';

const routes: Routes = [
    {
        path: '',
        component: TemplateComponent,
        children: [{ 
            path: 'payment', 
            component: PaymentComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },{ 
            path: 'payment/:_id/details', 
            component: PaymentDetailsComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: 'invoice', 
            component: InvoiceComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: 'inventory', 
            component: InventoryComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: 'commission', 
            component: CommisionComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: 'acknowledgment', 
            component: AcknowledgmentComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        }, { 
            path: '606', 
            component: DGII606Component,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        }, { 
            path: '607', 
            component: DGII607Component,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        }]
    }
];

export const ReportRouting = RouterModule.forChild(routes);