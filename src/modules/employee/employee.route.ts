import { EmployeeCreateComponent } from './components/create.component';
import { EmployeeListComponent } from './components/list.component';

import { Routes, RouterModule } from '@angular/router';

import { CanActivateService } from '../../services/security/can.active.service';
import { TemplateComponent } from '../utils/components/template.component';
import { CommisionProductComponent } from './components/commision.product.component';

const routes: Routes = [
    {
        path: '',
        component: TemplateComponent,
        children: [{ 
            path: 'list', 
            component: EmployeeListComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: 'create/:_id', 
            component: EmployeeCreateComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: 'commision/:_id', 
            component: CommisionProductComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        }]
    }
];

export const EmployeeRouting = RouterModule.forChild(routes);