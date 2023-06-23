import { CanActivateService } from '../../services/security/can.active.service';
import { RouterModule, Routes } from '@angular/router';
import { TemplateComponent } from '../utils/components/template.component'

import { SettingComponent } from './components/setting.component';

const routes: Routes = [
    {
        path: '',
        component: TemplateComponent,
        children: [
            { 
                path: 'setting', component: SettingComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            }
        ]
    }
];

export const AdminRouting = RouterModule.forChild(routes);