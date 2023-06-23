
import { UserListComponent} from './components/user.list.component'
import { UserCreateComponent } from './components/user.create.component'
import { UserRoleComponent } from './components/user.role.component'
import { PasswordChangeComponent } from './components/password.change.component'
import { ProfileComponent } from './components/profile.component'
import { UserOfficeComponent } from './components/user.office.component'

import { Routes, RouterModule } from '@angular/router';

import { CanActivateService } from '../../services/security/can.active.service';
import { TemplateComponent } from '../utils/components/template.component'

const routes: Routes = [
    {
        path: '',
        component: TemplateComponent,
        children: [{ 
            path: 'list', 
            component: UserListComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: 'create/:_id', 
            component: UserCreateComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: ':_id/role', 
            component: UserRoleComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: ':_id/office', 
            component: UserOfficeComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: 'password/change', 
            component: PasswordChangeComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        },
        { 
            path: 'profile', 
            component: ProfileComponent,
            canActivate: [
                'CanAlwaysActivateGuard',
                CanActivateService
            ]
        }
        ]
    }
];

export const UserRouting = RouterModule.forChild(routes);