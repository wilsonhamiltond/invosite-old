import { BoxListComponent} from './components/list.component'
import { BoxCreateComponent } from './components/create.component'

import { Routes, RouterModule } from '@angular/router';

import { CanActivateService } from '../../services/security/can.active.service';
import { TemplateComponent } from '../utils/components/template.component'
import { BoxesComponent } from './components/boxes.component';
import { BoxCloseComponent } from './components/close.component';

const routes: Routes = [
    {
        path: '',
        component: TemplateComponent,
        children: [
            { 
                path: 'list', 
                component: BoxListComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            },
            { 
                path: 'create/:_id', 
                component: BoxCreateComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            },
            { 
                path: 'boxes', 
                component: BoxesComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            },
            { 
                path: 'close/:_id', 
                component: BoxCloseComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            } ,
            { 
                path: 'print/:_id', 
                component: BoxCloseComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            }             
        ]
    }
];

export const BoxRouting = RouterModule.forChild(routes);