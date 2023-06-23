import { OfficeListComponent} from './components/office.list.component'
import { OfficeCreateComponent } from './components/office.create.component'
import { Routes, RouterModule } from '@angular/router';

import { CanActivateService } from '../../services/security/can.active.service';
import { TemplateComponent } from '../utils/components/template.component'

const routes: Routes = [
    {
        path: '',
        component: TemplateComponent,
        children: [{ 
            path: 'list', 
            component: OfficeListComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: 'create/:_id', 
            component: OfficeCreateComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        }]
    }
];

export const OfficeRouting = RouterModule.forChild(routes);