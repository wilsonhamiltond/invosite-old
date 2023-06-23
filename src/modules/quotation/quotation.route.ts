import { QuotationCreateComponent } from './components/create.component';
import { QuotationListComponent } from './components/list.component';
import { PrintComponent } from './components/print.component';

import { Routes, RouterModule } from '@angular/router';

import { CanActivateService } from '../../services/security/can.active.service';
import { TemplateComponent } from '../utils/components/template.component'

const routes: Routes = [
    {
        path: '',
        component: TemplateComponent,
        children: [{ 
            path: 'list', 
            component: QuotationListComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: 'create/:_id', 
            component: QuotationCreateComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: 'print/:_id', 
            component: PrintComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        }
        ]
    }
];

export const QuotationRouting = RouterModule.forChild(routes);