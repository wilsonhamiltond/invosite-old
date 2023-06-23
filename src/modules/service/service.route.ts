import { ServiceListComponent } from './components/list.component'
import { ServiceCreateComponent } from './components/create.component'

import { TypeCreateComponent } from './components/type.create.component';
import { TypeListComponent } from './components/type.list.component';
import { ServiceTypeFieldComponent } from './components/fields.component';
import { HistoryComponent } from './components/history.component';

import { Routes, RouterModule } from '@angular/router';

import { CanActivateService } from '../../services/security/can.active.service';
import { TemplateComponent } from '../utils/components/template.component';

const routes: Routes = [
    {
        path: '',
        component: TemplateComponent,
        children: [{ 
            path: 'list', 
            component: ServiceListComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: 'create/:_id', 
            component: ServiceCreateComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },    
        { 
            path: 'type/:_id/fields', 
            component: ServiceTypeFieldComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: 'type/list', 
            component: TypeListComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: 'type/create/:_id', 
            component: TypeCreateComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        }, { 
            path: ':_id/history', 
            component: HistoryComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },]
    }
];

export const ServiceRouting = RouterModule.forChild(routes);