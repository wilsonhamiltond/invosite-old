import { CanActivateService } from '../../services/security/can.active.service';
import { FieldCreateComponent } from './components/create.component';
import { FieldListComponent } from './components/list.component';
import { Routes, RouterModule } from '@angular/router';
import { TemplateComponent } from '../utils/components/template.component'

const routes: Routes = [
    {
        path: '',
        component: TemplateComponent,
        children: [
            { 
                path: 'list', 
                component: FieldListComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            },
            { 
                path: 'create/:_id', 
                component: FieldCreateComponent,
                canActivate: [
                    'CanAlwaysActivateGuard',
                    CanActivateService
                ]
            }
        ]
    }
];

export const FieldRouting = RouterModule.forChild(routes);