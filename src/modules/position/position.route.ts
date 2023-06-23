import { PositionListComponent} from './components/list.component'
import { PositionCreateComponent } from './components/create.component'
import { PositionFieldComponent } from './components/fields.component'

import { Routes, RouterModule } from '@angular/router';

import { CanActivateService } from '../../services/security/can.active.service';
import { TemplateComponent } from '../utils/components/template.component'
import { CommisionProductComponent } from './components/commision.product.component'

const routes: Routes = [
    {
        path: '',
        component: TemplateComponent,
        children: [
            { 
                path: 'list', 
                component: PositionListComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            },
            { 
                path: 'create/:_id', 
                component: PositionCreateComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            },
            { 
                path: ':_id/fields', 
                component: PositionFieldComponent,
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
            }
        ]
    }
];

export const PositionRouting = RouterModule.forChild(routes);