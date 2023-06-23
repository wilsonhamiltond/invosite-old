import { RoleListComponent} from './components/role.list.component'
import { RoleCreateComponent } from './components/role.create.component'
import { RoleModuleComponent } from './components/role.module.component'
import { RoleWidgetComponent } from './components/role.widget.component'
import { RoleOfficeComponent } from './components/role.office.component'

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
                component: RoleListComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            },
            { 
                path: 'create/:_id', 
                component: RoleCreateComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            },
            { 
                path: ':_id/module', 
                component: RoleModuleComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            },
            { 
                path: ':_id/widget', 
                component: RoleWidgetComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            },
            { 
                path: ':_id/office', 
                component: RoleOfficeComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            }
        ]
    }
];

export const RoleRouting = RouterModule.forChild(routes);