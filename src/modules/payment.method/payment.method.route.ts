import { PaymentMethodListComponent} from './components/list.component'
import { PaymentMethodCreateComponent } from './components/create.component'
import { PaymentMethodFieldComponent } from './components/fields.component'

import { Routes, RouterModule } from '@angular/router';

import { CanActivateService } from '../../services/security/can.active.service';
import { TemplateComponent } from '../utils/components/template.component'
import { PaymentMethodTicketComponent } from './components/tickets.component';

const routes: Routes = [
    {
        path: '',
        component: TemplateComponent,
        children: [
            { 
                path: 'list', 
                component: PaymentMethodListComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            },
            { 
                path: 'create/:_id', 
                component: PaymentMethodCreateComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            },
            { 
                path: ':_id/fields', 
                component: PaymentMethodFieldComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            },
            { 
                path: ':_id/tickets', 
                component: PaymentMethodTicketComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            }
        ]
    }
];

export const PaymentMethodRouting = RouterModule.forChild(routes);