import { ProviderListComponent} from './components/list.component'
import { ProviderCreateComponent } from './components/create.component'
import { ProviderTypeFieldComponent } from './components/fields.component'
import { TypeCreateComponent } from './components/type.create.component'
import { TypeListComponent } from './components/type.list.component'

import { Routes, RouterModule } from '@angular/router';

import { CanActivateService } from '../../services/security/can.active.service';
import { TemplateComponent } from '../utils/components/template.component'

const routes: Routes = [
    {
        path: '',
        component: TemplateComponent,
        children: [
            { 
                path: 'list', 
                component: ProviderListComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            },
            { 
                path: 'create/:_id', 
                component: ProviderCreateComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            },
            { 
                path: 'type/:_id/fields', 
                component: ProviderTypeFieldComponent,
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
            }
        ]
    }
];

export const ProviderRouting = RouterModule.forChild(routes);