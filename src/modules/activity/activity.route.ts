import { ActivityListComponent} from './components/list.component'
import { ActivityCreateComponent } from './components/create.component'
import { ActivityTypeFieldComponent } from './components/fields.component'
import { TypeCreateComponent } from './components/type.create.component'
import { TypeListComponent } from './components/type.list.component'
import { DetailReportComponent } from './components/detail.report.component'

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
                component: ActivityListComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            },
            { 
                path: 'create/:_id', 
                component: ActivityCreateComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            },
            { 
                path: 'type/:type_id/create/:_id', 
                component: ActivityCreateComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            },
            { 
                path: ':_id/report', 
                component: DetailReportComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            },
            { 
                path: 'type/:_id/fields', 
                component: ActivityTypeFieldComponent,
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

export const ActivityRouting = RouterModule.forChild(routes);